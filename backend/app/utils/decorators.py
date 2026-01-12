"""
Decorators for route protection and role-based access control
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User, UserRole


def role_required(*allowed_roles):
    """
    Decorator to require specific user roles
    
    Args:
        *allowed_roles: Variable number of UserRole enum values
        
    Usage:
        @role_required(UserRole.ADMIN)
        @role_required(UserRole.MERCHANT, UserRole.ADMIN)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Verify JWT token exists
            verify_jwt_in_request()
            
            # Get current user ID from JWT
            current_user_id = get_jwt_identity()
            
            # Fetch user from database
            user = User.find_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'USER_NOT_FOUND',
                        'message': 'User not found'
                    }
                }), 404
            
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'USER_INACTIVE',
                        'message': 'Your account has been deactivated'
                    }
                }), 403
            
            # Check if user has one of the allowed roles
            if user.role not in allowed_roles:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INSUFFICIENT_PERMISSIONS',
                        'message': 'You do not have permission to access this resource'
                    }
                }), 403
            
            # Pass user to the route function
            return fn(current_user=user, *args, **kwargs)
        
        return wrapper
    return decorator


def admin_required(fn):
    """
    Decorator to require admin role
    
    Usage:
        @admin_required
        def admin_only_route(current_user):
            ...
    """
    return role_required(UserRole.ADMIN)(fn)


def merchant_required(fn):
    """
    Decorator to require merchant role
    
    Usage:
        @merchant_required
        def merchant_only_route(current_user):
            ...
    """
    return role_required(UserRole.MERCHANT)(fn)


def customer_required(fn):
    """
    Decorator to require customer role
    
    Usage:
        @customer_required
        def customer_only_route(current_user):
            ...
    """
    return role_required(UserRole.CUSTOMER)(fn)


def hub_staff_required(fn):
    """
    Decorator to require hub staff role
    
    Usage:
        @hub_staff_required
        def hub_staff_only_route(current_user):
            ...
    """
    return role_required(UserRole.HUB_STAFF)(fn)


def get_current_user():
    """
    Helper function to get current authenticated user
    
    Returns:
        User: Current user object or None
    """
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.find_by_id(user_id)
    except:
        return None