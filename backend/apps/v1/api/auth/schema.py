"""
Pydantic schemas for authentication.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterUserSchema(BaseModel):
    """Schema for user registration."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
    full_name: str = Field(..., description="User's full name")


class LoginUserSchema(BaseModel):
    """Schema for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class RefreshTokenSchema(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str = Field(..., description="Refresh token to exchange for new access token")


class ForgetPasswordSchema(BaseModel):
    """Schema for forget password request."""

    email: EmailStr = Field(..., description="User's email address")


class ResetPasswordSchema(BaseModel):
    """Schema for reset password request."""

    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")


class UserResponseSchema(BaseModel):
    """Schema for user response."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., description="User's full name")
    is_active: bool = Field(..., description="Whether user is active")
    is_verified: bool = Field(..., description="Whether user is verified")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Update timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True
