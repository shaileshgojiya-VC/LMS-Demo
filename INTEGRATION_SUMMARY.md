# EveryCRED Integration Summary

## Overview

This document summarizes the EveryCRED integration setup for your LMS demo. The integration allows you to issue verifiable credentials directly from your LMS frontend, which can then be verified on the EveryCRED platform.

## What Has Been Implemented

### 1. **Backend Integration** ✅

**Location**: `backend/apps/v1/api/credentials/`

- **Service Layer** (`services/everycred_service.py`):
  - `EveryCREDService` class handles all API communication with EveryCRED
  - Supports both mock mode (for testing) and production mode
  - Methods:
    - `create_record()` - Creates student data entry in EveryCRED
    - `issue_credential()` - Issues credentials for record IDs
    - `issue_credential_for_student()` - Complete flow (create record + issue credential)
    - `verify_credential()` - Verifies credentials by ID

- **API Endpoints** (`view.py`):
  - `POST /api/v1/credentials/issue` - Issue credential for a student
  - `GET /api/v1/credentials/verify/{credential_id}` - Verify a credential

### 2. **Frontend Integration** ✅

**Updated Files**:
- `frontend/lib/api.ts` - Updated credential issue API to call backend
- `frontend/components/students/students-table.tsx` - Uses backend API
- `frontend/components/credentials/student-credential-card.tsx` - Uses backend API

**Changes**:
- Frontend now calls backend API (`/api/v1/credentials/issue`) instead of directly calling EveryCRED
- Proper error handling and response parsing
- Credential data stored locally for dashboard display

### 3. **Setup Script** ✅

**Location**: `setup_everycred.py`

Interactive Python script that helps you:
1. Create issuer profile
2. Create group
3. Create credential fields (Degree Type, Program, Institution)
4. Create subject named "Degree"
5. Print configuration summary with IDs

### 4. **Documentation** ✅

**Location**: `EVERYCRED_SETUP_GUIDE.md`

Comprehensive guide covering:
- Step-by-step setup process
- API endpoint details
- Environment variable configuration
- Troubleshooting tips

## Setup Process

### Step 1: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# EveryCRED API Configuration
EVERYCRED_API_URL=http://localhost:8000/api/v1
EVERYCRED_API_TOKEN=your_bearer_token_here
EVERYCRED_ISSUER_ID=your_issuer_id
EVERYCRED_GROUP_ID=your_group_id
EVERYCRED_SUBJECT_ID=your_subject_id
EVERYCRED_MOCK_MODE=false
```

### Step 2: Get Authentication Token

Login to EveryCRED API:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` and set it as `EVERYCRED_API_TOKEN`.

### Step 3: Run Setup Script

```bash
# Set the token
export EVERYCRED_API_TOKEN="your_token_here"

# Run the setup script
python setup_everycred.py
```

The script will:
- Prompt for issuer details
- Create issuer, group, and subject
- Print configuration IDs

### Step 4: Update Environment Variables

After running the setup script, add the printed IDs to your `.env` file.

### Step 5: Start Backend and Frontend

```bash
# Backend
cd backend
uvicorn apps.server:app --reload --port 8888

# Frontend (in another terminal)
cd frontend
npm run dev
```

## How It Works

### Credential Issuance Flow

1. **User Action**: Admin clicks "Issue Credential" for a student in the LMS frontend

2. **Frontend Request**: Frontend calls backend API:
   ```typescript
   await api.credentials.issue({
     student_name: "John Doe",
     student_email: "john@example.com",
     degree: "Bachelor of Technology",
     program: "Computer Science",
     institution: "Demo University",
     issue_date: "2024-01-15"
   })
   ```

3. **Backend Processing**: Backend service:
   - Creates a record in EveryCRED with student data
   - Issues credential for that record
   - Returns credential details (ID, verification URL, status)

4. **Frontend Display**: Frontend:
   - Stores credential locally
   - Shows success message
   - Displays credential ID and verification URL

