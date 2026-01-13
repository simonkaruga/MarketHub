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