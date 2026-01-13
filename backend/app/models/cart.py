"""
Cart Models
Shopping cart for customers
"""
from datetime import datetime
from app import db
from sqlalchemy import CheckConstraint, UniqueConstraint


class Cart(db.Model):
    """
    Shopping cart - one per customer
    """
    __tablename__ = 'carts'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', backref='cart', foreign_keys=[user_id], uselist=False)
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        """String representation"""
        return f'<Cart {self.id} for User {self.user_id}>'

    def get_total(self):
        """
        Calculate total cart value

        Returns:
            float: Total amount
        """
        total = 0
        for item in self.items:
            if item.product and item.product.is_active:
                total += float(item.product.price) * item.quantity
        return total

    def get_item_count(self):
        """
        Get total number of items in cart

        Returns:
            int: Total quantity of all items
        """
        count = 0
        for item in self.items:
            count += item.quantity
        return count

    def to_dict(self):
        """Convert cart to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': [item.to_dict() for item in self.items if item.product],
            'total': self.get_total(),
            'item_count': self.get_item_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def get_or_create_cart(user_id):
        """
        Get existing cart or create new one for user

        Args:
            user_id (int): User's ID

        Returns:
            Cart: User's cart
        """
        cart = Cart.query.filter_by(user_id=user_id).first()

        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()

        return cart

    @staticmethod
    def find_by_id(cart_id):
        """
        Find cart by ID

        Args:
            cart_id (int): Cart ID

        Returns:
            Cart: Cart object or None
        """
        return Cart.query.get(cart_id)

    @staticmethod
    def find_by_user(user_id):
        """
        Find cart by user ID

        Args:
            user_id (int): User's ID

        Returns:
            Cart: Cart object or None
        """
        return Cart.query.filter_by(user_id=user_id).first()


class CartItem(db.Model):
    """
    Cart item - product in a cart with quantity
    """
    __tablename__ = 'cart_items'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)

    # Cart Item Details
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    product = db.relationship('Product', backref='cart_items', foreign_keys=[product_id])

    # Constraints
    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_cart_item_quantity_positive'),
        UniqueConstraint('cart_id', 'product_id', name='unique_cart_product'),
    )

    def __repr__(self):
        """String representation"""
        return f'<CartItem {self.quantity}x Product {self.product_id}>'

    def get_subtotal(self):
        """
        Calculate item subtotal

        Returns:
            float: Subtotal (price * quantity)
        """
        if self.product:
            return float(self.product.price) * self.quantity
        return 0

    def to_dict(self):
        """Convert cart item to dictionary"""
        return {
            'id': self.id,
            'cart_id': self.cart_id,
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
            } if self.product else None,
            'quantity': self.quantity,
            'subtotal': self.get_subtotal(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def find_by_id(cart_item_id):
        """
        Find cart item by ID

        Args:
            cart_item_id (int): Cart item ID

        Returns:
            CartItem: CartItem object or None
        """
        return CartItem.query.get(cart_item_id)

    @staticmethod
    def find_by_cart_and_product(cart_id, product_id):
        """
        Find cart item by cart and product

        Args:
            cart_id (int): Cart ID
            product_id (int): Product ID

        Returns:
            CartItem: CartItem object or None
        """
        return CartItem.query.filter_by(
            cart_id=cart_id,
            product_id=product_id
        ).first()

    @staticmethod
    def find_in_cart(cart_id, product_id):
        """
        Alias for find_by_cart_and_product
        Find cart item by cart and product

        Args:
            cart_id (int): Cart ID
            product_id (int): Product ID

        Returns:
            CartItem: CartItem object or None
        """
        return CartItem.find_by_cart_and_product(cart_id, product_id)
