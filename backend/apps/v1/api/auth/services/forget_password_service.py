"""
Service for forget password functionality.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.methods.password_reset_method import get_user_by_email_for_password_reset
from apps.v1.api.auth.schema import ForgetPasswordSchema
from core.utils import constant_variable, message_variable
from core.utils.email_service import render_email_template, send_email
from core.utils.jwt_hanlder import jwt_handler
from core.utils.standard_response import StandardResponse
from config.env_config import settings

logger = logging.getLogger(__name__)


async def forget_password_service(
    db: AsyncSession,
    forget_password_data: ForgetPasswordSchema,
) -> StandardResponse:
    """
    Send password reset email to user.

    Args:
        db: Async database session
        forget_password_data: ForgetPasswordSchema containing user email

    Returns:
        StandardResponse with success or error message
    """
    logger.info("STEP 1: Starting forget password workflow")

    try:
        logger.info("STEP 2: Validating input data")

        email = forget_password_data.email.lower().strip()

        logger.info(f"STEP 3: Fetching user with email {email}")

        user = await get_user_by_email_for_password_reset(db=db, email=email)

        if not user:
            logger.warning(f"User with email {email} not found")
            return StandardResponse(
                status=constant_variable.STATUS_SUCCESS,
                status_code=constant_variable.HTTP_200_OK,
                data=constant_variable.STATUS_NULL,
                message=message_variable.FORGET_PASSWORD_SUCCESS,
            )

        if not user.is_active:
            logger.warning(f"User account is inactive: {user.email}")
            return StandardResponse(
                status=constant_variable.STATUS_SUCCESS,
                status_code=constant_variable.HTTP_200_OK,
                data=constant_variable.STATUS_NULL,
                message=message_variable.FORGET_PASSWORD_SUCCESS,
            )

        logger.info(f"STEP 4: User found with ID: {user.id}")

        logger.info("STEP 5: Generating password reset token")

        token_data = {
            "user_id": str(user.id),
            "email": user.email,
            "type": "password_reset",
        }

        reset_token = jwt_handler.create_password_reset_token(data=token_data)

        logger.info("STEP 6: Preparing password reset link")

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        logger.info("STEP 7: Rendering email template")

        email_body = render_email_template(
            template_path="emails/forget_password.html",
            name=user.full_name or user.email,
            reset_link=reset_link,
        )

        logger.info("STEP 8: Sending password reset email")

        email_subject = "Reset Your Password - University LMS"
        await send_email(
            to=user.email,
            subject=email_subject,
            body=email_body,
            html=True,
        )

        logger.info(f"STEP 9: Password reset email sent successfully to {user.email}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=constant_variable.STATUS_NULL,
            message=message_variable.FORGET_PASSWORD_SUCCESS,
        )

    except Exception as exc:
        logger.error(f"Error during forget password: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

