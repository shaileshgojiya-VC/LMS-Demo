"""
Service for getting course by ID.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.models.methods.get_course_method import get_course_by_id
from apps.v1.api.course.serializer import CourseSerializer
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def get_course_service(
    db: AsyncSession,
    course_id: int,
) -> StandardResponse:
    """
    Get course by ID.

    Args:
        db: Async database session
        course_id: Course ID

    Returns:
        StandardResponse with course data or error message
    """
    logger.info("STEP 1: Starting course retrieval workflow")
    logger.info(f"Fetching course with ID: {str(course_id)}")

    try:
        logger.info("STEP 2: Fetching course from database")

        course = await get_course_by_id(db=db, course_id=course_id)

        if not course:
            logger.warning(f"Course with ID {str(course_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Course not found",
            )

        logger.info("STEP 3: Serializing course data for response")

        course_serializer = CourseSerializer()
        serialized_course = course_serializer.dump(course)

        logger.info("STEP 4: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=serialized_course,
            message="Course retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching course: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

