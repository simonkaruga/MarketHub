Product Model
Products listed by merchants
"""
from datetime import datetime
from app import db
from sqlalchemy import CheckConstraint


class Product(db.Model):
    """
    Product model for marketplace items
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
    
    # Image
    image_url = db.Column(db.String(500), nullable=True)
    image_public_id = db.Column(db.String(255), nullable=True)  # Cloudinary public ID for deletion
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    low_stock_alert_sent = db.Column(db.Boolean, default=False, nullable=False)  # Track if alert sent
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('price >= 10.00', name='check_minimum_price'),
        CheckConstraint('stock_quantity >= 0', name='check_stock_non_negative'),
    )
    
    # Relationships
    merchant = db.relationship('User', backref='products', foreign_keys=[merchant_id])
    # reviews = db.relationship('Review', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    # cart_items = db.relationship('CartItem', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    # order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')
    
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
                'name': self.merchant.name,
                'email': self.merchant.email
            }
        
        return product_dict
    
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0
    
    def is_low_stock(self):
        """Check if product has low stock (5 or fewer items)"""
        return self.stock_quantity <= 5
    
    @staticmethod
    def find_by_id(product_id):
        """Find product by ID"""
        return Product.query.get(product_id)
    
    @staticmethod
    def search_products(query=None, category_id=None, min_price=None, max_price=None, 
                       in_stock_only=True, page=1, per_page=20):
        """
        Search and filter products
        
        Args:
            query: Search term (searches name and description)
            category_id: Filter by category
            min_price: Minimum price filter
            max_price: Maximum price filter
            in_stock_only: Only show products with stock > 0
            page: Page number for pagination
            per_page: Items per page
            
        Returns:
            Pagination object with products
        """
        filters = [Product.is_active == True]
        
        # Search query
        if query:
            search_filter = db.or_(
                Product.name.ilike(f'%{query}%'),
                Product.description.ilike(f'%{query}%')
            )
            filters.append(search_filter)
        
        # Category filter
        if category_id:
            filters.append(Product.category_id == category_id)
        
        # Price filters
        if min_price is not None:
            filters.append(Product.price >= min_price)
        if max_price is not None:
            filters.append(Product.price <= max_price)
        
        # Stock filter
        if in_stock_only:
            filters.append(Product.stock_quantity > 0)
        
        # Query with filters
        query_obj = Product.query.filter(*filters)
        
        # Order by created_at (newest first)
        query_obj = query_obj.order_by(Product.created_at.desc())
        
        # Paginate
        return query_obj.paginate(page=page, per_page=per_page, error_out=False)