import uuid
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Integer, Float,
    Text, ForeignKey, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class PatientType(str, enum.Enum):
    outpatient = "outpatient"
    inpatient = "inpatient"
    icu = "icu"

class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class ReportStatus(str, enum.Enum):
    pending = "pending"
    available = "available"
    reviewed = "reviewed"

class PharmacyStatus(str, enum.Enum):
    pending = "pending"
    ready = "ready"
    dispensed = "dispensed"

class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# ─── Users (existing, extended) ───────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, nullable=True)  # hospital_admin | doctor | patient
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)


# ─── Hospital ─────────────────────────────────────────────────────────────────

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    established_year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    departments = relationship("Department", back_populates="hospital")


# ─── Department ───────────────────────────────────────────────────────────────

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    head_doctor = Column(String, nullable=True)
    total_beds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="departments")
    doctors = relationship("Doctor", back_populates="department")


# ─── Doctor ───────────────────────────────────────────────────────────────────

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    specialization = Column(String, nullable=True)
    qualification = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    phone = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    icu_patients = relationship("IcuPatient", back_populates="doctor")


# ─── Staff (non-doctor) ───────────────────────────────────────────────────────

class Staff(Base):
    __tablename__ = "staff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)   # nurse | receptionist | lab_tech | pharmacist
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    shift = Column(String, nullable=True)   # morning | evening | night
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Patient ──────────────────────────────────────────────────────────────────

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String, nullable=True)
    patient_type = Column(String, default="outpatient")  # outpatient | inpatient | icu
    current_condition = Column(String, nullable=True)
    status = Column(String, default="stable")  # stable | under_review | critical | improving
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="patient_profile")
    assigned_doctor = relationship("Doctor", foreign_keys=[assigned_doctor_id])
    appointments = relationship("Appointment", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    lab_reports = relationship("LabReport", back_populates="patient")
    admission = relationship("Admission", back_populates="patient", uselist=False)
    icu_record = relationship("IcuPatient", back_populates="patient", uselist=False)
    medical_records = relationship("MedicalRecord", back_populates="patient")


# ─── Appointment ──────────────────────────────────────────────────────────────

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String, nullable=True)
    appointment_type = Column(String, nullable=True)  # consultation | follow-up | check-up | emergency
    status = Column(String, default="scheduled")      # scheduled | confirmed | completed | cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")


# ─── Admission (Inpatients) ───────────────────────────────────────────────────

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    ward = Column(String, nullable=True)
    bed_number = Column(String, nullable=True)
    admission_date = Column(Date, nullable=False)
    discharge_date = Column(Date, nullable=True)
    diagnosis = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="admission")


# ─── ICU Patient ──────────────────────────────────────────────────────────────

class IcuPatient(Base):
    __tablename__ = "icu_patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    bed_number = Column(String, nullable=False)
    admission_date = Column(Date, nullable=False)
    condition = Column(String, nullable=True)
    heart_rate = Column(Float, nullable=True)
    blood_pressure = Column(String, nullable=True)
    oxygen_saturation = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="icu_record")
    doctor = relationship("Doctor", back_populates="icu_patients")
    alerts = relationship("IcuAlert", back_populates="icu_patient")


# ─── ICU Alert ────────────────────────────────────────────────────────────────

class IcuAlert(Base):
    __tablename__ = "icu_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    icu_patient_id = Column(UUID(as_uuid=True), ForeignKey("icu_patients.id"), nullable=False)
    alert_type = Column(String, nullable=False)    # heart_rate | bp | oxygen | temperature
    message = Column(Text, nullable=False)
    severity = Column(String, default="medium")    # low | medium | high | critical
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    icu_patient = relationship("IcuPatient", back_populates="alerts")


# ─── Prescription ─────────────────────────────────────────────────────────────

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)   # URL to uploaded prescription image/PDF
    ai_summary = Column(Text, nullable=True)    # AI-generated summary (future)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")
    pharmacy_order = relationship("PharmacyOrder", back_populates="prescription", uselist=False)


# ─── Prescription Item (medicines) ───────────────────────────────────────────

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)        # e.g., "500mg"
    frequency = Column(String, nullable=True)     # e.g., "Twice daily"
    duration = Column(String, nullable=True)      # e.g., "7 days"
    instructions = Column(Text, nullable=True)    # e.g., "Take after meals"

    prescription = relationship("Prescription", back_populates="items")


# ─── Lab Report ───────────────────────────────────────────────────────────────

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    report_name = Column(String, nullable=False)
    report_type = Column(String, nullable=True)   # blood_test | ecg | xray | mri | lipid | urine
    file_url = Column(String, nullable=True)      # URL to uploaded report file
    status = Column(String, default="pending")    # pending | available | reviewed
    requested_date = Column(Date, nullable=True)
    result_date = Column(Date, nullable=True)
    priority = Column(String, default="normal")   # low | normal | high
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="lab_reports")


# ─── Medical Record ───────────────────────────────────────────────────────────

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    record_type = Column(String, nullable=True)   # consultation | surgery | vaccination
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    record_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_records")


# ─── Pharmacy Order ───────────────────────────────────────────────────────────

class PharmacyOrder(Base):
    __tablename__ = "pharmacy_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"), nullable=False)
    status = Column(String, default="pending")    # pending | ready | dispensed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ready_at = Column(DateTime, nullable=True)
    dispensed_at = Column(DateTime, nullable=True)

    prescription = relationship("Prescription", back_populates="pharmacy_order")
