## marshmallow serializer for the 

from apps.v1.api.auth.models.model import Users
from marshmallow import Schema, fields

class UserSerializer(Schema):
    id = fields.Int(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    full_name = fields.Str(required=True)
    is_active = fields.Bool(required=True)
    is_verified = fields.Bool(required=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)