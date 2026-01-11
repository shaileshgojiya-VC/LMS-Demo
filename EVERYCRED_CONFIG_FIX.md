# EveryCRED Configuration Fix

## Issue
The credential issuance was failing with the error:
```
Configuration error: EVERYCRED_SUBJECT_ID is not configured
```

## Solution
Added `EVERYCRED_SUBJECT_ID=117` to the `backend/.env` file.

## Subject Details
- **Subject ID**: 117
- **Subject Name**: "Degree"
- **Subject Title**: "A Student Degree Certificate Issue Portal"
- **Group ID**: 79
- **Theme ID**: 22
- **Template ID**: 1

## Next Steps

### 1. Restart the Backend Server
The environment variable change requires a server restart to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
uvicorn apps.server:app --reload
```

### 2. Verify Configuration
After restarting, the logs should no longer show:
- ❌ "EveryCRED not configured, using mock mode"
- ❌ "Configuration error: EVERYCRED_SUBJECT_ID is not configured"

Instead, you should see successful credential issuance.

### 3. Optional: Complete EveryCRED Configuration
For full EveryCRED integration (not mock mode), also set these in `backend/.env`:

```env
# EveryCRED Configuration
EVERYCRED_API_URL=http://localhost:8000/api/v1
EVERYCRED_API_TOKEN=your_bearer_token_here
EVERYCRED_ISSUER_ID=your_issuer_id
EVERYCRED_GROUP_ID=79
EVERYCRED_SUBJECT_ID=117
EVERYCRED_MOCK_MODE=false
```

**Note**: Currently, `EVERYCRED_MOCK_MODE` is set to `true` (default), which allows the system to work without a full EveryCRED API connection. The subject ID is still required even in mock mode.

## Record Creation Payload
When creating records, use the following fields (excluding `enrollment_status` which causes validation errors):

```json
{
  "subject_id": 117,
  "records": [
    {
      "name": "johnsmith",
      "email": "john@example.com",
      "program": "Bachelor_of_Computer_Science",
      "course_id": 101,
      "enrollment_date": "2025-01-10 10:30:00",
      "completion_date": "2026-06-15 18:00:00"
    }
  ]
}
```

## Field Mapping
- `name` → Field ID: 236
- `email` → Field ID: 237
- `program` → Field ID: 281
- `course_id` → Field ID: 278
- `enrollment_date` → Field ID: 279
- `completion_date` → Field ID: 280

**Excluded**: `enrollment_status` (Field ID: 277) - causes "Got Unexpected data" error

