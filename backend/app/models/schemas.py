"""
User Schemas for validation and serialization
"""
from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.user import UserRole


class UserRegistrationSchema(Schema):
    """Schema for user registration"""
    email = fields.Email(required=True, validate=validate.Length(max=120))
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        load_only=True  # Don't include in serialization
    )
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    phone_number = fields.Str(validate=validate.Length(max=20))
    role = fields.Str(
        validate=validate.OneOf(['customer', 'merchant_applicant']),
        missing='customer'  # Default to customer
    )
    
    @validates('email')
    def validate_email(self, value):
        """Ensure email is lowercase"""
        return value.lower()


class UserLoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class UserUpdateSchema(Schema):
    """Schema for updating user profile"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone_number = fields.Str(validate=validate.Length(max=20))


class PasswordChangeSchema(Schema):
    """Schema for changing password"""
    old_password = fields.Str(required=True, load_only=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        load_only=True
    )


class ForgotPasswordSchema(Schema):
    """Schema for forgot password request"""
    email = fields.Email(required=True)


class ResetPasswordSchema(Schema):
    """Schema for password reset with token"""
    token = fields.Str(required=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        load_only=True
    )


class UserResponseSchema(Schema):
    """Schema for user data in responses"""
    id = fields.Int()
    email = fields.Email()
    name = fields.Str()
    phone_number = fields.Str()
    role = fields.Str()
    is_active = fields.Bool()
    hub_id = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()