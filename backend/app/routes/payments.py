"""
Payment Routes
Payment webhooks and callbacks
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.order import MasterOrder, SubOrder, PaymentStatus, SubOrderStatus
from app.services.mpesa_service import process_mpesa_callback

# Create blueprint
bp = Blueprint('payments', __name__)


@bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    M-Pesa payment callback
    
    POST /api/v1/payments/mpesa/callback
    """
    try:
        callback_data = request.json
        
        # Log callback for debugging
        print(f"M-Pesa Callback received: {callback_data}")
        
        # Process callback
        payment_info = process_mpesa_callback(callback_data)
        
        if payment_info.get('success'):
            # Payment successful
            checkout_request_id = payment_info.get('checkout_request_id')
            mpesa_receipt_number = payment_info.get('mpesa_receipt_number')
            
            # Find order by checkout request ID
            order = MasterOrder.query.filter_by(
                mpesa_checkout_request_id=checkout_request_id
            ).first()
            
            if order:
                # Update order payment status
                order.payment_status = PaymentStatus.PAID
                order.mpesa_transaction_id = mpesa_receipt_number
                
                # Update all suborders to PAID_AWAITING_SHIPMENT
                for suborder in order.suborders:
                    suborder.status = SubOrderStatus.PAID_AWAITING_SHIPMENT
                
                db.session.commit()
                
                print(f"Order {order.id} marked as paid")
                
                # TODO: Send email notifications
                # - Email customer (payment confirmed)
                # - Email merchants (new order received)
            
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Accepted'
            }), 200
        
        else:
            # Payment failed
            checkout_request_id = payment_info.get('checkout_request_id')
            
            # Find and mark order as failed
            order = MasterOrder.query.filter_by(
                mpesa_checkout_request_id=checkout_request_id
            ).first()
            
            if order:
                order.payment_status = PaymentStatus.FAILED
                db.session.commit()
                
                print(f"Order {order.id} payment failed")
                
                # TODO: Send email notification to customer
            
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Accepted'
            }), 200
    
    except Exception as e:
        print(f"M-Pesa callback error: {str(e)}")
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': 'Failed'
        }), 500