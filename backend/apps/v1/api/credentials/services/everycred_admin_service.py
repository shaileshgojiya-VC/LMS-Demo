"""
Service for integrating with EveryCRED staging admin API for credential management.
"""

import logging
from typing import Dict, Any, Optional, List
import httpx

from apps.v1.api.credentials.services.everycred_service import EveryCREDConfig

logger = logging.getLogger(__name__)


class EveryCREDAdminService:
    """Service for interacting with EveryCRED staging admin API."""
    
    def __init__(self):
        self.api_url = "https://stg-dcs-api.everycred.com/v1/credentials"
        self.admin_api_url = "https://stg-dcs-issuer.everycred.com/admin/subjects"
        self.subject_api_url = "https://stg-dcs-api.everycred.com/v1/subject"  # Staging API endpoint for subject creation
        self.cred_fields_api_url = "https://stg-dcs-api.everycred.com/v1/field"  # Fixed: should be /v1/field not /v1/cred_fields
        self.single_field_api_url = "https://stg-dcs-api.everycred.com/v1/field"
        self.config = EveryCREDConfig()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_course_credentials(
        self,
        issuer_id: int,
        subject_id: int,
        page: int = 1,
        size: int = 10,
        credential_status: str = "draft",
    ) -> Dict[str, Any]:
        """
        Fetch credentials/records for a course from EveryCred API.
        Endpoint: https://stg-dcs-api.everycred.com/v1/credentials
        
        Args:
            issuer_id: Issuer ID (static: 15)
            subject_id: Subject ID (course ID)
            page: Page number (default: 1)
            size: Page size (default: 10)
            credential_status: Credential status filter (default: "draft")
            
        Returns:
            Response data with credentials/records list
        """
        # Build query parameters for new API
        params: Dict[str, Any] = {
            "page": page,
            "size": size,
            "credential_status": credential_status,
            "subject_id": subject_id,
            "issuer_id": issuer_id,
        }
        
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json",
        }
        
        try:
            logger.info("Fetching course credentials from EveryCred API")
            logger.info(f"URL: {self.api_url}")
            logger.info(f"Params: {params}")
            
            response = await self.client.request(
                method="GET",
                url=self.api_url,
                headers=headers,
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
    
    async def create_subject(
        self,
        name: str,
        title: str,
        description: Optional[str] = None,
        logo: Optional[str] = None,
        group_id: int = None,
        theme_id: Optional[int] = 1,
        template_id: Optional[int] = None,
        subject_fields: Optional[List[Dict[str, Any]]] = None,
        subject_field_ids: Optional[List[int]] = None,
        field_edit_policies: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new subject in EveryCred admin API.
        Endpoint: https://stg-dcs-issuer.everycred.com/admin/subjects/add
        
        Args:
            name: Subject name (required)
            title: Credential title (required)
            description: Subject description (optional)
            logo: Logo URL or file path (optional)
            group_id: Group ID (required)
            theme_id: Theme ID (optional, default: 1)
            template_id: Template ID (optional, default: None)
            subject_fields: List of subject field definitions (optional, legacy)
            subject_field_ids: List of credential field IDs (optional, preferred)
            field_edit_policies: List of field edit policies (optional)
            
        Returns:
            Response data with created subject information
        """
        if not group_id:
            raise ValueError("group_id is required")
        
        # Build request payload
        payload: Dict[str, Any] = {
            "name": name,
            "title": title,
            "theme_id": theme_id or 1,
        }
        
        # Only include template_id if it's provided (not None)
        if template_id is not None:
            payload["template_id"] = template_id
        
        if description:
            payload["description"] = description
        
        if logo:
            payload["logo"] = logo
        
        # Convert group_id to group_ids list (required by API)
        if group_id:
            payload["group_ids"] = [group_id]
        
        # Use subject_fields if provided (preferred format for service API)
        # The staging API expects subject_fields (field objects), not subject_field_ids
        if subject_fields:
            payload["subject_fields"] = subject_fields
        elif subject_field_ids:
            # If only IDs provided, we need to fetch field objects from the API
            # For now, convert to subject_fields format that the service API expects
            # Note: This requires field objects, but we only have IDs
            # The service API needs field objects with: fname, ftype, description, sample, is_mandatory, preview
            # We'll need to fetch these from the cred_fields API first
            logger.warning("subject_field_ids provided but subject_fields format required. Attempting to use IDs directly.")
            # Try using subject_field_ids format (might work for some APIs)
            payload["subject_field_ids"] = [
                {"id": field_id, "data_source": "issuer", "digilocker_field_uuid": None}
                for field_id in subject_field_ids
            ]
        
        if field_edit_policies:
            payload["field_edit_policies"] = field_edit_policies
        
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json",
        }
        
        try:
            # Get issuer_id from config (required query parameter)
            issuer_id = self.config.issuer_id
            if not issuer_id:
                raise ValueError("issuer_id is required but not configured. Please set EVERYCRED_ISSUER_ID in environment variables.")
            
            # Add issuer_id as query parameter
            url_with_params = f"{self.subject_api_url}?issuer_id={issuer_id}"
            
            logger.info("Creating subject in EveryCred staging API")
            logger.info(f"URL: {url_with_params}")
            logger.info(f"Payload keys: {list(payload.keys())}")
            logger.info(f"Issuer ID: {issuer_id}")
            logger.info(f"Full payload: {payload}")
            
            # Use the staging API endpoint for subject creation
            response = await self.client.request(
                method="POST",
                url=url_with_params,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Subject created successfully via {self.subject_api_url}")
            return result
                
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
            raise Exception(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
        except Exception as e:
            logger.error(f"Error calling EveryCRED API: {str(e)}")
            raise
    
    async def create_cred_fields(
        self,
        fields_list: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Create credential fields in EveryCred staging API.
        Endpoint: https://stg-dcs-api.everycred.com/v1/cred_fields
        
        Args:
            fields_list: List of credential field definitions
            Each field should have:
                - name: str (required)
                - title: str (required)
                - ftype: str (STRING, EMAIL, FLOAT, DATE, INTEGER, BOOLEAN, etc.)
                - description: Optional[str]
                - is_required: bool (default: False)
                - is_mask: bool (default: False)
                - is_preview: bool (default: False)
                - hint_text: Optional[str]
                - sample: Optional[str]
                - error_message: Optional[str]
                - pattern: Optional[str]
                
        Returns:
            Response data with created field IDs
        """
        if not fields_list:
            raise ValueError("fields_list cannot be empty")
        
        # Build request payload matching BulkCredFieldCreateSchema
        payload: Dict[str, Any] = {
            "fields_list": fields_list
        }
        
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json",
        }
        
        try:
            logger.info("Creating credential fields in EveryCred staging API")
            logger.info(f"URL: {self.cred_fields_api_url}")
            logger.info(f"Fields count: {len(fields_list)}")
            
            response = await self.client.request(
                method="POST",
                url=self.cred_fields_api_url,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Credential fields created successfully. Response keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
            return result
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
            raise Exception(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
        except Exception as e:
            logger.error(f"Error calling EveryCRED API: {str(e)}")
            raise
    
    async def create_single_field(
        self,
        field_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Create a single credential field in EveryCred staging API.
        Endpoint: https://stg-dcs-api.everycred.com/v1/field
        
        Note: The endpoint expects BulkCredFieldCreateSchema format with fields_list,
        so we wrap the single field in a fields_list array.
        
        Args:
            field_data: Single credential field definition
            Should have:
                - name: str (required)
                - title: str (required)
                - ftype: str (STRING, EMAIL, FLOAT, DATE, INTEGER, BOOLEAN, etc.)
                - description: Optional[str]
                - is_required: bool (default: False)
                - is_mask: bool (default: False)
                - is_preview: bool (default: False)
                - hint_text: Optional[str]
                - sample: Optional[str]
                - error_message: Optional[str]
                - pattern: Optional[str]
                
        Returns:
            Response data with created field information including ID
        """
        if not field_data:
            raise ValueError("field_data cannot be empty")
        
        # Clean up the field data - remove None values for optional fields that shouldn't be sent
        # But keep required fields even if they're None
        cleaned_field_data = {
            "name": field_data.get("name"),
            "title": field_data.get("title"),
            "ftype": field_data.get("ftype"),
        }
        
        # Add optional fields only if they have values (not None)
        optional_fields = [
            "description", "pattern", "value", "hint_text", 
            "sample", "error_message"
        ]
        for field in optional_fields:
            value = field_data.get(field)
            if value is not None and value != "":
                cleaned_field_data[field] = value
        
        # Boolean fields should always be included
        cleaned_field_data["is_required"] = field_data.get("is_required", False)
        cleaned_field_data["is_mask"] = field_data.get("is_mask", False)
        cleaned_field_data["is_preview"] = field_data.get("is_preview", False)
        
        # Wrap single field in fields_list format (as expected by the API)
        payload = {
            "fields_list": [cleaned_field_data]
        }
        
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json",
        }
        
        try:
            logger.info("Creating single credential field in EveryCred staging API")
            logger.info(f"URL: {self.single_field_api_url}")
            logger.info(f"Field data: {field_data}")
            logger.info(f"Cleaned field data: {cleaned_field_data}")
            logger.info(f"Payload: {payload}")
            
            response = await self.client.request(
                method="POST",
                url=self.single_field_api_url,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Single credential field created successfully. Response: {result}")
            
            # Extract the single field from the response
            # Response format: {"status": "success", "data": [{"id": 93, ...}], "message": "..."}
            if isinstance(result, dict) and "data" in result:
                data = result["data"]
                if isinstance(data, list) and len(data) > 0:
                    # Return the first field from the list with the full response structure
                    return {
                        "status": result.get("status", "success"),
                        "data": data[0],  # Return the single field object
                        "message": result.get("message", "Credential field created successfully!"),
                    }
            
            return result
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
            raise Exception(f"EveryCRED API error: {e.response.status_code} - {error_detail}")
        except Exception as e:
            logger.error(f"Error calling EveryCRED API: {str(e)}")
            raise
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Singleton instance
everycred_admin_service = EveryCREDAdminService()

