from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ─── Shared Helper (imported by other routers) ────────────────────────────────

def get_current_user_from_token(token: str, db: Session) -> models.User:
    try:
        payload = auth.jwt.decode(token, auth.JWT_SECRET, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except auth.jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except auth.jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role in ("doctor", "patient", "hospital_admin", "pharmacy", "pharmacist"):
        raise HTTPException(
            status_code=400,
            detail="Registration is disabled for this role. Account credentials must be provisioned by the Administrator."
        )

    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.name,
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please sign up.",
        )
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "id": str(db_user.id), "role": db_user.role},
        expires_delta=access_token_expires,
    )

    user_response = schemas.UserResponse.model_validate(db_user)
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(token: str, db: Session = Depends(get_db)):
    return get_current_user_from_token(token, db)


@router.put("/change-password")
def change_password(data: schemas.ChangePassword, token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)

    if not auth.verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    user.hashed_password = auth.get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
