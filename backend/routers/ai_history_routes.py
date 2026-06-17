import uuid as uuid_lib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers.auth_routes import get_current_user_from_token
import models
from typing import List, Optional, Any
from datetime import date, datetime
from pydantic import BaseModel

from services.ai_service import (
    generate_soap_notes,
    summarize_medical_report,
    analyze_patient_history,
    get_treatment_recommendations,
    generate_copilot_response
)

router = APIRouter(prefix="/api/ai-history", tags=["ai-history"])

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str

class CopilotChatRequest(BaseModel):
    messages: List[ChatMessage]
    patient_id: Optional[str] = None
    context_info: Optional[str] = None

class DocumentNotesRequest(BaseModel):
    keywords: str

class SummarizeReportRequest(BaseModel):
    report_name: str
    report_type: str
    notes: Optional[str] = None
    priority: Optional[str] = "normal"
    is_patient: Optional[bool] = False

class PatientInsightsRequest(BaseModel):
    patient_id: str

class TreatmentRecommendRequest(BaseModel):
    diagnosis: str
    patient_id: Optional[str] = None


# ─── Patients Listing Endpoint (Role Based) ───────────────────────────────────

@router.get("/patients")
def get_patients_for_history(token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    
    # Patients see only themselves
    if user.role == "patient":
        patient = db.query(models.Patient).filter(models.Patient.user_id == user.id).first()
        if not patient:
            return []
        return [{
            "id": str(patient.id),
            "full_name": user.full_name,
            "email": user.email,
            "phone": patient.phone,
            "patient_type": patient.patient_type,
            "blood_group": patient.blood_group,
            "current_condition": patient.current_condition,
            "doctor_name": patient.assigned_doctor.user.full_name if patient.assigned_doctor and patient.assigned_doctor.user else "Unassigned",
            "doctor_id": str(patient.assigned_doctor_id) if patient.assigned_doctor_id else None
        }]
        
    elif user.role == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        # Get patient IDs from various visits/events with this doctor
        patient_ids = set()
        
        # 1. Assigned patients
        assigned_pats = db.query(models.Patient.id).filter(models.Patient.assigned_doctor_id == doctor.id).all()
        for p in assigned_pats:
            patient_ids.add(p[0])
            
        # 2. Appointments
        appt_pats = db.query(models.Appointment.patient_id).filter(models.Appointment.doctor_id == doctor.id).all()
        for p in appt_pats:
            if p[0]: patient_ids.add(p[0])
            
        # 3. Prescriptions
        presc_pats = db.query(models.Prescription.patient_id).filter(models.Prescription.doctor_id == doctor.id).all()
        for p in presc_pats:
            if p[0]: patient_ids.add(p[0])
            
        # 4. Lab Reports
        lab_pats = db.query(models.LabReport.patient_id).filter(models.LabReport.doctor_id == doctor.id).all()
        for p in lab_pats:
            if p[0]: patient_ids.add(p[0])
            
        # 5. Medical Records
        rec_pats = db.query(models.MedicalRecord.patient_id).filter(models.MedicalRecord.doctor_id == doctor.id).all()
        for p in rec_pats:
            if p[0]: patient_ids.add(p[0])
            
        # 6. Admissions
        adm_pats = db.query(models.Admission.patient_id).filter(models.Admission.doctor_id == doctor.id).all()
        for p in adm_pats:
            if p[0]: patient_ids.add(p[0])
            
        patients = db.query(models.Patient).filter(models.Patient.id.in_(list(patient_ids))).all()
        return [{
            "id": str(p.id),
            "full_name": p.user.full_name if p.user else "Unknown Patient",
            "email": p.user.email if p.user else None,
            "phone": p.phone,
            "patient_type": p.patient_type,
            "blood_group": p.blood_group,
            "current_condition": p.current_condition,
            "doctor_name": p.assigned_doctor.user.full_name if p.assigned_doctor and p.assigned_doctor.user else "Unassigned",
            "doctor_id": str(p.assigned_doctor_id) if p.assigned_doctor_id else None
        } for p in patients]
        
    # Pharmacy sees only patients with prescriptions
    elif user.role in ["pharmacist", "pharmacy"]:
        patients_with_presc = db.query(models.Patient).join(models.Prescription).all()
        # Deduplicate
        unique_patients = list({p.id: p for p in patients_with_presc}.values())
        return [{
            "id": str(p.id),
            "full_name": p.user.full_name if p.user else "Unknown Patient",
            "email": p.user.email if p.user else None,
            "phone": p.phone,
            "patient_type": p.patient_type,
            "blood_group": p.blood_group,
            "current_condition": p.current_condition,
            "doctor_name": p.assigned_doctor.user.full_name if p.assigned_doctor and p.assigned_doctor.user else "Unassigned",
            "doctor_id": str(p.assigned_doctor_id) if p.assigned_doctor_id else None
        } for p in unique_patients]
        
    # Admins see all patients
    elif user.role == "hospital_admin":
        patients = db.query(models.Patient).all()
        return [{
            "id": str(p.id),
            "full_name": p.user.full_name if p.user else "Unknown Patient",
            "email": p.user.email if p.user else None,
            "phone": p.phone,
            "patient_type": p.patient_type,
            "blood_group": p.blood_group,
            "current_condition": p.current_condition,
            "doctor_name": p.assigned_doctor.user.full_name if p.assigned_doctor and p.assigned_doctor.user else "Unassigned",
            "doctor_id": str(p.assigned_doctor_id) if p.assigned_doctor_id else None
        } for p in patients]
        
    else:
        raise HTTPException(status_code=403, detail="Unauthorized role")


# ─── Patient Timeline History Endpoint (Role Based) ──────────────────────────

@router.get("/patient/{patient_id}")
def get_patient_timeline_history(patient_id: str, token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    patient_id_uuid = uuid_lib.UUID(patient_id)
    
    # 1. Validation and Authorization checks
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id_uuid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # If user is a patient, they can only view their own history
    if user.role == "patient":
        if patient.user_id != user.id:
            raise HTTPException(status_code=403, detail="You can only access your own medical history.")
            
    doctor = None
    if user.role == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
    events = []
    
    def get_doctor_name(doc_id):
        if not doc_id:
            return "Unknown Doctor"
        doc = db.query(models.Doctor).filter(models.Doctor.id == doc_id).first()
        if doc and doc.user:
            return doc.user.full_name
        return "Unknown Doctor"
    
    # 2. Query Appointments
    appts_query = db.query(models.Appointment).filter(models.Appointment.patient_id == patient.id)
    if doctor:
        appts_query = appts_query.filter(models.Appointment.doctor_id == doctor.id)
    appointments = appts_query.all()
    for a in appointments:
        events.append({
            "id": str(a.id),
            "type": "appointment",
            "date": str(a.appointment_date),
            "title": f"Appointment ({a.appointment_type.title() if a.appointment_type else 'Consultation'})",
            "description": a.notes or "No notes provided.",
            "doctor_name": a.doctor.user.full_name if a.doctor and a.doctor.user else "Unknown Doctor",
            "meta": {
                "time": a.appointment_time,
                "status": a.status
            }
        })
        
    # 3. Query Prescriptions
    presc_query = db.query(models.Prescription).filter(models.Prescription.patient_id == patient.id)
    if doctor:
        presc_query = presc_query.filter(models.Prescription.doctor_id == doctor.id)
    prescriptions = presc_query.all()
    for p in prescriptions:
        events.append({
            "id": str(p.id),
            "type": "prescription",
            "date": str(p.created_at.date()) if p.created_at else str(date.today()),
            "title": f"Prescription - Diagnosis: {p.diagnosis or 'General Health Check'}",
            "description": p.notes or "Prescribed medications.",
            "doctor_name": p.doctor.user.full_name if p.doctor and p.doctor.user else "Unknown Doctor",
            "meta": {
                "medicines": [{
                    "medicine_name": item.medicine_name,
                    "dosage": item.dosage,
                    "frequency": item.frequency,
                    "duration": item.duration,
                    "instructions": item.instructions
                } for item in p.items],
                "image_url": p.image_url,
                "ai_summary": p.ai_summary,
                "pharmacy_status": p.pharmacy_order.status if p.pharmacy_order else "pending"
            }
        })
        
    # 4. Query Lab Reports
    lab_query = db.query(models.LabReport).filter(models.LabReport.patient_id == patient.id)
    if doctor:
        lab_query = lab_query.filter(models.LabReport.doctor_id == doctor.id)
    reports = lab_query.all()
    for r in reports:
        events.append({
            "id": str(r.id),
            "type": "lab_report",
            "date": str(r.result_date) if r.result_date else str(r.requested_date),
            "title": f"Lab Report: {r.report_name}",
            "description": r.notes or "Diagnostic findings.",
            "doctor_name": get_doctor_name(r.doctor_id),
            "meta": {
                "report_type": r.report_type,
                "status": r.status,
                "priority": r.priority,
                "file_url": r.file_url
            }
        })
        
    # 5. Query Medical Records
    rec_query = db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == patient.id)
    if doctor:
        rec_query = rec_query.filter(models.MedicalRecord.doctor_id == doctor.id)
    records = rec_query.all()
    for r in records:
        events.append({
            "id": str(r.id),
            "type": "medical_record",
            "date": str(r.record_date),
            "title": f"Medical Record: {r.title}",
            "description": r.description or "",
            "doctor_name": get_doctor_name(r.doctor_id),
            "meta": {
                "record_type": r.record_type,
                "file_url": r.file_url
            }
        })
        
    # 6. Query Admissions
    adm_query = db.query(models.Admission).filter(models.Admission.patient_id == patient.id)
    if doctor:
        adm_query = adm_query.filter(models.Admission.doctor_id == doctor.id)
    admissions = adm_query.all()
    for adm in admissions:
        events.append({
            "id": str(adm.id),
            "type": "admission",
            "date": str(adm.admission_date),
            "title": f"Hospital Admission ({'Active' if adm.is_active else 'Discharged'})",
            "description": f"Admission Diagnosis: {adm.diagnosis}",
            "doctor_name": get_doctor_name(adm.doctor_id),
            "meta": {
                "ward": adm.ward,
                "bed_number": adm.bed_number,
                "discharge_date": str(adm.discharge_date) if adm.discharge_date else None,
                "is_active": adm.is_active
            }
        })
        
    # Sort events by date descending
    events.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "patient": {
            "id": str(patient.id),
            "full_name": patient.user.full_name if patient.user else "Unknown",
            "email": patient.user.email if patient.user else None,
            "phone": patient.phone,
            "date_of_birth": str(patient.date_of_birth),
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "patient_type": patient.patient_type,
            "current_condition": patient.current_condition,
            "status": patient.status
        },
        "events": events
    }


