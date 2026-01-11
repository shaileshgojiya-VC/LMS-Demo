"""
Service for listing all students with search and filters.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from apps.v1.api.student.models.methods.get_student_method import get_all_students
from apps.v1.api.student.serializer import StudentSerializer
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def list_students_service(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    course_id: Optional[int] = None,
    status: Optional[str] = None,
) -> StandardResponse:
    """
    Get all students with pagination, search and filters.

    Args:
        db: Async database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search term for name or email
        course_id: Filter by course ID
        status: Filter by status

    Returns:
        StandardResponse with list of students or error message
    """
    logger.info("STEP 1: Starting students listing workflow")
    logger.info(f"Fetching students with skip: {skip}, limit: {limit}, search: {search}, course_id: {course_id}, status: {status}")

    try:
        logger.info("STEP 2: Fetching students from database with filters")

        students = await get_all_students(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            course_id=course_id,
            status=status,
        )

        logger.info("STEP 3: Serializing students data for response")

        student_serializer = StudentSerializer()
        students_data = [student_serializer.dump(student) for student in students]

        logger.info("STEP 4: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=students_data,
            message="Students retrieved successfully",
        )

    except Exception as exc:
        logger.error(f"Error fetching students: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

