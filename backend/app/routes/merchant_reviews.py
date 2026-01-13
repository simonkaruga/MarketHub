"""
Merchant Reviews Routes
Merchant review management and replies
"""
from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from sqlalchemy import desc
from datetime import datetime
from app import db
from app.models.review import Review
from app.models.product import Product
from app.utils.decorators import merchant_required

# Create blueprint
bp = Blueprint('merchant_reviews', __name__)


# Validation Schema
class ReplyToReviewSchema(Schema):
    """Schema for replying to a review"""
    reply = fields.Str(required=True, validate=validate.Length(min=10, max=1000))


reply_schema = ReplyToReviewSchema()


@bp.route('/reviews', methods=['GET'])
@merchant_required
def get_merchant_reviews_route(current_user):
    """
    Get all reviews for merchant's products
    
    GET /api/v1/merchant/reviews
    Headers: Authorization: Bearer <merchant_token>
    """
    # Get all reviews for merchant's products
    reviews = db.session.query(Review).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == current_user.id
    ).order_by(desc(Review.created_at)).all()
    
    return jsonify({
        'success': True,
        'data': [review.to_dict(include_product=True) for review in reviews]
    }), 200


@bp.route('/reviews/<int:review_id>/reply', methods=['POST'])
@merchant_required
def reply_to_review(current_user, review_id):
    """
    Reply to a review
    
    POST /api/v1/merchant/reviews/:id/reply
    Headers: Authorization: Bearer <merchant_token>
    Body: {
        "reply": "Thank you for your feedback! We're glad you enjoyed the product."
    }
    """
    review = Review.find_by_id(review_id)
    
    if not review:
        return jsonify({
            'success': False,
            'error': {
                'code': 'REVIEW_NOT_FOUND',
                'message': 'Review not found'
            }
        }), 404
    
    # Check if review is for merchant's product
    if review.product.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only reply to reviews of your own products'
            }
        }), 403
    
    try:
        data = reply_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': err.messages
            }
        }), 400
    
    # Add or update reply
    review.merchant_reply = data['reply']
    review.merchant_reply_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # TODO: Send notification to customer
        # - Email customer: "Merchant replied to your review"
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to add reply'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': review.to_dict(include_product=True),
        'message': 'Reply added successfully'
    }), 200


@bp.route('/reviews/<int:review_id>/reply', methods=['DELETE'])
@merchant_required
def delete_reply(current_user, review_id):
    """
    Delete reply to a review
    
    DELETE /api/v1/merchant/reviews/:id/reply
    Headers: Authorization: Bearer <merchant_token>
    """
    review = Review.find_by_id(review_id)
    
    if not review:
        return jsonify({
            'success': False,
            'error': {
                'code': 'REVIEW_NOT_FOUND',
                'message': 'Review not found'
            }
        }), 404
    
    # Check if review is for merchant's product
    if review.product.merchant_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only manage replies to your own products'
            }
        }), 403
    
    # Remove reply
    review.merchant_reply = None
    review.merchant_reply_at = None
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to delete reply'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Reply deleted successfully'
    }), 200