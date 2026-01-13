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
            'business_registration_number': request.form.get('business_registration_number'),
            'tax_identification_number': request.form.get('tax_identification_number'),
            'business_phone': request.form.get('business_phone'),
            'business_email': request.form.get('business_email'),
            'business_address': request.form.get('business_address'),
            'business_city': request.form.get('business_city'),
            'bank_name': request.form.get('bank_name'),
            'bank_account_number': request.form.get('bank_account_number'),
            'bank_account_name': request.form.get('bank_account_name'),
            'years_in_business': int(request.form.get('years_in_business', 0)),
            'product_categories': request.form.getlist('product_categories'),
            'expected_monthly_sales': request.form.get('expected_monthly_sales'),
            'application_notes': request.form.get('application_notes')
        }
        
        # Validate
        validated_data = application_schema.load(data)
    except (ValidationError, ValueError, TypeError) as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages if isinstance(err, ValidationError) else str(err)
            }
        }), 400
    
    # Handle document uploads
    business_license_url = None
    id_document_url = None
    tax_certificate_url = None
    
    if 'business_license' in request.files:
        file = request.files['business_license']
        if file.filename:
            upload_result = upload_product_image(file)
            if upload_result:
                business_license_url = upload_result['url']
    
    if 'id_document' in request.files:
        file = request.files['id_document']
        if file.filename:
            upload_result = upload_product_image(file)
            if upload_result:
                id_document_url = upload_result['url']
    
    if 'tax_certificate' in request.files:
        file = request.files['tax_certificate']
        if file.filename:
            upload_result = upload_product_image(file)
            if upload_result:
                tax_certificate_url = upload_result['url']
    
    # Create application
    application = MerchantApplication(
        user_id=current_user.id,
        business_name=validated_data['business_name'],
        business_type=validated_data['business_type'],
        business_registration_number=validated_data.get('business_registration_number'),
        tax_identification_number=validated_data.get('tax_identification_number'),
        business_phone=validated_data['business_phone'],
        business_email=validated_data['business_email'],
        business_address=validated_data['business_address'],
        business_city=validated_data['business_city'],
        bank_name=validated_data['bank_name'],
        bank_account_number=validated_data['bank_account_number'],
        bank_account_name=validated_data['bank_account_name'],
        years_in_business=validated_data.get('years_in_business'),
        product_categories=validated_data['product_categories'],
        expected_monthly_sales=validated_data.get('expected_monthly_sales'),
        application_notes=validated_data.get('application_notes'),
        business_license_url=business_license_url,
        id_document_url=id_document_url,
        tax_certificate_url=tax_certificate_url,
        status=ApplicationStatus.PENDING
    )
    
    try:
        db.session.add(application)
        db.session.commit()
        
        # TODO: Send notification to admin
        # - Email admin: "New merchant application received"
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to submit application'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': application.to_dict(),
        'message': 'Application submitted successfully. We will review it within 3-5 business days.'
    }), 201


@bp.route('/my', methods=['GET'])
@login_required
def get_my_application(current_user):
    """
    Get user's latest application
    
    GET /api/v1/merchant-applications/my
    Headers: Authorization: Bearer <access_token>
    """
    application = MerchantApplication.find_by_user(current_user.id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_APPLICATION',
                'message': 'You have not submitted an application'
            }
        }), 404
    
    return jsonify({
        'success': True,
        'data': application.to_dict()
    }), 200


@bp.route('/my', methods=['PUT'])
@login_required
def update_my_application(current_user):
    """
    Update application (only if rejected or pending)
    
    PUT /api/v1/merchant-applications/my
    Headers: Authorization: Bearer <access_token>
    """
    application = MerchantApplication.find_by_user(current_user.id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_APPLICATION',
                'message': 'You have not submitted an application'
            }
        }), 404
    
    # Can only update if pending or rejected
    if application.status not in [ApplicationStatus.PENDING, ApplicationStatus.REJECTED]:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CANNOT_UPDATE',
                'message': f'Cannot update application with status: {application.status.value}'
            }
        }), 400
    
    try:
        data = application_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Update fields
    for key, value in data.items():
        setattr(application, key, value)
    
    # Reset status to pending if was rejected
    if application.status == ApplicationStatus.REJECTED:
        application.status = ApplicationStatus.PENDING
        application.rejection_reason = None
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update application'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': application.to_dict(),
        'message': 'Application updated successfully'
    }), 200
