import os
import uuid as uuid_lib
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from routers.auth_routes import get_current_user_from_token
import models, schemas
from typing import List, Optional
from datetime import date, datetime

router = APIRouter(prefix="/api/doctor", tags=["doctor"])

UPLOAD_DIR = "uploads"


def get_doctor_profile(token: str, db: Session) -> models.Doctor:
    user = get_current_user_from_token(token, db)
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=schemas.DoctorStats)
def get_doctor_stats(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    assigned = db.query(models.Patient).filter(models.Patient.assigned_doctor_id == doctor.id).count()
    today = date.today()
    todays_appts = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor.id,
        models.Appointment.appointment_date == today,
        models.Appointment.status.in_(["scheduled", "confirmed"]),
    ).count()
    pending_reports = db.query(models.LabReport).filter(
        models.LabReport.doctor_id == doctor.id,
        models.LabReport.status == "pending",
    ).count()
    icu_count = db.query(models.IcuPatient).filter(
        models.IcuPatient.doctor_id == doctor.id,
        models.IcuPatient.is_active == True,
    ).count()
    unread_alerts = (
        db.query(models.IcuAlert)
        .join(models.IcuPatient, models.IcuAlert.icu_patient_id == models.IcuPatient.id)
        .filter(
            models.IcuPatient.doctor_id == doctor.id,
            models.IcuAlert.is_acknowledged == False,
        )
        .count()
    )
    inpatients = db.query(models.Patient).filter(
        models.Patient.assigned_doctor_id == doctor.id,
        models.Patient.patient_type == "inpatient",
    ).count()
    outpatients = db.query(models.Patient).filter(
        models.Patient.assigned_doctor_id == doctor.id,
        models.Patient.patient_type == "outpatient",
    ).count()

    return schemas.DoctorStats(
        assigned_patients=assigned,
        todays_appointments=todays_appts,
        pending_reports=pending_reports,
        icu_patients=icu_count,
        unread_icu_alerts=unread_alerts,
        inpatients=inpatients,
        outpatients=outpatients,
    )


# ─── My Patients (Outpatients) ────────────────────────────────────────────────

@router.get("/my-patients", response_model=List[schemas.PatientResponse])
def get_my_patients(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    patients = db.query(models.Patient).filter(
        models.Patient.assigned_doctor_id == doctor.id,
        models.Patient.patient_type == "outpatient",
    ).all()

    result = []
    for p in patients:
        last_appt = (
            db.query(models.Appointment)
            .filter(models.Appointment.patient_id == p.id, models.Appointment.status == "completed")
            .order_by(models.Appointment.appointment_date.desc())
            .first()
        )
        next_appt = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.patient_id == p.id,
                models.Appointment.appointment_date >= date.today(),
                models.Appointment.status.in_(["scheduled", "confirmed"]),
            )
            .order_by(models.Appointment.appointment_date.asc())
            .first()
        )
        result.append(schemas.PatientResponse(
            id=p.id,
            full_name=p.user.full_name if p.user else None,
            email=p.user.email if p.user else None,
            date_of_birth=p.date_of_birth,
            gender=p.gender,
            blood_group=p.blood_group,
            phone=p.phone,
            patient_type=p.patient_type,
            current_condition=p.current_condition,
            status=p.status,
            last_visit=last_appt.appointment_date if last_appt else None,
            next_appointment=next_appt.appointment_date if next_appt else None,
        ))
    return result


# ─── Inpatients ───────────────────────────────────────────────────────────────

