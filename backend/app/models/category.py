"""
Category Model
Product categories (Electronics, Fashion, Food, etc.)
"""
from datetime import datetime
from app import db


class Category(db.Model):
    """
    Category model for organizing products
    """
    __tablename__ = 'categories'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Category Info
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    products = db.relationship('Product', backref='category', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        """String representation"""
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'product_count': self.products.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_id(category_id):
        """Find category by ID"""
        return Category.query.get(category_id)
    
    @staticmethod
    def find_by_name(name):
        """Find category by name"""
        return Category.query.filter_by(name=name).first()
    
    @staticmethod
    def get_all():
        """Get all categories"""
        return Category.query.order_by(Category.name).all()