"""
Service for reset password functionality.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.methods.password_reset_method import (
    get_user_by_email_for_password_reset,
    update_user_password,
)
from apps.v1.api.auth.schema import ResetPasswordSchema
from core.utils import constant_variable, message_variable
from core.utils.helper import PasswordUtils
from core.utils.jwt_hanlder import jwt_handler
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def reset_password_service(
    db: AsyncSession,
    reset_password_data: ResetPasswordSchema,
) -> StandardResponse:
    """
    Reset user password using reset token.

    Args:
        db: Async database session
        reset_password_data: ResetPasswordSchema containing reset token and new password

    Returns:
        StandardResponse with success or error message
    """
    logger.info("STEP 1: Starting reset password workflow")

    try:
        logger.info("STEP 2: Validating input data")

        reset_token = reset_password_data.token
        new_password = reset_password_data.new_password

        logger.info("STEP 3: Verifying password reset token")

        try:
            payload = jwt_handler.verify_token(token=reset_token)
        except Exception as exc:
            logger.warning(f"Invalid or expired reset token: {str(exc)}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_REFRESH_TOKEN,
            )

        token_type = payload.get("type")
        if token_type != "password_reset":
            logger.warning("Token is not a password reset token")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_REFRESH_TOKEN,
            )

        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id or not email:
            logger.warning("Reset token missing user_id or email")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_REFRESH_TOKEN,
            )

        logger.info(f"STEP 4: Fetching user with ID: {user_id}")

        user = await get_user_by_email_for_password_reset(db=db, email=email)

        if not user:
            logger.warning(f"User not found with email: {email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_NOT_FOUND,
            )

        if str(user.id) != str(user_id):
            logger.warning(f"User ID mismatch: token user_id={user_id}, db user_id={user.id}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_REFRESH_TOKEN,
            )

        if not user.is_active:
            logger.warning(f"User account is inactive: {user.email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_403_FORBIDDEN,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_INACTIVE,
            )

        logger.info("STEP 5: Hashing new password")

        password_utils = PasswordUtils()
        hashed_password = password_utils.hash_password(password=new_password)

        logger.info("STEP 6: Updating user password in database")

        await update_user_password(
            db=db,
            user_id=user.id,
            hashed_password=hashed_password,
        )

        logger.info(f"STEP 7: Password reset successful for user: {user.email}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=constant_variable.STATUS_NULL,
            message=message_variable.PASSWORD_CHANGED_SUCCESS,
        )

    except Exception as exc:
        logger.error(f"Error during reset password: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

