"""
Hub Staff Routes
Hub staff dashboard and order management
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime, date
from sqlalchemy import func, and_
from app import db
from app.models.order import SubOrder, SubOrderStatus, PaymentStatus
from app.models.user import User
from app.utils.decorators import hub_staff_required

# Create blueprint
bp = Blueprint('hub_staff', __name__)


# Validation Schemas
class VerifyOrderSchema(Schema):
    """Schema for verifying product delivery"""
    notes = fields.Str(validate=validate.Length(max=500))


class RejectOrderSchema(Schema):
    """Schema for rejecting product"""
    rejection_reason = fields.Str(required=True, validate=validate.Length(min=10, max=500))


class ProcessPickupSchema(Schema):
    """Schema for processing customer pickup"""
    payment_received = fields.Bool(required=True)
    notes = fields.Str(validate=validate.Length(max=500))


verify_schema = VerifyOrderSchema()
reject_schema = RejectOrderSchema()
pickup_schema = ProcessPickupSchema()


@bp.route('/dashboard', methods=['GET'])
@hub_staff_required
def get_dashboard(current_user):
    """
    Get hub dashboard overview
    
    GET /api/v1/hub/dashboard
    Headers: Authorization: Bearer <hub_staff_token>
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    # Get statistics
    stats = {
        'pending_verification': SubOrder.query.filter_by(
            hub_id=hub_id,
            status=SubOrderStatus.AT_HUB_VERIFICATION_PENDING
        ).count(),
        
        'ready_for_pickup': SubOrder.query.filter_by(
            hub_id=hub_id,
            status=SubOrderStatus.AT_HUB_READY_FOR_PICKUP
        ).count(),
        
        'awaiting_payment': SubOrder.query.filter_by(
            hub_id=hub_id,
            status=SubOrderStatus.PAYMENT_RECEIVED_READY_FOR_COLLECTION
        ).count(),
        
        'completed_today': SubOrder.query.filter(
            SubOrder.hub_id == hub_id,
            SubOrder.status == SubOrderStatus.COMPLETED,
            func.date(SubOrder.updated_at) == date.today()
        ).count(),
        
        'expired': SubOrder.query.filter(
            SubOrder.hub_id == hub_id,
            SubOrder.status == SubOrderStatus.EXPIRED
        ).count()
    }
    
    # Calculate today's revenue (COD payments received)
    today_revenue = db.session.query(
        func.sum(SubOrder.subtotal_amount)
    ).filter(
        SubOrder.hub_id == hub_id,
        SubOrder.status == SubOrderStatus.COMPLETED,
        func.date(SubOrder.updated_at) == date.today()
    ).scalar() or 0
    
    stats['revenue_today'] = float(today_revenue)
    
    return jsonify({
        'success': True,
        'data': {
            'hub_id': hub_id,
            'hub_name': current_user.hub.name if current_user.hub else None,
            'statistics': stats
        }
    }), 200


@bp.route('/orders', methods=['GET'])
@hub_staff_required
def get_hub_orders(current_user):
    """
    Get all orders for the hub
    
    GET /api/v1/hub/orders?status=at_hub_verification_pending
    Headers: Authorization: Bearer <hub_staff_token>
    
    Query Parameters:
    - status: Filter by status (optional)
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    # Base query
    query = SubOrder.query.filter_by(hub_id=hub_id)
    
    # Filter by status if provided
    status_filter = request.args.get('status')
    if status_filter:
        try:
            status = SubOrderStatus(status_filter)
            query = query.filter_by(status=status)
        except ValueError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'Invalid status: {status_filter}'
                }
            }), 400
    
    # Order by created_at descending
    orders = query.order_by(SubOrder.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [order.to_dict() for order in orders]
    }), 200


@bp.route('/orders/<int:suborder_id>', methods=['GET'])
@hub_staff_required
def get_hub_order(current_user, suborder_id):
    """
    Get single order details
    
    GET /api/v1/hub/orders/:id
    Headers: Authorization: Bearer <hub_staff_token>
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    # Get order
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check if order belongs to this hub
    if suborder.hub_id != hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'This order does not belong to your hub'
            }
        }), 403
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict()
    }), 200