# ─── Copilot Chat Endpoint ───────────────────────────────────────────────────

@router.post("/copilot/chat")
def post_copilot_chat(data: CopilotChatRequest, token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    
    # Compile context information
    context_parts = []
    
    # 1. User Info
    context_parts.append(f"User Role: {user.role}, Name: {user.full_name}")
    
    # 2. Patient selection context (if provided)
    if data.patient_id:
        p_uuid = uuid_lib.UUID(data.patient_id)
        patient = db.query(models.Patient).filter(models.Patient.id == p_uuid).first()
        if patient:
            context_parts.append(
                f"Selected Patient: {patient.user.full_name if patient.user else 'Unknown'}, "
                f"Condition: {patient.current_condition or 'None'}, DOB: {patient.date_of_birth}, "
                f"Gender: {patient.gender}, Blood Group: {patient.blood_group}"
            )
            
    # 3. Add any other frontend context passed
    if data.context_info:
        context_parts.append(f"Application Context: {data.context_info}")
        
    # 4. Live database stats context (for metrics queries)
    try:
        pat_count = db.query(models.Patient).count()
        doc_count = db.query(models.Doctor).count()
        dept_count = db.query(models.Department).count()
        
        dept_stats = []
        for dept in db.query(models.Department).all():
            docs_in_dept = db.query(models.Doctor).filter(models.Doctor.department_id == dept.id).count()
            dept_stats.append(f"{dept.name} ({docs_in_dept} doctors)")
            
        context_parts.append(
            f"LIVE HOSPITAL METRICS: Total Registered Patients = {pat_count}; "
            f"Total Active Doctors = {doc_count}; "
            f"Total Departments = {dept_count}; "
            f"Department Doctor Assignments: {', '.join(dept_stats)}."
        )
    except Exception as e:
        print(f"Error compiling live stats for copilot: {e}")
        
    context_str = " | ".join(context_parts)
    
    messages_list = [{"role": msg.role, "content": msg.content} for msg in data.messages]
    
    ai_response = generate_copilot_response(
        messages=messages_list,
        role=user.role,
        context_info=context_str
    )
    
    return {"response": ai_response}


# ─── Specialized AI Tools Endpoints ──────────────────────────────────────────

@router.post("/copilot/document-notes")
def post_document_notes(data: DocumentNotesRequest, token: str, db: Session = Depends(get_db)):
    # Verify user is doctor
    user = get_current_user_from_token(token, db)
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access clinical documentation assist.")
        
    notes = generate_soap_notes(keywords=data.keywords)
    return {"soap_notes": notes}


@router.post("/copilot/summarize-report")
def post_summarize_report(data: SummarizeReportRequest, token: str, db: Session = Depends(get_db)):
    # Any verified user can access (tone is customized for patient vs doctor)
    get_current_user_from_token(token, db)
    
    summary = summarize_medical_report(
        report_name=data.report_name,
        report_type=data.report_type,
        notes=data.notes,
        priority=data.priority,
        is_patient=data.is_patient
    )
    return {"summary": summary}


@router.post("/copilot/patient-insights")
def post_patient_insights(data: PatientInsightsRequest, token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    
    # Security check: patients can only check their own insights
    p_uuid = uuid_lib.UUID(data.patient_id)
    patient = db.query(models.Patient).filter(models.Patient.id == p_uuid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Get history summary
    history_data = get_patient_timeline_history(patient_id=data.patient_id, token=token, db=db)
    events = history_data.get("events", [])
    
    # Build text representation of timeline
    timeline_desc = []
    for ev in events[:10]: # Analyze top 10 recent events
        timeline_desc.append(
            f"Date: {ev['date']} | Type: {ev['type']} | Title: {ev['title']} | "
            f"Doctor: {ev['doctor_name']} | Details: {ev['description']}"
        )
    timeline_summary = "\n".join(timeline_desc)
    
    insights = analyze_patient_history(timeline_summary=timeline_summary)
    return {"insights": insights}


@router.post("/copilot/recommend-treatment")
def post_recommend_treatment(data: TreatmentRecommendRequest, token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    if user.role != "doctor":
         raise HTTPException(status_code=403, detail="Only doctors can access treatment recommendations.")
         
    history_context = ""
    if data.patient_id:
        p_uuid = uuid_lib.UUID(data.patient_id)
        patient = db.query(models.Patient).filter(models.Patient.id == p_uuid).first()
        if patient:
            history_context += f"Patient: {patient.user.full_name}. Condition: {patient.current_condition}. "
            
            # Fetch past diagnoses
            past_prescriptions = db.query(models.Prescription).filter(models.Prescription.patient_id == patient.id).all()
            if past_prescriptions:
                diagnoses = [p.diagnosis for p in past_prescriptions if p.diagnosis]
                history_context += f"Past Diagnoses: {', '.join(diagnoses[:3])}. "
                
    recommendations = get_treatment_recommendations(diagnosis=data.diagnosis, history_context=history_context)
    return {"recommendations": recommendations}
