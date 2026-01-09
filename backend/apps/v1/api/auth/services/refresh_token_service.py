"""
Service for refreshing JWT access tokens.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.methods.login_user_method import get_user_by_email_for_login
from core.utils import constant_variable, message_variable
from core.utils.jwt_hanlder import jwt_handler
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def refresh_token_service(
    db: AsyncSession,
    refresh_token: str,
) -> StandardResponse:
    """
    Refresh access token using refresh token.

    Args:
        db: Async database session
        refresh_token: JWT refresh token string

    Returns:
        StandardResponse with new access token and refresh token or error message
    """
    logger.info("STEP 1: Starting token refresh workflow")

    try:
        logger.info("STEP 2: Verifying refresh token")

        payload = jwt_handler.verify_refresh_token(token=refresh_token)

        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id or not email:
            logger.warning("Refresh token missing user_id or email")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_401_UNAUTHORIZED,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_REFRESH_TOKEN,
            )

        logger.info(f"STEP 3: Fetching user with ID: {user_id}")

        user = await get_user_by_email_for_login(db=db, email=email)

        if not user:
            logger.warning(f"User not found with email: {email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_401_UNAUTHORIZED,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_NOT_FOUND,
            )

        if not user.is_active:
            logger.warning(f"User account is inactive: {user.email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_403_FORBIDDEN,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_INACTIVE,
            )

        logger.info("STEP 4: Generating new JWT access token")

        token_data = {
            "user_id": str(user.id),
            "email": user.email,
        }

        new_access_token = jwt_handler.create_access_token(data=token_data)

        logger.info("STEP 5: Generating new JWT refresh token")

        new_refresh_token = jwt_handler.create_refresh_token(data=token_data)

        logger.info("STEP 6: Preparing response data with new tokens")

        response_data = {
            "tokens": {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
            },
        }

        logger.info(f"STEP 7: Token refresh successful for user: {user.email}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=response_data,
            message=message_variable.REFRESH_TOKEN_SUCCESS,
        )

    except Exception as exc:
        logger.error(f"Error during token refresh: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_401_UNAUTHORIZED,
            data=constant_variable.STATUS_NULL,
            message=message_variable.INVALID_REFRESH_TOKEN,
        )