5. **Verification**: Credentials can be verified on EveryCRED platform using the credential ID or verification URL

### Data Flow

```
LMS Frontend → Backend API → EveryCRED Service → EveryCRED API
                ↓
         Credential Response
                ↓
         LMS Frontend (Display)
```

## Minimum Required Fields for Degree Credential

The "Degree" subject includes these minimum fields:

1. **Student Name** (system field - always included)
2. **Student Email** (system field - always included)
3. **Degree Type** (e.g., "Bachelor of Technology")
4. **Program** (e.g., "Computer Science")
5. **Institution** (e.g., "Demo University")
6. **Issue Date** (system field - always included)
7. **Completion Date** (optional)

## API Endpoints

### Backend Endpoints

- `POST /api/v1/credentials/issue`
  - Request body:
    ```json
    {
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "degree": "Bachelor of Technology",
      "program": "Computer Science",
      "institution": "Demo University",
      "issue_date": "2024-01-15",
      "completion_date": "2024-01-15" // optional
    }
    ```
  - Response:
    ```json
    {
      "status": "success",
      "status_code": 200,
      "data": {
        "credential_id": "EC-1234567890-ABCDEF",
        "verification_url": "https://verify.everycred.com/EC-1234567890-ABCDEF",
        "status": "issued",
        "issued_at": "2024-01-15T10:00:00Z",
        "record_id": 123
      },
      "message": "Credential issued successfully"
    }
    ```

- `GET /api/v1/credentials/verify/{credential_id}`
  - Returns verification result

## Testing

### Test Credential Issuance

1. Start both backend and frontend servers
2. Login to LMS demo
3. Navigate to Students page
4. Click "Issue Credential" for any student
5. Check console/logs for API calls
6. Verify credential appears in dashboard

### Test Verification

1. Get credential ID from issued credential
2. Visit verification URL or call verify endpoint
3. Check verification result

## Mock Mode

For testing without EveryCRED backend, set:

```env
EVERYCRED_MOCK_MODE=true
```

This will:
- Skip actual API calls
- Generate mock credential IDs
- Return mock responses
- Allow testing the integration flow

## Troubleshooting

### Common Issues

1. **"EveryCRED not configured"**
   - Check environment variables are set
   - Verify API token is valid
   - Ensure EveryCRED backend is running

2. **"Failed to create record"**
   - Verify subject_id is correct
   - Check credential fields exist
   - Ensure student data matches field requirements

3. **"Failed to issue credential"**
   - Check record was created successfully
   - Verify issuer has proper permissions
   - Check EveryCRED backend logs

### Debugging

Enable debug logging in backend:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check logs for:
- API request/response details
- Error messages
- Configuration issues

## Next Steps

1. **Complete Setup**: Run setup script and configure environment variables
2. **Test Integration**: Issue test credentials and verify them
3. **Customize Fields**: Add more fields to degree credential if needed
4. **Prepare Demo**: Test end-to-end flow for university presentation
5. **Production Setup**: Configure for production EveryCRED instance

## Support

For issues:
- Check `EVERYCRED_SETUP_GUIDE.md` for detailed setup instructions
- Review backend logs for error details
- Verify EveryCRED API documentation
- Check environment variable configuration

## Files Modified/Created

### Backend
- `backend/apps/v1/api/credentials/view.py` - API endpoints
- `backend/apps/v1/api/credentials/services/everycred_service.py` - EveryCRED service
- `backend/apps/server.py` - Added credentials router
- `backend/config/env_config.py` - Added EveryCRED config

### Frontend
- `frontend/lib/api.ts` - Updated credential API calls
- `frontend/components/students/students-table.tsx` - Updated to use backend API
- `frontend/components/credentials/student-credential-card.tsx` - Updated to use backend API

### Scripts & Documentation
- `setup_everycred.py` - Setup automation script
- `EVERYCRED_SETUP_GUIDE.md` - Detailed setup guide
- `INTEGRATION_SUMMARY.md` - This file

