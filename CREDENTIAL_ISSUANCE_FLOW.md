# Credential Issuance Flow - Frontend to EveryCRED

## Overview
This document explains how credentials are issued from the LMS frontend to EveryCRED API when students are created or when credentials are manually issued.

## Flow Diagram

```
Frontend (UI) 
    ↓
Backend API (/v1/credentials/issue)
    ↓
EveryCRED Service
    ↓
EveryCRED API (http://0.0.0.0:7007/api/v1/record)
    ↓
Credential Issued
```

## Configuration

### Environment Variables (backend/.env)

```env
# EveryCRED API Configuration
EVERYCRED_API_URL=http://0.0.0.0:7007/api/v1
EVERYCRED_API_TOKEN=your_bearer_token_here
EVERYCRED_ISSUER_ID=63
EVERYCRED_GROUP_ID=79
EVERYCRED_SUBJECT_ID=117
EVERYCRED_MOCK_MODE=false
```

## API Endpoints

### 1. Issue Credential (Backend)
**Endpoint:** `POST /api/v1/credentials/issue`

**Request Body:**
```json
{
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "degree": "Bachelor of Technology",
  "program": "Computer Science",
  "institution": "Demo University",
  "issue_date": "2026-01-11",
  "completion_date": "2026-06-15",
  "course_id": 101,
  "enrollment_date": "2025-01-10 10:30:00"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "credential_id": "EC-1234567890-1234",
    "verification_url": "https://verify.everycred.com/EC-1234567890-1234",
    "status": "processing",
    "issued_at": "2026-01-11T00:00:00",
    "record_id": 12345
  },
  "message": "Credential issued successfully"
}
```

### 2. Create Record (EveryCRED API)
**Endpoint:** `POST /api/v1/record?subject_id=117&issuer_id=63`

**Request Body:**
```json
{
  "group_id": 79,
  "badge_id": null,
  "slug": "{\"subject_fields\":{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"program\":\"Computer Science\",\"course_id\":101,\"enrollment_date\":\"2025-01-10 10:30:00\",\"completion_date\":\"2026-06-15 18:00:00\"}}"
}
```

## Field Mapping

The following fields from the student are mapped to EveryCRED subject fields:

| Student Field | EveryCRED Field | Field ID | Required |
|--------------|-----------------|----------|----------|
| `name` | `name` | 236 | Yes |
| `email` | `email` | 237 | Yes |
| `program` | `program` | 281 | Yes |
| `course_id` | `course_id` | 278 | No |
| `enrollment_date` | `enrollment_date` | 279 | No |
| `completion_date` | `completion_date` | 280 | No |

**Note:** `enrollment_status` (Field ID: 277) is excluded as it causes validation errors.

## Frontend Integration

### Issue Credential from Students Table

When a user clicks "Issue Credentials" button in the students table:

1. Frontend calls: `api.credentials.issue({...student data...})`
2. Backend receives request at `/v1/credentials/issue`
3. Backend calls EveryCRED API to:
   - Create a record with student data
   - Issue a credential for that record
4. Response is returned to frontend
5. Frontend stores credential in localStorage and displays success message

### Code Example (Frontend)

```typescript
const handleIssueCredential = async (student: Student) => {
  try {
    const data = await api.credentials.issue({
      student_name: student.name,
      student_email: student.email,
      degree: getDegreeForProgram(student.program),
      program: student.program || "General Studies",
      institution: "Demo University",
      issue_date: new Date().toISOString().split("T")[0],
      completion_date: student.completion_date || undefined,
      course_id: student.course_id || undefined,
      enrollment_date: student.enrollment_date || undefined,
    })
    
    // Store credential
    credentialStorage.storeCredential({...})
    
    toast.success("Credential issued successfully!")
  } catch (error) {
    toast.error("Failed to issue credential")
  }
}
```

## Backend Service Flow

### 1. Create Record
- Builds `subject_fields` object with student data
- Creates `slug` as JSON string: `{"subject_fields": {...}}`
- Sends POST request to EveryCRED: `/v1/record?subject_id=117&issuer_id=63`
- Returns record ID

### 2. Issue Credential
- Uses record ID from step 1
- Sends POST request to EveryCRED: `/v1/user/credentials/issue`
- Returns credential details with task_id

## Error Handling

### Common Errors

1. **404 Not Found**
   - **Cause:** Wrong endpoint URL or EveryCRED API not running
   - **Fix:** Verify `EVERYCRED_API_URL` and ensure EveryCRED service is running

2. **EVERYCRED_SUBJECT_ID is not configured**
   - **Cause:** Missing environment variable
   - **Fix:** Add `EVERYCRED_SUBJECT_ID=117` to `backend/.env`

3. **Got Unexpected data: {'enrollment_status'}**
   - **Cause:** Field type "SELECT" not supported
   - **Fix:** Exclude `enrollment_status` from record data

4. **401 Unauthorized**
   - **Cause:** Invalid or missing API token
   - **Fix:** Verify `EVERYCRED_API_TOKEN` is correct

## Testing

### Test Credential Issuance

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn apps.server:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create a Student:**
   - Go to Students page
   - Click "Add Student"
   - Fill in student details
   - Save

4. **Issue Credential:**
   - Find the student in the table
   - Click "Issue Credentials" button
   - Check for success message
   - Verify credential appears in Dashboard

### Verify EveryCRED Integration

Check backend logs for:
- `Making POST request to EveryCRED: http://0.0.0.0:7007/api/v1/record`
- `Credential issued successfully: {credential_id}`

## Troubleshooting

### Check Environment Variables
```bash
cd backend
grep EVERYCRED .env
```

Should show:
```
EVERYCRED_API_URL=http://0.0.0.0:7007/api/v1
EVERYCRED_API_TOKEN=your_token
EVERYCRED_ISSUER_ID=63
EVERYCRED_GROUP_ID=79
EVERYCRED_SUBJECT_ID=117
EVERYCRED_MOCK_MODE=false
```

### Verify EveryCRED API is Running
```bash
curl http://0.0.0.0:7007/api/v1/health
```

### Test Record Creation Directly
```bash
curl -X POST "http://0.0.0.0:7007/api/v1/record?subject_id=117&issuer_id=63" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": 79,
    "badge_id": null,
    "slug": "{\"subject_fields\":{\"name\":\"Test Student\",\"email\":\"test@example.com\",\"program\":\"Test Program\"}}"
  }'
```

## Next Steps

1. ✅ Fixed endpoint path: `/v1/record` (was `/user/subject/{id}/record`)
2. ✅ Fixed payload format: Using `slug` with `group_id` and `badge_id`
3. ✅ Added field mapping: name, email, program, course_id, enrollment_date, completion_date
4. ✅ Updated frontend to pass all student fields
5. ⏳ Test end-to-end flow
6. ⏳ Add error handling for EveryCRED API failures
7. ⏳ Add retry logic for failed credential issuances

