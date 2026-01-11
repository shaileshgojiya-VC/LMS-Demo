# EveryCRED Integration Setup Guide for LMS Demo

## Overview

This guide will help you set up EveryCRED integration for your LMS demo. You'll create:
1. **One Issuer Account** - Represents your university/institution
2. **One Group** - Organizes credentials (e.g., "Degree Credentials")
3. **One Subject** - Named "Degree" with minimum required fields for frontend/backend

## Prerequisites

1. EveryCRED backend is running (in the `Everycred/` directory)
2. You have a user account in EveryCRED with proper permissions
3. Access to EveryCRED API (either local or production)
4. Authentication token for API calls

## Step-by-Step Setup Process

### Step 1: Get Authentication Token

First, you need to authenticate and get a bearer token:

```bash
# Login to get token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` from the response. You'll use it as `Bearer {token}` in subsequent requests.

### Step 2: Create Pre-Verified OTP (Bypass OTP Verification)

Since you're setting up for demo purposes, you can bypass OTP verification by creating a pre-verified OTP record:

**Option A: Use the provided script**
```bash
cd Everycred
python create_pre_verified_otp.py --email "issuer@university.edu" --user_id 1
```

**Option B: Direct API call** (if OTP bypass is enabled in development)

### Step 3: Create Issuer Profile

Create the issuer account that will issue credentials:

```bash
curl -X POST "http://localhost:8000/api/v1/user/issuer?mode=production&credential_type=credential&wallet_holder_type=issuer" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo University",
    "email": "issuer@university.edu",
    "website": "https://www.university.edu",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "about": "Demo University - Issuer profile for LMS integration demonstration",
    "reference_id": "YOUR_PRE_VERIFIED_OTP_UUID"
  }'
```

**Save the `issuer_id` from the response** - you'll need it for creating groups and subjects.

**Required Fields:**
- `name`: Issuer name (min 1 char)
- `email`: Valid email address
- `website`: Valid URL
- `logo`: Base64-encoded image (min 1 char, max 2MB)
- `about`: Description (10-550 characters)
- `reference_id`: OTP UUID (if bypassing OTP)

**Optional Fields:**
- `crypto_address`: MetaMask wallet address
- `banner_image`: Base64-encoded banner image
- `linkedIn_url`, `x_url`, `facebook_url`, `instagram_url`: Social media links

### Step 4: Get Theme ID (Required for Subject)

Before creating a subject, you need a theme. List available themes:

```bash
curl -X GET "http://localhost:8000/api/v1/user/theme" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Save the `theme_id`** from the response (usually `1` for default theme).

### Step 5: Create Credential Fields (Subject Fields)

Before creating a subject, you need to create credential fields. These are the fields that will appear in the degree credential.

**Minimum Required Fields for Degree Credential:**

1. **Student Name** (usually already exists as system field)
2. **Student Email** (usually already exists as system field)
3. **Degree Type** (e.g., "Bachelor of Technology")
4. **Program** (e.g., "Computer Science")
5. **Institution** (e.g., "Demo University")
6. **Issue Date** (usually system field)
7. **Completion Date** (optional but recommended)

Check existing credential fields:

```bash
curl -X GET "http://localhost:8000/api/v1/user/cred_fields?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If fields don't exist, create them:

```bash
# Create Degree Type field
curl -X POST "http://localhost:8000/api/v1/user/cred_fields" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree Type",
    "ftype": "text",
    "is_required": true,
    "sample": "Bachelor of Technology"
  }'

# Create Program field
curl -X POST "http://localhost:8000/api/v1/user/cred_fields" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Program",
    "ftype": "text",
    "is_required": true,
    "sample": "Computer Science"
  }'

# Create Institution field
curl -X POST "http://localhost:8000/api/v1/user/cred_fields" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Institution",
    "ftype": "text",
    "is_required": true,
    "sample": "Demo University"
  }'
```

**Save the `cred_field_ids`** from each response.

### Step 6: Create Group

Create a group to organize your credentials:

```bash
curl -X POST "http://localhost:8000/api/v1/user/group?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree Credentials"
  }'
```

**Save the `group_id`** from the response.

### Step 7: Create Subject (Named "Degree")

Create the subject with minimum required fields:

```bash
curl -X POST "http://localhost:8000/api/v1/user/subject?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree",
    "title": "Degree Credential",
    "description": "Academic degree credential issued by the university",
    "theme_id": YOUR_THEME_ID,
    "group_ids": [YOUR_GROUP_ID],
    "subject_field_ids": [
      {
        "id": CRED_FIELD_ID_DEGREE_TYPE,
        "data_source": "manual"
      },
      {
        "id": CRED_FIELD_ID_PROGRAM,
        "data_source": "manual"
      },
      {
        "id": CRED_FIELD_ID_INSTITUTION,
        "data_source": "manual"
      }
    ]
  }'
```

**Save the `subject_id`** from the response.

### Step 8: Create Records (Student Data)

Before issuing credentials, you need to create records (student data entries):

```bash
curl -X POST "http://localhost:8000/api/v1/user/records" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": YOUR_SUBJECT_ID,
    "records": [
      {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "Degree Type": "Bachelor of Technology",
        "Program": "Computer Science",
        "Institution": "Demo University"
      }
    ]
  }'
```

**Save the `record_ids`** from the response.

### Step 9: Issue Credentials

Issue credentials using the record IDs:

```bash
curl -X POST "http://localhost:8000/api/v1/user/credentials/issue?email_to_holder=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [RECORD_ID_1, RECORD_ID_2],
    "batch": "2024-Graduates",
    "remarks": "Credentials issued for 2024 graduating class"
  }'
```

## Integration with LMS Demo

### Backend Integration

The LMS backend should call EveryCRED API to:
1. Create records when students are added
2. Issue credentials when requested
3. Verify credentials when needed

### Frontend Integration

The LMS frontend should:
1. Display credential issuance button
2. Show credential status
3. Provide verification links

## Environment Variables

Add these to your `.env` file:

```env
# EveryCRED API Configuration
EVERYCRED_API_URL=http://localhost:8000/api/v1
EVERYCRED_API_TOKEN=your_bearer_token_here
EVERYCRED_ISSUER_ID=your_issuer_id
EVERYCRED_GROUP_ID=your_group_id
EVERYCRED_SUBJECT_ID=your_subject_id
EVERYCRED_MOCK_MODE=false
```

## Testing the Integration

1. **Create a student** in your LMS demo
2. **Issue credential** from the frontend
3. **Verify credential** on EveryCRED platform
4. **Check verification** using the credential ID

## Troubleshooting

### Common Issues

1. **"Issuer already exists"**: Check if issuer with same email exists
2. **"Invalid reference_id"**: Ensure OTP is pre-verified
3. **"Theme not found"**: Use default theme_id (usually 1)
4. **"Group not found"**: Ensure group is created before subject
5. **"Subject field not found"**: Create credential fields first

### Verification

After setup, verify your configuration:

```bash
# Check issuer
curl -X GET "http://localhost:8000/api/v1/user/issuer/issuer_id?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check group
curl -X GET "http://localhost:8000/api/v1/user/group/YOUR_GROUP_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check subject
curl -X GET "http://localhost:8000/api/v1/user/subject/YOUR_SUBJECT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

After completing this setup:
1. Integrate EveryCRED API calls into your LMS backend
2. Update frontend to use real EveryCRED endpoints
3. Test end-to-end credential issuance flow
4. Prepare demo presentation for universities

## Support

For issues or questions:
- Check EveryCRED API documentation
- Review API response errors
- Check server logs for detailed error messages

