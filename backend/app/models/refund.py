"""
Refund Model
Tracks refund requests and processing
"""
from datetime import datetime
from app import db
from sqlalchemy import Enum
import enum


class RefundReason(enum.Enum):
    """Refund reason enumeration"""
    DEFECTIVE = "defective"
    WRONG_PRODUCT = "wrong_product"
    NOT_AS_DESCRIBED = "not_as_described"
    OTHER = "other"


class RefundStatus(enum.Enum):
    """Refund status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class Refund(db.Model):
    """
    Refund request model
    Tracks customer refund requests and admin decisions
    """
    __tablename__ = 'refunds'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    suborder_id = db.Column(db.Integer, db.ForeignKey('suborders.id'), nullable=False, unique=True, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Refund Request Details
    reason = db.Column(Enum(RefundReason), nullable=False)
    reason_details = db.Column(db.Text, nullable=False)
    evidence_image_url = db.Column(db.String(500), nullable=True)  # Optional photo evidence

    # Admin Decision
    status = db.Column(Enum(RefundStatus), nullable=False, default=RefundStatus.PENDING)
    admin_decision_reason = db.Column(db.Text, nullable=True)  # Reason if denied
    reviewed_by_admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Refund Processing
    refund_amount = db.Column(db.Numeric(10, 2), nullable=True)
    refund_transaction_id = db.Column(db.String(255), nullable=True)  # M-Pesa transaction ID
    processed_at = db.Column(db.DateTime, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    suborder = db.relationship('SubOrder', backref='refund', foreign_keys=[suborder_id], uselist=False)
    customer = db.relationship('User', backref='refund_requests', foreign_keys=[customer_id])
    reviewed_by = db.relationship('User', foreign_keys=[reviewed_by_admin_id])

    def __repr__(self):
        """String representation"""
        return f'<Refund {self.id} for SubOrder {self.suborder_id} - {self.status.value}>'

    def to_dict(self, include_suborder=True):
        """Convert refund to dictionary"""
        refund_dict = {
            'id': self.id,
            'suborder_id': self.suborder_id,
            'customer': {
                'id': self.customer.id,
                'name': self.customer.name,
                'email': self.customer.email
            } if self.customer else None,
            'reason': self.reason.value,
            'reason_details': self.reason_details,
            'evidence_image_url': self.evidence_image_url,
            'status': self.status.value,
            'admin_decision_reason': self.admin_decision_reason,
            'refund_amount': float(self.refund_amount) if self.refund_amount else None,
            'refund_transaction_id': self.refund_transaction_id,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_suborder and self.suborder:
            refund_dict['suborder'] = {
                'id': self.suborder.id,
                'master_order_id': self.suborder.master_order_id,
                'subtotal_amount': float(self.suborder.subtotal_amount)
            }

        if self.reviewed_by:
            refund_dict['reviewed_by'] = {
                'id': self.reviewed_by.id,
                'name': self.reviewed_by.name
            }

        return refund_dict

    @staticmethod
    def find_by_id(refund_id):
        """Find refund by ID"""
        return Refund.query.get(refund_id)

    @staticmethod
    def find_by_suborder(suborder_id):
        """Find refund by suborder ID"""
        return Refund.query.filter_by(suborder_id=suborder_id).first()

    @staticmethod
    def get_pending_refunds():
        """Get all pending refund requests"""
        return Refund.query.filter_by(status=RefundStatus.PENDING).order_by(Refund.created_at.desc()).all()
