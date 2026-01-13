"""
Merchant Routes
Endpoints for merchants to manage their products
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from app import db
from app.models.product import Product
from app.models.category import Category
from app.utils.decorators import merchant_required
from app.services.cloudinary_service import upload_product_image, delete_product_image
from app.services.email_service import send_product_created_notification, send_low_stock_alert
from app.utils.validators import validate_price, validate_stock

# Create blueprint
bp = Blueprint('merchant', __name__)


# Validation Schemas
class ProductCreateSchema(Schema):
    """Schema for creating a product"""
    name = fields.Str(required=True, validate=validate.Length(min=5, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=20, max=2000))
    price = fields.Float(required=True)
    category_id = fields.Int(required=True)
    stock_quantity = fields.Int(required=True)


class ProductUpdateSchema(Schema):
    """Schema for updating a product"""
    name = fields.Str(validate=validate.Length(min=5, max=200))
    description = fields.Str(validate=validate.Length(min=20, max=2000))
    price = fields.Float()
    category_id = fields.Int()
    stock_quantity = fields.Int()
    is_active = fields.Bool()


# Initialize schemas
product_create_schema = ProductCreateSchema()
product_update_schema = ProductUpdateSchema()


@bp.route('/products', methods=['GET'])
@merchant_required
def get_merchant_products(current_user):
    """
    Get all products for the current merchant
    
    GET /api/v1/merchant/products
    Headers: Authorization: Bearer <access_token>
    """
    products = Product.query.filter_by(merchant_id=current_user.id).order_by(Product.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [product.to_dict(include_merchant=False) for product in products]
    }), 200


@bp.route('/products', methods=['POST'])
@merchant_required
def create_product(current_user):
    """
    Create a new product
    
    POST /api/v1/merchant/products
    Headers: Authorization: Bearer <access_token>
    Content-Type: multipart/form-data
    
    Form Data:
    - name: Product name (5-200 chars)
    - description: Product description (20-2000 chars)
    - price: Price (minimum 10.00)
    - category_id: Category ID
    - stock_quantity: Stock quantity (>= 0)
    - image: Product image file (optional)
    """
    try:
        # Get form data
        data = {
            'name': request.form.get('name'),
            'description': request.form.get('description'),
            'price': float(request.form.get('price', 0)),
            'category_id': int(request.form.get('category_id', 0)),
            'stock_quantity': int(request.form.get('stock_quantity', 0))
        }
        
        # Validate data
        validated_data = product_create_schema.load(data)
        
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    except (ValueError, TypeError):
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid data format'
            }
        }), 400
    
    # Validate price
    price_valid, price_error = validate_price(validated_data['price'])
    if not price_valid:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': price_error
            }
        }), 400
    
    # Validate stock
    stock_valid, stock_error = validate_stock(validated_data['stock_quantity'])
    if not stock_valid:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': stock_error
            }
        }), 400
    
    # Check if category exists
    category = Category.find_by_id(validated_data['category_id'])
    if not category:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CATEGORY_NOT_FOUND',
                'message': 'Category not found'
            }
        }), 404
    
    # Handle image upload
    image_url = None
    image_public_id = None
    
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename:
            upload_result = upload_product_image(image_file)
            if upload_result:
                image_url = upload_result['url']
                image_public_id = upload_result['public_id']
            else:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'IMAGE_UPLOAD_ERROR',
                        'message': 'Failed to upload image. Please check file format and size.'
                    }
                }), 400
    
    # Create product
    product = Product(
        merchant_id=current_user.id,
        category_id=validated_data['category_id'],
        name=validated_data['name'],
        description=validated_data['description'],
        price=validated_data['price'],
        stock_quantity=validated_data['stock_quantity'],
        image_url=image_url,
        image_public_id=image_public_id
    )
    
    try:
        db.session.add(product)
        db.session.commit()
        
        # Send email notification
        send_product_created_notification(
            current_user.email,
            current_user.name,
            product.name
        )
        
    except Exception as e:
        db.session.rollback()
        # If database fails, clean up uploaded image
        if image_public_id:
            delete_product_image(image_public_id)
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create product'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': product.to_dict(include_merchant=False),
        'message': 'Product created successfully'
    }), 201


@bp.route('/products/<int:product_id>', methods=['PUT'])
@merchant_required
def update_product(current_user, product_id):
    """
    Update a product
    
    PUT /api/v1/merchant/products/:id
    Headers: Authorization: Bearer <access_token>
    Content-Type: multipart/form-data
    
    Form Data (all optional):
    - name: Product name
    - description: Product description
    - price: Price
    - category_id: Category ID
    - stock_quantity: Stock quantity
    - is_active: Active status (true/false)
    - image: New product image file
    """
    # Find product
    product = Product.find_by_id(product_id)
    
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    # Check ownership
    if product.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only update your own products'
            }
        }), 403
    
    try:
        # Get form data (only fields that are present)
        data = {}
        if 'name' in request.form:
            data['name'] = request.form.get('name')
        if 'description' in request.form:
            data['description'] = request.form.get('description')
        if 'price' in request.form:
            data['price'] = float(request.form.get('price'))
        if 'category_id' in request.form:
            data['category_id'] = int(request.form.get('category_id'))
        if 'stock_quantity' in request.form:
            data['stock_quantity'] = int(request.form.get('stock_quantity'))
        if 'is_active' in request.form:
            data['is_active'] = request.form.get('is_active').lower() == 'true'
        
        # Validate data
        if data:
            validated_data = product_update_schema.load(data)
        else:
            validated_data = {}
        
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    except (ValueError, TypeError):
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid data format'
            }
        }), 400
    
    # Validate price if provided
    if 'price' in validated_data:
        price_valid, price_error = validate_price(validated_data['price'])
        if not price_valid:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': price_error
                }
            }), 400
    
    # Validate stock if provided
    old_stock = product.stock_quantity
    if 'stock_quantity' in validated_data:
        stock_valid, stock_error = validate_stock(validated_data['stock_quantity'])
        if not stock_valid:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': stock_error
                }
            }), 400
    
    # Check if category exists if provided
    if 'category_id' in validated_data:
        category = Category.find_by_id(validated_data['category_id'])
        if not category:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CATEGORY_NOT_FOUND',
                    'message': 'Category not found'
                }
            }), 404
    
    # Handle image upload if new image provided
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename:
            # Delete old image if exists
            if product.image_public_id:
                delete_product_image(product.image_public_id)
            
            # Upload new image
            upload_result = upload_product_image(image_file)
            if upload_result:
                product.image_url = upload_result['url']
                product.image_public_id = upload_result['public_id']
            else:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'IMAGE_UPLOAD_ERROR',
                        'message': 'Failed to upload image'
                    }
                }), 400
    
    # Update product fields
    for key, value in validated_data.items():
        setattr(product, key, value)
    
    try:
        db.session.commit()
        
        # Check if stock was increased (reset alert flag)
        if 'stock_quantity' in validated_data:
            new_stock = validated_data['stock_quantity']
            if old_stock <= 5 and new_stock > 5:
                product.low_stock_alert_sent = False
                db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update product'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': product.to_dict(include_merchant=False),
        'message': 'Product updated successfully'
    }), 200


@bp.route('/products/<int:product_id>', methods=['DELETE'])
@merchant_required
def delete_product(current_user, product_id):
    """
    Delete a product (soft delete - mark as inactive)
    
    DELETE /api/v1/merchant/products/:id
    Headers: Authorization: Bearer <access_token>
    """
    # Find product
    product = Product.find_by_id(product_id)
    
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    # Check ownership
    if product.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only delete your own products'
            }
        }), 403
    
    # Soft delete (mark as inactive)
    product.is_active = False
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to delete product'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Product deleted successfully'
    }), 200


@bp.route('/products/check-low-stock', methods=['POST'])
@merchant_required
def check_low_stock(current_user):
    """
    Manually check for low stock and send alerts
    (In production, this would be a cron job)
    
    POST /api/v1/merchant/products/check-low-stock
    Headers: Authorization: Bearer <access_token>
    """
    # Get merchant's low stock products
    low_stock_products = Product.query.filter(
        Product.merchant_id == current_user.id,
        Product.is_active == True,
        Product.stock_quantity <= 5,
        Product.stock_quantity > 0,
        Product.low_stock_alert_sent == False
    ).all()
    
    alerts_sent = 0
    for product in low_stock_products:
        # Send alert
        success = send_low_stock_alert(
            current_user.email,
            current_user.name,
            product.name,
            product.stock_quantity
        )
        
        if success:
            product.low_stock_alert_sent = True
            alerts_sent += 1
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
    
    return jsonify({
        'success': True,
        'message': f'{alerts_sent} low stock alert(s) sent',
        'data': {
            'alerts_sent': alerts_sent,
            'products_checked': len(low_stock_products)
        }
    }), 200