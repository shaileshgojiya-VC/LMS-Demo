"""
View for course operations.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
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
from apps.v1.api.credentials.services.everycred_service import everycred_service
from config.db_config import get_async_db
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_courses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all courses with pagination from database.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Async database session

    Returns:
        StandardResponse with list of courses or error message
    """
    logger.info(f"Fetching courses from database with skip: {skip}, limit: {limit}")
    response = await list_courses_service(db=db, skip=skip, limit=limit)
    return response.make


@router.get("/list")
async def get_courses_list(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    order_by: str = Query("newest", description="Order by field (e.g., 'newest')"),
    group_id: Optional[int] = Query(None, description="Group ID filter"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Fetch subjects list from EveryCRED API and format for frontend.
    Endpoint: https://stg-dcs-api.everycred.com/v1/subject?order_by=newest&page=1
    Similar to credentials list endpoint.
    
    Args:
        page: Page number
        size: Page size
        order_by: Order by field (default: "newest")
        group_id: Optional group ID filter
        
    Returns:
        Formatted subjects list as courses for frontend
    """
    try:
        logger.info(f"STEP 1: Fetching subjects list from EveryCRED - page: {page}, size: {size}, order_by: {order_by}, group_id: {group_id}")
        logger.info(f"STEP 2: EveryCred API URL: {everycred_service.config.api_url}")
        logger.info(f"STEP 3: EveryCred API Token configured: {'Yes' if everycred_service.config.api_token else 'No'}")
        
        subjects_response = await everycred_service.get_subjects_list(
            page=page,
            size=size,
            order_by=order_by,
            group_id=group_id,
        )
        
        logger.info(f"STEP 4: Raw subjects response received - type: {type(subjects_response)}")
        logger.info(f"STEP 5: Raw subjects response keys: {list(subjects_response.keys()) if isinstance(subjects_response, dict) else 'Not a dict'}")
        logger.info(f"STEP 6: Raw subjects response (first 500 chars): {str(subjects_response)[:500]}")
        
        # Parse and format the response for frontend
        formatted_courses = []
        
        # Extract subjects from response - handle EveryCRED API response structure
        logger.info("STEP 7: Parsing subjects response structure")
        
        subjects_data = subjects_response.get("data", {})
        logger.info(f"STEP 8: subjects_data type: {type(subjects_data)}")
        
        subjects_list = []
        
        if isinstance(subjects_data, dict):
            logger.info(f"STEP 9: subjects_data is dict, keys: {list(subjects_data.keys())}")
            # EveryCRED API returns subjects in data.list[] array (similar to credentials)
            subjects_list = subjects_data.get("list", [])
            logger.info(f"STEP 10: Found subjects list in data.list: {len(subjects_list)} items")
            
            # Fallback: Check other possible keys if list is empty
            if not subjects_list:
                for key in ["subjects", "items", "results", "data"]:
                    if key in subjects_data and isinstance(subjects_data[key], list):
                        subjects_list = subjects_data[key]
                        logger.info(f"STEP 11: Found subjects in data.{key}: {len(subjects_list)} items")
                        break
        elif isinstance(subjects_data, list):
            subjects_list = subjects_data
            logger.info(f"STEP 12: subjects_data is directly a list: {len(subjects_list)} items")
        else:
            # Try direct access at root level
            subjects_list = subjects_response.get("subjects", [])
            if not subjects_list:
                subjects_list = subjects_response.get("items", [])
            if not subjects_list:
                subjects_list = subjects_response.get("results", [])
            logger.info(f"STEP 13: Tried direct access, found: {len(subjects_list)} items")
        
        logger.info(f"STEP 15: Final subjects list count: {len(subjects_list)}")
        
        # If still no subjects found, log the full response for debugging
        if len(subjects_list) == 0:
            logger.warning("STEP 16: No subjects found in response. Full response structure:")
            logger.warning(f"  Response type: {type(subjects_response)}")
            if isinstance(subjects_response, dict):
                logger.warning(f"  Response keys: {list(subjects_response.keys())}")
                logger.warning(f"  Full response: {subjects_response}")
            else:
                logger.warning(f"  Response: {subjects_response}")
        
        # Format each subject as a course for frontend
        # API response structure: { "status": "success", "data": { "total": 3, "list": [...] } }
        for idx, subject in enumerate(subjects_list):
            logger.info(f"STEP 17.{idx}: Processing subject {idx + 1}/{len(subjects_list)}")
            if isinstance(subject, dict):
                logger.info(f"Subject {idx} keys: {list(subject.keys())}")
                
                # Extract subject fields from actual API response
                subject_id = subject.get("id")
                subject_name = subject.get("name") or subject.get("title") or ""
                subject_description = subject.get("description") or ""
                subject_logo = subject.get("logo")
                status_type = subject.get("status_type", "")
                
                # Extract credential counts
                issued_count = subject.get("issued_cred_count", 0)
                draft_count = subject.get("draft_cred_count", 0)
                scheduled_count = subject.get("scheduled_cred_count", 0)
                total_credentials = issued_count + draft_count + scheduled_count
                
                # Extract group IDs (array)
                group_ids = subject.get("group_ids", [])
                group_id_val = group_ids[0] if group_ids else None
                
                # Determine status from status_type
                # status_type format: "SubjectStatusType.active"
                course_status = "active"
                if "active" in status_type.lower():
                    course_status = "active"
                elif "inactive" in status_type.lower():
                    course_status = "inactive"
                
                # Map subject to course format
                formatted_course = {
                    "id": subject_id,
                    "name": subject_name,
                    "title": subject.get("title", subject_name),
                    "description": subject_description,
                    "logo": subject_logo,
                    "instructor": None,  # Not in API response
                    "students": total_credentials,  # Use total credential count as students
                    "duration": None,  # Not in API response
                    "modules": None,  # Not in API response
                    "status": course_status,
                    "created_at": subject.get("created_at") or "",
                    "updated_at": subject.get("updated_at") or "",
                    "group_ids": group_ids,
                    "group_id": group_id_val,
                    "issued_cred_count": issued_count,
                    "draft_cred_count": draft_count,
                    "scheduled_cred_count": scheduled_count,
                    "uuid": subject.get("uuid"),
                    "did": subject.get("did"),
                    "profile_link": subject.get("profile_link"),
                }
                
                formatted_courses.append(formatted_course)
                logger.info(f"Formatted course: {formatted_course.get('name')} - ID: {subject_id}")
        
        # Get pagination info from API response
        response_data = subjects_response.get("data", {})
        total_count = response_data.get("total", len(formatted_courses))
        pages = response_data.get("pages", 1)
        
        # Return the exact response structure matching EveryCRED API format
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data={
                "total": total_count,
                "pages": pages,
                "size": response_data.get("size"),
                "list": formatted_courses,  # Keep as "list" to match API response structure
                "page": page,
            },
            message=subjects_response.get("message", "Subject list retrieved successfully!"),
        ).make
        
    except Exception as e:
        logger.error(f"Error fetching courses list: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch courses list: {str(e)}",
        )


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

