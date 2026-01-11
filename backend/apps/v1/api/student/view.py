"""
View for student operations.
"""

import logging

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from apps.v1.api.student.schema import (
    StudentCreateSchema,
    StudentUpdateSchema,
)
from apps.v1.api.student.services.create_student_service import create_student_service
from apps.v1.api.student.services.get_student_service import get_student_service
from apps.v1.api.student.services.update_student_service import update_student_service
from apps.v1.api.student.services.delete_student_service import delete_student_service
from apps.v1.api.student.services.list_students_service import list_students_service
from config.db_config import get_async_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_students(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: str = Query(None, description="Search term for name or email"),
    course_id: int = Query(None, description="Filter by course ID", gt=0),
    status: str = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all students with pagination, search and filters.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search term for name or email
        course_id: Filter by course ID
        status: Filter by status
        db: Async database session

    Returns:
        StandardResponse with list of students or error message
    """
    logger.info(f"Fetching students with skip: {skip}, limit: {limit}, search: {search}, course_id: {course_id}, status: {status}")
    response = await list_students_service(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        course_id=course_id,
        status=status,
    )
    return response.make


@router.post("/")
async def create_student(
    student_data: StudentCreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new student.

    Args:
        student_data: StudentCreateSchema containing student data
        db: Async database session

    Returns:
        StandardResponse with created student data or error message
    """
    logger.info(f"Creating student: {str(student_data)}")
    response = await create_student_service(db=db, student_data=student_data)
    return response.make


@router.get("/{student_id}")
async def get_student(
    student_id: int = Path(..., description="Student ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get student by ID.

    Args:
        student_id: Student ID
        db: Async database session

    Returns:
        StandardResponse with student data or error message
    """
    logger.info(f"Fetching student with ID: {str(student_id)}")
    response = await get_student_service(db=db, student_id=student_id)
    return response.make


@router.put("/{student_id}")
async def update_student(
    student_data: StudentUpdateSchema,
    student_id: int = Path(..., description="Student ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Update student.

    Args:
        student_id: Student ID
        student_data: StudentUpdateSchema containing updated student data
        db: Async database session

    Returns:
        StandardResponse with updated student data or error message
    """
    logger.info(f"Updating student with ID: {str(student_id)}")
    response = await update_student_service(
        db=db,
        student_id=student_id,
        student_data=student_data,
    )
    return response.make


@router.delete("/{student_id}")
async def delete_student(
    student_id: int = Path(..., description="Student ID"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Delete student.

    Args:
        student_id: Student ID
        db: Async database session

    Returns:
        StandardResponse with success or error message
    """
    logger.info(f"Deleting student with ID: {str(student_id)}")
    response = await delete_student_service(db=db, student_id=student_id)
    return response.make

