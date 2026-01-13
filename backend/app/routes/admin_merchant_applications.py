"""
Admin Merchant Applications Routes
Admin review and approval of merchant applications
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
from app import db
from app.models.merchant_application import MerchantApplication, ApplicationStatus
from app.models.user import User, UserRole
from app.utils.decorators import admin_required

# Create blueprint
bp = Blueprint('admin_merchant_applications', __name__)


# Validation Schemas
class ReviewApplicationSchema(Schema):
    """Schema for reviewing application"""
    admin_notes = fields.Str(validate=validate.Length(max=1000))


class RejectApplicationSchema(Schema):
    """Schema for rejecting application"""
    rejection_reason = fields.Str(required=True, validate=validate.Length(min=20, max=1000))
    admin_notes = fields.Str(validate=validate.Length(max=1000))


review_schema = ReviewApplicationSchema()
reject_schema = RejectApplicationSchema()


@bp.route('/admin/merchant-applications', methods=['GET'])
@admin_required
def get_all_applications(current_user):
    """
    Get all merchant applications
    
    GET /api/v1/admin/merchant-applications?status=pending
    Headers: Authorization: Bearer <admin_token>
    
    Query Parameters:
    - status: Filter by status (pending, under_review, approved, rejected)
    """
    # Base query
    query = MerchantApplication.query
    
    # Filter by status if provided
    status_filter = request.args.get('status')
    if status_filter:
        try:
            status = ApplicationStatus(status_filter)
            query = query.filter_by(status=status)
        except ValueError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'Invalid status: {status_filter}'
                }
            }), 400
    
    # Order by created_at descending
    applications = query.order_by(MerchantApplication.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [app.to_dict(include_sensitive=True) for app in applications]
    }), 200


@bp.route('/admin/merchant-applications/<int:application_id>', methods=['GET'])
@admin_required
def get_application(current_user, application_id):
    """
    Get application details
    
    GET /api/v1/admin/merchant-applications/:id
    Headers: Authorization: Bearer <admin_token>
    """
    application = MerchantApplication.find_by_id(application_id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'APPLICATION_NOT_FOUND',
                'message': 'Application not found'
            }
        }), 404
    
    return jsonify({
        'success': True,
        'data': application.to_dict(include_sensitive=True)
    }), 200


@bp.route('/admin/merchant-applications/<int:application_id>/approve', methods=['POST'])
@admin_required
def approve_application(current_user, application_id):
    """
    Approve merchant application
    
    POST /api/v1/admin/merchant-applications/:id/approve
    Headers: Authorization: Bearer <admin_token>
    Body: {
        "admin_notes": "Application approved. All documents verified." (optional)
    }
    """
    application = MerchantApplication.find_by_id(application_id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'APPLICATION_NOT_FOUND',
                'message': 'Application not found'
            }
        }), 404
    
    # Check if already approved or rejected
    if application.status == ApplicationStatus.APPROVED:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ALREADY_APPROVED',
                'message': 'Application is already approved'
            }
        }), 400
    
    try:
        data = review_schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Update application status
    application.status = ApplicationStatus.APPROVED
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()
    application.admin_notes = data.get('admin_notes')
    application.rejection_reason = None
    
    # Update user role to merchant
    user = User.find_by_id(application.user_id)
    if user:
        user.role = UserRole.MERCHANT
    
    try:
        db.session.commit()
        
        # TODO: Send notification to user
        # - Email user: "Congratulations! Your merchant application has been approved"
        # - Include next steps (set up shop, upload products)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to approve application'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': application.to_dict(include_sensitive=True),
        'message': f'Application approved. {user.name if user else "User"} is now a merchant.'
    }), 200


@bp.route('/admin/merchant-applications/<int:application_id>/reject', methods=['POST'])
@admin_required
def reject_application(current_user, application_id):
    """
    Reject merchant application
    
    POST /api/v1/admin/merchant-applications/:id/reject
    Headers: Authorization: Bearer <admin_token>
    Body: {
        "rejection_reason": "Business license document is not clear. Please re-upload.",
        "admin_notes": "Need clearer documents" (optional)
    }
    """
    application = MerchantApplication.find_by_id(application_id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'APPLICATION_NOT_FOUND',
                'message': 'Application not found'
            }
        }), 404
    
    # Check if already approved
    if application.status == ApplicationStatus.APPROVED:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ALREADY_APPROVED',
                'message': 'Cannot reject an approved application'
            }
        }), 400
    
    try:
        data = reject_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Update application status
    application.status = ApplicationStatus.REJECTED
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()
    application.rejection_reason = data['rejection_reason']
    application.admin_notes = data.get('admin_notes')
    
    try:
        db.session.commit()
        
        # TODO: Send notification to user
        # - Email user: "Your merchant application needs revision"
        # - Include rejection reason
        # - Explain they can reapply
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to reject application'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': application.to_dict(include_sensitive=True),
        'message': 'Application rejected. User has been notified.'
    }), 200


@bp.route('/admin/merchant-applications/<int:application_id>/review', methods=['PATCH'])
@admin_required
def mark_under_review(current_user, application_id):
    """
    Mark application as under review
    
    PATCH /api/v1/admin/merchant-applications/:id/review
    Headers: Authorization: Bearer <admin_token>
    """
    application = MerchantApplication.find_by_id(application_id)
    
    if not application:
        return jsonify({
            'success': False,
            'error': {
                'code': 'APPLICATION_NOT_FOUND',
                'message': 'Application not found'
            }
        }), 404
    
    # Can only mark pending applications
    if application.status != ApplicationStatus.PENDING:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f'Cannot mark {application.status.value} application as under review'
            }
        }), 400
    
    # Update status
    application.status = ApplicationStatus.UNDER_REVIEW
    
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
        'data': application.to_dict(include_sensitive=True),
        'message': 'Application marked as under review'
    }), 200