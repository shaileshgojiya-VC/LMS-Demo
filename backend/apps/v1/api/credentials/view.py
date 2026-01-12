"""
API endpoints for credential management and EveryCRED integration.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from apps.v1.api.credentials.services.everycred_service import (
    everycred_service,
    CredentialRequest,
    CredentialResponse,
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
        logger.info(f"STEP 7: Parsing credentials response structure")
        
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
            logger.warning(f"STEP 16: No credentials found in response. Full response structure:")
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

