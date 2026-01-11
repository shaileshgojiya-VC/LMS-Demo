"""
Marshmallow serializer for user module.
"""

from apps.v1.api.auth.models.model import Users
from marshmallow import Schema, fields


class UserSerializer(Schema):
    """Serializer for User model."""

    id = fields.Int(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)  # Only for loading, not dumping
    full_name = fields.Str(required=True)
    is_active = fields.Bool(required=True)
    is_verified = fields.Bool(required=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)