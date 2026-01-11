#!/usr/bin/env python3
"""
Setup script for EveryCRED integration.
This script helps you set up issuer, group, and subject in EveryCRED.
"""

import os
import sys
import json
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
EVERYCRED_API_URL = os.getenv("EVERYCRED_API_URL", "http://localhost:8000/api/v1")
EVERYCRED_API_TOKEN = os.getenv("EVERYCRED_API_TOKEN", "")


class EveryCREDSetup:
    """Helper class for EveryCRED setup."""
    
    def __init__(self):
        self.api_url = EVERYCRED_API_URL.rstrip("/")
        self.api_token = EVERYCRED_API_TOKEN
        self.client = httpx.Client(timeout=30.0)
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request to EveryCRED API."""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        
        try:
            response = self.client.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                params=params,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"❌ Error: {e.response.status_code}")
            print(f"   Response: {e.response.text}")
            raise
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            raise
    
    def get_theme_id(self) -> int:
        """Get default theme ID."""
        print("\n📋 Fetching available themes...")
        try:
            response = self._make_request("GET", "user/theme")
            themes = response.get("data", [])
            if themes:
                theme_id = themes[0].get("id", 1)
                print(f"✅ Using theme ID: {theme_id}")
                return theme_id
            else:
                print("⚠️  No themes found, using default: 1")
                return 1
        except Exception as e:
            print(f"⚠️  Could not fetch themes, using default: 1")
            return 1
    
    def create_issuer(
        self,
        name: str,
        email: str,
        website: str,
        about: str,
        reference_id: Optional[str] = None,
    ) -> int:
        """Create issuer profile."""
        print(f"\n🏛️  Creating issuer: {name}")
        
        # Minimal logo (1x1 transparent PNG)
        logo_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        payload = {
            "name": name,
            "email": email,
            "website": website,
            "logo": logo_base64,
            "about": about,
        }
        
        if reference_id:
            payload["reference_id"] = reference_id
        
        response = self._make_request(
            "POST",
            "user/issuer?mode=production&credential_type=credential&wallet_holder_type=issuer",
            data=payload,
        )
        
        issuer_id = response.get("data", {}).get("id")
        if issuer_id:
            print(f"✅ Issuer created with ID: {issuer_id}")
            return issuer_id
        else:
            raise Exception("Failed to extract issuer ID from response")
    
    def create_group(self, issuer_id: int, name: str) -> int:
        """Create group."""
        print(f"\n📁 Creating group: {name}")
        
        payload = {"name": name}
        
        response = self._make_request(
            "POST",
            f"user/group?issuer_id={issuer_id}",
            data=payload,
        )
        
        group_id = response.get("data", {}).get("id")
        if group_id:
            print(f"✅ Group created with ID: {group_id}")
            return group_id
        else:
            raise Exception("Failed to extract group ID from response")
    
    def create_credential_fields(self, issuer_id: int) -> Dict[str, int]:
        """Create credential fields for degree credential."""
        print(f"\n📝 Creating credential fields...")
        
        fields = {
            "Degree Type": {
                "name": "Degree Type",
                "ftype": "text",
                "is_required": True,
                "sample": "Bachelor of Technology",
            },
            "Program": {
                "name": "Program",
                "ftype": "text",
                "is_required": True,
                "sample": "Computer Science",
            },
            "Institution": {
                "name": "Institution",
                "ftype": "text",
                "is_required": True,
                "sample": "Demo University",
            },
        }
        
        field_ids = {}
        
        for field_name, field_data in fields.items():
            try:
                response = self._make_request(
                    "POST",
                    f"user/cred_fields?issuer_id={issuer_id}",
                    data=field_data,
                )
                field_id = response.get("data", {}).get("id")
                if field_id:
                    field_ids[field_name] = field_id
                    print(f"✅ Created field '{field_name}' with ID: {field_id}")
                else:
                    print(f"⚠️  Field '{field_name}' may already exist, checking...")
                    # Try to find existing field
                    list_response = self._make_request(
                        "GET",
                        f"user/cred_fields?issuer_id={issuer_id}",
                    )
                    existing_fields = list_response.get("data", [])
                    for field in existing_fields:
                        if field.get("name") == field_name:
                            field_ids[field_name] = field.get("id")
                            print(f"✅ Found existing field '{field_name}' with ID: {field.get('id')}")
                            break
            except Exception as e:
                print(f"⚠️  Error creating field '{field_name}': {str(e)}")
                # Try to find existing field
                try:
                    list_response = self._make_request(
                        "GET",
                        f"user/cred_fields?issuer_id={issuer_id}",
                    )
                    existing_fields = list_response.get("data", [])
                    for field in existing_fields:
                        if field.get("name") == field_name:
                            field_ids[field_name] = field.get("id")
                            print(f"✅ Found existing field '{field_name}' with ID: {field.get('id')}")
                            break
                except:
                    pass
        
        return field_ids
    
    def create_subject(
        self,
        issuer_id: int,
        group_id: int,
        theme_id: int,
        field_ids: Dict[str, int],
    ) -> int:
        """Create subject named 'Degree'."""
        print(f"\n🎓 Creating subject: Degree")
        
        subject_field_ids = [
            {
                "id": field_ids["Degree Type"],
                "data_source": "manual",
            },
            {
                "id": field_ids["Program"],
                "data_source": "manual",
            },
            {
                "id": field_ids["Institution"],
                "data_source": "manual",
            },
        ]
        
        payload = {
            "name": "Degree",
            "title": "Degree Credential",
            "description": "Academic degree credential issued by the university for LMS demo integration",
            "theme_id": theme_id,
            "group_ids": [group_id],
            "subject_field_ids": subject_field_ids,
        }
        
        response = self._make_request(
            "POST",
            f"user/subject?issuer_id={issuer_id}",
            data=payload,
        )
        
        subject_id = response.get("data", {}).get("id")
        if subject_id:
            print(f"✅ Subject created with ID: {subject_id}")
            return subject_id
        else:
            raise Exception("Failed to extract subject ID from response")
    
    def setup_complete(
        self,
        issuer_id: int,
        group_id: int,
        subject_id: int,
        field_ids: Dict[str, int],
    ):
        """Print setup completion summary."""
        print("\n" + "=" * 60)
        print("✅ EveryCRED Setup Complete!")
        print("=" * 60)
        print(f"\n📋 Configuration Summary:")
        print(f"   Issuer ID: {issuer_id}")
        print(f"   Group ID: {group_id}")
        print(f"   Subject ID: {subject_id}")
        print(f"\n📝 Credential Fields:")
        for field_name, field_id in field_ids.items():
            print(f"   - {field_name}: {field_id}")
        
        print(f"\n🔧 Add these to your .env file:")
        print(f"   EVERYCRED_ISSUER_ID={issuer_id}")
        print(f"   EVERYCRED_GROUP_ID={group_id}")
        print(f"   EVERYCRED_SUBJECT_ID={subject_id}")
        print("\n" + "=" * 60)


def main():
    """Main setup function."""
    print("🚀 EveryCRED Setup Script")
    print("=" * 60)
    
    if not EVERYCRED_API_TOKEN:
        print("❌ Error: EVERYCRED_API_TOKEN not set in environment")
        print("   Please set it in your .env file or export it:")
        print("   export EVERYCRED_API_TOKEN='your_token_here'")
        sys.exit(1)
    
    setup = EveryCREDSetup()
    
    # Get user input
    print("\n📝 Please provide the following information:")
    issuer_name = input("Issuer Name (e.g., Demo University): ").strip() or "Demo University"
    issuer_email = input("Issuer Email: ").strip()
    issuer_website = input("Issuer Website: ").strip() or "https://www.university.edu"
    issuer_about = input("Issuer Description: ").strip() or "Demo University - LMS Integration Demo"
    
    if not issuer_email:
        print("❌ Error: Issuer email is required")
        sys.exit(1)
    
    try:
        # Step 1: Get theme ID
        theme_id = setup.get_theme_id()
        
        # Step 2: Create issuer
        issuer_id = setup.create_issuer(
            name=issuer_name,
            email=issuer_email,
            website=issuer_website,
            about=issuer_about,
        )
        
        # Step 3: Create group
        group_id = setup.create_group(
            issuer_id=issuer_id,
            name="Degree Credentials",
        )
        
        # Step 4: Create credential fields
        field_ids = setup.create_credential_fields(issuer_id=issuer_id)
        
        if not all(key in field_ids for key in ["Degree Type", "Program", "Institution"]):
            print("❌ Error: Failed to create required credential fields")
            sys.exit(1)
        
        # Step 5: Create subject
        subject_id = setup.create_subject(
            issuer_id=issuer_id,
            group_id=group_id,
            theme_id=theme_id,
            field_ids=field_ids,
        )
        
        # Step 6: Print summary
        setup.setup_complete(
            issuer_id=issuer_id,
            group_id=group_id,
            subject_id=subject_id,
            field_ids=field_ids,
        )
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()


