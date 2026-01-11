"""
Service for deleting course.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.models.methods.get_course_method import delete_course
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def delete_course_service(
    db: AsyncSession,
    course_id: int,
) -> StandardResponse:
    """
    Delete course.

    Args:
        db: Async database session
        course_id: Course ID

    Returns:
        StandardResponse with success or error message
    """
    logger.info("STEP 1: Starting course deletion workflow")
    logger.info(f"Deleting course with ID: {str(course_id)}")

    try:
        logger.info("STEP 2: Deleting course from database")

        deleted = await delete_course(db=db, course_id=course_id)

        if not deleted:
            logger.warning(f"Course with ID {str(course_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Course not found",
            )

        logger.info(f"STEP 3: Course deleted successfully with ID: {str(course_id)}")

        logger.info("STEP 4: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=constant_variable.STATUS_NULL,
            message="Course deleted successfully",
        )

    except Exception as exc:
        logger.error(f"Error deleting course: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

