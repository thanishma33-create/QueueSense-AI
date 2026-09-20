from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    is_active: bool
    created_at: datetime
