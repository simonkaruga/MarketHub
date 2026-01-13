"""
Product Model
Products listed by merchants
"""
from datetime import datetime
from app import db
from sqlalchemy import CheckConstraint


class Product(db.Model):
    """
    Product model for items sold by merchants
    """
    __tablename__ = 'products'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    merchant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)

    # Product Information
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(500), nullable=True)

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    merchant = db.relationship('User', backref='products', foreign_keys=[merchant_id])
    category = db.relationship('Category', backref='products', foreign_keys=[category_id])

    # Constraints
    __table_args__ = (
        CheckConstraint('price >= 10', name='check_price_minimum'),
        CheckConstraint('stock_quantity >= 0', name='check_stock_non_negative'),
    )

    def __repr__(self):
        """String representation"""
        return f'<Product {self.name} by Merchant {self.merchant_id}>'

    def to_dict(self, include_merchant=True):
        """Convert product to dictionary"""
        product_dict = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'stock_quantity': self.stock_quantity,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'category': {
                'id': self.category.id,
                'name': self.category.name
            } if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_merchant and self.merchant:
            product_dict['merchant'] = {
                'id': self.merchant.id,
                'name': self.merchant.name
            }

        return product_dict

    def get_average_rating(self):
        """
        Get average rating for this product

        Returns:
            float: Average rating (0 if no reviews)
        """
        from sqlalchemy import func
        from app.models.review import Review

        avg = db.session.query(func.avg(Review.rating)).filter_by(
            product_id=self.id
        ).scalar()

        return round(float(avg), 1) if avg else 0

    def get_review_count(self):
        """
        Get total number of reviews for this product

        Returns:
            int: Review count
        """
        from app.models.review import Review

        return Review.query.filter_by(product_id=self.id).count()

    def to_dict_with_reviews(self, include_merchant=True):
        """
        Convert product to dictionary including review stats

        Returns:
            dict: Product data with review statistics
        """
        product_dict = self.to_dict(include_merchant=include_merchant)
        product_dict['rating'] = {
            'average': self.get_average_rating(),
            'count': self.get_review_count()
        }
        return product_dict

    @staticmethod
    def find_by_id(product_id):
        """Find product by ID"""
        return Product.query.get(product_id)
