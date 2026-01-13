"""
User Profile Routes
User profile management and settings
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User
from app.utils.decorators import login_required
from app.services.cloudinary_service import upload_product_image

# Create blueprint
bp = Blueprint('profile', __name__)


# Validation Schemas
class UpdateProfileSchema(Schema):
    """Schema for updating profile"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone_number = fields.Str(validate=validate.Length(min=10, max=20))
    email = fields.Email()


class ChangePasswordSchema(Schema):
    """Schema for changing password"""
    current_password = fields.Str(required=True, validate=validate.Length(min=8))
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm_password = fields.Str(required=True)


class AddAddressSchema(Schema):
    """Schema for adding shipping address"""
    label = fields.Str(required=True, validate=validate.Length(min=2, max=50))  # e.g., "Home", "Office"
    address_line1 = fields.Str(required=True, validate=validate.Length(min=5, max=200))
    address_line2 = fields.Str(validate=validate.Length(max=200))
    city = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    county = fields.Str(validate=validate.Length(max=100))
    postal_code = fields.Str(validate=validate.Length(max=20))
    phone_number = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    is_default = fields.Bool()


update_profile_schema = UpdateProfileSchema()
change_password_schema = ChangePasswordSchema()
add_address_schema = AddAddressSchema()


@bp.route('/profile', methods=['GET'])
@login_required
def get_profile(current_user):
    """
    Get user profile
    
    GET /api/v1/profile
    Headers: Authorization: Bearer <access_token>
    """
    profile_data = {
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'phone_number': current_user.phone_number,
        'role': current_user.role.value,
        'profile_picture': current_user.profile_picture,
        'is_active': current_user.is_active,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    }
    
    # Add role-specific data
    if hasattr(current_user, 'hub_id') and current_user.hub_id:
        profile_data['hub'] = current_user.hub.to_dict() if current_user.hub else None
    
    return jsonify({
        'success': True,
        'data': profile_data
    }), 200


@bp.route('/profile', methods=['PUT'])
@login_required
def update_profile(current_user):
    """
    Update user profile
    
    PUT /api/v1/profile
    Headers: Authorization: Bearer <access_token>
    Body: {
        "name": "John Doe",
        "phone_number": "0712345678",
        "email": "newemail@example.com"
    }
    """
    try:
        data = update_profile_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if email is being changed and if it's already taken
    if 'email' in data and data['email'] != current_user.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMAIL_EXISTS',
                    'message': 'This email is already registered'
                }
            }), 409
    
    # Update fields
    for key, value in data.items():
        setattr(current_user, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update profile'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'phone_number': current_user.phone_number
        },
        'message': 'Profile updated successfully'
    }), 200


@bp.route('/profile/picture', methods=['POST'])
@login_required
def upload_profile_picture(current_user):
    """
    Upload profile picture
    
    POST /api/v1/profile/picture
    Headers: Authorization: Bearer <access_token>
    Content-Type: multipart/form-data
    
    Form Data:
    - picture: Image file
    """
    if 'picture' not in request.files:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_FILE',
                'message': 'No image file provided'
            }
        }), 400
    
    file = request.files['picture']
    
    if not file.filename:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_FILE',
                'message': 'No image file selected'
            }
        }), 400
    
    # Upload to Cloudinary
    upload_result = upload_product_image(file)
    
    if not upload_result:
        return jsonify({
            'success': False,
            'error': {
                'code': 'UPLOAD_ERROR',
                'message': 'Failed to upload image'
            }
        }), 500
    
    # Update user profile picture
    current_user.profile_picture = upload_result['url']
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update profile picture'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': {
            'profile_picture': current_user.profile_picture
        },
        'message': 'Profile picture updated successfully'
    }), 200


