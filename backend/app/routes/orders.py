"""
Orders Routes
Order creation and management
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
from app import db
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.cart import Cart
from app.models.hub import Hub
from app.models.order import (
    MasterOrder, SubOrder, OrderItem,
    PaymentMethod, PaymentStatus, SubOrderStatus
)
from app.utils.decorators import login_required, role_required
from app.services.mpesa_service import initiate_stk_push

# Create blueprint
bp = Blueprint('orders', __name__)


# Validation Schemas
class CreateOrderSchema(Schema):
    """Schema for creating an order"""
    payment_method = fields.Str(required=True, validate=validate.OneOf(['mpesa_delivery', 'cash_on_delivery']))
    mpesa_phone_number = fields.Str()
    hub_id = fields.Int()


class CancelOrderSchema(Schema):
    """Schema for cancelling order"""
    reason = fields.Str(required=True, validate=validate.Length(min=10, max=500))


create_order_schema = CreateOrderSchema()
cancel_order_schema = CancelOrderSchema()


@bp.route('', methods=['POST'])
@login_required
def create_order(current_user):
    """
    Create order from cart
    
    POST /api/v1/orders
    Headers: Authorization: Bearer <access_token>
    Body: {
        "payment_method": "mpesa_delivery" | "cash_on_delivery",
        "mpesa_phone_number": "254712345678" (required if mpesa_delivery),
        "hub_id": 1 (required if cash_on_delivery)
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
    
    # Validate payment method specific requirements
    payment_method = PaymentMethod(data['payment_method'])
    
    if payment_method == PaymentMethod.MPESA_DELIVERY:
        if not data.get('mpesa_phone_number'):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'PHONE_REQUIRED',
                    'message': 'M-Pesa phone number is required'
                }
            }), 400
    
    if payment_method == PaymentMethod.COD:
        if not data.get('hub_id'):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'HUB_REQUIRED',
                    'message': 'Hub selection is required for Cash on Delivery'
                }
            }), 400
        
        # Verify hub exists
        hub = Hub.query.get(data['hub_id'])
        if not hub:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'HUB_NOT_FOUND',
                    'message': 'Selected hub not found'
                }
            }), 404
    
    # Get user's cart
    cart = Cart.get_or_create_cart(current_user.id)
    
    if not cart.items:
        return jsonify({
            'success': False,
            'error': {
                'code': 'EMPTY_CART',
                'message': 'Cart is empty'
            }
        }), 400
    
    # Validate stock availability
    for item in cart.items:
        if item.product.stock_quantity < item.quantity:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INSUFFICIENT_STOCK',
                    'message': f'Insufficient stock for {item.product.name}'
                }
            }), 400
    
    # Calculate total
    total_amount = cart.get_total()
    
    # Create master order
    master_order = MasterOrder(
        customer_id=current_user.id,
        total_amount=total_amount,
        payment_method=payment_method,
        mpesa_phone_number=data.get('mpesa_phone_number'),
        payment_status=PaymentStatus.PENDING
    )
    
    try:
        db.session.add(master_order)
        db.session.flush()  # Get master_order.id
        
        # Group cart items by merchant
        items_by_merchant = {}
        for item in cart.items:
            merchant_id = item.product.merchant_id
            if merchant_id not in items_by_merchant:
                items_by_merchant[merchant_id] = []
            items_by_merchant[merchant_id].append(item)
        
        # Create suborders for each merchant
        for merchant_id, items in items_by_merchant.items():
            # Calculate subtotal for this merchant
            from decimal import Decimal
            subtotal = sum(Decimal(str(item.product.price)) * item.quantity for item in items)

            # Calculate commission (25%)
            commission = subtotal * Decimal('0.25')
            merchant_payout = subtotal - commission
            
            # Determine initial status based on payment method
            if payment_method == PaymentMethod.MPESA_DELIVERY:
                status = SubOrderStatus.PENDING_PAYMENT
            else:  # COD
                status = SubOrderStatus.PENDING_MERCHANT_DELIVERY
            
            # Create suborder
            suborder = SubOrder(
                master_order_id=master_order.id,
                merchant_id=merchant_id,
                hub_id=data.get('hub_id'),
                subtotal_amount=subtotal,
                commission_amount=commission,
                merchant_payout_amount=merchant_payout,
                status=status
            )
            
            db.session.add(suborder)
            db.session.flush()  # Get suborder.id
            
            # Create order items
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
        for item in cart.items:
            db.session.delete(item)
        
        db.session.commit()
        
        # If M-Pesa, initiate STK push
        if payment_method == PaymentMethod.MPESA_DELIVERY:
            mpesa_response = initiate_stk_push(
                phone_number=data['mpesa_phone_number'],
                amount=int(total_amount),
                account_reference=f"ORDER-{master_order.id}",
                transaction_desc=f"Payment for Order #{master_order.id}"
            )
            
            if mpesa_response.get('success'):
                master_order.mpesa_checkout_request_id = mpesa_response.get('checkout_request_id')
                db.session.commit()
        
        # Send order confirmation email
        from app.services.email_service import send_order_confirmation_email
        send_order_confirmation_email(master_order)
        
        # Send notifications to merchants
        from app.services.email_service import send_merchant_new_order_email
        for suborder in master_order.suborders:
            send_merchant_new_order_email(suborder.merchant, suborder)
        
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': f'Failed to create order: {str(e)}'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': master_order.to_dict(),
        'message': 'Order created successfully'
    }), 201


