# Subject Creation Payload - Field Mapping

## Complete Subject Creation Payload

```json
{
  "name": "Degree",
  "title": "A Student Degree Certificate Issue Portal",
  "description": "Academic degree credential issued by the university for LMS demo integration. This credential includes student enrollment information, course details, and completion status.",
  "template_id": 1,
  "theme_id": 22,
  "badge_ids": [],
  "group_ids": [79],
  "subject_field_ids": [
    {
      "id": 236,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 237,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 281,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 277,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 278,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 279,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    },
    {
      "id": 280,
      "data_source": "issuer",
      "digilocker_field_uuid": null
    }
  ]
}
```

## Field Mapping Details

The following table shows which credential field IDs correspond to each field in your record data:

| Record Field Name | Credential Field ID | Field Name | Field Type | Description |
|-------------------|---------------------|------------|------------|-------------|
| `name` | 236 | name | STRING | Student's full name |
| `email` | 237 | email | EMAIL | Student's email address |
| `program` | 281 | program | STRING | Academic program name |
| `status` | 277 | enrollment_status | SELECT | Enrollment status (ACTIVE/INACTIVE/COMPLETED/SUSPENDED) |
| `course_id` | 278 | course_id | INTEGER | Unique course identifier |
| `enrollment_date` | 279 | enrollment_date | DATETIME | Date and time of enrollment |
| `completion_date` | 280 | completion_date | DATETIME | Date and time of completion |

## Field Details from Credential Fields Response

### 1. Name Field (ID: 236)
```json
{
  "id": 236,
  "name": "name",
  "title": "name",
  "ftype": "STRING",
  "is_required": true,
  "is_default": true,
  "is_subject_field": true
}
```

### 2. Email Field (ID: 237)
```json
{
  "id": 237,
  "name": "email",
  "title": "email",
  "ftype": "EMAIL",
  "is_required": true,
  "is_default": true,
  "is_subject_field": true
}
```

### 3. Program Field (ID: 281)
```json
{
  "id": 281,
  "name": "program",
  "title": "Program",
  "ftype": "STRING",
  "pattern": "^.{2,255}$",
  "is_required": true,
  "sample": "Bachelor_of_Computer_Science"
}
```

### 4. Enrollment Status Field (ID: 277) - Maps to "status"
```json
{
  "id": 277,
  "name": "enrollment_status",
  "title": "Enrollment Status",
  "ftype": "SELECT",
  "pattern": "^(ACTIVE|INACTIVE|COMPLETED|SUSPENDED)$",
  "value": "ACTIVE",
  "is_required": true
}
```
**Note:** When creating records, use the field name `"enrollment_status"` (not `"status"`), or check if the API accepts `"status"` as an alias.

### 5. Course ID Field (ID: 278)
```json
{
  "id": 278,
  "name": "course_id",
  "title": "Course ID",
  "ftype": "INTEGER",
  "pattern": "^[0-9]+$",
  "is_required": false,
  "sample": "101"
}
```

### 6. Enrollment Date Field (ID: 279)
```json
{
  "id": 279,
  "name": "enrollment_date",
  "title": "Enrollment Date",
  "ftype": "DATETIME",
  "pattern": "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
  "is_required": false,
  "sample": "2025-01-10_10:30:00"
}
```

### 7. Completion Date Field (ID: 280)
```json
{
  "id": 280,
  "name": "completion_date",
  "title": "Completion Date",
  "ftype": "DATETIME",
  "pattern": "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
  "is_required": false,
  "sample": "2026-06-15_18:00:00"
}
```

## Example Record Creation Payload

When creating records for this subject, use the following structure:

```json
{
  "subject_id": <SUBJECT_ID_FROM_RESPONSE>,
  "records": [
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "program": "Bachelor_of_Computer_Science",
      "enrollment_status": "ACTIVE",
      "course_id": 101,
      "enrollment_date": "2025-01-10 10:30:00",
      "completion_date": "2026-06-15 18:00:00"
    }
  ]
}
```

## Important Notes

1. **Field Name Mapping**: The credential field `enrollment_status` (ID: 277) corresponds to the `status` field in your record. When creating records, you may need to use `"enrollment_status"` as the field name, or verify if the API accepts `"status"` as an alias.

2. **Date Format**: Both `enrollment_date` and `completion_date` should be in the format: `"YYYY-MM-DD HH:MM:SS"` (e.g., `"2025-01-10 10:30:00"`).

3. **Status Values**: The `enrollment_status` field accepts only these values:
   - `"ACTIVE"`
   - `"INACTIVE"`
   - `"COMPLETED"`
   - `"SUSPENDED"`

4. **Required Fields**: Based on the credential fields:
   - `name` (ID: 236) - **Required**
   - `email` (ID: 237) - **Required**
   - `program` (ID: 281) - **Required**
   - `enrollment_status` (ID: 277) - **Required**
   - `course_id` (ID: 278) - Optional
   - `enrollment_date` (ID: 279) - Optional
   - `completion_date` (ID: 280) - Optional

5. **Data Source Values**: The `data_source` field must be one of these three values:
   - `"issuer"` - Data provided by the issuer (university/LMS system) when creating records
   - `"holder_manual"` - Data entered manually by the credential holder
   - `"holder_digilocker"` - Data fetched from DigiLocker (requires `digilocker_field_uuid`)
   
   In this payload, all fields use `"issuer"` since the LMS system will provide the data when creating records.

6. **DigiLocker Integration**: The `digilocker_field_uuid` is set to `null` for all fields. If you need DigiLocker integration, you'll need to provide the appropriate UUIDs.

## API Request Example

```bash
curl -X POST "http://localhost:8000/api/v1/user/subject?issuer_id=YOUR_ISSUER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Degree",
    "title": "A Student Degree Certificate Issue Portal",
    "description": "Academic degree credential issued by the university for LMS demo integration. This credential includes student enrollment information, course details, and completion status.",
    "template_id": 1,
    "theme_id": 22,
    "badge_ids": [],
    "group_ids": [79],
    "subject_field_ids": [
      {
        "id": 236,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 237,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 281,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 277,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 278,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 279,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 280,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      }
    ]
  }'
```

## Expected Response

```json
{
  "status": "success",
  "status_code": 200,
  "data": {
    "id": <SUBJECT_ID>,
    "name": "Degree",
    "title": "A Student Degree Certificate Issue Portal",
    "description": "Academic degree credential issued by the university for LMS demo integration. This credential includes student enrollment information, course details, and completion status.",
    "template_id": 1,
    "theme_id": 22,
    "badge_ids": [],
    "group_ids": [79],
    "subject_field_ids": [
      {
        "id": 236,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 237,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 281,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 277,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 278,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 279,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      },
      {
        "id": 280,
        "data_source": "issuer",
        "digilocker_field_uuid": null
      }
    ],
    "created_at": "2026-01-11T00:00:00",
    "updated_at": "2026-01-11T00:00:00"
  },
  "message": "Subject created successfully"
}
```

