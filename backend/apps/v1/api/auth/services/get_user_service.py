"""
Service for getting current authenticated user.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.auth.models.model import Users
from apps.v1.api.auth.serializer import UserSerializer
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def get_user_service(
    db: AsyncSession,
    current_user: Users,
) -> StandardResponse:
    """
    Get current authenticated user.

    Args:
        db: Async database session
        current_user: Current authenticated user from dependency

    Returns:
        StandardResponse with user data or error message
    """
    logger.info("STEP 1: Starting user retrieval workflow")
    logger.info(f"Fetching current user with ID: {str(current_user.id)}")

    try:
        logger.info("STEP 2: Serializing user data for response")

        user_serializer = UserSerializer()
        # Serialize user data (password is excluded via load_only=True)
        serialized_user = user_serializer.dump(current_user)
        # Ensure password is not in response
        serialized_user.pop("password", None)

        logger.info("STEP 3: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=serialized_user,
            message="User retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching user: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

