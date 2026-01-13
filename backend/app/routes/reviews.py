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
