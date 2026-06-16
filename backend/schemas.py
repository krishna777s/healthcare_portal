from pydantic import BaseModel, EmailStr, computed_field
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = None

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def name(self) -> Optional[str]:
        return self.full_name

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ChangePassword(BaseModel):
    current_password: str
    new_password: str


# ─── Hospital ─────────────────────────────────────────────────────────────────

class HospitalResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    established_year: Optional[int] = None
    model_config = {"from_attributes": True}


# ─── Department ───────────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    head_doctor: Optional[str] = None
    total_beds: Optional[int] = 0

class DepartmentResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    head_doctor: Optional[str] = None
    total_beds: Optional[int] = None
    doctor_count: Optional[int] = 0
    model_config = {"from_attributes": True}


# ─── Staff ────────────────────────────────────────────────────────────────────

class StaffResponse(BaseModel):
    id: UUID
    full_name: str
    role: str
    department_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    shift: Optional[str] = None
    is_active: bool
    model_config = {"from_attributes": True}


class StaffCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    department_id: Optional[UUID] = None
    phone: Optional[str] = None
    shift: Optional[str] = None


# ─── Doctor ───────────────────────────────────────────────────────────────────

class DoctorCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None

class DoctorResponse(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    email: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    department_name: Optional[str] = None
    is_available: Optional[bool] = True
    model_config = {"from_attributes": True}


# ─── Patient ──────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    patient_type: Optional[str] = "outpatient"
    current_condition: Optional[str] = None
    assigned_doctor_id: Optional[UUID] = None
    ward: Optional[str] = None
    bed_number: Optional[str] = None

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    patient_type: Optional[str] = None
    current_condition: Optional[str] = None
    status: Optional[str] = None
    assigned_doctor_id: Optional[UUID] = None
    ward: Optional[str] = None
    bed_number: Optional[str] = None

class PatientResponse(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    patient_type: Optional[str] = None
    current_condition: Optional[str] = None
    status: Optional[str] = None
    assigned_doctor_name: Optional[str] = None
    last_visit: Optional[date] = None
    next_appointment: Optional[date] = None
    ward: Optional[str] = None
    bed_number: Optional[str] = None
    model_config = {"from_attributes": True}


# ─── Appointment ──────────────────────────────────────────────────────────────

class AppointmentResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[str] = None
    appointment_type: Optional[str] = None
    status: str
    notes: Optional[str] = None
    model_config = {"from_attributes": True}


class AppointmentCreate(BaseModel):
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    appointment_date: date
    appointment_time: Optional[str] = None
    appointment_type: Optional[str] = "consultation"
    status: Optional[str] = "scheduled"
    notes: Optional[str] = None



# ─── Admission (Inpatient) ────────────────────────────────────────────────────

class AdmissionResponse(BaseModel):
    id: UUID
    patient_id: Optional[UUID] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    ward: Optional[str] = None
    bed_number: Optional[str] = None
    admission_date: date
    discharge_date: Optional[date] = None
    diagnosis: Optional[str] = None
    days_admitted: Optional[int] = None
    is_active: bool
    model_config = {"from_attributes": True}


# ─── ICU ──────────────────────────────────────────────────────────────────────

class IcuAlertResponse(BaseModel):
    id: UUID
    icu_patient_id: UUID
    patient_name: Optional[str] = None
    bed_number: Optional[str] = None
    alert_type: str
    message: str
    severity: str
    is_acknowledged: bool
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class IcuPatientResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    bed_number: str
    admission_date: date
    condition: Optional[str] = None
    heart_rate: Optional[float] = None
    blood_pressure: Optional[str] = None
    oxygen_saturation: Optional[float] = None
    temperature: Optional[float] = None
    unread_alerts: Optional[int] = 0
    model_config = {"from_attributes": True}


# ─── Prescription ─────────────────────────────────────────────────────────────

class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: List[PrescriptionItemCreate] = []

class PrescriptionItemResponse(BaseModel):
    id: UUID
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    model_config = {"from_attributes": True}

class PrescriptionResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    ai_summary: Optional[str] = None
    pharmacy_status: Optional[str] = None
    created_at: datetime
    items: List[PrescriptionItemResponse] = []
    model_config = {"from_attributes": True}


# ─── Lab Report ───────────────────────────────────────────────────────────────

class LabReportCreate(BaseModel):
    patient_id: UUID
    report_name: str
    report_type: Optional[str] = None
    priority: Optional[str] = "normal"
    notes: Optional[str] = None

class LabReportResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    report_name: str
    report_type: Optional[str] = None
    file_url: Optional[str] = None
    status: str
    requested_date: Optional[date] = None
    result_date: Optional[date] = None
    priority: str
    notes: Optional[str] = None
    model_config = {"from_attributes": True}


# ─── Medical Record ───────────────────────────────────────────────────────────

class MedicalRecordCreate(BaseModel):
    patient_id: UUID
    record_type: Optional[str] = "consultation"
    title: str
    description: Optional[str] = None
    record_date: Optional[date] = None

class MedicalRecordResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    record_type: Optional[str] = None
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    record_date: Optional[date] = None
    model_config = {"from_attributes": True}


# ─── Pharmacy ─────────────────────────────────────────────────────────────────

class PharmacyOrderResponse(BaseModel):
    id: UUID
    prescription_id: UUID
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    status: str
    medicines: List[PrescriptionItemResponse] = []
    created_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ─── Admin Dashboard Stats ────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_departments: int
    total_doctors: int
    total_staff: int
    total_patients: int
    total_outpatients: int
    total_inpatients: int
    total_icu: int
    total_lab_reports: int
    pending_pharmacy_orders: int

class ChartDataPoint(BaseModel):
    month: str
    patients: int
    staff: int


# ─── Doctor Dashboard Stats ───────────────────────────────────────────────────

class DoctorStats(BaseModel):
    assigned_patients: int
    todays_appointments: int
    pending_reports: int
    icu_patients: int
    unread_icu_alerts: int
    inpatients: int
    outpatients: int


# ─── Patient Dashboard Stats ──────────────────────────────────────────────────

class PatientStats(BaseModel):
    upcoming_appointments: int
    total_reports: int
    total_prescriptions: int
