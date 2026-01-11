"""
View for course operations.
"""

import logging

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.course.schema import (
    CourseCreateSchema,
    CourseUpdateSchema,
)
from apps.v1.api.course.services.create_course_service import create_course_service
from apps.v1.api.course.services.get_course_service import get_course_service
from apps.v1.api.course.services.update_course_service import update_course_service
from apps.v1.api.course.services.delete_course_service import delete_course_service
from apps.v1.api.course.services.list_courses_service import list_courses_service
from config.db_config import get_async_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_courses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all courses with pagination.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Async database session

    Returns:
        StandardResponse with list of courses or error message
    """
    logger.info(f"Fetching courses with skip: {skip}, limit: {limit}")
    response = await list_courses_service(db=db, skip=skip, limit=limit)
    return response.make


@router.post("/")
async def create_course(
    course_data: CourseCreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new course.

    Args:
        course_data: CourseCreateSchema containing course data
        db: Async database session

    Returns:
        StandardResponse with created course data or error message
    """
    logger.info(f"Creating course: {str(course_data)}")
    response = await create_course_service(db=db, course_data=course_data)
    return response.make


@router.get("/{course_id}")
async def get_course(
    course_id: int = Path(..., description="Course ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get course by ID.

    Args:
        course_id: Course ID
        db: Async database session

    Returns:
        StandardResponse with course data or error message
    """
    logger.info(f"Fetching course with ID: {str(course_id)}")
    response = await get_course_service(db=db, course_id=course_id)
    return response.make


@router.put("/{course_id}")
async def update_course(
    course_data: CourseUpdateSchema,
    course_id: int = Path(..., description="Course ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Update course.

    Args:
        course_id: Course ID
        course_data: CourseUpdateSchema containing updated course data
        db: Async database session

    Returns:
        StandardResponse with updated course data or error message
    """
    logger.info(f"Updating course with ID: {str(course_id)}")
    response = await update_course_service(
        db=db,
        course_id=course_id,
        course_data=course_data,
    )
    return response.make


@router.delete("/{course_id}")
async def delete_course(
    course_id: int = Path(..., description="Course ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Delete course.

    Args:
        course_id: Course ID
        db: Async database session

    Returns:
        StandardResponse with success or error message
    """
    logger.info(f"Deleting course with ID: {str(course_id)}")
    response = await delete_course_service(db=db, course_id=course_id)
    return response.make