@bp.route('', methods=['GET'])
@login_required
def get_orders(current_user):
    """
    Get user's orders
    
    GET /api/v1/orders
    Headers: Authorization: Bearer <access_token>
    """
    orders = MasterOrder.query.filter_by(
        customer_id=current_user.id
    ).order_by(MasterOrder.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [order.to_dict() for order in orders]
    }), 200


@bp.route('/<int:order_id>', methods=['GET'])
@login_required
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


@bp.route('/<int:order_id>/cancel', methods=['POST'])
@role_required(UserRole.CUSTOMER)
def cancel_order(current_user, order_id):
    """
    Cancel an order
    
    POST /api/v1/orders/:id/cancel
    Headers: Authorization: Bearer <customer_token>
    Body: {
        "reason": "Changed my mind / Found better price / etc."
    }
    """
    try:
        data = cancel_order_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get order
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
                'message': 'You can only cancel your own orders'
            }
        }), 403
    
    # Check if already cancelled
    if order.is_cancelled:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ALREADY_CANCELLED',
                'message': 'This order is already cancelled'
            }
        }), 400
    
    # Check if order can be cancelled
    # Can only cancel if: pending_payment, paid_awaiting_shipment, or pending_merchant_delivery
    cancellable_statuses = [
        SubOrderStatus.PENDING_PAYMENT,
        SubOrderStatus.PAID_AWAITING_SHIPMENT,
        SubOrderStatus.PENDING_MERCHANT_DELIVERY,
        SubOrderStatus.AT_HUB_VERIFICATION_PENDING
    ]
    
    # Check all suborders
    all_cancellable = all(
        suborder.status in cancellable_statuses 
        for suborder in order.suborders
    )
    
    if not all_cancellable:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CANNOT_CANCEL',
                'message': 'Order cannot be cancelled. Some items have already been shipped or delivered.'
            }
        }), 400
    
    # Mark order as cancelled
    order.is_cancelled = True
    order.cancelled_at = datetime.utcnow()
    order.cancellation_reason = data['reason']
    
    # Cancel all suborders
    for suborder in order.suborders:
        suborder.status = SubOrderStatus.CANCELLED
        
        # Restore stock
        for item in suborder.items:
            item.product.stock_quantity += item.quantity
    
    # Handle refund for paid orders
    if order.payment_status == PaymentStatus.PAID:
        order.refund_status = 'pending'
        order.refund_amount = order.total_amount
        
        # TODO: Integrate with M-Pesa B2C API for automatic refund
        # For now, mark as pending for manual processing
    
    try:
        db.session.commit()
        
        # Send cancellation email
        from app.services.email_service import send_order_cancelled_email
        send_order_cancelled_email(order, data['reason'])
        
        # TODO: Notify merchants about cancellation
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to cancel order'
            }
        }), 500
    
    refund_message = ""
    if order.refund_status == 'pending':
        refund_message = " Your refund will be processed within 3-5 business days."
    
    return jsonify({
        'success': True,
        'data': order.to_dict(),
        'message': f'Order cancelled successfully.{refund_message}'
    }), 200


