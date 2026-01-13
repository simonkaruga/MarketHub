"""
Reviews Routes
Customer reviews and public review viewing
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from sqlalchemy import func, desc
from app import db
from app.models.review import Review
from app.models.product import Product
from app.models.user import User, UserRole
from app.utils.decorators import role_required
from app.services.cloudinary_service import upload_product_image

# Create blueprint
bp = Blueprint('reviews', __name__)


# Validation Schemas
class CreateReviewSchema(Schema):
    """Schema for creating a review"""
    product_id = fields.Int(required=True)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    title = fields.Str(validate=validate.Length(max=200))
    comment = fields.Str(required=True, validate=validate.Length(min=10, max=2000))


class UpdateReviewSchema(Schema):
    """Schema for updating a review"""
    rating = fields.Int(validate=validate.Range(min=1, max=5))
    title = fields.Str(validate=validate.Length(max=200))
    comment = fields.Str(validate=validate.Length(min=10, max=2000))


create_review_schema = CreateReviewSchema()
update_review_schema = UpdateReviewSchema()


@bp.route('', methods=['POST'])
@role_required(UserRole.CUSTOMER)
def create_review(current_user):
    """
    Create a product review
    
    POST /api/v1/reviews
    Headers: Authorization: Bearer <customer_token>
    Content-Type: multipart/form-data (if uploading images)
    
    Form Data:
    - product_id: Product ID
    - rating: 1-5
    - title: Review title (optional)
    - comment: Review text (min 10 chars)
    - images: Image files (optional, up to 3)
    """
    try:
        # Get form data
        data = {
            'product_id': int(request.form.get('product_id')),
            'rating': int(request.form.get('rating')),
            'title': request.form.get('title'),
            'comment': request.form.get('comment')
        }
        
        # Validate data
        validated_data = create_review_schema.load(data)
    except (ValidationError, ValueError, TypeError) as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages if isinstance(err, ValidationError) else str(err)
            }
        }), 400
    
    # Check if product exists
    product = Product.find_by_id(validated_data['product_id'])
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    # Check if customer can review
    can_review, result = Review.can_customer_review(current_user.id, validated_data['product_id'])
    
    if not can_review:
        return jsonify({
            'success': False,
            'error': {
                'code': 'CANNOT_REVIEW',
                'message': result
            }
        }), 400
    
    order_item_id = result

     # Handle image uploads (optional, up to 3 images)
    image_urls = []
    if 'images' in request.files:
        images = request.files.getlist('images')
        
        if len(images) > 3:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TOO_MANY_IMAGES',
                    'message': 'Maximum 3 images allowed'
                }
            }), 400
        
        for image_file in images:
            if image_file.filename:
                upload_result = upload_product_image(image_file)
                if upload_result:
                    image_urls.append(upload_result['url'])
    
    # Create review
    review = Review(
        product_id=validated_data['product_id'],
        customer_id=current_user.id,
        order_item_id=order_item_id,
        rating=validated_data['rating'],
        title=validated_data.get('title'),
        comment=validated_data['comment'],
        image_urls=image_urls if image_urls else None,
        verified_purchase=True
    )
    
    try:
        db.session.add(review)
        db.session.commit()
        
        # TODO: Send notification to merchant
        # - Email merchant about new review
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to create review'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': review.to_dict(),
        'message': 'Review created successfully'
    }), 201

