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

@bp.route('', methods=['POST'])
@login_required
def submit_application(current_user):
    """
    Submit merchant application
    
    POST /api/v1/merchant-applications
    Headers: Authorization: Bearer <access_token>
    Content-Type: multipart/form-data
    
    Form Data:
    - business_name, business_type, etc (all fields)
    - business_license: File (optional)
    - id_document: File (optional)
    - tax_certificate: File (optional)
    """
    # Check if user is already a merchant
    if current_user.role == UserRole.MERCHANT:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ALREADY_MERCHANT',
                'message': 'You are already a merchant'
            }
        }), 400
    
    # Check if user has a pending application
    existing_app = MerchantApplication.find_by_user(current_user.id)
    if existing_app and existing_app.status in [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW]:
        return jsonify({
            'success': False,
            'error': {
                'code': 'APPLICATION_EXISTS',
                'message': 'You already have a pending application'
            }
        }), 400
    
    try:
        # Get form data
        data = {
            'business_name': request.form.get('business_name'),
            'business_type': request.form.get('business_type'),
            'business_registration_number':