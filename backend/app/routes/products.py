"""
Products Routes
Public endpoints for browsing products
"""
from flask import Blueprint, request, jsonify
from app.models.product import Product

# Create blueprint
bp = Blueprint('products', __name__)


@bp.route('', methods=['GET'])
def get_products():
    """
    Get products with search, filtering, and pagination
    
    GET /api/v1/products?query=laptop&category=1&min_price=1000&max_price=50000&page=1
    
    Query Parameters:
    - query: Search term (searches name and description)
    - category: Category ID filter
    - min_price: Minimum price
    - max_price: Maximum price
    - in_stock: Only show in-stock products (default: true)
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 50)
    """
    # Get query parameters
    query = request.args.get('query', '').strip()
    category_id = request.args.get('category', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    in_stock_only = request.args.get('in_stock', 'true').lower() == 'true'
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', type=int)
    per_page = min(request.args.get('per_page', limit or 20, type=int), 50)  # Max 50 per page
    
    # Search products
    pagination = Product.search_products(
        query=query if query else None,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only,
        page=page,
        per_page=per_page
    )
    
    return jsonify({
        'success': True,
        'data': {
            'products': [product.to_dict() for product in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_pages': pagination.pages,
                'total_items': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200


@bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """
    Get single product details
    
    GET /api/v1/products/:id
    """
    product = Product.find_by_id(product_id)
    
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    if not product.is_active:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_INACTIVE',
                'message': 'Product is not available'
            }
        }), 404
    
    return jsonify({
        'success': True,
        'data': product.to_dict()
    }), 200
