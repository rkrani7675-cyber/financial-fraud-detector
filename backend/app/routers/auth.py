import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, UserResponse, AuthResponse
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

logger = logging.getLogger(__name__)

router = APIRouter()

def set_auth_cookie(response: Response, token: str):
    """Set hardened httpOnly JWT authentication cookie."""
    max_age_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, response: Response, db: Session = Depends(get_db)):
    """Register a new user account, hash password with bcrypt, and set httpOnly auth cookie."""
    logger.info(f"Processing signup registration for email: {payload.email}")

    # Check email duplicate
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        logger.error(f"Signup rejected: Email '{payload.email}' already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    # Hash password with bcrypt
    hashed = hash_password(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue JWT token and set httpOnly cookie
    token = create_access_token(user.id, user.email)
    set_auth_cookie(response, token)

    logger.info(f"User '{user.name}' (ID {user.id}) registered and authenticated successfully.")
    return AuthResponse(
        success=True,
        message="Account created successfully.",
        user=UserResponse.model_validate(user)
    )

@router.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticate credentials, verify bcrypt hash, and set httpOnly auth cookie."""
    logger.info(f"Login attempt for email: {payload.email}")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        logger.error(f"Login failed: User with email '{payload.email}' not found.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(payload.password, user.password_hash):
        logger.error(f"Login failed: Incorrect password for '{payload.email}'.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Issue JWT token and set httpOnly cookie
    token = create_access_token(user.id, user.email)
    set_auth_cookie(response, token)

    logger.info(f"User '{user.name}' (ID {user.id}) signed in successfully.")
    return AuthResponse(
        success=True,
        message="Signed in successfully.",
        user=UserResponse.model_validate(user)
    )

@router.post("/auth/logout")
def logout(response: Response):
    """Clear httpOnly JWT authentication cookie."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=True,
        samesite=settings.COOKIE_SAMESITE
    )
    logger.info("User signed out, auth cookie deleted.")
    return {"success": True, "message": "Signed out successfully."}

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve authenticated user identity."""
    return UserResponse.model_validate(current_user)
