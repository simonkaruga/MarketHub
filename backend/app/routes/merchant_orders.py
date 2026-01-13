"""
Merchant Orders Routes
Merchant order management endpoints
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.order import SubOrder, SubOrderStatus
from app.utils.decorators import merchant_required

# Create blueprint
bp = Blueprint('merchant_orders', __name__)


# Validation Schema
class UpdateOrderStatusSchema(Schema):
    """Schema for updating order status"""
    status = fields.Str(required=True)


update_status_schema = UpdateOrderStatusSchema()


@bp.route('/orders', methods=['GET'])
@merchant_required
def get_merchant_orders(current_user):
    """
    Get merchant's orders
    
    GET /api/v1/merchant/orders
    Headers: Authorization: Bearer <access_token>
    """
    suborders = SubOrder.query.filter_by(merchant_id=current_user.id).order_by(SubOrder.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [suborder.to_dict(include_merchant=False) for suborder in suborders]
    }), 200


@bp.route('/orders/<int:suborder_id>', methods=['GET'])
@merchant_required
def get_merchant_order(current_user, suborder_id):
    """
    Get single order details
    
    GET /api/v1/merchant/orders/:id
    Headers: Authorization: Bearer <access_token>
    """
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check ownership
    if suborder.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only view your own orders'
            }
        }), 403
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict(include_merchant=False)
    }), 200


@bp.route('/orders/<int:suborder_id>/status', methods=['PATCH'])
@merchant_required
def update_order_status(current_user, suborder_id):
    """
    Update order status
    
    PATCH /api/v1/merchant/orders/:id/status
    Headers: Authorization: Bearer <access_token>
    Body: {
        "status": "pending_merchant_delivery" | "shipped" | etc.
    }
    
    Valid status transitions:
    - PAID_AWAITING_SHIPMENT → SHIPPED
    - SHIPPED → IN_TRANSIT
    - IN_TRANSIT → DELIVERED
    - PENDING_MERCHANT_DELIVERY → AT_HUB_VERIFICATION_PENDING (for COD)
    """
    try:
        data = update_status_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Get suborder
    suborder = SubOrder.query.get(suborder_id)
    
    if not suborder:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404
    
    # Check ownership
    if suborder.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only update your own orders'
            }
        }), 403
    
    # Validate status
    try:
        new_status = SubOrderStatus(data['status'])
    except ValueError:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f"Invalid status: {data['status']}"
            }
        }), 400
    
    # Validate status transitions
    current_status = suborder.status
    valid_transitions = {
        SubOrderStatus.PAID_AWAITING_SHIPMENT: [SubOrderStatus.SHIPPED],
        SubOrderStatus.SHIPPED: [SubOrderStatus.IN_TRANSIT],
        SubOrderStatus.IN_TRANSIT: [SubOrderStatus.DELIVERED],
        SubOrderStatus.PENDING_MERCHANT_DELIVERY: [SubOrderStatus.AT_HUB_VERIFICATION_PENDING],
    }
    
    if current_status in valid_transitions:
        if new_status not in valid_transitions[current_status]:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_TRANSITION',
                    'message': f"Cannot transition from {current_status.value} to {new_status.value}"
                }
            }), 400
    else:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_TRANSITION',
                'message': f"Cannot update status from {current_status.value}"
            }
        }), 400
    
    # Update status
    suborder.status = new_status
    
    try:
        db.session.commit()
        
        # TODO: Send notifications
        # - Email customer about status change
        # - If AT_HUB_VERIFICATION_PENDING, notify hub staff
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update order status'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': suborder.to_dict(include_merchant=False),
        'message': 'Order status updated successfully'
    }), 200