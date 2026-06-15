import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from database import engine, Base
from routers import auth_routes, admin_routes, doctor_routes, patient_routes, pharmacy_routes
from fastapi import Depends
from sqlalchemy.orm import Session
import database
import models

# Create all database tables
Base.metadata.create_all(bind=engine)

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


@app.get("/api/clean-db")
def clean_db(db: Session = Depends(database.get_db)):
    from utils import auth
    users = db.query(models.User).filter(models.User.role.in_(["pharmacist", "pharmacy"])).all()
    for u in users:
        if u.email != "pharmacy@hospital.com":
            staff = db.query(models.Staff).filter(models.Staff.user_id == u.id).first()
            if staff:
                db.delete(staff)
            db.delete(u)
    db.commit()
    
    pharmacy_user = db.query(models.User).filter(models.User.email == "pharmacy@hospital.com").first()
    if pharmacy_user:
        pharmacy_user.full_name = "Pharmacy"
        pharmacy_user.hashed_password = auth.get_password_hash("pharmacy123")
        pharmacy_user.role = "pharmacist"
        staff = db.query(models.Staff).filter(models.Staff.user_id == pharmacy_user.id).first()
        if not staff:
            db.add(models.Staff(user_id=pharmacy_user.id, role="pharmacist", shift="morning"))
        else:
            staff.role = "pharmacist"
        db.commit()
    else:
        new_user = models.User(email="pharmacy@hospital.com", hashed_password=auth.get_password_hash("pharmacy123"), full_name="Pharmacy", role="pharmacist")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db.add(models.Staff(user_id=new_user.id, role="pharmacist", shift="morning"))
        db.commit()
    return {"status": "cleaned"}

@app.get("/")
def read_root():
    return {"message": "Hospital Management API v2.0", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
