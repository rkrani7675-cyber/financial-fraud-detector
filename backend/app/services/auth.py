import logging
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """Hash password securely with bcrypt and salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as err:
        logger.error(f"Error checking password hash: {err}", exc_info=True)
        return False

def create_access_token(user_id: int, email: str) -> str:
    """Create signed JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate signed JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Access token has expired.")
        return None
    except jwt.InvalidTokenError as err:
        logger.error(f"Invalid access token: {err}")
        return None

def extract_token_from_request(request: Request) -> Optional[str]:
    """
    Extract token with priority:
    1. httpOnly Cookie ('ffd_token')
    2. Authorization header ('Bearer <token>')
    """
    # 1. Check httpOnly cookie
    cookie_token = request.cookies.get(settings.COOKIE_NAME)
    if cookie_token and cookie_token.strip():
        return cookie_token.strip()

    # 2. Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    return None

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """FastAPI dependency: require authenticated user or raise 401."""
    token = extract_token_from_request(request)
    if not token:
        logger.error("Authentication required: Missing token in cookie and Authorization header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource."
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        logger.error("Authentication rejected: Session expired or invalid token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again."
        )

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        logger.error("Authentication rejected: Malformed user ID in token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication session."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"Authentication rejected: User ID {user_id} not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )

    return user

def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """FastAPI dependency: return authenticated user if present, else None."""
    token = extract_token_from_request(request)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        return None

    return db.query(User).filter(User.id == user_id).first()