@bp.route('/orders/<int:suborder_id>/verify', methods=['POST'])
@hub_staff_required
def verify_order(current_user, suborder_id):
    """
    Verify product delivery (accept products)
    
    POST /api/v1/hub/orders/:id/verify
    Headers: Authorization: Bearer <hub_staff_token>
    Body: {
        "notes": "Products verified and in good condition"
    }
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    try:
        data = verify_schema.load(request.json or {})
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
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
     # Check if order belongs to this hub
    if suborder.hub_id != hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'This order does not belong to your hub'
            }
        }), 403
    
    # Check current status
    if suborder.status != SubOrderStatus.AT_HUB_VERIFICATION_PENDING:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f'Cannot verify order with status: {suborder.status.value}'
            }
        }), 400
    
    # Update status to ready for pickup
    suborder.status = SubOrderStatus.AT_HUB_READY_FOR_PICKUP
    
    try:
        db.session.commit()
        
        # TODO: Send notification to customer
        # - Email: "Your order is ready for pickup at [hub name]"
        # - SMS: "Order #[id] ready for pickup. Expires: [deadline]"
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to verify order'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict(),
        'message': 'Product verified successfully. Customer can now pick up.'
    }), 200


@bp.route('/orders/<int:suborder_id>/reject', methods=['POST'])
@hub_staff_required
def reject_order(current_user, suborder_id):
    """
    Reject product delivery (quality issues)
    
    POST /api/v1/hub/orders/:id/reject
    Headers: Authorization: Bearer <hub_staff_token>
    Body: {
        "rejection_reason": "Product damaged during delivery. Packaging torn."
    }
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    try:
        data = reject_schema.load(request.json)
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
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check if order belongs to this hub
    if suborder.hub_id != hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'This order does not belong to your hub'
            }
        }), 403
    
    # Check current status
    if suborder.status != SubOrderStatus.AT_HUB_VERIFICATION_PENDING:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f'Cannot reject order with status: {suborder.status.value}'
            }
        }), 400
    
    # Update status and save rejection reason
    suborder.status = SubOrderStatus.PENDING_MERCHANT_DELIVERY
    suborder.rejection_reason = data['rejection_reason']
    
    try:
        db.session.commit()
        
        # TODO: Send notifications
        # - Email merchant: "Product rejected at hub. Reason: [reason]"
        # - Email customer: "Order delayed due to quality issue. Merchant notified."
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to reject order'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict(),
        'message': 'Product rejected. Merchant has been notified to re-deliver.'
    }), 200


@bp.route('/orders/<int:suborder_id>/pickup', methods=['POST'])
@hub_staff_required
def process_pickup(current_user, suborder_id):
    """
    Process customer pickup and COD payment
    
    POST /api/v1/hub/orders/:id/pickup
    Headers: Authorization: Bearer <hub_staff_token>
    Body: {
        "payment_received": true,
        "notes": "Customer paid KES 120,000 in cash"
    }
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    try:
        data = pickup_schema.load(request.json)
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
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check if order belongs to this hub
    if suborder.hub_id != hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'This order does not belong to your hub'
            }
        }), 403
    
    # Check current status
    if suborder.status != SubOrderStatus.AT_HUB_READY_FOR_PICKUP:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f'Cannot process pickup for order with status: {suborder.status.value}'
            }
        }), 400
    
    # Check if payment received
    if not data['payment_received']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PAYMENT_REQUIRED',
                'message': 'Payment must be received before completing pickup'
            }
        }), 400
    
    # Update order status
    suborder.status = SubOrderStatus.COMPLETED
    
    # Update master order payment status
    master_order = suborder.master_order
    master_order.payment_status = PaymentStatus.PAID
    
    try:
        db.session.commit()
        
        # TODO: Send notifications
        # - Email customer: "Thank you for your purchase! Order completed."
        # - Email merchant: "Payment received. Payout will be processed."
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to process pickup'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict(),
        'message': f'Pickup completed. Payment of KES {float(suborder.subtotal_amount):,.2f} received.'
    }), 200


@bp.route('/reports/daily', methods=['GET'])
@hub_staff_required
def get_daily_report(current_user):
    """
    Get daily activity report
    
    GET /api/v1/hub/reports/daily?date=2026-01-12
    Headers: Authorization: Bearer <hub_staff_token>
    
    Query Parameters:
    - date: Date for report (YYYY-MM-DD, default: today)
    """
    hub_id = current_user.hub_id
    
    if not hub_id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_HUB_ASSIGNED',
                'message': 'You are not assigned to any hub'
            }
        }), 400
    
    # Get date from query params or use today
    date_str = request.args.get('date')
    if date_str:
        try:
            report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_DATE',
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }
            }), 400
    else:
        report_date = date.today()
    
    # Get orders for the date
    orders_verified = SubOrder.query.filter(
        SubOrder.hub_id == hub_id,
        SubOrder.status.in_([
            SubOrderStatus.AT_HUB_READY_FOR_PICKUP,
            SubOrderStatus.COMPLETED
        ]),
        func.date(SubOrder.updated_at) == report_date
    ).all()
    
    orders_completed = SubOrder.query.filter(
        SubOrder.hub_id == hub_id,
        SubOrder.status == SubOrderStatus.COMPLETED,
        func.date(SubOrder.updated_at) == report_date
    ).all()
    
    orders_rejected = SubOrder.query.filter(
        SubOrder.hub_id == hub_id,
        SubOrder.status == SubOrderStatus.PENDING_MERCHANT_DELIVERY,
        SubOrder.rejection_reason.isnot(None),
        func.date(SubOrder.updated_at) == report_date
    ).all()
    
    # Calculate totals
    total_revenue = sum(float(order.subtotal_amount) for order in orders_completed)
    total_commission = sum(float(order.commission_amount) for order in orders_completed)
    
    report = {
        'date': report_date.isoformat(),
        'hub_id': hub_id,
        'hub_name': current_user.hub.name if current_user.hub else None,
        'summary': {
            'orders_verified': len(orders_verified),
            'orders_completed': len(orders_completed),
            'orders_rejected': len(orders_rejected),
            'total_revenue': total_revenue,
            'total_commission': total_commission
        },
        'completed_orders': [order.to_dict() for order in orders_completed],
        'rejected_orders': [
            {
                'id': order.id,
                'merchant': order.merchant.name if order.merchant else None,
                'rejection_reason': order.rejection_reason,
                'subtotal': float(order.subtotal_amount)
            } for order in orders_rejected
        ]
    }
    
    return jsonify({
        'success': True,
        'data': report
    }), 200
    