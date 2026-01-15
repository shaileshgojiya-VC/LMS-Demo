"""
API endpoints for credential management and EveryCRED integration.
"""

import logging
from typing import Optional, List, Dict, Any
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from apps.v1.api.credentials.services.everycred_service import (
    everycred_service,
)
from apps.v1.api.credentials.services.everycred_admin_service import (
    everycred_admin_service,
)
from config.db_config import get_async_db
from core.utils.standard_response import StandardResponse

logger = logging.getLogger(__name__)

credentials_router = APIRouter()


class IssueCredentialSchema(BaseModel):
    """Schema for issuing credentials."""
    student_name: str
    student_email: EmailStr
    degree: str
    program: str
    institution: str
    issue_date: str
    completion_date: Optional[str] = None
    course_id: Optional[int] = None
    enrollment_date: Optional[str] = None


class SubjectFieldSchema(BaseModel):
    """Schema for subject field definition."""
    name: str
    title: str
    ftype: str  # STRING, EMAIL, FLOAT, DATE, etc.
    is_required: bool = False
    is_mask: bool = False
    is_preview: bool = False
    is_default: bool = False
    description: Optional[str] = None
    hint_text: Optional[str] = None
    sample: Optional[str] = None
    error_message: Optional[str] = None
    pattern: Optional[str] = None


class FieldEditPolicySchema(BaseModel):
    """Schema for field edit policy."""
    field_key: str
    is_editable: bool = True


class CredFieldCreateSchema(BaseModel):
    """Schema for creating a credential field."""
    name: str
    title: str
    ftype: str  # STRING, EMAIL, FLOAT, DATE, INTEGER, BOOLEAN, etc.
    pattern: Optional[str] = None
    value: Optional[str] = None
    hint_text: Optional[str] = None
    description: Optional[str] = None
    sample: Optional[str] = None
    error_message: Optional[str] = None
    is_required: bool = False
    is_preview: bool = False
    is_mask: bool = False


class BulkCredFieldCreateSchema(BaseModel):
    """Schema for bulk creating credential fields."""
    fields_list: List[CredFieldCreateSchema]


class SubjectCreateSchema(BaseModel):
    """Schema for creating a subject in EveryCred."""
    name: str
    title: str
    description: Optional[str] = None
    logo: Optional[str] = None  # URL or file path
    group_id: int
    theme_id: Optional[int] = 1
    template_id: Optional[int] = None
    subject_field_ids: Optional[List[int]] = None  # List of credential field IDs
    subject_fields: Optional[List[SubjectFieldSchema]] = None  # Deprecated: use subject_field_ids instead
    field_edit_policies: Optional[List[FieldEditPolicySchema]] = None


