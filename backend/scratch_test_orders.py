import sys
import os
sys.path.append(os.path.abspath('.'))

from database import SessionLocal
import models
import auth
from datetime import timedelta
from routers.pharmacy_routes import get_pharmacy_orders

db = SessionLocal()
try:
    user = db.query(models.User).filter(models.User.email == "pharmacy@hospital.com").first()
    print(f"Testing user: {user.email}, role: {user.role}")
    
    # Generate token
    token = auth.create_access_token(
        data={"sub": user.email, "id": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=30)
    )
    print(f"Generated Token: {token}")
    
    # Call endpoint
    orders = get_pharmacy_orders(token=token, db=db)
    print(f"Successfully retrieved {len(orders)} orders!")
    for o in orders:
        print(f"Order ID: {o.id}, Patient: {o.patient_name}, Status: {o.status}, Medicines: {[m.medicine_name for m in o.medicines]}")
except Exception as e:
    import traceback
    print("Error calling get_pharmacy_orders:")
    traceback.print_exc()
finally:
    db.close()
