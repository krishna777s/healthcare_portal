from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers.auth_routes import get_current_user_from_token
import models, schemas
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/pharmacy", tags=["pharmacy"])


def require_admin_or_pharmacy(token: str, db: Session):
    user = get_current_user_from_token(token, db)
    if user.role not in ("hospital_admin", "pharmacy"):
        raise HTTPException(status_code=403, detail="Admin or pharmacy access required")
    return user


# ─── All Pharmacy Orders ──────────────────────────────────────────────────────

@router.get("/orders", response_model=List[schemas.PharmacyOrderResponse])
def get_pharmacy_orders(token: str, db: Session = Depends(get_db)):
    require_admin_or_pharmacy(token, db)

    orders = (
        db.query(models.PharmacyOrder)
        .order_by(models.PharmacyOrder.created_at.desc())
        .all()
    )

    result = []
    for o in orders:
        presc = o.prescription
        patient_name = None
        doctor_name = None
        if presc:
            if presc.patient and presc.patient.user:
                patient_name = presc.patient.user.full_name
            if presc.doctor and presc.doctor.user:
                doctor_name = presc.doctor.user.full_name

        result.append(schemas.PharmacyOrderResponse(
            id=o.id,
            prescription_id=o.prescription_id,
            patient_name=patient_name,
            doctor_name=doctor_name,
            status=o.status,
            medicines=[
                schemas.PrescriptionItemResponse(
                    id=i.id,
                    medicine_name=i.medicine_name,
                    dosage=i.dosage,
                    frequency=i.frequency,
                    duration=i.duration,
                    instructions=i.instructions,
                )
                for i in (presc.items if presc else [])
            ],
            created_at=o.created_at or datetime.utcnow(),
            ready_at=o.ready_at,
        ))
    return result


# ─── Mark as Ready ────────────────────────────────────────────────────────────

@router.put("/orders/{order_id}/ready")
def mark_order_ready(order_id: str, token: str, db: Session = Depends(get_db)):
    require_admin_or_pharmacy(token, db)

    order = db.query(models.PharmacyOrder).filter(models.PharmacyOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "ready"
    order.ready_at = datetime.utcnow()
    db.commit()
    return {"message": "Order marked as ready"}


# ─── Mark as Dispensed ────────────────────────────────────────────────────────

@router.put("/orders/{order_id}/dispensed")
def mark_order_dispensed(order_id: str, token: str, db: Session = Depends(get_db)):
    require_admin_or_pharmacy(token, db)

    order = db.query(models.PharmacyOrder).filter(models.PharmacyOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "dispensed"
    order.dispensed_at = datetime.utcnow()
    db.commit()
    return {"message": "Order marked as dispensed"}
