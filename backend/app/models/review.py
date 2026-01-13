"""
Review Model
Customer reviews for products
"""
from datetime import datetime
from app import db
from sqlalchemy import CheckConstraint


class Review(db.Model):
    """
    Product review by customer
    """
    __tablename__ = 'reviews'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id'), nullable=False, unique=True)
    
    # Review Content
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    
    # Review Images (optional)
    image_urls = db.Column(db.JSON, nullable=True)  # Array of image URLs
    
    # Helpful Votes
    helpful_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Merchant Reply
    merchant_reply = db.Column(db.Text, nullable=True)
    merchant_reply_at = db.Column(db.DateTime, nullable=True)
    
    # Verification
    verified_purchase = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = db.relationship('Product', backref='reviews', foreign_keys=[product_id])
    customer = db.relationship('User', backref='reviews', foreign_keys=[customer_id])
    order_item = db.relationship('OrderItem', backref='review', uselist=False, foreign_keys=[order_item_id])
    
    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
    
    def __repr__(self):
        """String representation"""
        return f'<Review {self.id} - {self.rating} stars for Product {self.product_id}>'
    
    def to_dict(self, include_customer=True, include_product=False):
        """Convert review to dictionary"""
        review_dict = {
            'id': self.id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'image_urls': self.image_urls,
            'helpful_count': self.helpful_count,
            'merchant_reply': self.merchant_reply,
            'merchant_reply_at': self.merchant_reply_at.isoformat() if self.merchant_reply_at else None,
            'verified_purchase': self.verified_purchase,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_customer and self.customer:
            review_dict['customer'] = {
                'id': self.customer.id,
                'name': self.customer.name
            }
        
        if include_product and self.product:
            review_dict['product'] = {
                'id': self.product.id,
                'name': self.product.name,
                'image_url': self.product.image_url
            }
        
        return review_dict
    
    @staticmethod
    def find_by_id(review_id):
        """Find review by ID"""
        return Review.query.get(review_id)
    
    @staticmethod
    def can_customer_review(customer_id, product_id):
        """
        Check if customer can review a product
        (Must have completed order with this product, and not already reviewed)
        
        Args:
            customer_id: Customer ID
            product_id: Product ID
            
        Returns:
            tuple: (can_review, order_item_id or error_message)
        """
        from app.models.order import OrderItem, SubOrder, SubOrderStatus, MasterOrder
        
        # Find completed order item
        order_item = db.session.query(OrderItem).join(
            SubOrder, OrderItem.suborder_id == SubOrder.id
        ).join(
            MasterOrder, SubOrder.master_order_id == MasterOrder.id
        ).filter(
            MasterOrder.customer_id == customer_id,
            OrderItem.product_id == product_id,
            SubOrder.status == SubOrderStatus.COMPLETED
        ).first()
        
        if not order_item:
            return False, "You can only review products you've purchased"
        
        # Check if already reviewed
        existing_review = Review.query.filter_by(order_item_id=order_item.id).first()
        if existing_review:
            return False, "You've already reviewed this product"
        
        return True, order_item.id