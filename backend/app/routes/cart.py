"""
Cart Routes
Shopping cart management endpoints
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.utils.decorators import customer_required, role_required
from app.models.user import UserRole

# Create blueprint
bp = Blueprint('cart', __name__)


# Validation Schemas
class AddToCartSchema(Schema):
    """Schema for adding item to cart"""
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=100))


class UpdateCartItemSchema(Schema):
    """Schema for updating cart item quantity"""
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=100))


# Initialize schemas
add_to_cart_schema = AddToCartSchema()
update_cart_item_schema = UpdateCartItemSchema()


@bp.route('', methods=['GET'])
@role_required(UserRole.CUSTOMER)
def get_cart(current_user):
    """
    Get user's shopping cart
    
    GET /api/v1/cart
    Headers: Authorization: Bearer <access_token>
    """
    # Get or create cart
    cart = Cart.get_or_create_cart(current_user.id)
    
    return jsonify({
        'success': True,
        'data': cart.to_dict()
    }), 200


@bp.route('/items', methods=['POST'])
@role_required(UserRole.CUSTOMER)
def add_to_cart(current_user):
    """
    Add item to cart
    
    POST /api/v1/cart/items
    Headers: Authorization: Bearer <access_token>
    Body: {
        "product_id": 1,
        "quantity": 2
    }
    """
    try:
        # Validate request data
        data = add_to_cart_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get product
    product = Product.find_by_id(data['product_id'])
    
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    # Check if product is active
    if not product.is_active:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_INACTIVE',
                'message': 'This product is not available'
            }
        }), 400
    
    # Check stock availability
    if product.stock_quantity < data['quantity']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INSUFFICIENT_STOCK',
                'message': f'Only {product.stock_quantity} unit(s) available in stock'
            }
        }), 400
    
    # Get or create cart
    cart = Cart.get_or_create_cart(current_user.id)
    
    # Check if product already in cart
    existing_item = CartItem.find_in_cart(cart.id, product.id)
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + data['quantity']
        
        # Check if new quantity exceeds stock
        if new_quantity > product.stock_quantity:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INSUFFICIENT_STOCK',
                    'message': f'Cannot add {data["quantity"]} more. Only {product.stock_quantity - existing_item.quantity} more available.'
                }
            }), 400
        
        existing_item.quantity = new_quantity
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'Failed to update cart'
                }
            }), 500
        
        return jsonify({
            'success': True,
            'data': cart.to_dict(),
            'message': 'Cart updated successfully'
        }), 200
    
    else:
        # Add new item to cart
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=data['quantity']
        )
        
        try:
            db.session.add(cart_item)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'Failed to add item to cart'
                }
            }), 500
        
        return jsonify({
            'success': True,
            'data': cart.to_dict(),
            'message': 'Item added to cart successfully'
        }), 201


@bp.route('/items/<int:cart_item_id>', methods=['PUT'])
@role_required(UserRole.CUSTOMER)
def update_cart_item(current_user, cart_item_id):
    """
    Update cart item quantity
    
    PUT /api/v1/cart/items/:id
    Headers: Authorization: Bearer <access_token>
    Body: {
        "quantity": 3
    }
    """
    try:
        # Validate request data
        data = update_cart_item_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get cart item
    cart_item = CartItem.find_by_id(cart_item_id)
    
    if not cart_item:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CART_ITEM_NOT_FOUND',
                'message': 'Cart item not found'
            }
        }), 404
    
    # Verify cart belongs to current user
    if cart_item.cart.user_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only modify your own cart'
            }
        }), 403
    
    # Check product still exists and is active
    product = cart_item.product
    
    if not product or not product.is_active:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_UNAVAILABLE',
                'message': 'This product is no longer available'
            }
        }), 400
    
    # Check stock availability
    if product.stock_quantity < data['quantity']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INSUFFICIENT_STOCK',
                'message': f'Only {product.stock_quantity} unit(s) available in stock'
            }
        }), 400
    
    # Update quantity
    cart_item.quantity = data['quantity']
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update cart item'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': cart_item.cart.to_dict(),
        'message': 'Cart item updated successfully'
    }), 200


@bp.route('/items/<int:cart_item_id>', methods=['DELETE'])
@role_required(UserRole.CUSTOMER)
def remove_cart_item(current_user, cart_item_id):
    """
    Remove item from cart
    
    DELETE /api/v1/cart/items/:id
    Headers: Authorization: Bearer <access_token>
    """
    # Get cart item
    cart_item = CartItem.find_by_id(cart_item_id)
    
    if not cart_item:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CART_ITEM_NOT_FOUND',
                'message': 'Cart item not found'
            }
        }), 404
    
    # Verify cart belongs to current user
    if cart_item.cart.user_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only modify your own cart'
            }
        }), 403

    # Get cart before deleting item
    cart = cart_item.cart

    try:
        db.session.delete(cart_item)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to remove item from cart'
            }
        }), 500

    return jsonify({
        'success': True,
        'data': cart.to_dict(),
        'message': 'Item removed from cart successfully'
    }), 200


@bp.route('', methods=['DELETE'])
@role_required(UserRole.CUSTOMER)
def clear_cart(current_user):
    """
    Clear all items from cart
    
    DELETE /api/v1/cart
    Headers: Authorization: Bearer <access_token>
    """
    # Get user's cart
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    
    if not cart:
        return jsonify({
            'success': True,
            'message': 'Cart is already empty'
        }), 200
    
    try:
        # Delete all cart items (cascade will handle this)
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to clear cart'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': cart.to_dict(),
        'message': 'Cart cleared successfully'
    }), 200
