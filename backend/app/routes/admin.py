"""
Admin Routes
Admin-only endpoints for managing categories and platform
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.category import Category
from app.utils.decorators import admin_required

# Create blueprint
bp = Blueprint('admin', __name__)


# Validation Schemas
class CategorySchema(Schema):
    """Schema for category"""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(validate=validate.Length(max=500))


category_schema = CategorySchema()


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