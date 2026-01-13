"""
Order Models
MasterOrder (customer's complete order), SubOrder (per merchant), OrderItem
"""
from datetime import datetime, timedelta
from app import db
from sqlalchemy import Enum, CheckConstraint
import enum


class PaymentMethod(enum.Enum):
    """Payment method enumeration"""
    MPESA_DELIVERY = "mpesa_delivery"  # M-Pesa with direct delivery
    COD = "cash_on_delivery"  # Cash at hub pickup


class PaymentStatus(enum.Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubOrderStatus(enum.Enum):
    """SubOrder status enumeration"""
    # M-Pesa orders
    PENDING_PAYMENT = "pending_payment"
    PAID_AWAITING_SHIPMENT = "paid_awaiting_shipment"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    
    # COD orders
    PENDING_MERCHANT_DELIVERY = "pending_merchant_delivery"
    AT_HUB_VERIFICATION_PENDING = "at_hub_verification_pending"
    AT_HUB_READY_FOR_PICKUP = "at_hub_ready_for_pickup"
    PAYMENT_RECEIVED_READY_FOR_COLLECTION = "payment_received_ready_for_collection"
    
    # Both
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"  # COD pickup window expired


class MasterOrder(db.Model):
    """
    Master order - customer's complete order
    May contain products from multiple merchants
    """
    __tablename__ = 'master_orders'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Order Information
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(Enum(PaymentMethod), nullable=False)
    payment_status = db.Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    
    # M-Pesa Details (if payment_method is MPESA_DELIVERY)
    mpesa_phone_number = db.Column(db.String(20), nullable=True)
    mpesa_transaction_id = db.Column(db.String(255), nullable=True)
    mpesa_checkout_request_id = db.Column(db.String(255), nullable=True)
    
    # Delivery Details (if payment_method is MPESA_DELIVERY)
    delivery_address = db.Column(db.Text, nullable=True)
    delivery_city = db.Column(db.String(100), nullable=True)
    
    # Hub Details (if payment_method is COD)
    selected_hub_id = db.Column(db.Integer, db.ForeignKey('hubs.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    customer = db.relationship('User', backref='master_orders', foreign_keys=[customer_id])
    selected_hub = db.relationship('Hub', backref='master_orders', foreign_keys=[selected_hub_id])
    suborders = db.relationship('SubOrder', backref='master_order', lazy='dynamic', cascade='all, delete-orphan')

       # Cancellation fields
    is_cancelled = db.Column(db.Boolean, default=False, nullable=False)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    cancellation_reason = db.Column(db.Text, nullable=True)
    refund_status = db.Column(db.String(50), nullable=True)  # 'pending', 'processing', 'completed', 'failed'
    refund_amount = db.Column(db.Numeric(10, 2), nullable=True)
    refund_processed_at = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        """String representation"""
        return f'<MasterOrder {self.id} for Customer {self.customer_id}>'
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'customer': {
                'id': self.customer.id,
                'name': self.customer.name,
                'email': self.customer.email
            } if self.customer else None,
            'is_cancelled': self.is_cancelled,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'refund_status': self.refund_status,
            'refund_amount': float(self.refund_amount) if self.refund_amount else None,
            'total_amount': float(self.total_amount),
            'payment_method': self.payment_method.value,
            'payment_status': self.payment_status.value,
            'mpesa_phone_number': self.mpesa_phone_number,
            'mpesa_transaction_id': self.mpesa_transaction_id,
            'delivery_address': self.delivery_address,
            'delivery_city': self.delivery_city,
            'selected_hub': self.selected_hub.to_dict() if self.selected_hub else None,
            'suborders': [suborder.to_dict() for suborder in self.suborders],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class SubOrder(db.Model):
    """
    Sub-order - contains items from one merchant
    Each MasterOrder can have multiple SubOrders
    """
    __tablename__ = 'suborders'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    master_order_id = db.Column(db.Integer, db.ForeignKey('master_orders.id'), nullable=False, index=True)
    merchant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    hub_id = db.Column(db.Integer, db.ForeignKey('hubs.id'), nullable=True)
    delivery_partner_id = db.Column(db.Integer, db.ForeignKey('delivery_partners.id'), nullable=True)
    
    # Order Details
    status = db.Column(Enum(SubOrderStatus), nullable=False)
    subtotal_amount = db.Column(db.Numeric(10, 2), nullable=False)
    commission_amount = db.Column(db.Numeric(10, 2), nullable=False)  # 25% of subtotal
    merchant_payout_amount = db.Column(db.Numeric(10, 2), nullable=False)  # subtotal - commission
    
    # Payout
    merchant_paid_at = db.Column(db.DateTime, nullable=True)
    
    # COD Details
    pickup_deadline = db.Column(db.DateTime, nullable=True)  # created_at + 5 days for COD
    rejection_reason = db.Column(db.Text, nullable=True)  # If hub rejects product
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    merchant = db.relationship('User', backref='suborders_as_merchant', foreign_keys=[merchant_id])
    hub = db.relationship('Hub', backref='suborders', foreign_keys=[hub_id])
    delivery_partner = db.relationship('DeliveryPartner', backref='suborders', foreign_keys=[delivery_partner_id])
    items = db.relationship('OrderItem', backref='suborder', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        """String representation"""
        return f'<SubOrder {self.id} - Merchant {self.merchant_id}>'
    
    def to_dict(self, include_merchant=True):
        """Convert to dictionary"""
        suborder_dict = {
            'id': self.id,
            'master_order_id': self.master_order_id,
            'status': self.status.value,
            'subtotal_amount': float(self.subtotal_amount),
            'commission_amount': float(self.commission_amount),
            'merchant_payout_amount': float(self.merchant_payout_amount),
            'merchant_paid_at': self.merchant_paid_at.isoformat() if self.merchant_paid_at else None,
            'pickup_deadline': self.pickup_deadline.isoformat() if self.pickup_deadline else None,
            'rejection_reason': self.rejection_reason,
            'hub': self.hub.to_dict() if self.hub else None,
            'delivery_partner': self.delivery_partner.to_dict() if self.delivery_partner else None,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_merchant and self.merchant:
            suborder_dict['merchant'] = {
                'id': self.merchant.id,
                'name': self.merchant.name,
                'email': self.merchant.email,
                'phone_number': self.merchant.phone_number
            }
        
        return suborder_dict


class OrderItem(db.Model):
    """
    Order item - product in a SubOrder
    """
    __tablename__ = 'order_items'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    suborder_id = db.Column(db.Integer, db.ForeignKey('suborders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    
    # Order Item Details
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Numeric(10, 2), nullable=False)  # Price when ordered (snapshot)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = db.relationship('Product', backref='order_items', foreign_keys=[product_id])
    
    # Constraints
    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )
    
    def __repr__(self):
        """String representation"""
        return f'<OrderItem {self.quantity}x Product {self.product_id}>'
    
    def get_subtotal(self):
        """Calculate item subtotal"""
        return float(self.price_at_purchase) * self.quantity
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'product': {
                'id': self.product.id,
                'name': self.product.name,
                'image_url': self.product.image_url
            } if self.product else None,
            'quantity': self.quantity,
            'price_at_purchase': float(self.price_at_purchase),
            'subtotal': self.get_subtotal(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }