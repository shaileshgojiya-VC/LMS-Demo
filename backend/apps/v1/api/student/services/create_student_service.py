"""
Service for creating student.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from apps.v1.api.student.models.methods.get_student_method import (
    create_student,
    get_student_by_email,
)
from apps.v1.api.student.schema import StudentCreateSchema
from apps.v1.api.student.serializer import StudentSerializer
from apps.v1.api.student.models.attribute import StudentStatus
from apps.v1.api.course.models.methods.get_course_method import get_course_by_id
from apps.v1.api.course.models.model import Course
from sqlalchemy import update
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def create_student_service(
    db: AsyncSession,
    student_data: StudentCreateSchema,
) -> StandardResponse:
    """
    Create a new student.

    Args:
        db: Async database session
        student_data: StudentCreateSchema containing student data

    Returns:
        StandardResponse with created student data or error message
    """
    logger.info("STEP 1: Starting student creation workflow")
    logger.info(f"Creating student: {str(student_data)}")

    try:
        logger.info("STEP 2: Checking if student already exists")

        existing_student = await get_student_by_email(
            db=db,
            email=student_data.email,
        )

        if existing_student:
            logger.warning(f"Student with email {str(student_data.email)} already exists")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_400_BAD_REQUEST,
                data=constant_variable.STATUS_NULL,
                message="Student with this email already exists",
            )

        logger.info("STEP 3: Validating course_id if provided")

        if student_data.course_id:
            course = await get_course_by_id(db=db, course_id=student_data.course_id)
            if not course:
                logger.warning(f"Course with ID {str(student_data.course_id)} not found")
                return StandardResponse(
                    status=constant_variable.STATUS_FAIL,
                    status_code=constant_variable.HTTP_404_NOT_FOUND,
                    data=constant_variable.STATUS_NULL,
                    message="Course not found",
                )

        logger.info("STEP 4: Preparing student data for database insertion")

        student_dict = student_data.model_dump()

        if "status" in student_dict and student_dict["status"] is not None:
            if isinstance(student_dict["status"], str):
                student_dict["status"] = StudentStatus(student_dict["status"])

        if "enrollment_date" in student_dict and student_dict["enrollment_date"]:
            try:
                student_dict["enrollment_date"] = datetime.fromisoformat(
                    student_dict["enrollment_date"].replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                student_dict["enrollment_date"] = None

        if "completion_date" in student_dict and student_dict["completion_date"]:
            try:
                student_dict["completion_date"] = datetime.fromisoformat(
                    student_dict["completion_date"].replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                student_dict["completion_date"] = None

        logger.info("STEP 5: Creating student in database")

        new_student = await create_student(
            db=db,
            student_data=student_dict,
        )

        logger.info(f"STEP 6: Student created successfully with ID: {new_student.id}")

        # STEP 7: Update course student count if course_id is provided
        if new_student.course_id:
            logger.info(f"STEP 7: Incrementing student count for course ID: {new_student.course_id}")
            course = await get_course_by_id(db=db, course_id=new_student.course_id)
            if course:
                # Increment the students count
                current_count = course.students or 0
                stmt = (
                    update(Course)
                    .where(Course.id == new_student.course_id)
                    .values(students=current_count + 1)
                )
                await db.execute(stmt)
                await db.commit()
                logger.info(f"Course student count updated to: {current_count + 1}")

        logger.info("STEP 8: Serializing student data for response")

        student_serializer = StudentSerializer()
        serialized_student = student_serializer.dump(new_student)

        # STEP 9: Note - Credential issuance should be done via the /credentials/issue endpoint
        # Automatic issuance can be added here if needed, but it's better to let the frontend
        # trigger it explicitly so users can see the status
        logger.info("STEP 9: Student created. Credential can be issued via /v1/credentials/issue endpoint")

        logger.info("STEP 10: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_201_CREATED,
            data=serialized_student,
            message="Student created successfully",
        )

    except Exception as exc:
        logger.error(f"Error creating student: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )
