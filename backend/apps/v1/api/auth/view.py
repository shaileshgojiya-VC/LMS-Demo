"""
View for the register, login, token refresh, and password reset.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.schema import (
    ForgetPasswordSchema,
    LoginUserSchema,
    RefreshTokenSchema,
    RegisterUserSchema,
    ResetPasswordSchema,
)
from apps.v1.api.auth.services.create_user_service import create_user_service
from apps.v1.api.auth.services.forget_password_service import forget_password_service
from apps.v1.api.auth.services.login_user_service import login_user_service
from apps.v1.api.auth.services.refresh_token_service import refresh_token_service
from apps.v1.api.auth.services.reset_password_service import reset_password_service
from apps.v1.api.auth.services.get_user_service import get_user_service
from apps.v1.api.auth.models.model import Users
from core.utils.auth_dependencies import get_current_user
from config.db_config import get_async_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register")
async def register_user(
    user: RegisterUserSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Register a new user and get JWT tokens.

    Args:
        user: RegisterUserSchema containing user registration data
        db: Async database session

    Returns:
        StandardResponse with created user data and JWT tokens or error message
    """
    logger.info(f"Registering user: {user.email}")
    response = await create_user_service(db=db, user_data=user)
    return response.make


@router.post("/login")
async def login_user(
    login_data: LoginUserSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Login user and get JWT tokens.

    Args:
        login_data: LoginUserSchema containing user login credentials
        db: Async database session

    Returns:
        StandardResponse with user data and JWT tokens or error message
    """
    logger.info(f"Login attempt for user: {login_data.email}")
    response = await login_user_service(db=db, login_data=login_data)
    return response.make


@router.post("/refresh")
async def refresh_token(
    token_data: RefreshTokenSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Refresh access token using refresh token.

    Args:
        token_data: RefreshTokenSchema containing refresh token
        db: Async database session

    Returns:
        StandardResponse with new access token and refresh token or error message
    """
    logger.info("Token refresh request received")
    response = await refresh_token_service(db=db, refresh_token=token_data.refresh_token)
    return response.make


@router.post("/forget-password")
async def forget_password(
    forget_password_data: ForgetPasswordSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Send password reset email to user.

    Args:
        forget_password_data: ForgetPasswordSchema containing user email
        db: Async database session

    Returns:
        StandardResponse with success or error message
    """
    logger.info(f"Forget password request for email: {forget_password_data.email}")
    response = await forget_password_service(db=db, forget_password_data=forget_password_data)
    return response.make


@router.post("/reset-password")
async def reset_password(
    reset_password_data: ResetPasswordSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Reset user password using reset token.

    Args:
        reset_password_data: ResetPasswordSchema containing reset token and new password
        db: Async database session

    Returns:
        StandardResponse with success or error message
    """
    logger.info("Password reset request received")
    response = await reset_password_service(db=db, reset_password_data=reset_password_data)
    return response.make


@router.get("/me")
async def get_current_user_profile(
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get current authenticated user profile.

    Args:
        current_user: Current authenticated user from dependency
        db: Async database session

    Returns:
        StandardResponse with user data or error message
    """
    logger.info(f"Fetching current user profile for user ID: {str(current_user.id)}")
    response = await get_user_service(db=db, current_user=current_user)
    return response.make