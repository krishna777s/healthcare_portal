import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from database import engine, Base
from routers import auth_routes, admin_routes, doctor_routes, patient_routes, pharmacy_routes, ai_history_routes
from fastapi import Depends
from sqlalchemy.orm import Session
import database
import models

# Create all database tables
Base.metadata.create_all(bind=engine)

def seed_doctor_patient_types():
    from database import SessionLocal
    import models
    from datetime import date
    import auth
    import uuid
    db = SessionLocal()
    try:
        doctors = db.query(models.Doctor).all()
        for doc in doctors:
            inpatient_count = db.query(models.Patient).filter(
                models.Patient.assigned_doctor_id == doc.id,
                models.Patient.patient_type == "inpatient"
            ).count()
            
            icu_count = db.query(models.Patient).filter(
                models.Patient.assigned_doctor_id == doc.id,
                models.Patient.patient_type == "icu"
            ).count()

            patients = db.query(models.Patient).filter(models.Patient.assigned_doctor_id == doc.id).all()
            
            if len(patients) > 0:
                if inpatient_count == 0:
                    patients[0].patient_type = "inpatient"
                    inpatient_count = 1
                if len(patients) > 1 and icu_count == 0:
                    patients[1].patient_type = "icu"
                    icu_count = 1
                    
            if inpatient_count == 0:
                email = f"inpatient_{uuid.uuid4().hex[:6]}@hospital.com"
                user = models.User(
                    email=email,
                    hashed_password=auth.get_password_hash("patient123"),
                    full_name="John Doe (Inpatient)",
                    role="patient"
                )
                db.add(user)
                db.flush()
                patient = models.Patient(
                    user_id=user.id,
                    assigned_doctor_id=doc.id,
                    date_of_birth=date(1990, 5, 12),
                    gender="male",
                    blood_group="O+",
                    phone="9876543210",
                    patient_type="inpatient",
                    current_condition="Recovering from Appendectomy",
                    status="improving"
                )
                db.add(patient)
                db.flush()
                
            if icu_count == 0:
                email = f"icu_{uuid.uuid4().hex[:6]}@hospital.com"
                user = models.User(
                    email=email,
                    hashed_password=auth.get_password_hash("patient123"),
                    full_name="Sarah Smith (ICU)",
                    role="patient"
                )
                db.add(user)
                db.flush()
                patient = models.Patient(
                    user_id=user.id,
                    assigned_doctor_id=doc.id,
                    date_of_birth=date(1985, 8, 24),
                    gender="female",
                    blood_group="AB-",
                    phone="9876543211",
                    patient_type="icu",
                    current_condition="Severe Pneumonia",
                    status="under_review"
                )
                db.add(patient)
                db.flush()

            inpatients_list = db.query(models.Patient).filter(
                models.Patient.assigned_doctor_id == doc.id,
                models.Patient.patient_type == "inpatient"
            ).all()
            for p in inpatients_list:
                admission = db.query(models.Admission).filter(
                    models.Admission.patient_id == p.id,
                    models.Admission.is_active == True
                ).first()
                if not admission:
                    db.add(models.Admission(
                        patient_id=p.id,
                        doctor_id=doc.id,
                        ward="General Ward B",
                        bed_number="B-102",
                        admission_date=date.today(),
                        diagnosis=p.current_condition or "Admitted",
                        is_active=True
                    ))

            icu_list = db.query(models.Patient).filter(
                models.Patient.assigned_doctor_id == doc.id,
                models.Patient.patient_type == "icu"
            ).all()
            for p in icu_list:
                icu = db.query(models.IcuPatient).filter(
                    models.IcuPatient.patient_id == p.id,
                    models.IcuPatient.is_active == True
                ).first()
                if not icu:
                    icu = models.IcuPatient(
                        patient_id=p.id,
                        doctor_id=doc.id,
                        bed_number="ICU-A3",
                        admission_date=date.today(),
                        condition=p.current_condition or "Critical",
                        heart_rate=94.0,
                        blood_pressure="130/80",
                        oxygen_saturation=93.0,
                        temperature=38.5,
                        is_active=True
                    )
                    db.add(icu)
                    db.flush()
                
                alert_count = db.query(models.IcuAlert).filter(
                    models.IcuAlert.icu_patient_id == icu.id,
                    models.IcuAlert.is_acknowledged == False
                ).count()
                if alert_count == 0:
                    db.add(models.IcuAlert(
                        icu_patient_id=icu.id,
                        alert_type="oxygen",
                        message="Oxygen saturation dropped below 94% (currently 93%)",
                        severity="high",
                        is_acknowledged=False
                    ))
        db.commit()
    except Exception as e:
        print(f"Error seeding doctor patient types: {e}")
        db.rollback()
    finally:
        db.close()

seed_doctor_patient_types()

# Ensure uploads directory exists
os.makedirs("uploads/prescriptions", exist_ok=True)
os.makedirs("uploads/lab_reports", exist_ok=True)
os.makedirs("uploads/medical_records", exist_ok=True)

app = FastAPI(title="Hospital Management API", version="2.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        "https://healthcare-cerevyn.azurewebsites.net"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static URLs
# e.g., http://localhost:8000/uploads/prescriptions/file.jpg
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(doctor_routes.router)
app.include_router(patient_routes.router)
app.include_router(pharmacy_routes.router)
app.include_router(ai_history_routes.router)


@app.get("/api/clean-db")
def clean_db(db: Session = Depends(database.get_db)):
    import auth
    users = db.query(models.User).filter(models.User.role.in_(["pharmacist", "pharmacy"])).all()
    for u in users:
        if u.email != "pharmacy@hospital.com":
            staff = db.query(models.Staff).filter(models.Staff.email == u.email).first()
            if staff:
                db.delete(staff)
            db.delete(u)
    db.commit()
    
    pharmacy_user = db.query(models.User).filter(models.User.email == "pharmacy@hospital.com").first()
    if pharmacy_user:
        pharmacy_user.full_name = "Pharmacy"
        pharmacy_user.hashed_password = auth.get_password_hash("pharmacy123")
        pharmacy_user.role = "pharmacy"
        staff = db.query(models.Staff).filter(models.Staff.email == pharmacy_user.email).first()
        if not staff:
            db.add(models.Staff(full_name=pharmacy_user.full_name, email=pharmacy_user.email, role="pharmacist", shift="morning", phone="+91-9000000099"))
        else:
            staff.role = "pharmacist"
            staff.full_name = pharmacy_user.full_name
            staff.phone = "+91-9000000099"
        db.commit()
    else:
        new_user = models.User(email="pharmacy@hospital.com", hashed_password=auth.get_password_hash("pharmacy123"), full_name="Pharmacy", role="pharmacy")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db.add(models.Staff(full_name=new_user.full_name, email=new_user.email, role="pharmacist", shift="morning", phone="+91-9000000099"))
        db.commit()
    return {"status": "cleaned"}

@app.get("/")
def read_root():
    return {"message": "Hospital Management API v2.0", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
