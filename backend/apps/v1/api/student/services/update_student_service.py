"""
Service for updating student.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from datetime import datetime

from apps.v1.api.student.models.methods.get_student_method import get_student_by_id, update_student
from apps.v1.api.student.schema import StudentUpdateSchema
from apps.v1.api.student.serializer import StudentSerializer
from apps.v1.api.student.models.attribute import StudentStatus
from apps.v1.api.course.models.methods.get_course_method import get_course_by_id
from apps.v1.api.course.models.model import Course
from core.utils import constant_variable, message_variable
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)


async def update_student_service(
    db: AsyncSession,
    student_id: int,
    student_data: StudentUpdateSchema,
) -> StandardResponse:
    """
    Update student.

    Args:
        db: Async database session
        student_id: Student ID
        student_data: StudentUpdateSchema containing updated student data

    Returns:
        StandardResponse with updated student data or error message
    """
    logger.info("STEP 1: Starting student update workflow")
    logger.info(f"Updating student with ID: {str(student_id)}")

    try:
        logger.info("STEP 2: Preparing update data")

        update_dict = student_data.model_dump(exclude_unset=True)

        if "status" in update_dict and update_dict["status"] is not None:
            if isinstance(update_dict["status"], str):
                update_dict["status"] = StudentStatus(update_dict["status"])

        logger.info("STEP 3: Getting current student to check old course_id")

        # Get current student to check old course_id
        current_student = await get_student_by_id(db=db, student_id=student_id)
        if not current_student:
            logger.warning(f"Student with ID {str(student_id)} not found")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_404_NOT_FOUND,
                data=constant_variable.STATUS_NULL,
                message="Student not found",
            )

        old_course_id = current_student.course_id
        new_course_id = update_dict.get("course_id")

        logger.info("STEP 4: Validating new course_id if provided")

        if new_course_id:
            course = await get_course_by_id(db=db, course_id=new_course_id)
            if not course:
                logger.warning(f"Course with ID {str(new_course_id)} not found")
                return StandardResponse(
                    status=constant_variable.STATUS_FAIL,
                    status_code=constant_variable.HTTP_404_NOT_FOUND,
                    data=constant_variable.STATUS_NULL,
                    message="Course not found",
                )

        if "enrollment_date" in update_dict and update_dict["enrollment_date"]:
            try:
                update_dict["enrollment_date"] = datetime.fromisoformat(
                    update_dict["enrollment_date"].replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                update_dict["enrollment_date"] = None

        if "completion_date" in update_dict and update_dict["completion_date"]:
            try:
                update_dict["completion_date"] = datetime.fromisoformat(
                    update_dict["completion_date"].replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                update_dict["completion_date"] = None

        logger.info("STEP 5: Updating student in database")

        student = await update_student(
            db=db,
            student_id=student_id,
            student_data=update_dict,
        )

        if not student:
            logger.warning(f"Failed to update student with ID {str(student_id)}")
            return StandardResponse(
                status=constant_variable.STATUS_FAIL,
                status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
                data=constant_variable.STATUS_NULL,
                message="Failed to update student",
            )

        logger.info(f"STEP 6: Student updated successfully with ID: {str(student_id)}")

        # STEP 7: Handle course student count updates
        # If course_id changed, decrement old course and increment new course
        if old_course_id != new_course_id:
            # Decrement old course if it exists
            if old_course_id:
                logger.info(f"STEP 7a: Decrementing student count for old course ID: {old_course_id}")
                old_course = await get_course_by_id(db=db, course_id=old_course_id)
                if old_course:
                    current_count = old_course.students or 0
                    new_count = max(0, current_count - 1)
                    stmt = (
                        update(Course)
                        .where(Course.id == old_course_id)
                        .values(students=new_count)
                    )
                    await db.execute(stmt)
                    await db.commit()
                    logger.info(f"Old course student count updated to: {new_count}")

            # Increment new course if it exists
            if new_course_id:
                logger.info(f"STEP 7b: Incrementing student count for new course ID: {new_course_id}")
                new_course = await get_course_by_id(db=db, course_id=new_course_id)
                if new_course:
                    current_count = new_course.students or 0
                    stmt = (
                        update(Course)
                        .where(Course.id == new_course_id)
                        .values(students=current_count + 1)
                    )
                    await db.execute(stmt)
                    await db.commit()
                    logger.info(f"New course student count updated to: {current_count + 1}")

        logger.info("STEP 8: Serializing student data for response")

        student_serializer = StudentSerializer()
        serialized_student = student_serializer.dump(student)

        logger.info("STEP 9: Preparing standard response")

        return StandardResponse(
            status=constant_variable.STATUS_SUCCESS,
            status_code=constant_variable.HTTP_200_OK,
            data=serialized_student,
            message="Student updated successfully",
        )

    except Exception as exc:
        logger.error(f"Error updating student: {str(exc)}", exc_info=True)
        return StandardResponse(
            status=constant_variable.STATUS_FAIL,
            status_code=constant_variable.HTTP_500_INTERNAL_SERVER_ERROR,
            data=constant_variable.STATUS_NULL,
            message=message_variable.SOMETHING_WENT_WRONG,
        )

