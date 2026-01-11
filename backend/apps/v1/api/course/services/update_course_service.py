"""
Service for updating course.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.models.methods.get_course_method import update_course
from apps.v1.api.course.schema import CourseUpdateSchema
from apps.v1.api.course.serializer import CourseSerializer
from apps.v1.api.course.models.attribute import CourseStatus
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def update_course_service(
    db: AsyncSession,
    course_id: int,
    course_data: CourseUpdateSchema,
) -> StandardResponse:
    """
    Update course.

    Args:
        db: Async database session
        course_id: Course ID
        course_data: CourseUpdateSchema containing updated course data

    Returns:
        StandardResponse with updated course data or error message
    """
    logger.info("STEP 1: Starting course update workflow")
    logger.info(f"Updating course with ID: {str(course_id)}")

    try:
        logger.info("STEP 2: Preparing update data")

        update_dict = course_data.model_dump(exclude_unset=True)
        if "status" in update_dict and update_dict["status"] is not None:
            if isinstance(update_dict["status"], str):
                update_dict["status"] = CourseStatus(update_dict["status"])

        logger.info("STEP 3: Updating course in database")

        course = await update_course(
            db=db,
            course_id=course_id,
            course_data=update_dict,
        )

        if not course:
            logger.warning(f"Course with ID {str(course_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Course not found",
            )

        logger.info(f"STEP 4: Course updated successfully with ID: {str(course_id)}")

        logger.info("STEP 5: Serializing course data for response")

        course_serializer = CourseSerializer()
        serialized_course = course_serializer.dump(course)

        logger.info("STEP 6: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=serialized_course,
            message="Course updated successfully",
        )

    except Exception as exc:
        logger.error(f"Error updating course: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

