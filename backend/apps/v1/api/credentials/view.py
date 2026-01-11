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
        
        return StandardResponse(
            status="success",
            status_code=status.HTTP_200_OK,
            data={
                "credential_id": credential_response.credential_id,
                "verification_url": credential_response.verification_url,
                "status": credential_response.status,
                "issued_at": credential_response.issued_at,
                "record_id": credential_response.record_id,
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

