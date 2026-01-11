"""
Service for integrating with EveryCRED API for credential issuance.
"""

import logging
import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file before reading environment variables
# Use BASE_DIR from config if available, otherwise calculate from this file
try:
    from config.project_path import BASE_DIR
    env_path = BASE_DIR / ".env"
except ImportError:
    # Fallback: calculate path from this file location
    backend_dir = Path(__file__).parent.parent.parent.parent.parent
    env_path = backend_dir / ".env"
load_dotenv(env_path)

logger = logging.getLogger(__name__)


class EveryCREDConfig:
    """Configuration for EveryCRED API."""
    
    def __init__(self):
        self.api_url = os.getenv("EVERYCRED_API_URL", "http://localhost:8000/api/v1")
        self.api_token = os.getenv("EVERYCRED_API_TOKEN", "")
        self.issuer_id = os.getenv("EVERYCRED_ISSUER_ID", "")
        self.group_id = os.getenv("EVERYCRED_GROUP_ID", "")
        self.subject_id = os.getenv("EVERYCRED_SUBJECT_ID", "")
        self.mock_mode = os.getenv("EVERYCRED_MOCK_MODE", "false").lower() == "true"
    
    def is_configured(self) -> bool:
        """Check if EveryCRED is properly configured."""
        if self.mock_mode:
            return True
        return bool(self.api_url and self.api_token and self.issuer_id and self.subject_id)


class CredentialRequest(BaseModel):
    """Request model for issuing credentials."""
    student_name: str
    student_email: str
    degree: str
    program: str
    institution: str
    issue_date: str
    completion_date: Optional[str] = None


class CredentialResponse(BaseModel):
    """Response model for issued credentials."""
    credential_id: str
    verification_url: str
    status: str
    issued_at: str
    record_id: Optional[int] = None


