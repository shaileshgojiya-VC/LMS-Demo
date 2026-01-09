"""
Service for user login and authentication.
"""

import logging
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.methods.login_user_method import get_user_by_email_for_login
from apps.v1.api.auth.schema import LoginUserSchema
from apps.v1.api.auth.serializer import UserSerializer
from core.utils import constant_variable, message_variable
from core.utils.helper import PasswordUtils
from core.utils.jwt_hanlder import jwt_handler
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def login_user_service(
    db: AsyncSession,
    login_data: LoginUserSchema,
) -> StandardResponse:
    """
    Authenticate user and generate JWT tokens.

    Args:
        db: Async database session
        login_data: LoginUserSchema containing user login credentials

    Returns:
        StandardResponse with user data and JWT tokens or error message
    """
    logger.info("STEP 1: Starting user login workflow")

    try:
        logger.info("STEP 2: Validating input data")

        email = login_data.email.lower().strip()
        password = login_data.password

        logger.info(f"STEP 3: Fetching user with email {email}")

        user = await get_user_by_email_for_login(db=db, email=email)

        if not user:
            logger.warning(f"User with email {email} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_401_UNAUTHORIZED,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_EMAIL_OR_PASSWORD,
            )

        logger.info(f"STEP 4: User found with ID: {user.id}")

        if not user.is_active:
            logger.warning(f"User account is inactive: {user.email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_403_FORBIDDEN,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_INACTIVE,
            )

        logger.info("STEP 5: Verifying user password")

        password_utils = PasswordUtils()
        is_password_valid = password_utils.verify_password(
            plain_password=password,
            hashed_password=user.password,
        )

        if not is_password_valid:
            logger.warning(f"Invalid password for user: {user.email}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_401_UNAUTHORIZED,
                data=constant_variable.STATUS_NULL,
                message=message_variable.INVALID_EMAIL_OR_PASSWORD,
            )

        logger.info("STEP 6: Password verified successfully")

        logger.info("STEP 7: Generating JWT access token")

        token_data = {
            "user_id": str(user.id),
            "email": user.email,
        }

        access_token = jwt_handler.create_access_token(data=token_data)

        logger.info("STEP 8: Generating JWT refresh token")

        refresh_token = jwt_handler.create_refresh_token(data=token_data)

        logger.info("STEP 9: Serializing user data for response")

        user_serializer = UserSerializer()
        serialized_user = user_serializer.dump(user)

        logger.info("STEP 10: Preparing response data with tokens")

        response_data = {
            "user": serialized_user,
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
            },
        }

        logger.info(f"STEP 11: Login successful for user: {user.email}")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=response_data,
            message=message_variable.LOGIN_SUCCESS,
        )

    except Exception as exc:
        logger.error(f"Error during login: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

