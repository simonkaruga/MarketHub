"""
Cart Models
Shopping cart and cart items
"""
from datetime import datetime
from app import db


class Cart(db.Model):
    """
    Shopping cart - one per user
    """
    __tablename__ = 'carts'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('cart', uselist=False))
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        """String representation"""
        return f'<Cart for User {self.user_id}>'
    
    def get_total(self):
        """
        Calculate total cart value
        
        Returns:
            float: Total cart value
        """
        total = 0
        for item in self.items:
            total += float(item.product.price) * item.quantity
        return total
    
    def get_item_count(self):
        """
        Get total number of items in cart
        
        Returns:
            int: Total quantity of all items
        """
        return sum(item.quantity for item in self.items)
    
    def to_dict(self):
        """Convert cart to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': [item.to_dict() for item in self.items],
            'total': self.get_total(),
            'item_count': self.get_item_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def get_or_create_cart(user_id):
        """
        Get user's cart or create if doesn't exist
        
        Args:
            user_id: User ID
            
        Returns:
            Cart: User's cart
        """
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        
        return cart


class CartItem(db.Model):
    """
    Cart item - product in cart with quantity
    """
    __tablename__ = 'cart_items'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    
    # Cart Item Info
    quantity = db.Column(db.Integer, nullable=False, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = db.relationship('Product', backref='cart_items')
    
    # Unique constraint: one product per cart
    __table_args__ = (
        db.UniqueConstraint('cart_id', 'product_id', name='unique_cart_product'),
    )
    
    def __repr__(self):
        """String representation"""
        return f'<CartItem {self.quantity}x Product {self.product_id} in Cart {self.cart_id}>'
    
    def get_subtotal(self):
        """
        Calculate subtotal for this cart item
        
        Returns:
            float: Subtotal (price * quantity)
        """
        return float(self.product.price) * self.quantity
    
    def to_dict(self):
        """Convert cart item to dictionary"""
        return {
            'id': self.id,
            'product': {
                'id': self.product.id,
                'name': self.product.name,
                'price': float(self.product.price),
                'image_url': self.product.image_url,
                'stock_quantity': self.product.stock_quantity,
                'is_active': self.product.is_active,
                'merchant': {
                    'id': self.product.merchant.id,
                    'name': self.product.merchant.name
                } if self.product.merchant else None
            },
            'quantity': self.quantity,
            'subtotal': self.get_subtotal(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_id(cart_item_id):
        """Find cart item by ID"""
        return CartItem.query.get(cart_item_id)
    
    @staticmethod
    def find_in_cart(cart_id, product_id):
        """
        Find specific product in cart
        
        Args:
            cart_id: Cart ID
            product_id: Product ID
            
        Returns:
            CartItem: Cart item or None
        """
        return CartItem.query.filter_by(cart_id=cart_id, product_id=product_id).first()