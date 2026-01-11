"""
Service for deleting student.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from apps.v1.api.student.models.methods.get_student_method import get_student_by_id, delete_student
from apps.v1.api.course.models.model import Course
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def delete_student_service(
    db: AsyncSession,
    student_id: int,
) -> StandardResponse:
    """
    Delete student.

    Args:
        db: Async database session
        student_id: Student ID

    Returns:
        StandardResponse with success or error message
    """
    logger.info("STEP 1: Starting student deletion workflow")
    logger.info(f"Deleting student with ID: {str(student_id)}")

    try:
        logger.info("STEP 2: Fetching student before deletion to get course_id")

        # Get student first to check course_id before deletion
        student = await get_student_by_id(db=db, student_id=student_id)

        if not student:
            logger.warning(f"Student with ID {str(student_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Student not found",
            )

        # Store course_id before deletion
        course_id_to_update = student.course_id

        logger.info("STEP 3: Deleting student from database")

        deleted = await delete_student(db=db, student_id=student_id)

        if not deleted:
            logger.warning(f"Failed to delete student with ID {str(student_id)}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
                data=constant_variable.STATUS_NULL,
                message="Failed to delete student",
            )

        logger.info("STEP 6: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=constant_variable.STATUS_NULL,
            message="Student deleted successfully",
        )

    except Exception as exc:
        logger.error(f"Error deleting student: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

