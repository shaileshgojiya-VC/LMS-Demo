# Credential Issuance Troubleshooting Guide

## Current Status

✅ **Record Creation**: Working correctly
- Records are being created successfully in EveryCRED
- Record IDs are being extracted correctly
- Endpoint: `POST /v1/record?subject_id=117&issuer_id=63`

⚠️ **Credential Issuance**: Async processing (202 Accepted)
- Credential issuance endpoint returns 202 (Accepted) with `task_id`
- Credentials are processed asynchronously via Celery background tasks
- The actual issuance happens in the background

## Issue: Credentials Not Being Issued

### Possible Causes

1. **Celery Worker Not Running**
   - The credential issuance is handled by Celery async tasks
   - If the Celery worker is not running, credentials won't be issued
   
   **Solution**: Start the Celery worker
   ```bash
   cd Everycred
   celery -A celery_app worker --loglevel=info --queue=credential_queue
   ```

2. **Record Status is "draft"**
   - Records are created with status "draft"
   - Some configurations may require records to be validated before issuance
   
   **Solution**: Check if records need validation first

3. **Pricing Plan Limits**
   - The API might be checking pricing plan limits
   - Error: "User exceeded with batch feature"
   
   **Solution**: Check your EveryCRED pricing plan limits

4. **Task Failing Silently**
   - The Celery task might be failing but not showing errors
   
   **Solution**: Check Celery logs and task status

## How to Check Credential Status

### 1. Check Celery Task Status

The credential issuance returns a `task_id`. You can check the task status:

```python
from celery.result import AsyncResult
task = AsyncResult(task_id)
print(task.state)  # PENDING, STARTED, SUCCESS, FAILURE
print(task.result)  # Task result if completed
```

### 2. Check Records in EveryCRED

Query the records to see their status:

```bash
curl -X GET "http://0.0.0.0:7007/v1/record?subject_id=117&issuer_id=63" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check Credentials in EveryCRED

Query issued credentials:

```bash
curl -X GET "http://0.0.0.0:7007/v1/user/credentials?subject_id=117" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Current Flow

1. **Create Record** ✅
   - Endpoint: `POST /v1/record?subject_id=117&issuer_id=63`
   - Status: Working
   - Response: Returns record ID

2. **Issue Credential** ⚠️
   - Endpoint: `POST /v1/user/credentials/issue?email_to_holder=true`
   - Status: Returns 202 (Accepted) with task_id
   - Processing: Async via Celery

## Next Steps

1. **Verify Celery Worker is Running**
   ```bash
   # Check if Celery is running
   ps aux | grep celery
   
   # Start Celery worker if not running
   cd Everycred
   celery -A celery_app worker --loglevel=info --queue=credential_queue
   ```

2. **Check Celery Logs**
   ```bash
   # Look for credential issuance tasks in logs
   tail -f Everycred/logs/app.log | grep -i credential
   ```

3. **Test Direct Credential Issuance**
   ```bash
   curl -X POST "http://0.0.0.0:7007/v1/user/credentials/issue?email_to_holder=true" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "records": [8426],
       "batch": "Test Batch",
       "remarks": "Test credential issuance"
     }'
   ```

4. **Check Record Status Before Issuance**
   - Records might need to be in a specific status (not "draft")
   - May need to validate records first using `/v1/record/validate_records`

## Debugging Tips

1. **Enable Detailed Logging**
   - Check backend logs for credential issuance attempts
   - Check EveryCRED logs for task processing

2. **Monitor Celery Tasks**
   - Use Flower (Celery monitoring tool) to see task status
   - Check task queue for pending/failed tasks

3. **Test with Single Record**
   - Try issuing credential for a single record
   - Check if batch size is causing issues

4. **Verify API Token Permissions**
   - Ensure the API token has `credentials_issue` permission
   - Check if token is expired

## Expected Behavior

When credentials are issued successfully:
- Record status changes from "draft" to "issued"
- Credential is created in EveryCRED database
- Email is sent to holder (if `email_to_holder=true`)
- Credential can be verified via verification URL

## Current Response Format

```json
{
  "status": "success",
  "status_code": 202,
  "data": {
    "task_id": "celery-task-uuid"
  },
  "message": "Credential issued successfully"
}
```

The `task_id` indicates the credential is being processed asynchronously. Check the Celery worker status to see if the task completes successfully.

