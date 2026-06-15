from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from routers.auth_routes import get_current_user_from_token
import models, schemas
from typing import List
from datetime import date

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(token: str, db: Session):
    user = get_current_user_from_token(token, db)
    if user.role != "hospital_admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=schemas.AdminStats)
def get_admin_stats(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    total_departments = db.query(models.Department).count()
    total_doctors = db.query(models.Doctor).count()
    total_staff = db.query(models.Staff).filter(models.Staff.is_active == True).count()
    total_patients = db.query(models.Patient).count()
    total_outpatients = db.query(models.Patient).filter(models.Patient.patient_type == "outpatient").count()
    total_inpatients = db.query(models.Patient).filter(models.Patient.patient_type == "inpatient").count()
    total_icu = db.query(models.Patient).filter(models.Patient.patient_type == "icu").count()
    total_lab_reports = db.query(models.LabReport).count()
    pending_pharmacy = db.query(models.PharmacyOrder).filter(models.PharmacyOrder.status == "pending").count()

    return schemas.AdminStats(
        total_departments=total_departments,
        total_doctors=total_doctors,
        total_staff=total_staff,
        total_patients=total_patients,
        total_outpatients=total_outpatients,
        total_inpatients=total_inpatients,
        total_icu=total_icu,
        total_lab_reports=total_lab_reports,
        pending_pharmacy_orders=pending_pharmacy,
    )


# ─── Chart Data ───────────────────────────────────────────────────────────────

@router.get("/chart-data", response_model=List[schemas.ChartDataPoint])
def get_chart_data(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    result = []
    current_year = date.today().year

    for i, month_name in enumerate(months, start=1):
        patient_count = db.query(models.Patient).filter(
            extract("month", models.Patient.created_at) == i,
            extract("year", models.Patient.created_at) == current_year,
        ).count()
        staff_count = db.query(models.Staff).filter(
            extract("month", models.Staff.created_at) == i,
            extract("year", models.Staff.created_at) == current_year,
        ).count()
        result.append(schemas.ChartDataPoint(month=month_name, patients=patient_count, staff=staff_count))

    return result


# ─── Departments ──────────────────────────────────────────────────────────────

@router.get("/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    departments = db.query(models.Department).all()
    result = []
    for dept in departments:
        doctor_count = db.query(models.Doctor).filter(models.Doctor.department_id == dept.id).count()
        result.append(schemas.DepartmentResponse(
            id=dept.id,
            name=dept.name,
            description=dept.description,
            head_doctor=dept.head_doctor,
            total_beds=dept.total_beds,
            doctor_count=doctor_count,
        ))
    return result


@router.post("/departments", response_model=schemas.DepartmentResponse)
def create_department(data: schemas.DepartmentCreate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    existing = db.query(models.Department).filter(models.Department.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name already exists")

    dept = models.Department(
        name=data.name,
        description=data.description,
        head_doctor=data.head_doctor,
        total_beds=data.total_beds
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)

    return schemas.DepartmentResponse(
        id=dept.id,
        name=dept.name,
        description=dept.description,
        head_doctor=dept.head_doctor,
        total_beds=dept.total_beds,
        doctor_count=0
    )


# ─── Staff (Doctors + Non-Doctor Staff) ──────────────────────────────────────

@router.get("/staff", response_model=List[schemas.StaffResponse])
def get_all_staff(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    staff_list = db.query(models.Staff).all()
    result = []
    for s in staff_list:
        dept_name = None
        if s.department_id:
            dept = db.query(models.Department).filter(models.Department.id == s.department_id).first()
            dept_name = dept.name if dept else None
        result.append(schemas.StaffResponse(
            id=s.id,
            full_name=s.full_name,
            role=s.role,
            department_name=dept_name,
            phone=s.phone,
            email=s.email,
            shift=s.shift,
            is_active=s.is_active,
        ))
    return result


@router.get("/doctors", response_model=List[schemas.DoctorResponse])
def get_all_doctors(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    doctors = db.query(models.Doctor).all()
    result = []
    for doc in doctors:
        dept_name = None
        if doc.department_id:
            dept = db.query(models.Department).filter(models.Department.id == doc.department_id).first()
            dept_name = dept.name if dept else None
        result.append(schemas.DoctorResponse(
            id=doc.id,
            full_name=doc.user.full_name if doc.user else None,
            email=doc.user.email if doc.user else None,
            specialization=doc.specialization,
            qualification=doc.qualification,
            experience_years=doc.experience_years,
            phone=doc.phone,
            department_name=dept_name,
            is_available=doc.is_available,
        ))
    return result


# ─── Patients ─────────────────────────────────────────────────────────────────

@router.get("/patients", response_model=List[schemas.PatientResponse])
def get_all_patients(token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    patients = db.query(models.Patient).all()
    result = []
    for p in patients:
        # get last completed appointment
        last_appt = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.patient_id == p.id,
                models.Appointment.status == "completed",
            )
            .order_by(models.Appointment.appointment_date.desc())
            .first()
        )
        # get next upcoming appointment
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
        assigned_doc_name = None
        if p.assigned_doctor_id:
            doc = db.query(models.Doctor).filter(models.Doctor.id == p.assigned_doctor_id).first()
            if doc and doc.user:
                assigned_doc_name = doc.user.full_name

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
            assigned_doctor_name=assigned_doc_name,
            last_visit=last_appt.appointment_date if last_appt else None,
            next_appointment=next_appt.appointment_date if next_appt else None,
        ))
    return result


# ─── Diagnostics / Lab Reports ────────────────────────────────────────────────

@router.get("/diagnostics", response_model=List[schemas.LabReportResponse])
def get_all_diagnostics(token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    if user.role not in ["hospital_admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Admin or Doctor access required")

    if user.role == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        reports = db.query(models.LabReport).filter(models.LabReport.doctor_id == doctor.id).order_by(models.LabReport.created_at.desc()).all()
    else:
        reports = db.query(models.LabReport).order_by(models.LabReport.created_at.desc()).all()
    result = []
    for r in reports:
        patient_name = r.patient.user.full_name if r.patient and r.patient.user else None
        doctor_name = None
        if r.doctor_id:
            doc = db.query(models.Doctor).filter(models.Doctor.id == r.doctor_id).first()
            doctor_name = doc.user.full_name if doc and doc.user else None
        result.append(schemas.LabReportResponse(
            id=r.id,
            patient_name=patient_name,
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


# ─── Doctor CRUD ──────────────────────────────────────────────────────────────

@router.post("/doctors", response_model=schemas.DoctorResponse)
def create_doctor(data: schemas.DoctorCreate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    from auth import get_password_hash
    hashed_password = get_password_hash(data.password)

    new_user = models.User(
        email=data.email,
        hashed_password=hashed_password,
        full_name=data.full_name,
        role="doctor"
    )
    db.add(new_user)
    db.flush()

    new_doctor = models.Doctor(
        user_id=new_user.id,
        department_id=data.department_id,
        specialization=data.specialization,
        qualification=data.qualification,
        experience_years=data.experience_years,
        phone=data.phone,
        is_available=True
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    dept_name = None
    if new_doctor.department_id:
        dept = db.query(models.Department).filter(models.Department.id == new_doctor.department_id).first()
        dept_name = dept.name if dept else None

    return schemas.DoctorResponse(
        id=new_doctor.id,
        full_name=new_user.full_name,
        email=new_user.email,
        specialization=new_doctor.specialization,
        qualification=new_doctor.qualification,
        experience_years=new_doctor.experience_years,
        phone=new_doctor.phone,
        department_name=dept_name,
        is_available=new_doctor.is_available
    )


@router.post("/staff", response_model=schemas.StaffResponse)
def create_staff(data: schemas.StaffCreate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_staff = db.query(models.Staff).filter(models.Staff.email == data.email).first()
    if existing_staff:
        raise HTTPException(status_code=400, detail="Email already registered to another staff member")

    from auth import get_password_hash
    hashed_password = get_password_hash(data.password)

    user_role = "pharmacy" if data.role == "pharmacist" else data.role

    new_user = models.User(
        email=data.email,
        hashed_password=hashed_password,
        full_name=data.full_name,
        role=user_role
    )
    db.add(new_user)
    db.flush()

    new_staff = models.Staff(
        full_name=data.full_name,
        role=data.role,
        department_id=data.department_id,
        phone=data.phone,
        email=data.email,
        shift=data.shift or "morning",
        is_active=True
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    dept_name = None
    if new_staff.department_id:
        dept = db.query(models.Department).filter(models.Department.id == new_staff.department_id).first()
        dept_name = dept.name if dept else None

    return schemas.StaffResponse(
        id=new_staff.id,
        full_name=new_staff.full_name,
        role=new_staff.role,
        department_name=dept_name,
        phone=new_staff.phone,
        email=new_staff.email,
        shift=new_staff.shift,
        is_active=new_staff.is_active
    )


# ─── Patient CRUD ─────────────────────────────────────────────────────────────

@router.post("/patients", response_model=schemas.PatientResponse)
def create_patient(data: schemas.PatientCreate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    from auth import get_password_hash
    hashed_password = get_password_hash(data.password)

    new_user = models.User(
        email=data.email,
        hashed_password=hashed_password,
        full_name=data.full_name,
        role="patient"
    )
    db.add(new_user)
    db.flush()

    new_patient = models.Patient(
        user_id=new_user.id,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        blood_group=data.blood_group,
        phone=data.phone,
        patient_type=data.patient_type or "outpatient",
        current_condition=data.current_condition,
        assigned_doctor_id=data.assigned_doctor_id,
        status="under_review"
    )
    db.add(new_patient)
    db.flush()

    if new_patient.patient_type == "inpatient":
        admission = models.Admission(
            patient_id=new_patient.id,
            doctor_id=new_patient.assigned_doctor_id,
            admission_date=date.today(),
            diagnosis=data.current_condition or "Admitted",
            is_active=True
        )
        db.add(admission)

    db.commit()
    db.refresh(new_patient)

    assigned_doc_name = None
    if new_patient.assigned_doctor_id:
        doc = db.query(models.Doctor).filter(models.Doctor.id == new_patient.assigned_doctor_id).first()
        assigned_doc_name = doc.user.full_name if doc and doc.user else None

    return schemas.PatientResponse(
        id=new_patient.id,
        full_name=new_user.full_name,
        email=new_user.email,
        date_of_birth=new_patient.date_of_birth,
        gender=new_patient.gender,
        blood_group=new_patient.blood_group,
        phone=new_patient.phone,
        patient_type=new_patient.patient_type,
        current_condition=new_patient.current_condition,
        status=new_patient.status,
        assigned_doctor_name=assigned_doc_name,
        last_visit=None,
        next_appointment=None
    )


@router.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: str, data: schemas.PatientUpdate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

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

    old_type = patient.patient_type
    if data.patient_type is not None:
        patient.patient_type = data.patient_type

    if data.assigned_doctor_id is not None:
        patient.assigned_doctor_id = data.assigned_doctor_id

    if patient.patient_type == "inpatient" and (old_type != "inpatient" or data.assigned_doctor_id is not None):
        admission = db.query(models.Admission).filter(
            models.Admission.patient_id == patient.id,
            models.Admission.is_active == True
        ).first()
        if not admission:
            admission = models.Admission(
                patient_id=patient.id,
                doctor_id=patient.assigned_doctor_id,
                admission_date=date.today(),
                diagnosis=patient.current_condition or "Admitted",
                is_active=True
            )
            db.add(admission)
        else:
            if data.assigned_doctor_id is not None:
                admission.doctor_id = data.assigned_doctor_id

    if old_type == "inpatient" and patient.patient_type != "inpatient":
        admission = db.query(models.Admission).filter(
            models.Admission.patient_id == patient.id,
            models.Admission.is_active == True
        ).first()
        if admission:
            admission.is_active = False
            admission.discharge_date = date.today()

    db.commit()
    db.refresh(patient)

    assigned_doc_name = None
    if patient.assigned_doctor_id:
        doc = db.query(models.Doctor).filter(models.Doctor.id == patient.assigned_doctor_id).first()
        assigned_doc_name = doc.user.full_name if doc and doc.user else None

    last_appt = (
        db.query(models.Appointment)
        .filter(models.Appointment.patient_id == patient.id, models.Appointment.status == "completed")
        .order_by(models.Appointment.appointment_date.desc())
        .first()
    )
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
        last_visit=last_appt.appointment_date if last_appt else None,
        next_appointment=next_appt.appointment_date if next_appt else None
    )


# ─── Bulk Patient Assignment ───────────────────────────────────────────────

class BulkAssignSchema(schemas.BaseModel):
    patient_ids: List[schemas.UUID]
    doctor_id: schemas.UUID

@router.post("/patients/bulk-assign")
def bulk_assign_patients(data: BulkAssignSchema, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)

    doctor = db.query(models.Doctor).filter(models.Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    patients = db.query(models.Patient).filter(models.Patient.id.in_(data.patient_ids)).all()
    for patient in patients:
        patient.assigned_doctor_id = doctor.id
        
        if patient.patient_type == "inpatient":
            admission = db.query(models.Admission).filter(
                models.Admission.patient_id == patient.id,
                models.Admission.is_active == True
            ).first()
            if admission:
                admission.doctor_id = doctor.id
            else:
                admission = models.Admission(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    admission_date=date.today(),
                    diagnosis=patient.current_condition or "Admitted",
                    is_active=True
                )
                db.add(admission)

    db.commit()
    return {"message": f"Successfully assigned {len(patients)} patients to Dr. {doctor.user.full_name if doctor.user else 'None'}"}


@router.post("/appointments", response_model=schemas.AppointmentResponse)
def create_admin_appointment(data: schemas.AppointmentCreate, token: str, db: Session = Depends(get_db)):
    require_admin(token, db)
    
    patient = db.query(models.Patient).filter(models.Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    doctor_id = data.doctor_id or patient.assigned_doctor_id
    if not doctor_id:
        raise HTTPException(status_code=400, detail="No doctor assigned to patient, and no doctor_id provided.")
        
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
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