@router.get("/inpatients", response_model=List[schemas.AdmissionResponse])
def get_inpatients(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    admissions = db.query(models.Admission).filter(
        models.Admission.doctor_id == doctor.id,
        models.Admission.is_active == True,
    ).all()

    result = []
    for a in admissions:
        patient_name = a.patient.user.full_name if a.patient and a.patient.user else None
        days = (date.today() - a.admission_date).days if a.admission_date else None
        result.append(schemas.AdmissionResponse(
            id=a.id,
            patient_id=a.patient_id,
            patient_name=patient_name,
            doctor_name=a.patient.assigned_doctor.user.full_name if a.patient and a.patient.assigned_doctor and a.patient.assigned_doctor.user else None,
            ward=a.ward,
            bed_number=a.bed_number,
            admission_date=a.admission_date,
            discharge_date=a.discharge_date,
            diagnosis=a.diagnosis,
            days_admitted=days,
            is_active=a.is_active,
            gender=a.patient.gender if a.patient else None,
            blood_group=a.patient.blood_group if a.patient else None,
            phone=a.patient.phone if a.patient else None,
            date_of_birth=a.patient.date_of_birth if a.patient else None,
            current_condition=a.patient.current_condition if a.patient else None,
            status=a.patient.status if a.patient else None,
        ))
    return result


# ─── ICU Patients ─────────────────────────────────────────────────────────────

@router.get("/icu-patients", response_model=List[schemas.IcuPatientResponse])
def get_icu_patients(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    icu_patients = db.query(models.IcuPatient).filter(
        models.IcuPatient.doctor_id == doctor.id,
        models.IcuPatient.is_active == True,
    ).all()

    result = []
    for ip in icu_patients:
        patient_name = ip.patient.user.full_name if ip.patient and ip.patient.user else None
        unread = db.query(models.IcuAlert).filter(
            models.IcuAlert.icu_patient_id == ip.id,
            models.IcuAlert.is_acknowledged == False,
        ).count()
        result.append(schemas.IcuPatientResponse(
            id=ip.id,
            patient_id=ip.patient_id,
            patient_name=patient_name,
            doctor_name=ip.doctor.user.full_name if ip.doctor and ip.doctor.user else None,
            bed_number=ip.bed_number,
            admission_date=ip.admission_date,
            condition=ip.condition,
            heart_rate=ip.heart_rate,
            blood_pressure=ip.blood_pressure,
            oxygen_saturation=ip.oxygen_saturation,
            temperature=ip.temperature,
            unread_alerts=unread,
            gender=ip.patient.gender if ip.patient else None,
            blood_group=ip.patient.blood_group if ip.patient else None,
            phone=ip.patient.phone if ip.patient else None,
            date_of_birth=ip.patient.date_of_birth if ip.patient else None,
            status=ip.patient.status if ip.patient else None,
        ))
    return result


# ─── ICU Alerts ───────────────────────────────────────────────────────────────

@router.get("/icu-alerts", response_model=List[schemas.IcuAlertResponse])
def get_icu_alerts(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    alerts = (
        db.query(models.IcuAlert)
        .join(models.IcuPatient, models.IcuAlert.icu_patient_id == models.IcuPatient.id)
        .filter(models.IcuPatient.doctor_id == doctor.id)
        .order_by(models.IcuAlert.created_at.desc())
        .all()
    )

    result = []
    for alert in alerts:
        ip = alert.icu_patient
        patient_name = ip.patient.user.full_name if ip and ip.patient and ip.patient.user else None
        result.append(schemas.IcuAlertResponse(
            id=alert.id,
            icu_patient_id=alert.icu_patient_id,
            patient_name=patient_name,
            bed_number=ip.bed_number if ip else None,
            alert_type=alert.alert_type,
            message=alert.message,
            severity=alert.severity,
            is_acknowledged=alert.is_acknowledged,
            created_at=alert.created_at,
        ))
    return result


@router.put("/icu-alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, token: str, db: Session = Depends(get_db)):
    get_doctor_profile(token, db)
    alert = db.query(models.IcuAlert).filter(models.IcuAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_acknowledged = True
    db.commit()
    return {"message": "Alert acknowledged"}


# ─── Appointments ─────────────────────────────────────────────────────────────

@router.get("/appointments", response_model=List[schemas.AppointmentResponse])
def get_appointments(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.appointment_date >= date.today(),
            models.Appointment.status.in_(["scheduled", "confirmed"]),
        )
        .order_by(models.Appointment.appointment_date.asc())
        .all()
    )

    return [
        schemas.AppointmentResponse(
            id=a.id,
            patient_name=a.patient.user.full_name if a.patient and a.patient.user else None,
            doctor_name=doctor.user.full_name if doctor.user else None,
            doctor_specialization=doctor.specialization,
            appointment_date=a.appointment_date,
            appointment_time=a.appointment_time,
            appointment_type=a.appointment_type,
            status=a.status,
            notes=a.notes,
        )
        for a in appointments
    ]


@router.post("/appointments", response_model=schemas.AppointmentResponse)
def create_doctor_appointment(data: schemas.AppointmentCreate, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    
    patient = db.query(models.Patient).filter(models.Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    new_appt = models.Appointment(
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        appointment_type=data.appointment_type or "consultation",
        status=data.status or "scheduled",
        notes=data.notes
    )
    db.add(new_appt)
    patient.assigned_doctor_id = doctor.id
    db.commit()
    db.refresh(new_appt)
    
    return schemas.AppointmentResponse(
        id=new_appt.id,
        patient_name=patient.user.full_name if patient.user else None,
        doctor_name=doctor.user.full_name if doctor.user else None,
        doctor_specialization=doctor.specialization,
        appointment_date=new_appt.appointment_date,
        appointment_time=new_appt.appointment_time,
        appointment_type=new_appt.appointment_type,
        status=new_appt.status,
        notes=new_appt.notes
    )


# ─── Pending Reports ──────────────────────────────────────────────────────────

@router.get("/pending-reports", response_model=List[schemas.LabReportResponse])
def get_pending_reports(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    reports = db.query(models.LabReport).filter(
        models.LabReport.doctor_id == doctor.id,
        models.LabReport.status == "pending",
    ).order_by(models.LabReport.created_at.desc()).all()

    return [
        schemas.LabReportResponse(
            id=r.id,
            patient_name=r.patient.user.full_name if r.patient and r.patient.user else None,
            doctor_name=doctor.user.full_name if doctor.user else None,
            report_name=r.report_name,
            report_type=r.report_type,
            file_url=r.file_url,
            status=r.status,
            requested_date=r.requested_date,
            result_date=r.result_date,
            priority=r.priority,
            notes=r.notes,
        )
        for r in reports
    ]


# ─── Create Prescription ──────────────────────────────────────────────────────

@router.post("/prescriptions", response_model=schemas.PrescriptionResponse)
def create_prescription(data: schemas.PrescriptionCreate, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    prescription = models.Prescription(
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        appointment_id=data.appointment_id,
        diagnosis=data.diagnosis,
        notes=data.notes,
    )
    db.add(prescription)
    db.flush()

    for item_data in data.items:
        item = models.PrescriptionItem(
            prescription_id=prescription.id,
            medicine_name=item_data.medicine_name,
            dosage=item_data.dosage,
            frequency=item_data.frequency,
            duration=item_data.duration,
            instructions=item_data.instructions,
        )
        db.add(item)

    # Auto-create pharmacy order
    pharmacy_order = models.PharmacyOrder(prescription_id=prescription.id, status="pending")
    db.add(pharmacy_order)

    db.commit()
    db.refresh(prescription)

    patient = db.query(models.Patient).filter(models.Patient.id == prescription.patient_id).first()
    return schemas.PrescriptionResponse(
        id=prescription.id,
        patient_name=patient.user.full_name if patient and patient.user else None,
        doctor_name=doctor.user.full_name if doctor.user else None,
        diagnosis=prescription.diagnosis,
        notes=prescription.notes,
        image_url=prescription.image_url,
        ai_summary=prescription.ai_summary,
        pharmacy_status=prescription.pharmacy_order.status if prescription.pharmacy_order else None,
        created_at=prescription.created_at,
        items=[
            schemas.PrescriptionItemResponse(
                id=i.id,
                medicine_name=i.medicine_name,
                dosage=i.dosage,
                frequency=i.frequency,
                duration=i.duration,
                instructions=i.instructions,
            )
            for i in prescription.items
        ],
    )


@router.get("/prescriptions", response_model=List[schemas.PrescriptionResponse])
def get_prescriptions(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.doctor_id == doctor.id
    ).order_by(models.Prescription.created_at.desc()).all()

    result = []
    for p in prescriptions:
        patient = db.query(models.Patient).filter(models.Patient.id == p.patient_id).first()
        result.append(schemas.PrescriptionResponse(
            id=p.id,
            patient_name=patient.user.full_name if patient and patient.user else None,
            doctor_name=doctor.user.full_name if doctor.user else None,
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


# ─── Upload Prescription Image ────────────────────────────────────────────────

@router.post("/prescriptions/{prescription_id}/upload")
async def upload_prescription_image(
    prescription_id: str,
    token: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    doctor = get_doctor_profile(token, db)
    prescription = db.query(models.Prescription).filter(
        models.Prescription.id == prescription_id,
        models.Prescription.doctor_id == doctor.id,
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid_lib.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, "prescriptions", filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    prescription.image_url = f"/uploads/prescriptions/{filename}"
    db.commit()

    return {"image_url": prescription.image_url}


# ─── Medical Records ──────────────────────────────────────────────────────────

@router.get("/medical-records", response_model=List[schemas.MedicalRecordResponse])
def get_medical_records(token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)

    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.doctor_id == doctor.id
    ).order_by(models.MedicalRecord.record_date.desc()).all()

    return [
        schemas.MedicalRecordResponse(
            id=r.id,
            patient_name=r.patient.user.full_name if r.patient and r.patient.user else None,
            doctor_name=doctor.user.full_name if doctor.user else None,
            record_type=r.record_type,
            title=r.title,
            description=r.description,
            file_url=r.file_url,
            record_date=r.record_date,
        )
        for r in records
    ]


# ─── Create Medical Record ───────────────────────────────────────────────────

@router.post("/medical-records", response_model=schemas.MedicalRecordResponse)
def create_medical_record(data: schemas.MedicalRecordCreate, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    new_record = models.MedicalRecord(
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        record_type=data.record_type,
        title=data.title,
        description=data.description,
        record_date=data.record_date or date.today()
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return schemas.MedicalRecordResponse(
        id=new_record.id,
        patient_name=patient.user.full_name if patient.user else None,
        doctor_name=doctor.user.full_name if doctor.user else None,
        record_type=new_record.record_type,
        title=new_record.title,
        description=new_record.description,
        file_url=new_record.file_url,
        record_date=new_record.record_date
    )


# ─── Create Lab Report ────────────────────────────────────────────────────────

@router.post("/lab-reports", response_model=schemas.LabReportResponse)
def create_lab_report(data: schemas.LabReportCreate, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    
    patient = db.query(models.Patient).filter(models.Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    new_report = models.LabReport(
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        report_name=data.report_name,
        report_type=data.report_type,
        priority=data.priority or "normal",
        notes=data.notes,
        status="pending",
        requested_date=date.today()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return schemas.LabReportResponse(
        id=new_report.id,
        patient_name=patient.user.full_name if patient.user else None,
        doctor_name=doctor.user.full_name if doctor.user else None,
        report_name=new_report.report_name,
        report_type=new_report.report_type,
        file_url=new_report.file_url,
        status=new_report.status,
        requested_date=new_report.requested_date,
        result_date=new_report.result_date,
        priority=new_report.priority,
        notes=new_report.notes
    )


# ─── Upload Lab Report File ───────────────────────────────────────────────────

@router.post("/lab-reports/{report_id}/upload")
async def upload_lab_report_file(
    report_id: str,
    token: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    doctor = get_doctor_profile(token, db)
    
    report = db.query(models.LabReport).filter(
        models.LabReport.id == report_id,
        models.LabReport.doctor_id == doctor.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
        
    os.makedirs(os.path.join(UPLOAD_DIR, "lab_reports"), exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid_lib.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, "lab_reports", filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    report.file_url = f"/uploads/lab_reports/{filename}"
    report.status = "available"
    report.result_date = date.today()
    db.commit()
    
    return {"file_url": report.file_url, "status": report.status}


@router.post("/prescriptions/{prescription_id}/generate-summary")
def generate_prescription_ai_summary(prescription_id: str, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    prescription = db.query(models.Prescription).filter(models.Prescription.id == uuid_lib.UUID(prescription_id)).first()
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


@router.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def doctor_update_patient(patient_id: str, data: schemas.PatientUpdate, token: str, db: Session = Depends(get_db)):
    doctor = get_doctor_profile(token, db)
    
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.assigned_doctor_id == doctor.id
    ).first()
    if not patient:
        raise HTTPException(status_code=403, detail="Not authorized to update this patient or patient not found")
        
    if data.full_name is not None and patient.user:
        patient.user.full_name = data.full_name
        
    if data.date_of_birth is not None:
        patient.date_of_birth = data.date_of_birth
    if data.gender is not None:
        patient.gender = data.gender
    if data.blood_group is not None:
        patient.blood_group = data.blood_group
    if data.phone is not None:
        patient.phone = data.phone
    if data.current_condition is not None:
        patient.current_condition = data.current_condition
    if data.status is not None:
        patient.status = data.status
        
    db.commit()
    db.refresh(patient)
    
    assigned_doc_name = doctor.user.full_name if doctor.user else None
    
    # Check ward / bed details if inpatient
    ward = None
    bed_number = None
    if patient.patient_type == "inpatient" and patient.admission:
        ward = patient.admission.ward
        bed_number = patient.admission.bed_number
    elif patient.patient_type == "icu" and patient.icu_record:
        ward = "ICU"
        bed_number = patient.icu_record.bed_number
        
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
        last_visit=None,
        next_appointment=None,
        ward=ward,
        bed_number=bed_number
    )
