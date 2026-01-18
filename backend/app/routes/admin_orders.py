"""
Admin Orders Routes
Admin management of orders, hubs and delivery partners
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from sqlalchemy import func, desc, and_, or_
from app import db
from app.models.hub import Hub
from app.models.delivery_partner import DeliveryPartner
from app.models.order import (
    MasterOrder, SubOrder, OrderItem,
    PaymentMethod, PaymentStatus, SubOrderStatus
)
from app.models.user import User
from app.utils.decorators import admin_required

# Create blueprint
bp = Blueprint('admin_orders', __name__)


# Validation Schemas
class HubSchema(Schema):
    """Schema for hub"""
    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    address = fields.Str(required=True, validate=validate.Length(min=10, max=500))
    city = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    phone_number = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    operating_hours = fields.Str(validate=validate.Length(max=200))
    is_active = fields.Bool()


class DeliveryPartnerSchema(Schema):
    """Schema for delivery partner"""
    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    contact_phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    coverage_areas = fields.List(fields.Str(), required=True)
    is_active = fields.Bool()


hub_schema = HubSchema()
partner_schema = DeliveryPartnerSchema()


# ===== HUB MANAGEMENT =====

@bp.route('/admin/hubs', methods=['GET'])
def get_hubs():
    """
    Get all hubs (public endpoint)
    
    GET /api/v1/hubs
    """
    hubs = Hub.query.order_by(Hub.city, Hub.name).all()
    
    return jsonify({
        'success': True,
        'data': [hub.to_dict() for hub in hubs]
    }), 200


@bp.route('/admin/hubs', methods=['POST'])
@admin_required
def create_hub(current_user):
    """
    Create a hub
    
    POST /api/v1/admin/hubs
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Westlands Hub",
        "address": "123 Waiyaki Way, Westlands",
        "city": "Nairobi",
        "phone_number": "0712345678",
        "operating_hours": "Mon-Sat: 8AM-6PM"
    }
    """
    try:
        data = hub_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if hub with same name exists
    existing_hub = Hub.query.filter_by(name=data['name']).first()
    if existing_hub:
        return jsonify({
            'success': False,
            'error': {
                'code': 'HUB_EXISTS',
                'message': 'A hub with this name already exists'
            }
        }), 409
    
    # Create hub
    hub = Hub(
        name=data['name'],
        address=data['address'],
        city=data['city'],
        phone_number=data['phone_number'],
        operating_hours=data.get('operating_hours')
    )
    
    try:
        db.session.add(hub)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create hub'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': hub.to_dict(),
        'message': 'Hub created successfully'
    }), 201


@bp.route('/admin/hubs/<int:hub_id>', methods=['PUT'])
@admin_required
def update_hub(current_user, hub_id):
    """
    Update a hub
    
    PUT /api/v1/admin/hubs/:id
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Updated Hub Name",
        "is_active": false,
        ...
    }
    """
    hub = Hub.find_by_id(hub_id)
    
    if not hub:
        return jsonify({
            'success': False,
            'error': {
                'code': 'HUB_NOT_FOUND',
                'message': 'Hub not found'
            }
        }), 404
    
    try:
        data = hub_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Update fields
    for key, value in data.items():
        setattr(hub, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update hub'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': hub.to_dict(),
        'message': 'Hub updated successfully'
    }), 200


# ===== DELIVERY PARTNER MANAGEMENT =====

@bp.route('/delivery-partners', methods=['GET'])
def get_delivery_partners():
    """
    Get all delivery partners (public endpoint)
    
    GET /api/v1/delivery-partners
    """
    partners = DeliveryPartner.query.order_by(DeliveryPartner.name).all()
    
    return jsonify({
        'success': True,
        'data': [partner.to_dict() for partner in partners]
    }), 200


@bp.route('/admin/delivery-partners', methods=['POST'])
@admin_required
def create_delivery_partner(current_user):
    """
    Create a delivery partner
    
    POST /api/v1/admin/delivery-partners
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "name": "Nairobi Express SACCO",
        "contact_phone": "0722123456",
        "coverage_areas": ["Nairobi", "Kiambu", "Machakos"]
    }
    """
    try:
        data = partner_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Check if partner exists
    existing_partner = DeliveryPartner.query.filter_by(name=data['name']).first()
    if existing_partner:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PARTNER_EXISTS',
                'message': 'A delivery partner with this name already exists'
            }
        }), 409
    
    # Create partner
    partner = DeliveryPartner(
        name=data['name'],
        contact_phone=data['contact_phone'],
        coverage_areas=data['coverage_areas']
    )
    
    try:
        db.session.add(partner)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create delivery partner'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': partner.to_dict(),
        'message': 'Delivery partner created successfully'
    }), 201


@bp.route('/admin/delivery-partners/<int:partner_id>', methods=['PUT'])
@admin_required
def update_delivery_partner(current_user, partner_id):
    """
    Update a delivery partner
    
    PUT /api/v1/admin/delivery-partners/:id
    Headers: Authorization: Bearer <admin_access_token>
    """
    partner = DeliveryPartner.find_by_id(partner_id)
    
    if not partner:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PARTNER_NOT_FOUND',
                'message': 'Delivery partner not found'
            }
        }), 404
    
    try:
        data = partner_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Update fields
    for key, value in data.items():
        setattr(partner, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update delivery partner'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': partner.to_dict(),
        'message': 'Delivery partner updated successfully'
    }), 200


# ===== ORDER MANAGEMENT =====

@bp.route('/admin/orders', methods=['GET'])
@admin_required
def get_admin_orders(current_user):
    """
    Get all orders for admin (with pagination and filtering)

    GET /api/v1/admin/orders?status=PENDING_PAYMENT&page=1&limit=20
    Headers: Authorization: Bearer <admin_access_token>

    Query Parameters:
    - status: Filter by order status (optional)
    - page: Page number (default: 1)
    - limit: Items per page (default: 20)
    """
    # Parse query parameters
    status_filter = request.args.get('status')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))

    # Base query - get master orders with customer info
    query = db.session.query(
        MasterOrder,
        User.name.label('customer_name'),
        User.email.label('customer_email')
    ).join(
        User, MasterOrder.customer_id == User.id
    )

    # Apply status filter if provided
    if status_filter:
        try:
            # For master orders, we need to check suborder statuses
            # This is a simplified filter - you might want to adjust based on your needs
            query = query.filter(
                MasterOrder.id.in_(
                    db.session.query(SubOrder.master_order_id).filter(
                        SubOrder.status == SubOrderStatus(status_filter)
                    )
                )
            )
        except ValueError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'Invalid status: {status_filter}'
                }
            }), 400

    # Get total count for pagination
    total_orders = query.count()

    # Apply pagination and ordering
    orders_data = query.order_by(
        MasterOrder.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    # Format the response
    orders = []
    for master_order, customer_name, customer_email in orders_data:
        # Get suborders for this master order
        suborders = SubOrder.query.filter_by(master_order_id=master_order.id).all()

        # Determine overall status (simplified - take the first suborder status)
        overall_status = suborders[0].status.value if suborders else 'UNKNOWN'

        # Get items count
        items_count = sum(len(suborder.items) for suborder in suborders)

        order_dict = {
            'id': master_order.id,
            'total_amount': float(master_order.total_amount),
            'payment_method': master_order.payment_method.value,
            'payment_status': master_order.payment_status.value,
            'status': overall_status,
            'created_at': master_order.created_at.isoformat(),
            'customer': {
                'id': master_order.customer_id,
                'name': customer_name,
                'email': customer_email
            },
            'items': items_count,
            'is_cancelled': master_order.is_cancelled
        }
        orders.append(order_dict)

    return jsonify({
        'success': True,
        'data': orders,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total_orders,
            'pages': (total_orders + limit - 1) // limit
        }
    }), 200


@bp.route('/admin/orders/stats', methods=['GET'])
@admin_required
def get_admin_order_stats(current_user):
    """
    Get order statistics for admin dashboard

    GET /api/v1/admin/orders/stats
    Headers: Authorization: Bearer <admin_access_token>
    """
    # Total orders
    total_orders = MasterOrder.query.count()

    # Orders by status (using suborders)
    status_counts = db.session.query(
        SubOrder.status,
        func.count(SubOrder.id).label('count')
    ).group_by(SubOrder.status).all()

    # Convert to dictionary for easier access
    status_dict = {status.value: count for status, count in status_counts}

    # Map statuses to the expected frontend keys
    pending = (status_dict.get('PENDING_PAYMENT', 0) +
               status_dict.get('PENDING_MERCHANT_DELIVERY', 0) +
               status_dict.get('PAID_AWAITING_SHIPMENT', 0))
    in_transit = (status_dict.get('SHIPPED', 0) +
                  status_dict.get('IN_TRANSIT', 0) +
                  status_dict.get('AT_HUB_VERIFICATION_PENDING', 0) +
                  status_dict.get('AT_HUB_READY_FOR_PICKUP', 0))
    completed = (status_dict.get('DELIVERED', 0) +
                 status_dict.get('COMPLETED', 0) +
                 status_dict.get('PAYMENT_RECEIVED_READY_FOR_COLLECTION', 0))

    # Total revenue (from completed orders)
    total_revenue = db.session.query(
        func.sum(SubOrder.subtotal_amount)
    ).filter(
        SubOrder.status.in_([
            SubOrderStatus.DELIVERED,
            SubOrderStatus.COMPLETED,
            SubOrderStatus.PAYMENT_RECEIVED_READY_FOR_COLLECTION
        ])
    ).scalar() or 0

    return jsonify({
        'success': True,
        'data': {
            'total': total_orders,
            'pending': pending,
            'in_transit': in_transit,
            'completed': completed,
            'total_revenue': float(total_revenue)
        }
    }), 200


@bp.route('/admin/orders/<int:order_id>/status', methods=['PATCH'])
@admin_required
def update_order_status(current_user, order_id):
    """
    Update order status (admin only)

    PATCH /api/v1/admin/orders/:id/status
    Headers: Authorization: Bearer <admin_access_token>
    Body: {
        "status": "SHIPPED"
    }
    """
    data = request.json
    new_status = data.get('status')

    if not new_status:
        return jsonify({
            'success': False,
            'error': {
                'code': 'MISSING_STATUS',
                'message': 'Status is required'
            }
        }), 400

    try:
        status_enum = SubOrderStatus(new_status)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_STATUS',
                'message': f'Invalid status: {new_status}'
            }
        }), 400

    # Get the master order
    master_order = MasterOrder.query.get(order_id)
    if not master_order:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_NOT_FOUND',
                'message': 'Order not found'
            }
        }), 404

    # Update all suborders for this master order
    suborders = SubOrder.query.filter_by(master_order_id=order_id).all()

    if not suborders:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_SUBORDERS',
                'message': 'No suborders found for this order'
            }
        }), 404

    try:
        for suborder in suborders:
            suborder.status = status_enum

        db.session.commit()

        # TODO: Send notifications to customer/merchant

        return jsonify({
            'success': True,
            'message': f'Order status updated to {new_status}'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'UPDATE_FAILED',
                'message': 'Failed to update order status'
            }
        }), 500
