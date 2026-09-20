from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.utils.security import verify_password, create_access_token
from app.dependencies import get_current_user
from app.utils.logging_config import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user using email and password. Returns JWT access token.
    """
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for email: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please contact your hospital administrator."
        )

    access_token = create_access_token(
        subject=user.id,
        role=user.role
    )

    logger.info(f"User {user.email} successfully logged in as {user.role}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile of the currently authenticated user."""
    return current_user