@credentials_router.post("/issue")
async def issue_credential(
    credential_data: IssueCredentialSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Issue a credential via EveryCRED for a student.
    
    This endpoint:
    1. Creates a record in EveryCRED
    2. Issues a credential for that record
    3. Returns credential details including verification URL
    """
    try:
        logger.info(f"Issuing credential for student: {credential_data.student_name}")
        
        # Check if EveryCRED is configured
        if not everycred_service.config.is_configured():
            logger.warning("EveryCRED not configured, using mock mode")
        
        # Issue credential via EveryCRED
        credential_response = await everycred_service.issue_credential_for_student(
            student_name=credential_data.student_name,
            student_email=credential_data.student_email,
            degree=credential_data.degree,
            program=credential_data.program,
            institution=credential_data.institution,
            issue_date=credential_data.issue_date,
            completion_date=credential_data.completion_date,
            course_id=credential_data.course_id,
            enrollment_date=credential_data.enrollment_date,
        )
        
        logger.info(f"Credential issued successfully: {credential_response.credential_id}")
        
        # Safely extract fields from CredentialResponse, handling optional fields
        # Use getattr to safely access optional attributes
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data={
                "credential_id": credential_response.credential_id,
                "credentials_unique_id": getattr(credential_response, "credentials_unique_id", None),
                "verification_url": credential_response.verification_url,
                "status": credential_response.status,
                "issued_at": credential_response.issued_at,
                "record_id": getattr(credential_response, "record_id", None),
            },
            message="Credential issued successfully",
        ).make
        
    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"EveryCRED configuration error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error issuing credential: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to issue credential: {str(e)}",
        )


@credentials_router.get("/list")
async def get_credentials_list(
    page: int = 1,
    size: int = 10,
    credential_status: Optional[str] = "issued",
    issuer_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Fetch credentials list from EveryCRED API and format for frontend.
    
    Args:
        page: Page number
        size: Page size
        credential_status: Filter by credential status (e.g., "issued")
        issuer_id: Filter by issuer ID (uses config issuer_id if not provided)
        
    Returns:
        Formatted credentials list with credentials_unique_id (uuid) for frontend dashboard
    """
    try:
        # Always use issuer_id from config if available (from .env)
        if issuer_id is None:
            if everycred_service.config.issuer_id:
                try:
                    issuer_id = int(everycred_service.config.issuer_id)
                    logger.info(f"Using issuer_id from config (.env): {issuer_id}")
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid issuer_id in config: {everycred_service.config.issuer_id}, error: {e}")
                    issuer_id = None
            else:
                logger.warning("No issuer_id provided and not found in config. Credentials may not be filtered correctly.")
        
        logger.info(f"STEP 1: Fetching credentials list - page: {page}, size: {size}, status: {credential_status}, issuer_id: {issuer_id}")
        logger.info(f"STEP 2: EveryCred API URL: {everycred_service.config.api_url}")
        logger.info(f"STEP 3: EveryCred API Token configured: {'Yes' if everycred_service.config.api_token else 'No'}")
        
        credentials_response = await everycred_service.get_credentials_list(
            page=page,
            size=size,
            credential_status=credential_status,
            issuer_id=issuer_id,
        )
        
        logger.info(f"STEP 4: Raw credentials response received - type: {type(credentials_response)}")
        logger.info(f"STEP 5: Raw credentials response keys: {list(credentials_response.keys()) if isinstance(credentials_response, dict) else 'Not a dict'}")
        logger.info(f"STEP 6: Raw credentials response (first 500 chars): {str(credentials_response)[:500]}")
        
        # Parse and format the response for frontend
        formatted_credentials = []
        
        # Extract credentials from response - handle EveryCRED API response structure
        logger.info("STEP 7: Parsing credentials response structure")
        
        credentials_data = credentials_response.get("data", {})
        logger.info(f"STEP 8: credentials_data type: {type(credentials_data)}")
        
        credentials_list = []
        
        if isinstance(credentials_data, dict):
            logger.info(f"STEP 9: credentials_data is dict, keys: {list(credentials_data.keys())}")
            # EveryCRED API returns credentials in data.list[] array
            credentials_list = credentials_data.get("list", [])
            logger.info(f"STEP 10: Found credentials list in data.list: {len(credentials_list)} items")
            
            # Fallback: Check other possible keys if list is empty
            if not credentials_list:
                for key in ["credentials", "items", "results", "data"]:
                    if key in credentials_data and isinstance(credentials_data[key], list):
                        credentials_list = credentials_data[key]
                        logger.info(f"STEP 11: Found credentials in data.{key}: {len(credentials_list)} items")
                        break
        elif isinstance(credentials_data, list):
            credentials_list = credentials_data
            logger.info(f"STEP 12: credentials_data is directly a list: {len(credentials_list)} items")
        else:
            # Try direct access at root level
            credentials_list = credentials_response.get("credentials", [])
            if not credentials_list:
                credentials_list = credentials_response.get("items", [])
            if not credentials_list:
                credentials_list = credentials_response.get("results", [])
            logger.info(f"STEP 13: Tried direct access, found: {len(credentials_list)} items")
        
        logger.info(f"STEP 15: Final credentials list count: {len(credentials_list)}")
        
        # If still no credentials found, log the full response for debugging
        if len(credentials_list) == 0:
            logger.warning("STEP 16: No credentials found in response. Full response structure:")
            logger.warning(f"  Response type: {type(credentials_response)}")
            if isinstance(credentials_response, dict):
                logger.warning(f"  Response keys: {list(credentials_response.keys())}")
                logger.warning(f"  Full response: {credentials_response}")
            else:
                logger.warning(f"  Response: {credentials_response}")
        
        # Format each credential for frontend
        for idx, cred in enumerate(credentials_list):
            logger.info(f"STEP 17.{idx}: Processing credential {idx + 1}/{len(credentials_list)}")
            if isinstance(cred, dict):
                logger.info(f"Credential {idx} keys: {list(cred.keys())}")
                
                # Extract credential_unique_id from EveryCRED API response (this is the key field for verifier URL)
                credential_unique_id = (
                    cred.get("credential_unique_id") or 
                    cred.get("uuid") or 
                    cred.get("unique_id") or
                    cred.get("credentials_unique_id")
                )
                credential_id = cred.get("credential_id") or cred.get("id") or str(cred.get("id", ""))
                
                # Construct verification URL using credential_unique_id
                # EveryCRED verifier URL format: https://stg-dcs-verifier-in.everycred.com/{credential_unique_id}
                verification_url = None
                if credential_unique_id:
                    verification_url = f"https://stg-dcs-verifier-in.everycred.com/{credential_unique_id}"
                    logger.info(f"Constructed verification URL from credential_unique_id: {verification_url}")
                else:
                    logger.warning(f"No credential_unique_id found for credential {idx}, cannot construct verification URL")
                
                logger.info(f"Credential {idx} - credential_unique_id: {credential_unique_id}, Verification URL: {verification_url}")
                
                # Extract subject fields (name, email, program, etc.)
                subject_fields = cred.get("subject_fields", {})
                if isinstance(subject_fields, str):
                    import json
                    try:
                        subject_fields = json.loads(subject_fields)
                    except (json.JSONDecodeError, TypeError, ValueError):
                        subject_fields = {}
                
                # Get name and email from subject_fields or direct fields
                name = subject_fields.get("name") or cred.get("name") or ""
                email = subject_fields.get("email") or cred.get("email") or ""
                program = subject_fields.get("program") or cred.get("program") or ""
                
                # Extract dates
                issue_date = cred.get("issue_date") or cred.get("created_at") or cred.get("issued_at") or ""
                if issue_date and "T" in str(issue_date):
                    issue_date = str(issue_date).split("T")[0]
                
                formatted_cred = {
                    "id": str(cred.get("id", credential_id)),
                    "credential_id": credential_id,
                    "credential_unique_id": credential_unique_id,  # This is the credential_unique_id from EveryCred API
                    "student": name,
                    "student_email": email,
                    "degree": cred.get("degree") or "Bachelor of Technology",  # Default or extract from subject
                    "program": program,
                    "date": issue_date,
                    "verification_url": verification_url,  # Constructed from credential_unique_id
                    "status": cred.get("status") or "issued",
                }
                
                formatted_credentials.append(formatted_cred)
                logger.info(f"Formatted credential: {formatted_cred.get('student')} - credential_unique_id: {credential_unique_id}, Verification URL: {verification_url}")
        
        # Get total count from API response if available
        total_count = credentials_response.get("data", {}).get("total", len(formatted_credentials))
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data={
                "credentials": formatted_credentials,
                "total": total_count,
                "page": page,
                "size": size,
            },
            message="Credentials list fetched successfully",
        ).make
        
    except Exception as e:
        logger.error(f"Error fetching credentials: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch credentials: {str(e)}",
        )


