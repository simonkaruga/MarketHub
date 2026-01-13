"""
Admin Orders Routes
Admin management of hubs and delivery partners
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.hub import Hub
from app.models.delivery_partner import DeliveryPartner
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

@bp.route('/hubs', methods=['GET'])
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