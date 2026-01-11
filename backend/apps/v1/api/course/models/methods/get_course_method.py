"""
Database methods for course operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from apps.v1.api.course.models.model import Course


async def get_course_by_id(
    db: AsyncSession,
    course_id: int,
) -> Optional[Course]:
    """
    Get course by ID.

    Args:
        db: Async database session
        course_id: Course ID

    Returns:
        Course object if found, None otherwise
    """
    stmt = select(Course).where(Course.id == course_id).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_course_by_name(
    db: AsyncSession,
    name: str,
) -> Optional[Course]:
    """
    Get course by name.

    Args:
        db: Async database session
        name: Course name

    Returns:
        Course object if found, None otherwise
    """
    stmt = select(Course).where(Course.name == name).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_course(
    db: AsyncSession,
    course_data: dict,
) -> Course:
    """
    Create a new course in the database.

    Args:
        db: Async database session
        course_data: Dictionary containing course data

    Returns:
        Created Course object
    """
    new_course = Course(**course_data)
    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)
    return new_course


async def update_course(
    db: AsyncSession,
    course_id: int,
    course_data: dict,
) -> Optional[Course]:
    """
    Update course in the database.

    Args:
        db: Async database session
        course_id: Course ID
        course_data: Dictionary containing updated course data

    Returns:
        Updated Course object if found, None otherwise
    """
    course = await get_course_by_id(db=db, course_id=course_id)
    if not course:
        return None

    for key, value in course_data.items():
        setattr(course, key, value)

    await db.commit()
    await db.refresh(course)
    return course


async def delete_course(
    db: AsyncSession,
    course_id: int,
) -> bool:
    """
    Delete course from the database.

    Args:
        db: Async database session
        course_id: Course ID

    Returns:
        True if deleted, False otherwise
    """
    course = await get_course_by_id(db=db, course_id=course_id)
    if not course:
        return False

    await db.delete(course)
    await db.commit()
    return True


async def get_all_courses(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> List[Course]:
    """
    Get all courses with pagination.

    Args:
        db: Async database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of Course objects
    """
    stmt = select(Course).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

