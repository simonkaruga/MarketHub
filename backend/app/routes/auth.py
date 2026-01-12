"""
Authentication Routes
Handles user registration, login, logout, password reset
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from marshmallow import ValidationError
from datetime import datetime, timedelta
import secrets

from app import db, limiter
from app.models.user import User, UserRole
from app.models.schemas import (
    UserRegistrationSchema,
    UserLoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    UserResponseSchema
)

# Create blueprint
bp = Blueprint('auth', __name__)

# Initialize schemas
user_registration_schema = UserRegistrationSchema()
user_login_schema = UserLoginSchema()
forgot_password_schema = ForgotPasswordSchema()
reset_password_schema = ResetPasswordSchema()
user_response_schema = UserResponseSchema()


@bp.route('/register', methods=['POST'])
@limiter.limit("5 per hour")  # Prevent spam registrations
def register():
    """
    Register a new user
    
    POST /api/v1/auth/register
    Body: {
        "email": "user@example.com",
        "password": "SecurePass123",
        "name": "John Doe",
        "phone_number": "0712345678",
        "role": "customer" or "merchant_applicant"
    }
    """
    try:
        # Validate request data
        data = user_registration_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if user already exists
    if User.find_by_email(data['email']):
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_EXISTS',
                'message': 'A user with this email already exists'
            }
        }), 409
    
    # Create new user
    user = User(
        email=data['email'].lower(),
        name=data['name'],
        phone_number=data.get('phone_number'),
        role=UserRole.CUSTOMER  # Always start as customer
    )
    user.set_password(data['password'])
    
    # Save to database
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create user'
            }
        }), 500
    
    # Generate JWT tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'data': {
            'user': user_response_schema.dump(user),
            'access_token': access_token,
            'refresh_token': refresh_token
        },
        'message': 'User registered successfully'
    }), 201


@bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")  # Prevent brute force attacks
def login():
    """
    User login
    
    POST /api/v1/auth/login
    Body: {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    """
    try:
        # Validate request data
        data = user_login_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Find user by email
    user = User.find_by_email(data['email'].lower())
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_CREDENTIALS',
                'message': 'Invalid email or password'
            }
        }), 401
    
    # Check if user is active
    if not user.is_active:
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_INACTIVE',
                'message': 'Your account has been deactivated'
            }
        }), 403
    
    # Generate JWT tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'data': {
            'user': user_response_schema.dump(user),
            'access_token': access_token,
            'refresh_token': refresh_token
        },
        'message': 'Login successful'
    }), 200


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token
    
    POST /api/v1/auth/refresh
    Headers: Authorization: Bearer <refresh_token>
    """
    current_user_id = get_jwt_identity()
    
    # Generate new access token
    new_access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'success': True,
        'data': {
            'access_token': new_access_token
        }
    }), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_route():
    """
    Get current user profile
    
    GET /api/v1/auth/me
    Headers: Authorization: Bearer <access_token>
    """
    current_user_id = get_jwt_identity()
    user = User.find_by_id(current_user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_NOT_FOUND',
                'message': 'User not found'
            }
        }), 404
    
    return jsonify({
        'success': True,
        'data': user_response_schema.dump(user)
    }), 200


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (client should discard tokens)
    
    POST /api/v1/auth/logout
    Headers: Authorization: Bearer <access_token>
    """
    # In a full implementation, you would add the token to a blocklist
    # For now, we'll just return success and let the client handle it
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@bp.route('/forgot-password', methods=['POST'])
@limiter.limit("3 per hour")  # Prevent abuse
def forgot_password():
    """
    Request password reset
    
    POST /api/v1/auth/forgot-password
    Body: {
        "email": "user@example.com"
    }
    """
    try:
        data = forgot_password_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    user = User.find_by_email(data['email'].lower())
    
    # Always return success even if user doesn't exist (security best practice)
    # This prevents email enumeration attacks
    if user:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
        
        try:
            db.session.commit()
            
            # TODO: Send email with reset link
            # from app.services.email_service import send_password_reset_email
            # send_password_reset_email(user.email, reset_token)
            
            # For now, we'll just log the token (REMOVE IN PRODUCTION!)
            print(f"Password reset token for {user.email}: {reset_token}")
            
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMAIL_ERROR',
                    'message': 'Failed to send reset email'
                }
            }), 500
    
    return jsonify({
        'success': True,
        'message': 'If an account with that email exists, a password reset link has been sent'
    }), 200


@bp.route('/reset-password', methods=['POST'])
@limiter.limit("5 per hour")
def reset_password():
    """
    Reset password with token
    
    POST /api/v1/auth/reset-password
    Body: {
        "token": "reset_token_here",
        "new_password": "NewSecurePass123"
    }
    """
    try:
        data = reset_password_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Find user by reset token
    user = User.query.filter_by(reset_token=data['token']).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_TOKEN',
                'message': 'Invalid or expired reset token'
            }
        }), 400
    
    # Update password
    user.set_password(data['new_password'])
    user.reset_token = None
    user.reset_token_expires = None
    
    try:
        db.session.commit()
        
        # TODO: Send confirmation email
        # from app.services.email_service import send_password_changed_email
        # send_password_changed_email(user.email)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to reset password'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Password reset successfully'
    }), 200