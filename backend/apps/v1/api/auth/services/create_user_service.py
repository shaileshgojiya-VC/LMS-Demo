"""
Service for creating new users.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.methods.create_user_method import create_user, get_user_by_email
from apps.v1.api.auth.schema import RegisterUserSchema
from apps.v1.api.auth.serializer import UserSerializer
from core.utils import constant_variable, message_variable
from core.utils.helper import PasswordUtils
from core.utils.jwt_hanlder import jwt_handler
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def create_user_service(
    db: AsyncSession,
    user_data: RegisterUserSchema,
) -> StandardResponse:
    """
    Create a new user with validation and password hashing.

    Args:
        db: Async database session
        user_data: RegisterUserSchema containing user registration data

    Returns:
        StandardResponse with created user data or error message
    """
    logger.info("STEP 1: Starting user creation workflow")

    try:
        logger.info("STEP 2: Validating input data")

        email = user_data.email.lower().strip()
        password = user_data.password
        full_name = user_data.full_name.strip()

        logger.info(f"STEP 3: Checking if user with email {email} already exists")

        existing_user = await get_user_by_email(db=db, email=email)

        if existing_user:
            logger.warning(f"User with email {email} already exists")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message=message_variable.USER_ALREADY_EXISTS,
            )

        logger.info("STEP 4: Hashing user password")

        password_utils = PasswordUtils()
        hashed_password = password_utils.hash_password(password=password)

        logger.info("STEP 5: Preparing user data for database insertion")

        user_create_data = {
            "email": email,
            "password": hashed_password,
            "full_name": full_name,
            "is_active": constant_variable.STATUS_TRUE,
            "is_verified": constant_variable.STATUS_FALSE,
        }

        logger.info("STEP 6: Creating user in database")

        new_user = await create_user(db=db, user_data=user_create_data)

        logger.info(f"STEP 7: User created successfully with ID: {new_user.id}")

        logger.info("STEP 8: Generating JWT access token")

        token_data = {
            "user_id": str(new_user.id),
            "email": new_user.email,
        }

        access_token = jwt_handler.create_access_token(data=token_data)

        logger.info("STEP 9: Generating JWT refresh token")

        refresh_token = jwt_handler.create_refresh_token(data=token_data)

        logger.info("STEP 10: Serializing user data for response")

        user_serializer = UserSerializer()
        serialized_user = user_serializer.dump(new_user)

        logger.info("STEP 11: Preparing response data with tokens")

        response_data = {
            "user": serialized_user,
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
            },
        }

        logger.info("STEP 12: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_201_CREATED,
            data=response_data,
            message=message_variable.USER_CREATED,
        )

    except Exception as exc:
        logger.error(f"Error creating user: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

