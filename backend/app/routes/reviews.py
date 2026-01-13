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

@bp.route('/<int:review_id>', methods=['PUT'])
@role_required(UserRole.CUSTOMER)
def update_review(current_user, review_id):
    """
    Update a review
    
    PUT /api/v1/reviews/:id
    Headers: Authorization: Bearer <customer_token>
    Body: {
        "rating": 4,
        "title": "Updated title",
        "comment": "Updated comment"
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
    
    # Check ownership
    if review.customer_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only update your own reviews'
            }
        }), 403
    
    try:
        data = update_review_schema.load(request.json)
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
        setattr(review, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update review'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': review.to_dict(),
        'message': 'Review updated successfully'
    }), 200


@bp.route('/<int:review_id>', methods=['DELETE'])
@role_required(UserRole.CUSTOMER)
def delete_review(current_user, review_id):
    """
    Delete a review
    
    DELETE /api/v1/reviews/:id
    Headers: Authorization: Bearer <customer_token>
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
    
    # Check ownership
    if review.customer_id != current_user.id:
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'You can only delete your own reviews'
            }
        }), 403
    
    try:
        db.session.delete(review)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to delete review'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Review deleted successfully'
    }), 200


@bp.route('/<int:review_id>/helpful', methods=['POST'])
@role_required(UserRole.CUSTOMER)
def mark_helpful(current_user, review_id):
    """
    Mark review as helpful
    
    POST /api/v1/reviews/:id/helpful
    Headers: Authorization: Bearer <customer_token>
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
    
    # Increment helpful count
    review.helpful_count += 1
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'Failed to update review'
            }
        }), 500
    
    return jsonify({
        'success': True,
        'data': {'helpful_count': review.helpful_count},
        'message': 'Review marked as helpful'
    }), 200


@bp.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """
    Get all reviews for a product (PUBLIC)
    
    GET /api/v1/products/:id/reviews?sort=recent&rating=5
    
    Query Parameters:
    - sort: recent (default) | helpful | rating_high | rating_low
    - rating: Filter by rating (1-5)
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 50)
    """
    # Check if product exists
    product = Product.find_by_id(product_id)
    if not product:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PRODUCT_NOT_FOUND',
                'message': 'Product not found'
            }
        }), 404
    
    # Base query
    query = Review.query.filter_by(product_id=product_id)
    
    # Filter by rating if provided
    rating_filter = request.args.get('rating', type=int)
    if rating_filter and 1 <= rating_filter <= 5:
        query = query.filter_by(rating=rating_filter)
    
    # Sort
    sort_by = request.args.get('sort', 'recent')
    if sort_by == 'helpful':
        query = query.order_by(desc(Review.helpful_count), desc(Review.created_at))
    elif sort_by == 'rating_high':
        query = query.order_by(desc(Review.rating), desc(Review.created_at))
    elif sort_by == 'rating_low':
        query = query.order_by(Review.rating, desc(Review.created_at))
    else:  # recent (default)
        query = query.order_by(desc(Review.created_at))
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Calculate rating distribution
    rating_stats = db.session.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).filter_by(product_id=product_id).group_by(Review.rating).all()
    
    rating_distribution = {str(i): 0 for i in range(1, 6)}
    for rating, count in rating_stats:
        rating_distribution[str(rating)] = count
    
    # Calculate average rating
    avg_rating = db.session.query(func.avg(Review.rating)).filter_by(product_id=product_id).scalar()
    
    return jsonify({
        'success': True,
        'data': {
            'reviews': [review.to_dict() for review in pagination.items],
            'statistics': {
                'average_rating': round(float(avg_rating), 1) if avg_rating else 0,
                'total_reviews': pagination.total,
                'rating_distribution': rating_distribution
            },
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_pages': pagination.pages,
                'total_items': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200


@bp.route('/merchants/<int:merchant_id>/reviews', methods=['GET'])
def get_merchant_reviews(merchant_id):
    """
    Get all reviews for a merchant's products (PUBLIC)
    
    GET /api/v1/merchants/:id/reviews
    """
    # Check if merchant exists
    merchant = User.query.get(merchant_id)
    if not merchant or merchant.role != UserRole.MERCHANT:
        return jsonify({
            'success': False,
            'error': {
                'code': 'MERCHANT_NOT_FOUND',
                'message': 'Merchant not found'
            }
        }), 404
    
    # Get all reviews for merchant's products
    reviews = db.session.query(Review).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == merchant_id
    ).order_by(desc(Review.created_at)).all()
    
    # Calculate average rating
    avg_rating = db.session.query(func.avg(Review.rating)).join(
        Product, Review.product_id == Product.id
    ).filter(Product.merchant_id == merchant_id).scalar()
    
    return jsonify({
        'success': True,
        'data': {
            'merchant': {
                'id': merchant.id,
                'name': merchant.name
            },
            'reviews': [review.to_dict(include_product=True) for review in reviews],
            'statistics': {
                'average_rating': round(float(avg_rating), 1) if avg_rating else 0,
                'total_reviews': len(reviews)
            }
        }
    }), 200

