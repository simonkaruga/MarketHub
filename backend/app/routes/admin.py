"""
Admin Routes
Admin-only endpoints for managing categories and platform
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.category import Category
from app.models.user import User, UserRole
from app.utils.decorators import admin_required

# Create blueprint
bp = Blueprint('admin', __name__)


# Validation Schemas
class CategorySchema(Schema):
    """Schema for category"""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(validate=validate.Length(max=500))


class UserUpdateSchema(Schema):
    """Schema for updating user"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone_number = fields.Str(validate=validate.Length(max=20))
    role = fields.Str(validate=validate.OneOf([role.value for role in UserRole]))
    is_active = fields.Bool()
    email_verified = fields.Bool()


category_schema = CategorySchema()
user_update_schema = UserUpdateSchema()


@bp.route('/categories', methods=['POST'])
@admin_required
def create_category(current_user):
    """
    Create a new category
    
    POST /api/v1/admin/categories
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Electronics",
        "description": "Electronic devices and accessories"
    }
    """
    try:
        data = category_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if category already exists
    if Category.find_by_name(data['name']):
        return jsonify({
            'success': False,
            'error': {
                'code': 'CATEGORY_EXISTS',
                'message': 'Category with this name already exists'
            }
        }), 409
    
    # Create category
    category = Category(
        name=data['name'],
        description=data.get('description')
    )
    
    try:
        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create category'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': category.to_dict(),
        'message': 'Category created successfully'
    }), 201


@bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(current_user, category_id):
    """
    Update a category
    
    PUT /api/v1/admin/categories/:id
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Electronics & Gadgets",
        "description": "Updated description"
    }
    """
    category = Category.find_by_id(category_id)
    
    if not category:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CATEGORY_NOT_FOUND',
                'message': 'Category not found'
            }
        }), 404
    
    try:
        data = category_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if new name conflicts with existing category
    if 'name' in data:
        existing = Category.find_by_name(data['name'])
        if existing and existing.id != category_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CATEGORY_EXISTS',
                    'message': 'Category with this name already exists'
                }
            }), 409
    
    # Update category
    for key, value in data.items():
        setattr(category, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update category'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': category.to_dict(),
        'message': 'Category updated successfully'
    }), 200


@bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(current_user, category_id):
    """
    Delete a category (only if no products assigned)
    
    DELETE /api/v1/admin/categories/:id
    Headers: Authorization: Bearer <admin_access_token>
    """
    category = Category.find_by_id(category_id)
    
    if not category:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CATEGORY_NOT_FOUND',
                'message': 'Category not found'
            }
        }), 404
    
    # Check if category has products
    if category.products.count() > 0:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CATEGORY_HAS_PRODUCTS',
                'message': f'Cannot delete category. {category.products.count()} product(s) are assigned to this category.'
            }
        }), 400
    
    try:
        db.session.delete(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to delete category'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Category deleted successfully'
    }), 200