@credentials_router.get("/course/{course_id}")
async def get_course_credentials(
    course_id: int,
    course_name: str = Query(..., description="Course name"),
    credential_status: Optional[str] = Query("draft", description="Credential status filter (default: draft)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Fetch credentials/records for a course from EveryCred API.
    Endpoint: https://stg-dcs-api.everycred.com/v1/credentials
    
    Parameters:
    - issuer_id: 15 (hardcoded)
    - credential_status: draft (default, can be overridden)
    - subject_id: course_id
    - page: Page number (default: 1)
    - size: Page size (default: 10)
    
    Args:
        course_id: Course ID (subject_id)
        course_name: Course name (for response only, not used in API call)
        credential_status: Credential status filter (default: "draft")
        page: Page number (default: 1)
        size: Page size (default: 10)
        
    Returns:
        Formatted credentials/records list for the course
    """
    try:
        # Always use static issuer_id = 15 (hardcoded as per EveryCred API requirement)
        issuer_id = 15
        # Always use static cred_status = "draft" (can be overridden via query param, but defaults to draft)
        cred_status = credential_status or "draft"
        
        logger.info("Fetching course credentials from EveryCred API")
        logger.info(f"  Params: issuer_id={issuer_id}, subject_id={course_id}, credential_status={cred_status}, page={page}, size={size}")
        
        credentials_response = await everycred_admin_service.get_course_credentials(
            issuer_id=issuer_id,
            subject_id=course_id,
            page=page,
            size=size,
            credential_status=cred_status,
        )
        
        logger.info(f"Raw course credentials response received - type: {type(credentials_response)}")
        logger.info(f"Raw course credentials response keys: {list(credentials_response.keys()) if isinstance(credentials_response, dict) else 'Not a dict'}")
        
        # Parse and format the response for frontend
        formatted_credentials = []
        
        # Extract credentials from response - new API structure: data.list[]
        credentials_data = credentials_response.get("data", {})
        credentials_list = credentials_data.get("list", [])
        
        logger.info(f"Total credentials/records found for course {course_id}: {len(credentials_list)}")
        
        # Format each credential/record as a student-like object for frontend
        # New API returns fields directly on credential object
        for cred in credentials_list:
            if isinstance(cred, dict):
                # Fields are directly on credential object in new API
                name = cred.get("name") or ""
                email = cred.get("email") or ""
                program = cred.get("program") or ""
                
                # Extract dates (field names: enrollmentdate, completiondate)
                enrollment_date = cred.get("enrollmentdate") or ""
                completion_date = cred.get("completiondate") or ""
                
                # Extract status
                cred_status = cred.get("status") or "draft"
                
                # Extract IDs - use uuid or unique_id for credential_unique_id
                credential_unique_id = cred.get("uuid") or cred.get("unique_id") or ""
                
                # Extract course_id from courseid field (string in API, convert to int)
                course_id_from_cred = cred.get("courseid")
                if isinstance(course_id_from_cred, str):
                    try:
                        course_id_from_cred = int(course_id_from_cred)
                    except (ValueError, TypeError):
                        course_id_from_cred = course_id
                elif course_id_from_cred is None:
                    course_id_from_cred = course_id
                
                # Extract ID - ensure it's a number
                cred_id = cred.get("id")
                if cred_id is None:
                    cred_id = 0
                elif isinstance(cred_id, str):
                    try:
                        cred_id = int(cred_id)
                    except (ValueError, TypeError):
                        cred_id = 0
                
                formatted_cred = {
                    "id": cred_id,
                    "name": name,
                    "email": email,
                    "program": program,
                    "status": cred_status,
                    "enrollment_date": enrollment_date,
                    "completion_date": completion_date,
                    "course_id": course_id_from_cred,
                    "credential_id": cred_id,
                    "credential_unique_id": credential_unique_id,
                }
                
                formatted_credentials.append(formatted_cred)
        
        # Get total count from API response
        total_count = credentials_data.get("total", len(formatted_credentials))
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data={
                "students": formatted_credentials,
                "total": total_count,
                "course_id": course_id,
                "course_name": course_name,
            },
            message=f"Course credentials retrieved successfully for {course_name}",
        ).make
        
    except Exception as e:
        logger.error(f"Error fetching course credentials: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch course credentials: {str(e)}",
        )


@credentials_router.post("/field")
async def create_single_field(
    field_data: CredFieldCreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a single credential field in EveryCred staging API.
    
    Args:
        field_data: CredFieldCreateSchema containing single field to create
        db: Async database session
        
    Returns:
        StandardResponse with created field data or error message
    """
    try:
        logger.info(f"Creating single credential field: {field_data.name}")
        
        # Convert Pydantic model to dict for the service
        field_dict = field_data.dict(exclude_none=True)  # Exclude None values
        
        # Ensure sample is set (use name if not provided)
        if not field_dict.get("sample") and field_dict.get("name"):
            field_dict["sample"] = field_dict["name"]
        
        # Call EveryCred admin service to create single credential field
        field_response = await everycred_admin_service.create_single_field(
            field_data=field_dict,
        )
        
        logger.info("Single credential field created successfully")
        logger.info(f"Response: {field_response}")
        
        # Extract the field data from response
        response_data = field_response
        if isinstance(field_response, dict):
            # If response has nested data structure
            if "data" in field_response and isinstance(field_response["data"], dict):
                response_data = field_response["data"]
            elif "data" in field_response and isinstance(field_response["data"], list) and len(field_response["data"]) > 0:
                response_data = field_response["data"][0]
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_201_CREATED,
            data=response_data,
            message="Credential field created successfully",
        ).make
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        error_message = str(e)
        # Check if it's a duplicate field error
        if "Existing credential field" in error_message or "not credated or updated" in error_message:
            field_name = field_data.name or field_data.title or "this field"
            logger.warning(f"Duplicate field detected: {field_name}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A credential field with the name '{field_data.name}' or title '{field_data.title}' already exists. Please use a different name or search for existing fields to reuse them.",
            )
        logger.error(f"Error creating credential field: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create credential field: {str(e)}",
        )


@credentials_router.get("/fields")
async def list_cred_fields(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db),
):
    """
    List credential fields from EveryCred staging API.
    Uses issuer_id = 15 by default to fetch all fields.
    
    Args:
        search: Optional search query to filter fields
        page: Page number (default: 1)
        size: Page size (default: 100, max: 1000)
        db: Async database session
        
    Returns:
        StandardResponse with list of credential fields
    """
    try:
        logger.info(f"Listing credential fields - page: {page}, size: {size}, search: {search}")
        
        # Call EveryCred staging API to list fields
        # Use issuer_id = 15 as default
        headers = {
            "Authorization": f"Bearer {everycred_admin_service.config.api_token}",
            "Content-Type": "application/json",
        }
        
        # Build query parameters with issuer_id = 15
        params = {
            "page": page,
            "size": size,
            "issuer_id": 15,  # Default issuer_id
        }
        if search:
            params["search"] = search
        
        # Call EveryCred API endpoint for listing fields
        # The endpoint should be /v1/cred_fields or similar
        api_url = "https://stg-dcs-api.everycred.com/v1/cred_fields"
        
        try:
            response = await everycred_admin_service.client.get(
                api_url,
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"EveryCred API response: {result}")
            
            # Extract fields from response
            fields_list = []
            total = 0
            
            if isinstance(result, dict):
                if "data" in result:
                    data = result["data"]
                    if isinstance(data, dict) and "list" in data:
                        fields_list = data.get("list", [])
                        total = data.get("total", len(fields_list))
                    elif isinstance(data, list):
                        fields_list = data
                        total = len(data)
                elif "list" in result:
                    fields_list = result.get("list", [])
                    total = result.get("total", len(fields_list))
                elif isinstance(result.get("data"), list):
                    # Direct list in data
                    fields_list = result.get("data", [])
                    total = len(fields_list)
            
            logger.info(f"Fetched {len(fields_list)} fields from EveryCred API")
            
            return StandardResponse(
                status="success",
                status_code=status.HTTP_200_OK,
                data={
                    "list": fields_list,
                    "total": total,
                    "page": page,
                    "size": size,
                },
                message="Credential fields retrieved successfully",
            ).make
            
        except Exception as api_error:
            logger.warning(f"EveryCred API error: {api_error}, returning empty list")
            # If the endpoint doesn't exist or fails, return empty list
            # The frontend will show "No existing fields found"
            return StandardResponse(
                status="success",
                status_code=status.HTTP_200_OK,
                data={
                    "list": [],
                    "total": 0,
                    "page": page,
                    "size": size,
                },
                message="No fields found. Please create new fields.",
            ).make
            
    except Exception as e:
        logger.error(f"Error listing credential fields: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list credential fields: {str(e)}",
        )


