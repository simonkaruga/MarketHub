"""
MerchantApplication Model
User applications to become merchants
"""
from datetime import datetime
from app import db
from sqlalchemy import Enum
import enum


class ApplicationStatus(enum.Enum):
    """Application status enumeration"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class MerchantApplication(db.Model):
    """
    Merchant application
    """
    __tablename__ = 'merchant_applications'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Business Information
    business_name = db.Column(db.String(200), nullable=False)
    business_type = db.Column(db.String(100), nullable=False)  # e.g., "Sole Proprietor", "Limited Company"
    business_registration_number = db.Column(db.String(100), nullable=True)
    tax_identification_number = db.Column(db.String(100), nullable=True)
    
    # Contact Information
    business_phone = db.Column(db.String(20), nullable=False)
    business_email = db.Column(db.String(120), nullable=False)
    business_address = db.Column(db.Text, nullable=False)
    business_city = db.Column(db.String(100), nullable=False)
    
    # Bank Information (for payouts)
    bank_name = db.Column(db.String(100), nullable=False)
    bank_account_number = db.Column(db.String(50), nullable=False)
    bank_account_name = db.Column(db.String(200), nullable=False)
    
    # Additional Information
    years_in_business = db.Column(db.Integer, nullable=True)
    product_categories = db.Column(db.JSON, nullable=False)  # Array of category names
    expected_monthly_sales = db.Column(db.String(50), nullable=True)  # e.g., "10000-50000"
    application_notes = db.Column(db.Text, nullable=True)
    
    # Document URLs (Cloudinary)
    business_license_url = db.Column(db.String(500), nullable=True)
    id_document_url = db.Column(db.String(500), nullable=True)
    tax_certificate_url = db.Column(db.String(500), nullable=True)
    
    # Application Status
    status = db.Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING)
    
    # Admin Review
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    admin_notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='merchant_applications', foreign_keys=[user_id])
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])
    
    def __repr__(self):
        """String representation"""
        return f'<MerchantApplication {self.id} - {self.business_name}>'
    
    def to_dict(self, include_sensitive=False):
        """
        Convert application to dictionary
        
        Args:
            include_sensitive: Include bank details (admin only)
        """
        app_dict = {
            'id': self.id,
            'user': {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email
            } if self.user else None,
            'business_name': self.business_name,
            'business_type': self.business_type,
            'business_registration_number': self.business_registration_number,
            'tax_identification_number': self.tax_identification_number,
            'business_phone': self.business_phone,
            'business_email': self.business_email,
            'business_address': self.business_address,
            'business_city': self.business_city,
            'years_in_business': self.years_in_business,
            'product_categories': self.product_categories,
            'expected_monthly_sales': self.expected_monthly_sales,
            'application_notes': self.application_notes,
            'business_license_url': self.business_license_url,
            'id_document_url': self.id_document_url,
            'tax_certificate_url': self.tax_certificate_url,
            'status': self.status.value,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include sensitive info for admin
        if include_sensitive:
            app_dict['bank_name'] = self.bank_name
            app_dict['bank_account_number'] = self.bank_account_number
            app_dict['bank_account_name'] = self.bank_account_name
            app_dict['admin_notes'] = self.admin_notes
            
            if self.reviewer:
                app_dict['reviewer'] = {
                    'id': self.reviewer.id,
                    'name': self.reviewer.name
                }
            
            app_dict['reviewed_at'] = self.reviewed_at.isoformat() if self.reviewed_at else None
        
        return app_dict
    
    @staticmethod
    def find_by_id(application_id):
        """Find application by ID"""
        return MerchantApplication.query.get(application_id)
    
    @staticmethod
    def find_by_user(user_id):
        """Find user's latest application"""
        return MerchantApplication.query.filter_by(user_id=user_id).order_by(
            MerchantApplication.created_at.desc()
        ).first()