@bp.route('/<int:order_id>/refund-status', methods=['GET'])
@role_required(UserRole.CUSTOMER)
def get_refund_status(current_user, order_id):
    """
    Get refund status for cancelled order
    
    GET /api/v1/orders/:id/refund-status
    Headers: Authorization: Bearer <customer_token>
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
    
    if not order.is_cancelled:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_CANCELLED',
                'message': 'This order is not cancelled'
            }
        }), 400
    
    return jsonify({
        'success': True,
        'data': {
            'order_id': order.id,
            'is_cancelled': order.is_cancelled,
            'cancelled_at': order.cancelled_at.isoformat() if order.cancelled_at else None,
            'cancellation_reason': order.cancellation_reason,
            'refund_status': order.refund_status,
            'refund_amount': float(order.refund_amount) if order.refund_amount else None,
            'refund_processed_at': order.refund_processed_at.isoformat() if order.refund_processed_at else None
        }
    }), 200


# Admin endpoint to process refunds
@bp.route('/admin/orders/<int:order_id>/process-refund', methods=['POST'])
@role_required(UserRole.ADMIN)
def process_refund(current_user, order_id):
    """
    Process refund for cancelled order (Admin only)
    
    POST /api/v1/orders/admin/orders/:id/process-refund
    Headers: Authorization: Bearer <admin_token>
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
    
    if not order.is_cancelled:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_CANCELLED',
                'message': 'This order is not cancelled'
            }
        }), 400
    
    if order.refund_status == 'completed':
        return jsonify({
            'success': False,
            'error': {
                'code': 'ALREADY_REFUNDED',
                'message': 'Refund has already been processed'
            }
        }), 400
    
    # Mark refund as processing
    order.refund_status = 'processing'
    
    try:
        # TODO: Integrate with M-Pesa B2C API for automatic refund
        # For now, just mark as completed
        
        order.refund_status = 'completed'
        order.refund_processed_at = datetime.utcnow()
        
        db.session.commit()
        
        # TODO: Send refund confirmation email
        
    except Exception as e:
        db.session.rollback()
        order.refund_status = 'failed'
        db.session.commit()
        
        return jsonify({
            'success': False,
            'error': {
                'code': 'REFUND_ERROR',
                'message': 'Failed to process refund'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': {
            'order_id': order.id,
            'refund_status': order.refund_status,
            'refund_amount': float(order.refund_amount),
            'refund_processed_at': order.refund_processed_at.isoformat()
        },
        'message': 'Refund processed successfully'
    }), 200


# Admin endpoint to get all pending refunds
@bp.route('/admin/refunds/pending', methods=['GET'])
@role_required(UserRole.ADMIN)
def get_pending_refunds(current_user):
    """
    Get all pending refunds (Admin only)
    
    GET /api/v1/orders/admin/refunds/pending
    Headers: Authorization: Bearer <admin_token>
    """
    pending_refunds = MasterOrder.query.filter_by(
        is_cancelled=True,
        refund_status='pending'
    ).order_by(MasterOrder.cancelled_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [
            {
                'order_id': order.id,
                'customer': {
                    'id': order.customer.id,
                    'name': order.customer.name,
                    'email': order.customer.email
                },
                'refund_amount': float(order.refund_amount),
                'cancelled_at': order.cancelled_at.isoformat(),
                'cancellation_reason': order.cancellation_reason,
                'payment_method': order.payment_method.value,
                'mpesa_phone_number': order.mpesa_phone_number
            }
            for order in pending_refunds
        ]
    }), 200