# User Management Routes
@bp.route('/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """
    Get all users with pagination and filtering

    GET /api/v1/admin/users?page=1&limit=20&role=customer&search=john
    Headers: Authorization: Bearer <admin_access_token>

    Query Parameters:
    - page: Page number (default: 1)
    - limit: Items per page (default: 20)
    - role: Filter by role (optional)
    - search: Search by name or email (optional)
    - active: Filter by active status (true/false, optional)
    """
    # Parse query parameters
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    role_filter = request.args.get('role')
    search = request.args.get('search')
    active_filter = request.args.get('active')

    # Base query
    query = User.query

    # Apply filters
    if role_filter:
        try:
            role = UserRole(role_filter)
            query = query.filter_by(role=role)
        except ValueError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_ROLE',
                    'message': f'Invalid role: {role_filter}'
                }
            }), 400

    if active_filter is not None:
        is_active = active_filter.lower() == 'true'
        query = query.filter_by(is_active=is_active)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    # Get total count for pagination
    total_users = query.count()

    # Apply pagination
    users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'success': True,
        'data': {
            'users': [user.to_dict() for user in users],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_users,
                'pages': (total_users + limit - 1) // limit
            }
        }
    }), 200


@bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """
    Get single user details

    GET /api/v1/admin/users/:id
    Headers: Authorization: Bearer <admin_access_token>
    """
    user = User.find_by_id(user_id)

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
        'data': user.to_dict()
    }), 200


@bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    """
    Update user details

    PUT /api/v1/admin/users/:id
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Updated Name",
        "phone_number": "+254700000001",
        "role": "merchant",
        "is_active": true,
        "email_verified": true
    }
    """
    user = User.find_by_id(user_id)

    if not user:
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_NOT_FOUND',
                'message': 'User not found'
            }
        }), 404

    try:
        data = user_update_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400

    # Prevent admin from deactivating themselves
    if user_id == current_user.id and 'is_active' in data and not data['is_active']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SELF_DEACTIVATION',
                'message': 'You cannot deactivate your own account'
            }
        }), 400

    # Update user fields
    for key, value in data.items():
        if key == 'role':
            # Convert string to enum
            try:
                user.role = UserRole(value)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INVALID_ROLE',
                        'message': f'Invalid role: {value}'
                    }
                }), 400
        else:
            setattr(user, key, value)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update user'
            }
        }), 500

    return jsonify({
        'success': True,
        'data': user.to_dict(),
        'message': 'User updated successfully'
    }), 200


@bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(current_user, user_id):
    """
    Reset user password (admin forced reset)

    POST /api/v1/admin/users/:id/reset-password
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "new_password": "NewSecurePass123"
    }
    """
    user = User.find_by_id(user_id)

    if not user:
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_NOT_FOUND',
                'message': 'User not found'
            }
        }), 404

    # Get new password from request
    new_password = request.json.get('new_password')
    if not new_password or len(new_password) < 8:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_PASSWORD',
                'message': 'Password must be at least 8 characters long'
            }
        }), 400

    # Set new password
    user.set_password(new_password)

    try:
        db.session.commit()
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
        'message': f'Password reset successfully for user: {user.email}'
    }), 200


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """
    Permanently delete user from database

    DELETE /api/v1/admin/users/:id
    Headers: Authorization: Bearer <admin_access_token>
    Query Parameters:
    - hard_delete: Set to 'true' for permanent deletion, 'false' for soft delete (default: false)
    """
    hard_delete = request.args.get('hard_delete', 'false').lower() == 'true'

    user = User.find_by_id(user_id)

    if not user:
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_NOT_FOUND',
                'message': 'User not found'
            }
        }), 404

    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SELF_DELETION',
                'message': 'You cannot delete your own account'
            }
        }), 400

    if hard_delete:
        # Hard delete - permanently remove from database
        # Check for related data that would prevent deletion
        from app.models.order import MasterOrder, SubOrder
        from app.models.product import Product
        from app.models.review import Review
        from app.models.cart import Cart
        from app.models.merchant_application import MerchantApplication
        from app.models.refund import Refund

        related_orders = MasterOrder.query.filter_by(customer_id=user_id).count()
        related_products = Product.query.filter_by(merchant_id=user_id).count()
        related_reviews = Review.query.filter_by(customer_id=user_id).count()
        related_carts = Cart.query.filter_by(user_id=user_id).count()
        related_applications = MerchantApplication.query.filter_by(user_id=user_id).count()
        related_refunds = Refund.query.filter_by(customer_id=user_id).count()
        related_suborders = SubOrder.query.filter_by(merchant_id=user_id).count()

        total_related = related_orders + related_products + related_reviews + related_carts + related_applications + related_refunds + related_suborders

        if total_related > 0:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_HAS_RELATED_DATA',
                    'message': f'Cannot permanently delete user. They have {total_related} related records (orders: {related_orders}, products: {related_products}, reviews: {related_reviews}, cart: {related_carts}, applications: {related_applications}, refunds: {related_refunds}, suborders: {related_suborders}). Deactivate instead.'
                }
            }), 400

        try:
            db.session.delete(user)
            db.session.commit()
            message = f'User {user.email} has been permanently deleted from the database'
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'Failed to delete user'
                }
            }), 500
    else:
        # Soft delete by deactivating
        user.is_active = False

        try:
            db.session.commit()
            message = f'User {user.email} has been deactivated'
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'Failed to deactivate user'
                }
            }), 500

    return jsonify({
        'success': True,
        'message': message,
        'hard_delete': hard_delete
    }), 200
