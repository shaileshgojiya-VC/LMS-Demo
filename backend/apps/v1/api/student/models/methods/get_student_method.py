"""
Database methods for student operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from apps.v1.api.student.models.model import Student


async def get_student_by_id(
    db: AsyncSession,
    student_id: int,
) -> Optional[Student]:
    """
    Get student by ID.

    Args:
        db: Async database session
        student_id: Student ID

    Returns:
        Student object if found, None otherwise
    """
    stmt = select(Student).where(Student.id == student_id).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_student_by_email(
    db: AsyncSession,
    email: str,
) -> Optional[Student]:
    """
    Get student by email.

    Args:
        db: Async database session
        email: Student email address

    Returns:
        Student object if found, None otherwise
    """
    stmt = select(Student).where(Student.email == email).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_student(
    db: AsyncSession,
    student_data: dict,
) -> Student:
    """
    Create a new student in the database.

    Args:
        db: Async database session
        student_data: Dictionary containing student data

    Returns:
        Created Student object
    """
    new_student = Student(**student_data)
    db.add(new_student)
    await db.commit()
    await db.refresh(new_student)
    return new_student


async def update_student(
    db: AsyncSession,
    student_id: int,
    student_data: dict,
) -> Optional[Student]:
    """
    Update student in the database.

    Args:
        db: Async database session
        student_id: Student ID
        student_data: Dictionary containing updated student data

    Returns:
        Updated Student object if found, None otherwise
    """
    student = await get_student_by_id(db=db, student_id=student_id)
    if not student:
        return None

    for key, value in student_data.items():
        setattr(student, key, value)

    await db.commit()
    await db.refresh(student)
    return student


async def delete_student(
    db: AsyncSession,
    student_id: int,
) -> bool:
    """
    Delete student from the database.

    Args:
        db: Async database session
        student_id: Student ID

    Returns:
        True if deleted, False otherwise
    """
    student = await get_student_by_id(db=db, student_id=student_id)
    if not student:
        return False

    await db.delete(student)
    await db.commit()
    return True


async def get_all_students(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    course_id: Optional[int] = None,
    status: Optional[str] = None,
) -> List[Student]:
    """
    Get all students with pagination and filters.

    Args:
        db: Async database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search term for name or email
        course_id: Filter by course ID
        status: Filter by status

    Returns:
        List of Student objects
    """
    stmt = select(Student)

    # Apply filters
    if search:
        search_term = f"%{search.lower()}%"
        stmt = stmt.where(
            (Student.name.ilike(search_term)) | (Student.email.ilike(search_term))
        )

    if course_id:
        stmt = stmt.where(Student.course_id == course_id)

    if status:
        stmt = stmt.where(Student.status == status)

    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)

    result = await db.execute(stmt)
    return list(result.scalars().all())