class EveryCREDService:
    """Service for interacting with EveryCRED API."""
    
    def __init__(self):
        self.config = EveryCREDConfig()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Make HTTP request to EveryCRED API.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            data: Request body data
            params: Query parameters
            
        Returns:
            Response data as dictionary
            
        Raises:
            Exception: If request fails
        """
        if self.config.mock_mode:
            logger.info(f"[MOCK] {method} {endpoint}")
            return self._mock_response(method, endpoint, data)
        
        url = f"{self.config.api_url.rstrip('/')}/{endpoint.lstrip('/')}"
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json",
        }
        
        try:
            logger.info(f"Making {method} request to EveryCRED: {url}")
            response = await self.client.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
            raise Exception(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
        except Exception as e:
            logger.error(f"Error calling EveryCRED API: {str(e)}")
            raise
    
    def _mock_response(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Generate mock response for testing."""
        import time
        import random
        
        if "records" in endpoint and method == "POST":
            # Mock create record response
            return {
                "status": "success",
                "status_code": 200,
                "data": {
                    "records": [
                        {
                            "id": random.randint(1000, 9999),
                            "name": data.get("records", [{}])[0].get("name", "Mock Student"),
                            "email": data.get("records", [{}])[0].get("email", "mock@example.com"),
                        }
                    ]
                },
                "message": "Records created successfully",
            }
        elif "credentials/issue" in endpoint and method == "POST":
            # Mock issue credential response
            credential_id = f"EC-{int(time.time())}-{random.randint(1000, 9999)}"
            return {
                "status": "success",
                "status_code": 202,
                "data": {
                    "task_id": f"task-{random.randint(10000, 99999)}",
                },
                "message": "Credentials issued successfully",
            }
        
        return {"status": "success", "data": {}, "message": "Mock response"}
    
    async def create_record(
        self,
        student_name: str,
        student_email: str,
        degree: str,
        program: str,
        institution: str,
        completion_date: Optional[str] = None,
        course_id: Optional[int] = None,
        enrollment_date: Optional[str] = None,
    ) -> int:
        """
        Create a record (student data entry) in EveryCRED.
        
        Args:
            student_name: Name of the student
            student_email: Email of the student
            degree: Degree type (e.g., "Bachelor of Technology")
            program: Program name (e.g., "Computer Science")
            institution: Institution name
            completion_date: Optional completion date
            course_id: Optional course ID
            enrollment_date: Optional enrollment date
            
        Returns:
            Record ID
        """
        if not self.config.subject_id:
            raise ValueError("EVERYCRED_SUBJECT_ID is not configured")
        
        # Build subject_fields object matching the credential field names
        import json
        subject_fields = {
            "name": student_name,
            "email": student_email,
            "program": program,
        }
        
        # Add optional fields if provided
        if course_id is not None:
            subject_fields["course_id"] = course_id
        if enrollment_date:
            subject_fields["enrollment_date"] = enrollment_date
        if completion_date:
            subject_fields["completion_date"] = completion_date
        
        # Create slug as JSON string
        slug_data = {"subject_fields": subject_fields}
        slug = json.dumps(slug_data)
        
        # Build payload with group_id, badge_id, and slug
        payload = {
            "group_id": int(self.config.group_id) if self.config.group_id else None,
            "badge_id": None,  # Optional, can be set if needed
            "slug": slug,
        }
        
        # Use correct endpoint: /v1/record?subject_id={subject_id}&issuer_id={issuer_id}
        endpoint = "record"
        params = {
            "subject_id": int(self.config.subject_id),
        }
        if self.config.issuer_id:
            params["issuer_id"] = int(self.config.issuer_id)
        
        response = await self._make_request("POST", endpoint, data=payload, params=params)
        
        # Extract record ID from response
        if "data" in response:
            data = response["data"]
            if "id" in data:
                return data["id"]
            elif "record" in data and "id" in data["record"]:
                return data["record"]["id"]
        
        raise Exception("Failed to extract record ID from EveryCRED response")
    
    async def issue_credential(
        self,
        record_ids: List[int],
        batch: Optional[str] = None,
        remarks: Optional[str] = None,
        email_to_holder: bool = True,
    ) -> Dict[str, Any]:
        """
        Issue credentials for given record IDs.
        
        Args:
            record_ids: List of record IDs to issue credentials for
            batch: Optional batch name
            remarks: Optional remarks
            email_to_holder: Whether to email credentials to holders
            
        Returns:
            Response data with task_id or credential details
        """
        payload = {
            "records": record_ids,
        }
        
        if batch:
            payload["batch"] = batch
        if remarks:
            payload["remarks"] = remarks
        
        params = {"email_to_holder": str(email_to_holder).lower()}
        
        response = await self._make_request(
            "POST",
            "user/credentials/issue",
            data=payload,
            params=params,
        )
        
        return response
    
    async def issue_credential_for_student(
        self,
        student_name: str,
        student_email: str,
        degree: str,
        program: str,
        institution: str,
        issue_date: str,
        completion_date: Optional[str] = None,
        course_id: Optional[int] = None,
        enrollment_date: Optional[str] = None,
    ) -> CredentialResponse:
        """
        Complete flow: Create record and issue credential for a student.
        
        Args:
            student_name: Name of the student
            student_email: Email of the student
            degree: Degree type
            program: Program name
            institution: Institution name
            issue_date: Issue date (ISO format)
            completion_date: Optional completion date
            course_id: Optional course ID
            enrollment_date: Optional enrollment date
            
        Returns:
            CredentialResponse with credential details
        """
        # Step 1: Create record
        logger.info(f"Creating record for student: {student_name}")
        record_id = await self.create_record(
            student_name=student_name,
            student_email=student_email,
            degree=degree,
            program=program,
            institution=institution,
            completion_date=completion_date,
            course_id=course_id,
            enrollment_date=enrollment_date,
        )
        
        # Step 2: Validate record (if needed)
        # Records are created in "draft" status and may need validation
        # For now, we'll try to issue directly - the EveryCRED API will handle validation
        logger.info(f"Record created with ID: {record_id}, proceeding to issue credential")
        
        # Step 3: Issue credential
        logger.info(f"Issuing credential for record ID: {record_id}")
        issue_response = await self.issue_credential(
            record_ids=[record_id],
            batch=f"LMS-Demo-{issue_date}",
            remarks=f"Credential issued via LMS integration for {student_name}",
            email_to_holder=True,
        )
        
        logger.info(f"Credential issuance initiated. Response: {issue_response}")
        
        # Extract credential information
        if self.config.mock_mode:
            import time
            import random
            credential_id = f"EC-{int(time.time())}-{random.randint(1000, 9999)}"
            return CredentialResponse(
                credential_id=credential_id,
                verification_url=f"https://verify.everycred.com/{credential_id}",
                status="issued",
                issued_at=issue_date,
                record_id=record_id,
            )
        
        # In real mode, the response contains task_id for async processing
        # You may need to poll for completion or handle async response
        task_id = issue_response.get("data", {}).get("task_id", "")
        
        return CredentialResponse(
            credential_id=task_id,  # Use task_id temporarily
            verification_url=f"https://verify.everycred.com/{task_id}",
            status="processing",
            issued_at=issue_date,
            record_id=record_id,
        )
    
    async def verify_credential(self, credential_id: str) -> Dict[str, Any]:
        """
        Verify a credential by ID.
        
        Args:
            credential_id: Credential ID to verify
            
        Returns:
            Verification result
        """
        response = await self._make_request(
            "GET",
            f"user/credentials/{credential_id}/verify",
        )
        return response
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Singleton instance
everycred_service = EveryCREDService()

