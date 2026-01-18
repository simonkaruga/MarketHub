"""
Authentication Routes
Handles user registration, login, logout, password reset, OTP verification, and OAuth
"""
from flask import Blueprint, request, jsonify, current_app
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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app import db, limiter
from app.models.user import User, UserRole
from app.models.schemas import (
    UserRegistrationSchema,
    UserLoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    UserResponseSchema
)
from app.services.otp_service import OTPService

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
        role=UserRole.CUSTOMER,  # Always start as customer
        email_verified=False  # Email not verified yet
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

    # Generate and send OTP
    try:
        otp = OTPService.create_verification_token(user)
        OTPService.send_verification_email(user, otp)
    except Exception as e:
        current_app.logger.error(f"Failed to send OTP email: {str(e)}")
        # Continue even if email fails - user can request resend

    # Generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'success': True,
        'data': {
            'user': user_response_schema.dump(user),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'requires_verification': True
        },
        'message': 'User registered successfully. Please check your email for verification code.'
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
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
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

            # For security, never log reset tokens - this is for development only
            # In production, always use proper email service
            if current_app.debug:
                current_app.logger.info(f"Password reset requested for {user.email}")
            else:
                # TODO: Implement email service
                pass
            
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


@bp.route('/verify-email', methods=['POST'])
@jwt_required()
@limiter.limit("10 per hour")
def verify_email():
    """
    Verify email with OTP code

    POST /api/v1/auth/verify-email
    Headers: Authorization: Bearer <access_token>
    Body: {
        "otp": "123456"
    }
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

    # Get OTP from request
    otp = request.json.get('otp')
    if not otp:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'OTP code is required'
            }
        }), 400

    # Verify OTP
    success, message = OTPService.verify_otp(user, otp)

    if not success:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_OTP',
                'message': message
            }
        }), 400

    return jsonify({
        'success': True,
        'data': {
            'user': user_response_schema.dump(user)
        },
        'message': message
    }), 200


@bp.route('/resend-verification', methods=['POST'])
@jwt_required()
@limiter.limit("3 per hour")
def resend_verification():
    """
    Resend verification email

    POST /api/v1/auth/resend-verification
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

    success, message = OTPService.resend_verification_code(user)

    if not success:
        return jsonify({
            'success': False,
            'error': {
                'code': 'RESEND_FAILED',
                'message': message
            }
        }), 400

    return jsonify({
        'success': True,
        'message': message
    }), 200


@bp.route('/google', methods=['POST'])
@limiter.limit("10 per minute")
def google_auth():
    """
    Google OAuth authentication

    POST /api/v1/auth/google
    Body: {
        "token": "google_id_token"
    }
    """
    token = request.json.get('token')
    if not token:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Google token is required'
            }
        }), 400

    try:
        # Verify Google token
        google_client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        if not google_client_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CONFIG_ERROR',
                    'message': 'Google OAuth not configured'
                }
            }), 500

        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            google_client_id
        )

        # Get user info from Google
        email = idinfo.get('email')
        name = idinfo.get('name')
        google_id = idinfo.get('sub')
        picture = idinfo.get('picture')
        email_verified = idinfo.get('email_verified', False)

        if not email:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_TOKEN',
                    'message': 'Invalid Google token'
                }
            }), 400

        # Check if user exists
        user = User.find_by_email(email.lower())

        if user:
            # User exists - update OAuth info if not set
            if not user.oauth_provider:
                user.oauth_provider = 'google'
                user.oauth_provider_id = google_id
                user.profile_picture = picture
                if email_verified:
                    user.email_verified = True
                db.session.commit()
        else:
            # Create new user
            user = User(
                email=email.lower(),
                name=name,
                role=UserRole.CUSTOMER,
                oauth_provider='google',
                oauth_provider_id=google_id,
                profile_picture=picture,
                email_verified=email_verified,
                is_active=True
            )
            # No password for OAuth users
            db.session.add(user)
            db.session.commit()

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

    except ValueError as e:
        # Invalid token
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_TOKEN',
                'message': 'Invalid Google token'
            }
        }), 400
    except Exception as e:
        current_app.logger.error(f"Google OAuth error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'OAUTH_ERROR',
                'message': 'Failed to authenticate with Google'
            }
        }), 500
