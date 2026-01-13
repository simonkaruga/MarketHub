from datetime import datetime
from app import db, bcrypt
from sqlalchemy import Enum
import enum


class UserRole(enum.Enum):
    """User role enumeration"""
    CUSTOMER = "customer"
    MERCHANT = "merchant"
    HUB_STAFF = "hub_staff"
    ADMIN = "admin"


class User(db.Model):
    """
    User model for all user types in the system
    """
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Authentication fields
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Basic Information
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    
    # Role and Status
    role = db.Column(Enum(UserRole), nullable=False, default=UserRole.CUSTOMER)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Password Reset
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    # Hub Staff Assignment (only for hub_staff role)
    hub_id = db.Column(db.Integer, db.ForeignKey('hubs.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships (we'll add these as we create other models)
    # products = db.relationship('Product', backref='merchant', lazy='dynamic')
    # master_orders = db.relationship('MasterOrder', backref='customer', lazy='dynamic')
    # reviews = db.relationship('Review', backref='customer', lazy='dynamic')
    # cart = db.relationship('Cart', backref='user', uselist=False)
    # merchant_application = db.relationship('MerchantApplication', backref='user', uselist=False)
    # hub = db.relationship('Hub', backref='staff_members')
    
    def __repr__(self):
        """String representation"""
        return f'<User {self.email} ({self.role.value})>'
    
    def set_password(self, password):
        """
        Hash and set the user's password
        
        Args:
            password (str): Plain text password
        """
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """
        Verify the user's password
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """
        Convert user to dictionary (for JSON responses)
        Excludes sensitive information like password_hash
        
        Returns:
            dict: User data as dictionary
        """
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone_number': self.phone_number,
            'role': self.role.value,
            'is_active': self.is_active,
            'hub_id': self.hub_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_email(email):
        """
        Find user by email
        
        Args:
            email (str): User's email address
            
        Returns:
            User: User object or None
        """
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_id(user_id):
        """
        Find user by ID

        Args:
            user_id (int): User's ID

        Returns:
            User: User object or None
        """
        return User.query.get(user_id)