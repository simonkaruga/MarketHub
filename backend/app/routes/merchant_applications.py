"""
Merchant Applications Routes
User merchant application submission
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.merchant_application import MerchantApplication, ApplicationStatus
from app.models.user import UserRole
from app.utils.decorators import login_required
from app.services.cloudinary_service import upload_product_image

# Create blueprint
bp = Blueprint('merchant_applications', __name__)


# Validation Schema
class MerchantApplicationSchema(Schema):
    """Schema for merchant application"""
    business_name = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    business_type = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    business_registration_number = fields.Str(validate=validate.Length(max=100))
    tax_identification_number = fields.Str(validate=validate.Length(max=100))
    business_phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    business_email = fields.Email(required=True)
    business_address = fields.Str(required=True, validate=validate.Length(min=10, max=500))
    business_city = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    bank_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    bank_account_number = fields.Str(required=True, validate=validate.Length(min=5, max=50))
    bank_account_name = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    years_in_business = fields.Int(validate=validate.Range(min=0))
    product_categories = fields.List(fields.Str(), required=True)
    expected_monthly_sales = fields.Str(validate=validate.Length(max=50))
    application_notes = fields.Str(validate=validate.Length(max=1000))


application_schema = MerchantApplicationSchema()