"""
Marshmallow serializer for course module.
"""

from apps.v1.api.course.models.model import Course
from marshmallow import Schema, fields, post_dump


class CourseSerializer(Schema):
    """Serializer for Course model."""

    id = fields.Int(required=True)
    name = fields.Str(required=True)
    description = fields.Str(required=False, allow_none=True)
    instructor = fields.Str(required=False, allow_none=True)
    students = fields.Int(required=False, allow_none=True)
    duration = fields.Int(required=False, allow_none=True)
    modules = fields.Int(required=False, allow_none=True)
    status = fields.Method("serialize_status", required=False, allow_none=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)

    def serialize_status(self, obj):
        """Serialize status enum to string value."""
        if obj.status is None:
            return None
        if hasattr(obj.status, "value"):
            return obj.status.value
        return str(obj.status) if obj.status else None