@credentials_router.get("/group-fields")
async def get_group_fields(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Fetch credential fields from EveryCred field API.
    Calls https://stg-dcs-api.everycred.com/v1/field?issuer_id=15
    
    Args:
        search: Optional search query to filter fields
        db: Async database session
        
    Returns:
        StandardResponse with list of credential fields
    """
    try:
        logger.info(f"Fetching credential fields - search: {search}")
        
        # Call EveryCred field API with issuer_id=15
        headers = {
            "Authorization": f"Bearer {everycred_admin_service.config.api_token}",
            "Content-Type": "application/json",
        }
        
        params = {
            "issuer_id": 15,
        }
        if search:
            params["search"] = search
        
        api_url = "https://stg-dcs-api.everycred.com/v1/field"
        
        try:
            response = await everycred_admin_service.client.get(
                api_url,
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Field API response structure: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
            logger.info(f"Field API response (first 500 chars): {str(result)[:500]}")
            
            # Extract fields from response
            # Response structure: { "status": "success", "data": { "list": [{ "id": 84, ... }], "total": 16, ... } }
            fields_list = []
            total = 0
            
            if isinstance(result, dict):
                data = result.get("data", {})
                
                # Extract fields from data.list
                if isinstance(data, dict) and "list" in data:
                    fields_list = data.get("list", []) if isinstance(data.get("list"), list) else []
                    total = data.get("total", len(fields_list))
                elif isinstance(data, list):
                    # If data is directly a list
                    fields_list = data
                    total = len(fields_list)
                elif "list" in result:
                    # If list is at root level
                    fields_list = result.get("list", []) if isinstance(result.get("list"), list) else []
                    total = result.get("total", len(fields_list))
            
            logger.info(f"Extracted {len(fields_list)} fields from field API response (total: {total})")
            
            # Map fields to CredFieldResponse format
            # Fields from /v1/field API are already in the correct format
            mapped_fields = []
            
            for field in fields_list:
                if isinstance(field, dict) and field.get("id"):
                    # Field is already in the correct format from /v1/field API
                    mapped_field = {
                        "id": field.get("id"),
                        "name": field.get("name", ""),
                        "title": field.get("title", field.get("name", "")),
                        "ftype": field.get("ftype", "STRING"),
                        "description": field.get("description"),
                        "hint_text": field.get("hint_text"),
                        "sample": field.get("sample"),
                        "error_message": field.get("error_message"),
                        "pattern": field.get("pattern"),
                        "value": field.get("value"),
                        "is_required": field.get("is_required", False),
                        "is_preview": field.get("is_preview", False),
                        "is_mask": field.get("is_mask", False),
                    }
                    mapped_fields.append(mapped_field)
            
            logger.info(f"Mapped {len(mapped_fields)} valid fields")
            
            return StandardResponse(
                status="success",
                status_code=status.HTTP_200_OK,
                data={
                    "list": mapped_fields,
                    "total": total,
                },
                message="Credential fields retrieved successfully",
            ).make
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"EveryCred field API error: {e.response.status_code} - {error_detail}")
            # Return empty list if API fails
            return StandardResponse(
                status="success",
                status_code=status.HTTP_200_OK,
                data={
                    "list": [],
                    "total": 0,
                },
                message=f"Failed to fetch credential fields: {e.response.status_code} - {error_detail}",
            ).make
        except Exception as api_error:
            logger.warning(f"EveryCred field API error: {api_error}, returning empty list")
            logger.exception("Full error details:")
            # Return empty list if API fails
            return StandardResponse(
                status="success",
                status_code=status.HTTP_200_OK,
                data={
                    "list": [],
                    "total": 0,
                },
                message="No fields found. Please create new fields.",
            ).make
            
    except Exception as e:
        logger.error(f"Error fetching group fields: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch group fields: {str(e)}",
        )


@credentials_router.post("/fields")
async def create_cred_fields(
    fields_data: BulkCredFieldCreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create credential fields in EveryCred staging API.
    
    Args:
        fields_data: BulkCredFieldCreateSchema containing list of fields to create
        db: Async database session
        
    Returns:
        StandardResponse with created field IDs or error message
    """
    try:
        logger.info(f"Creating {len(fields_data.fields_list)} credential fields")
        
        # Convert Pydantic models to dicts for the service
        fields_list = [field.dict() for field in fields_data.fields_list]
        
        # Call EveryCred admin service to create credential fields
        fields_response = await everycred_admin_service.create_cred_fields(
            fields_list=fields_list,
        )
        
        logger.info("Credential fields created successfully")
        
        # Extract field IDs from response
        # Response structure may vary, try to extract IDs
        field_ids = []
        if isinstance(fields_response, dict):
            # Try common response structures
            if "data" in fields_response:
                data = fields_response["data"]
                if isinstance(data, list):
                    field_ids = [item.get("id") for item in data if isinstance(item, dict) and "id" in item]
                elif isinstance(data, dict) and "fields_list" in data:
                    field_ids = [item.get("id") for item in data["fields_list"] if isinstance(item, dict) and "id" in item]
            elif "fields_list" in fields_response:
                field_ids = [item.get("id") for item in fields_response["fields_list"] if isinstance(item, dict) and "id" in item]
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_201_CREATED,
            data={
                "fields": fields_response,
                "field_ids": field_ids,
            },
            message="Credential fields created successfully",
        ).make
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error creating credential fields: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create credential fields: {str(e)}",
        )


