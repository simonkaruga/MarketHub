"""
Categories Routes
Public endpoints for browsing categories
"""
from flask import Blueprint, jsonify
from app.models.category import Category

# Create blueprint
bp = Blueprint('categories', __name__)


@bp.route('', methods=['GET'])
def get_categories():
    """
    Get all categories
    
    GET /api/v1/categories
    """
    categories = Category.get_all()
    
    return jsonify({
        'success': True,
        'data': [cat.to_dict() for cat in categories]
    }), 200


@bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """
    Get single category
    
    GET /api/v1/categories/:id
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
    
    return jsonify({
        'success': True,
        'data': category.to_dict()
    }), 200