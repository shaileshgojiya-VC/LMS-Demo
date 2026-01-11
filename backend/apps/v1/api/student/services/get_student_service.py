"""
Service for getting student by ID.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.student.models.methods.get_student_method import get_student_by_id
from apps.v1.api.student.serializer import StudentSerializer
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def get_student_service(
    db: AsyncSession,
    student_id: int,
) -> StandardResponse:
    """
    Get student by ID.

    Args:
        db: Async database session
        student_id: Student ID

    Returns:
        StandardResponse with student data or error message
    """
    logger.info("STEP 1: Starting student retrieval workflow")
    logger.info(f"Fetching student with ID: {str(student_id)}")

    try:
        logger.info("STEP 2: Fetching student from database")

        student = await get_student_by_id(db=db, student_id=student_id)

        if not student:
            logger.warning(f"Student with ID {str(student_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Student not found",
            )

        logger.info("STEP 3: Serializing student data for response")

        student_serializer = StudentSerializer()
        serialized_student = student_serializer.dump(student)

        logger.info("STEP 4: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=serialized_student,
            message="Student retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching student: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

