import os
import uuid as uuid_lib
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from routers.auth_routes import get_current_user_from_token
import models, schemas
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/api/patient", tags=["patient"])

UPLOAD_DIR = "uploads"


def get_patient_profile(token: str, db: Session) -> models.Patient:
    user = get_current_user_from_token(token, db)
    if user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access required")
    patient = db.query(models.Patient).filter(models.Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=schemas.PatientStats)
def get_patient_stats(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    upcoming = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient.id,
        models.Appointment.appointment_date >= date.today(),
        models.Appointment.status.in_(["scheduled", "confirmed"]),
    ).count()

    total_reports = db.query(models.LabReport).filter(
        models.LabReport.patient_id == patient.id,
        models.LabReport.status == "available",
    ).count()

    total_prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient.id,
    ).count()

    return schemas.PatientStats(
        upcoming_appointments=upcoming,
        total_reports=total_reports,
        total_prescriptions=total_prescriptions,
    )


# ─── Profile ──────────────────────────────────────────────────────────────────

@router.get("/profile", response_model=schemas.PatientResponse)
def get_patient_profile_data(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    assigned_doc_name = None
    if patient.assigned_doctor_id:
        doc = db.query(models.Doctor).filter(models.Doctor.id == patient.assigned_doctor_id).first()
        if doc and doc.user:
            assigned_doc_name = doc.user.full_name

    return schemas.PatientResponse(
        id=patient.id,
        full_name=patient.user.full_name if patient.user else None,
        email=patient.user.email if patient.user else None,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_group=patient.blood_group,
        phone=patient.phone,
        patient_type=patient.patient_type,
        current_condition=patient.current_condition,
        status=patient.status,
        assigned_doctor_name=assigned_doc_name,
    )


# ─── Appointments ─────────────────────────────────────────────────────────────

@router.get("/appointments", response_model=List[schemas.AppointmentResponse])
def get_my_appointments(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    appointments = (
        db.query(models.Appointment)
        .filter(models.Appointment.patient_id == patient.id)
        .order_by(models.Appointment.appointment_date.asc())
        .all()
    )

    return [
        schemas.AppointmentResponse(
            id=a.id,
            patient_name=patient.user.full_name if patient.user else None,
            doctor_name=a.doctor.user.full_name if a.doctor and a.doctor.user else None,
            doctor_specialization=a.doctor.specialization if a.doctor else None,
            appointment_date=a.appointment_date,
            appointment_time=a.appointment_time,
            appointment_type=a.appointment_type,
            status=a.status,
            notes=a.notes,
        )
        for a in appointments
    ]


# ─── Next Appointment (for popup reminder) ────────────────────────────────────

@router.get("/next-appointment")
def get_next_appointment(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    next_appt = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.patient_id == patient.id,
            models.Appointment.appointment_date >= date.today(),
            models.Appointment.status.in_(["scheduled", "confirmed"]),
        )
        .order_by(models.Appointment.appointment_date.asc())
        .first()
    )

    if not next_appt:
        return {"has_appointment": False}

    days_until = (next_appt.appointment_date - date.today()).days

    return {
        "has_appointment": True,
        "appointment_date": str(next_appt.appointment_date),
        "appointment_time": next_appt.appointment_time,
        "doctor_name": next_appt.doctor.user.full_name if next_appt.doctor and next_appt.doctor.user else None,
        "doctor_specialization": next_appt.doctor.specialization if next_appt.doctor else None,
        "appointment_type": next_appt.appointment_type,
        "days_until": days_until,
        "is_today": days_until == 0,
        "is_tomorrow": days_until == 1,
        "show_reminder": days_until <= 1,  # Show popup if today or tomorrow
    }


# ─── Lab Reports ──────────────────────────────────────────────────────────────

@router.get("/reports", response_model=List[schemas.LabReportResponse])
def get_my_reports(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    reports = (
        db.query(models.LabReport)
        .filter(
            models.LabReport.patient_id == patient.id,
            models.LabReport.status == "available",
        )
        .order_by(models.LabReport.result_date.desc())
        .all()
    )

    result = []
    for r in reports:
        doctor_name = None
        if r.doctor_id:
            doc = db.query(models.Doctor).filter(models.Doctor.id == r.doctor_id).first()
            if doc and doc.user:
                doctor_name = doc.user.full_name
        result.append(schemas.LabReportResponse(
            id=r.id,
            patient_name=patient.user.full_name if patient.user else None,
            doctor_name=doctor_name,
            report_name=r.report_name,
            report_type=r.report_type,
            file_url=r.file_url,
            status=r.status,
            requested_date=r.requested_date,
            result_date=r.result_date,
            priority=r.priority,
            notes=r.notes,
        ))
    return result


# ─── Prescriptions ────────────────────────────────────────────────────────────

@router.get("/prescriptions", response_model=List[schemas.PrescriptionResponse])
def get_my_prescriptions(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)

    prescriptions = (
        db.query(models.Prescription)
        .filter(models.Prescription.patient_id == patient.id)
        .order_by(models.Prescription.created_at.desc())
        .all()
    )

    result = []
    for p in prescriptions:
        result.append(schemas.PrescriptionResponse(
            id=p.id,
            patient_name=patient.user.full_name if patient.user else None,
            doctor_name=p.doctor.user.full_name if p.doctor and p.doctor.user else None,
            diagnosis=p.diagnosis,
            notes=p.notes,
            image_url=p.image_url,
            ai_summary=p.ai_summary,
            pharmacy_status=p.pharmacy_order.status if p.pharmacy_order else None,
            created_at=p.created_at,
            items=[
                schemas.PrescriptionItemResponse(
                    id=i.id,
                    medicine_name=i.medicine_name,
                    dosage=i.dosage,
                    frequency=i.frequency,
                    duration=i.duration,
                    instructions=i.instructions,
                )
                for i in p.items
            ],
        ))
    return result


# ─── Upload Prescription Image (by patient) ───────────────────────────────────

@router.post("/upload-prescription")
async def upload_patient_prescription(
    token: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    patient = get_patient_profile(token, db)
    user = db.query(models.User).filter(models.User.id == patient.user_id).first()

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid_lib.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, "prescriptions", filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create a prescription record with just the image
    # Doctor is the assigned doctor
    new_prescription = models.Prescription(
        patient_id=patient.id,
        doctor_id=patient.assigned_doctor_id,
        image_url=f"/uploads/prescriptions/{filename}",
        notes="Uploaded by patient",
    )
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)

    return {
        "prescription_id": str(new_prescription.id),
        "image_url": new_prescription.image_url,
        "message": "Prescription uploaded successfully. AI summary coming soon.",
    }


# ─── Medical Records ──────────────────────────────────────────────────────────

@router.get("/medical-records", response_model=List[schemas.MedicalRecordResponse])
def get_my_medical_records(token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)
    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient.id
    ).order_by(models.MedicalRecord.record_date.desc()).all()

    result = []
    for r in records:
        doc_name = None
        if r.doctor_id:
            doc = db.query(models.Doctor).filter(models.Doctor.id == r.doctor_id).first()
            if doc and doc.user:
                doc_name = doc.user.full_name
        result.append(schemas.MedicalRecordResponse(
            id=r.id,
            patient_name=patient.user.full_name if patient.user else None,
            doctor_name=doc_name,
            record_type=r.record_type,
            title=r.title,
            description=r.description,
            file_url=r.file_url,
            record_date=r.record_date,
        ))
    return result


@router.post("/prescriptions/{prescription_id}/generate-summary")
def generate_patient_prescription_ai_summary(prescription_id: str, token: str, db: Session = Depends(get_db)):
    patient = get_patient_profile(token, db)
    prescription = db.query(models.Prescription).filter(
        models.Prescription.id == uuid_lib.UUID(prescription_id),
        models.Prescription.patient_id == patient.id
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    from services.ai_service import generate_prescription_summary, generate_image_prescription_summary
    
    if prescription.image_url:
        local_path = prescription.image_url.lstrip("/")
        if os.path.exists(local_path):
            summary = generate_image_prescription_summary(local_path)
        else:
            summary = f"Prescription image file ({local_path}) not found on server disk, unable to analyze."
    else:
        items = [{
            "medicine_name": item.medicine_name,
            "dosage": item.dosage,
            "frequency": item.frequency,
            "duration": item.duration,
            "instructions": item.instructions
        } for item in prescription.items]
        summary = generate_prescription_summary(prescription.diagnosis, items, prescription.notes)
        
    prescription.ai_summary = summary
    db.commit()
    return {"ai_summary": summary}

