"""
Service for creating course.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.models.methods.get_course_method import (
    create_course,
    get_course_by_name,
)
from apps.v1.api.course.schema import CourseCreateSchema
from apps.v1.api.course.serializer import CourseSerializer
from apps.v1.api.course.models.attribute import CourseStatus
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def create_course_service(
    db: AsyncSession,
    course_data: CourseCreateSchema,
) -> StandardResponse:
    """
    Create a new course.

    Args:
        db: Async database session
        course_data: CourseCreateSchema containing course data

    Returns:
        StandardResponse with created course data or error message
    """
    logger.info("STEP 1: Starting course creation workflow")
    logger.info(f"Creating course: {str(course_data)}")

    try:
        logger.info("STEP 2: Checking if course already exists")

        existing_course = await get_course_by_name(
            db=db,
            name=course_data.name,
        )

        if existing_course:
            logger.warning(f"Course with name {str(course_data.name)} already exists")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message="Course with this name already exists",
            )

        logger.info("STEP 3: Preparing course data for database insertion")

        course_dict = course_data.model_dump()
        if "status" in course_dict and course_dict["status"] is not None:
            if isinstance(course_dict["status"], str):
                course_dict["status"] = CourseStatus(course_dict["status"])

        logger.info("STEP 4: Creating course in database")

        new_course = await create_course(
            db=db,
            course_data=course_dict,
        )

        logger.info(f"STEP 5: Course created successfully with ID: {new_course.id}")

        logger.info("STEP 6: Serializing course data for response")

        course_serializer = CourseSerializer()
        serialized_course = course_serializer.dump(new_course)

        logger.info("STEP 7: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_201_CREATED,
            data=serialized_course,
            message="Course created successfully",
        )

    except Exception as exc:
        logger.error(f"Error creating course: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )
