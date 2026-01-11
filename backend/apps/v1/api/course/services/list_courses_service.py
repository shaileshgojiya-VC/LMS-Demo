"""
Service for listing all courses.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.models.methods.get_course_method import get_all_courses
from apps.v1.api.course.serializer import CourseSerializer
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def list_courses_service(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> StandardResponse:
    """
    Get all courses with pagination.

    Args:
        db: Async database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        StandardResponse with list of courses or error message
    """
    logger.info("STEP 1: Starting courses listing workflow")
    logger.info(f"Fetching courses with skip: {skip}, limit: {limit}")

    try:
        logger.info("STEP 2: Fetching courses from database")

        courses = await get_all_courses(db=db, skip=skip, limit=limit)

        logger.info("STEP 3: Serializing courses data for response")

        course_serializer = CourseSerializer()
        courses_data = [course_serializer.dump(course) for course in courses]

        logger.info("STEP 4: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=courses_data,
            message="Courses retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching courses: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

