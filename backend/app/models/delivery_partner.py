"""
DeliveryPartner Model
Delivery services (e.g., SACCOs)
"""
from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import JSON


class DeliveryPartner(db.Model):
    """
    Delivery partner (SACCO, courier service)
    """
    __tablename__ = 'delivery_partners'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Partner Information
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    contact_phone = db.Column(db.String(20), nullable=False)
    coverage_areas = db.Column(JSON, nullable=False)  # Array of cities: ["Nairobi", "Kiambu"]
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    # suborders = db.relationship('SubOrder', backref='delivery_partner', lazy='dynamic')
    
    def __repr__(self):
        """String representation"""
        return f'<DeliveryPartner {self.name}>'
    
    def to_dict(self):
        """Convert partner to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'contact_phone': self.contact_phone,
            'coverage_areas': self.coverage_areas,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def find_by_id(partner_id):
        """Find partner by ID"""
        return DeliveryPartner.query.get(partner_id)
    
    @staticmethod
    def find_for_city(city):
        """
        Find active delivery partners that cover a city
        
        Args:
            city: City name
            
        Returns:
            list: List of delivery partners
        """
        # Find partners where city is in coverage_areas JSON array
        partners = DeliveryPartner.query.filter(
            DeliveryPartner.is_active == True,
            DeliveryPartner.coverage_areas.contains([city])
        ).all()
        
        return partners