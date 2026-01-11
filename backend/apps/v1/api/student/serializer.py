"""
Marshmallow serializer for student module.
"""

from apps.v1.api.student.models.model import Student
from marshmallow import Schema, fields


class StudentSerializer(Schema):
    """Serializer for Student model."""

    id = fields.Int(required=True)
    name = fields.Str(required=True)
    email = fields.Str(required=True)
    program = fields.Str(required=False, allow_none=True)
    status = fields.Method("serialize_status", required=False, allow_none=True)
    course_id = fields.Int(required=False, allow_none=True)
    enrollment_date = fields.DateTime(required=False, allow_none=True)
    completion_date = fields.DateTime(required=False, allow_none=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)

    def serialize_status(self, obj):
        """Serialize status enum to string value."""
        if obj.status is None:
            return None
        if hasattr(obj.status, "value"):
            return obj.status.value
        return str(obj.status) if obj.status else None