@bp.route('/profile/password', methods=['PUT'])
@login_required
def change_password(current_user):
    """
    Change password
    
    PUT /api/v1/profile/password
    Headers: Authorization: Bearer <access_token>
    Body: {
        "current_password": "OldPass123!",
        "new_password": "NewPass123!",
        "confirm_password": "NewPass123!"
    }
    """
    try:
        data = change_password_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Verify current password
    if not check_password_hash(current_user.password_hash, data['current_password']):
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_PASSWORD',
                'message': 'Current password is incorrect'
            }
        }), 401
    
    # Check if new passwords match
    if data['new_password'] != data['confirm_password']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PASSWORD_MISMATCH',
                'message': 'New passwords do not match'
            }
        }), 400
    
    # Check if new password is different from current
    if data['new_password'] == data['current_password']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SAME_PASSWORD',
                'message': 'New password must be different from current password'
            }
        }), 400
    
    # Update password
    current_user.password_hash = generate_password_hash(data['new_password'])
    
    try:
        db.session.commit()
        
        # TODO: Send password changed confirmation email
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to change password'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Password changed successfully'
    }), 200


@bp.route('/profile/addresses', methods=['GET'])
@login_required
def get_addresses(current_user):
    """
    Get user's shipping addresses
    
    GET /api/v1/profile/addresses
    Headers: Authorization: Bearer <access_token>
    """
    # Note: Addresses are stored in user's addresses JSON field
    addresses = current_user.addresses if hasattr(current_user, 'addresses') and current_user.addresses else []
    
    return jsonify({
        'success': True,
        'data': addresses
    }), 200


@bp.route('/profile/addresses', methods=['POST'])
@login_required
def add_address(current_user):
    """
    Add shipping address
    
    POST /api/v1/profile/addresses
    Headers: Authorization: Bearer <access_token>
    Body: {
        "label": "Home",
        "address_line1": "123 Main Street",
        "address_line2": "Apt 4B",
        "city": "Nairobi",
        "county": "Nairobi",
        "postal_code": "00100",
        "phone_number": "0712345678",
        "is_default": true
    }
    """
    try:
        data = add_address_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get existing addresses
    addresses = current_user.addresses if hasattr(current_user, 'addresses') and current_user.addresses else []
    
    # If this is set as default, unset all others
    if data.get('is_default', False):
        for addr in addresses:
            addr['is_default'] = False
    
    # Add new address with ID
    new_address = {
        'id': len(addresses) + 1,
        **data
    }
    
    addresses.append(new_address)
    current_user.addresses = addresses
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to add address'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': new_address,
        'message': 'Address added successfully'
    }), 201


@bp.route('/profile/addresses/<int:address_id>', methods=['PUT'])
@login_required
def update_address(current_user, address_id):
    """
    Update shipping address
    
    PUT /api/v1/profile/addresses/:id
    Headers: Authorization: Bearer <access_token>
    """
    try:
        data = add_address_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get existing addresses
    addresses = current_user.addresses if hasattr(current_user, 'addresses') and current_user.addresses else []
    
    # Find address
    address_found = False
    for addr in addresses:
        if addr['id'] == address_id:
            address_found = True
            
            # If setting as default, unset all others
            if data.get('is_default', False):
                for a in addresses:
                    a['is_default'] = False
            
            # Update fields
            for key, value in data.items():
                addr[key] = value
            break
    
    if not address_found:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ADDRESS_NOT_FOUND',
                'message': 'Address not found'
            }
        }), 404
    
    current_user.addresses = addresses
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update address'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Address updated successfully'
    }), 200


@bp.route('/profile/addresses/<int:address_id>', methods=['DELETE'])
@login_required
def delete_address(current_user, address_id):
    """
    Delete shipping address
    
    DELETE /api/v1/profile/addresses/:id
    Headers: Authorization: Bearer <access_token>
    """
    # Get existing addresses
    addresses = current_user.addresses if hasattr(current_user, 'addresses') and current_user.addresses else []
    
    # Find and remove address
    original_length = len(addresses)
    addresses = [addr for addr in addresses if addr['id'] != address_id]
    
    if len(addresses) == original_length:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ADDRESS_NOT_FOUND',
                'message': 'Address not found'
            }
        }), 404
    
    current_user.addresses = addresses
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to delete address'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Address deleted successfully'
    }), 200