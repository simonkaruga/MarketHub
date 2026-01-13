"""
Orders Routes
Customer order management
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime, timedelta
from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.order import (
    MasterOrder, SubOrder, OrderItem,
    PaymentMethod, PaymentStatus, SubOrderStatus
)
from app.models.hub import Hub
from app.models.delivery_partner import DeliveryPartner
from app.models.user import User
from app.utils.decorators import role_required
from app.models.user import UserRole
from app.services.mpesa_service import initiate_stk_push

# Create blueprint
bp = Blueprint('orders', __name__)


# Validation Schemas
class CreateOrderSchema(Schema):
    """Schema for creating an order"""
    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf(['mpesa_delivery', 'cash_on_delivery'])
    )
    # M-Pesa fields
    mpesa_phone_number = fields.Str()
    delivery_address = fields.Str()
    delivery_city = fields.Str()
    # COD fields
    hub_id = fields.Int()


create_order_schema = CreateOrderSchema()


@bp.route('', methods=['POST'])
@role_required(UserRole.CUSTOMER)
def create_order(current_user):
    """
    Create order from cart (checkout)
    
    POST /api/v1/orders
    Headers: Authorization: Bearer <access_token>
    Body: {
        "payment_method": "mpesa_delivery" or "cash_on_delivery",
        
        // If M-Pesa:
        "mpesa_phone_number": "0712345678",
        "delivery_address": "123 Main St, Apt 4B",
        "delivery_city": "Nairobi",
        
        // If COD:
        "hub_id": 1
    }
    """
    try:
        data = create_order_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get user's cart
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    
    if not cart or cart.items.count() == 0:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CART_EMPTY',
                'message': 'Your cart is empty'
            }
        }), 400
    
    # Validate payment method specific fields
    payment_method = PaymentMethod(data['payment_method'])
    
    if payment_method == PaymentMethod.MPESA_DELIVERY:
        if not all([data.get('mpesa_phone_number'), data.get('delivery_address'), data.get('delivery_city')]):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_FIELDS',
                    'message': 'M-Pesa payment requires phone number, delivery address, and city'
                }
            }), 400
    
    elif payment_method == PaymentMethod.COD:
        if not data.get('hub_id'):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_FIELDS',
                    'message': 'COD payment requires hub selection'
                }
            }), 400
        
        # Validate hub exists and is active
        hub = Hub.find_by_id(data['hub_id'])
        if not hub or not hub.is_active:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_HUB',
                    'message': 'Selected hub is not available'
                }
            }), 400
    
    # Validate stock for all items
    for cart_item in cart.items:
        product = cart_item.product
        
        if not product.is_active:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'PRODUCT_UNAVAILABLE',
                    'message': f'Product "{product.name}" is no longer available'
                }
            }), 400
        
        if product.stock_quantity < cart_item.quantity:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INSUFFICIENT_STOCK',
                    'message': f'Product "{product.name}" has insufficient stock. Only {product.stock_quantity} available.'
                }
            }), 400
    
    # Calculate total
    total_amount = cart.get_total()
    
    # Create Master Order
    master_order = MasterOrder(
        customer_id=current_user.id,
        total_amount=total_amount,
        payment_method=payment_method,
        payment_status=PaymentStatus.PENDING,
        mpesa_phone_number=data.get('mpesa_phone_number'),
        delivery_address=data.get('delivery_address'),
        delivery_city=data.get('delivery_city'),
        selected_hub_id=data.get('hub_id')
    )
    
    try:
        db.session.add(master_order)
        db.session.flush()  # Get master_order.id
        
        # Group cart items by merchant
        merchant_items = {}
        for cart_item in cart.items:
            merchant_id = cart_item.product.merchant_id
            if merchant_id not in merchant_items:
                merchant_items[merchant_id] = []
            merchant_items[merchant_id].append(cart_item)
        
        # Create SubOrders for each merchant
        for merchant_id, items in merchant_items.items():
            # Calculate subtotal for this merchant
            subtotal = sum(float(item.product.price) * item.quantity for item in items)
            
            # Calculate commission (25%)
            commission_rate = current_app.config.get('COMMISSION_RATE', 0.25)
            commission = subtotal * commission_rate
            merchant_payout = subtotal - commission
            
            # Determine initial status
            if payment_method == PaymentMethod.MPESA_DELIVERY:
                status = SubOrderStatus.PENDING_PAYMENT
            else:
                status = SubOrderStatus.PENDING_MERCHANT_DELIVERY
            
            # Set pickup deadline for COD
            pickup_deadline = None
            if payment_method == PaymentMethod.COD:
                pickup_window_days = current_app.config.get('PICKUP_WINDOW_DAYS', 5)
                pickup_deadline = datetime.utcnow() + timedelta(days=pickup_window_days)
            
            # Create SubOrder
            suborder = SubOrder(
                master_order_id=master_order.id,
                merchant_id=merchant_id,
                hub_id=data.get('hub_id') if payment_method == PaymentMethod.COD else None,
                status=status,
                subtotal_amount=subtotal,
                commission_amount=commission,
                merchant_payout_amount=merchant_payout,
                pickup_deadline=pickup_deadline
            )
            
            db.session.add(suborder)
            db.session.flush()  # Get suborder.id
            
            # Create OrderItems
            for cart_item in items:
                order_item = OrderItem(
                    suborder_id=suborder.id,
                    product_id=cart_item.product_id,
                    quantity=cart_item.quantity,
                    price_at_purchase=cart_item.product.price
                )
                db.session.add(order_item)
                
                # Reduce stock
                cart_item.product.stock_quantity -= cart_item.quantity
        
        # Clear cart
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        db.session.commit()
        
        # If M-Pesa, initiate STK Push
        if payment_method == PaymentMethod.MPESA_DELIVERY:
            stk_result = initiate_stk_push(
                phone_number=data['mpesa_phone_number'],
                amount=total_amount,
                account_reference=f"ORDER-{master_order.id}",
                transaction_desc=f"Payment for Order #{master_order.id}"
            )
            
            if stk_result and stk_result.get('success'):
                # Save checkout request ID
                master_order.mpesa_checkout_request_id = stk_result.get('checkout_request_id')
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'data': {
                        'order': master_order.to_dict(),
                        'mpesa_prompt': 'Please check your phone for M-Pesa prompt',
                        'checkout_request_id': stk_result.get('checkout_request_id')
                    },
                    'message': 'Order created. Please complete M-Pesa payment on your phone.'
                }), 201
            else:
                # STK Push failed - mark order
                master_order.payment_status = PaymentStatus.FAILED
                db.session.commit()
                
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'MPESA_ERROR',
                        'message': f"Order created but M-Pesa payment failed: {stk_result.get('error') if stk_result else 'Unknown error'}"
                    }
                }), 500
        
        # COD order created successfully
        return jsonify({
            'success': True,
            'data': master_order.to_dict(),
            'message': 'Order created successfully. Please pick up at selected hub within 5 days.'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Order creation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_ERROR',
                'message': 'Failed to create order'
            }
        }), 500


@bp.route('', methods=['GET'])
@role_required(UserRole.CUSTOMER)
def get_orders(current_user):
    """
    Get customer's orders
    
    GET /api/v1/orders
    Headers: Authorization: Bearer <access_token>
    """
    orders = MasterOrder.query.filter_by(customer_id=current_user.id).order_by(MasterOrder.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [order.to_dict() for order in orders]
    }), 200


@bp.route('/<int:order_id>', methods=['GET'])
@role_required(UserRole.CUSTOMER)
def get_order(current_user, order_id):
    """
    Get order details
    
    GET /api/v1/orders/:id
    Headers: Authorization: Bearer <access_token>
    """
    order = MasterOrder.query.get(order_id)
    
    if not order:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check ownership
    if order.customer_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only view your own orders'
            }
        }), 403
    
    return jsonify({
        'success': True,
        'data': order.to_dict()
    }), 200