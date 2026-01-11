# Subject Creation Payload Guide

This guide explains the payload structure for creating a subject in EveryCRED API.

## API Endpoint

```
POST /api/v1/user/subject?issuer_id={issuer_id}
```

## Payload Structure

The subject creation payload is a JSON object with the following structure:

```json
{
  "name": "Degree",
  "title": "Degree Credential",
  "description": "Academic degree credential issued by the university for LMS demo integration",
  "theme_id": 1,
  "group_ids": [1],
  "subject_field_ids": [
    {
      "id": 123,
      "data_source": "manual"
    },
    {
      "id": 124,
      "data_source": "manual"
    },
    {
      "id": 125,
      "data_source": "manual"
    }
  ]
}
```

## Field Descriptions

### Required Fields

1. **`name`** (string, required)
   - The internal name/identifier for the subject
   - Example: `"Degree"`, `"Certificate"`, `"Diploma"`
   - Used for internal reference and identification

2. **`title`** (string, required)
   - The display title of the credential subject
   - Example: `"Degree Credential"`, `"Bachelor's Degree"`
   - This is what users will see as the credential title

3. **`description`** (string, required)
   - A detailed description of what this credential represents
   - Example: `"Academic degree credential issued by the university"`
   - Provides context about the credential type

4. **`theme_id`** (integer, required)
   - The ID of the theme to use for this subject
   - You must first fetch available themes using: `GET /api/v1/user/theme`
   - Typically `1` for the default theme
   - Determines the visual styling/template of the credential

5. **`group_ids`** (array of integers, required)
   - List of group IDs that this subject belongs to
   - You must create a group first using: `POST /api/v1/user/group?issuer_id={issuer_id}`
   - Groups help organize credentials into categories
   - Example: `[1]` or `[1, 2]` for multiple groups

6. **`subject_field_ids`** (array of objects, required)
   - List of credential fields that will be included in this subject
   - Each object in the array must have:
     - **`id`** (integer): The credential field ID (created via `POST /api/v1/user/cred_fields`)
     - **`data_source`** (string): How the data is provided. Options:
       - `"manual"` - Data entered manually when creating records
       - `"system"` - System-generated fields (like issue date)
       - `"api"` - Data provided via API
   - Example structure:
     ```json
     [
       {
         "id": 123,
         "data_source": "manual"
       },
       {
         "id": 124,
         "data_source": "manual"
       }
     ]
     ```

## Complete Example

Here's a complete example of creating a subject for a degree credential:

### Step 1: Get Theme ID
```bash
curl -X GET "http://localhost:8000/api/v1/user/theme" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Default Theme"
    }
  ]
}
```

### Step 2: Create Credential Fields
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

Save the field IDs from each response (e.g., `123`, `124`, `125`).

### Step 3: Create Group
```bash
curl -X POST "http://localhost:8000/api/v1/user/group?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree Credentials"
  }'
```

Save the group ID from the response (e.g., `1`).

### Step 4: Create Subject
```bash
curl -X POST "http://localhost:8000/api/v1/user/subject?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree",
    "title": "Degree Credential",
    "description": "Academic degree credential issued by the university for LMS demo integration",
    "theme_id": 1,
    "group_ids": [1],
    "subject_field_ids": [
      {
        "id": 123,
        "data_source": "manual"
      },
      {
        "id": 124,
        "data_source": "manual"
      },
      {
        "id": 125,
        "data_source": "manual"
      }
    ]
  }'
```

### Response
```json
{
  "status": "success",
  "status_code": 200,
  "data": {
    "id": 456,
    "name": "Degree",
    "title": "Degree Credential",
    "description": "Academic degree credential issued by the university for LMS demo integration",
    "theme_id": 1,
    "group_ids": [1],
    "subject_field_ids": [
      {
        "id": 123,
        "data_source": "manual"
      },
      {
        "id": 124,
        "data_source": "manual"
      },
      {
        "id": 125,
        "data_source": "manual"
      }
    ]
  },
  "message": "Subject created successfully"
}
```

**Save the `subject_id` (e.g., `456`) from the response** - you'll need it when creating records and issuing credentials.

## Implementation in Code

From `setup_everycred.py`, here's how the payload is constructed:

```python
def create_subject(
    self,
    issuer_id: int,
    group_id: int,
    theme_id: int,
    field_ids: Dict[str, int],
) -> int:
    """Create subject named 'Degree'."""
    
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
    return subject_id
```

## Important Notes

1. **Prerequisites**: Before creating a subject, you must have:
   - An issuer ID (created issuer profile)
   - A theme ID (from available themes)
   - A group ID (created group)
   - Credential field IDs (created credential fields)

2. **Field Mapping**: The `subject_field_ids` must reference valid credential field IDs that you've already created. The field names in your records (when creating records later) must match the credential field names exactly.

3. **Data Source Types**:
   - `"manual"`: Field data is provided when creating records
   - `"system"`: Automatically generated by the system (e.g., issue date)
   - `"api"`: Provided via API integration

4. **Multiple Groups**: You can assign a subject to multiple groups by including multiple group IDs in the `group_ids` array.

5. **Field Order**: The order of fields in `subject_field_ids` may affect how they appear in the credential template.

## Common Use Cases

### Degree Credential
- Fields: Student Name, Student Email, Degree Type, Program, Institution, Issue Date, Completion Date
- Group: "Academic Credentials"
- Theme: Default theme (ID: 1)

### Certificate Credential
- Fields: Student Name, Student Email, Certificate Type, Course Name, Institution, Issue Date
- Group: "Professional Certificates"
- Theme: Professional theme (ID: 2)

### Diploma Credential
- Fields: Student Name, Student Email, Diploma Type, Program, Institution, Issue Date, Completion Date
- Group: "Academic Credentials"
- Theme: Default theme (ID: 1)

