"""
Hub Model
Physical pickup locations for COD orders
"""
from datetime import datetime
from app import db


class Hub(db.Model):
    """
    Hub/outlet for COD pickup
    """
    __tablename__ = 'hubs'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Hub Information
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    phone_number = db.Column(db.String(20), nullable=False)
    operating_hours = db.Column(db.Text, nullable=True)  # e.g., "Mon-Sat: 8AM-6PM"
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    # staff_members = db.relationship('User', backref='hub', lazy='dynamic')
    # suborders = db.relationship('SubOrder', backref='hub', lazy='dynamic')
    
    def __repr__(self):
        """String representation"""
        return f'<Hub {self.name} in {self.city}>'
    
    def to_dict(self):
        """Convert hub to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'phone_number': self.phone_number,
            'operating_hours': self.operating_hours,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_id(hub_id):
        """Find hub by ID"""
        return Hub.query.get(hub_id)
    
    @staticmethod
    def get_active_hubs():
        """Get all active hubs"""
        return Hub.query.filter_by(is_active=True).order_by(Hub.name).all()