@credentials_router.post("/subjects")
async def create_subject(
    subject_data: SubjectCreateSchema,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new subject in EveryCred admin API.
    
    Args:
        subject_data: SubjectCreateSchema containing subject data
        db: Async database session
        
    Returns:
        StandardResponse with created subject data or error message
    """
    try:
        logger.info(f"Creating subject: {subject_data.name}")
        
        # Use subject_field_ids if provided, otherwise fall back to subject_fields (for backward compatibility)
        subject_fields_dict = None
        if subject_data.subject_fields:
            # Legacy support: convert full field definitions
            subject_fields_dict = [field.dict() for field in subject_data.subject_fields]
        
        field_edit_policies_dict = None
        if subject_data.field_edit_policies:
            field_edit_policies_dict = [policy.dict() for policy in subject_data.field_edit_policies]
        
        # Call EveryCred admin service to create subject
        subject_response = await everycred_admin_service.create_subject(
            name=subject_data.name,
            title=subject_data.title,
            description=subject_data.description,
            logo=subject_data.logo,
            group_id=subject_data.group_id,
            theme_id=subject_data.theme_id,
            template_id=subject_data.template_id,
            subject_fields=subject_fields_dict,
            subject_field_ids=subject_data.subject_field_ids,
            field_edit_policies=field_edit_policies_dict,
        )
        
        logger.info(f"Subject created successfully: {subject_response.get('id', 'unknown')}")
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_201_CREATED,
            data=subject_response,
            message="Subject created successfully",
        ).make
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error creating subject: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subject: {str(e)}",
        )


@credentials_router.get("/verify/{credential_id}")
async def verify_credential(
    credential_id: str,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Verify a credential by ID via EveryCRED.
    
    Args:
        credential_id: Credential ID to verify
        
    Returns:
        Verification result
    """
    try:
        logger.info(f"Verifying credential: {credential_id}")
        
        verification_result = await everycred_service.verify_credential(credential_id)
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data=verification_result,
            message="Credential verification completed",
        ).make
        
    except Exception as e:
        logger.error(f"Error verifying credential: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify credential: {str(e)}",
        )

