"""
Payment Routes
Payment webhooks, callbacks, and payment management
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import MasterOrder, SubOrder, PaymentStatus, SubOrderStatus
from app.models.user import User
from app.services.mpesa_service import process_mpesa_callback, initiate_stk_push

# Create blueprint
bp = Blueprint('payments', __name__)


@bp.route('/mpesa/stk-push', methods=['POST'])
@jwt_required()
def initiate_mpesa_payment():
    """
    Initiate M-Pesa STK Push payment

    POST /api/v1/payments/mpesa/stk-push
    Body: { order_id: int, phone_number: string }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': {'message': 'User not found'}}), 404

        data = request.json
        order_id = data.get('order_id')
        phone_number = data.get('phone_number')

        if not order_id or not phone_number:
            return jsonify({'error': {'message': 'Order ID and phone number are required'}}), 400

        # Get order
        order = MasterOrder.query.filter_by(id=order_id, customer_id=current_user_id).first()

        if not order:
            return jsonify({'error': {'message': 'Order not found'}}), 404

        if order.payment_status == PaymentStatus.PAID:
            return jsonify({'error': {'message': 'Order already paid'}}), 400

        # Initiate STK Push
        result = initiate_stk_push(
            phone_number=phone_number,
            amount=order.total_amount,
            account_reference=f"MH{order.id}",
            transaction_desc=f"Payment for MarketHub Order #{order.id}"
        )

        if not result:
            return jsonify({'error': {'message': 'Failed to initiate M-Pesa payment. Please check your M-Pesa credentials.'}}), 500

        if result.get('success'):
            # Store checkout request ID for callback matching
            order.mpesa_checkout_request_id = result.get('checkout_request_id')
            order.payment_status = PaymentStatus.PENDING
            db.session.commit()

            return jsonify({
                'message': 'STK Push sent. Please complete payment on your phone.',
                'checkout_request_id': result.get('checkout_request_id')
            }), 200
        else:
            return jsonify({'error': {'message': result.get('error', 'STK Push failed')}}), 400

    except Exception as e:
        current_app.logger.error(f"STK Push error: {str(e)}")
        return jsonify({'error': {'message': 'Failed to initiate payment'}}), 500


@bp.route('/status/<int:order_id>', methods=['GET'])
@jwt_required()
def check_payment_status(order_id):
    """
    Check payment status for an order

    GET /api/v1/payments/status/<order_id>
    """
    try:
        current_user_id = get_jwt_identity()

        # Get order
        order = MasterOrder.query.filter_by(id=order_id, customer_id=current_user_id).first()

        if not order:
            return jsonify({'error': {'message': 'Order not found'}}), 404

        return jsonify({
            'order_id': order.id,
            'payment_status': order.payment_status.value,
            'payment_method': order.payment_method.value if order.payment_method else None,
            'mpesa_transaction_id': order.mpesa_transaction_id,
            'total_amount': float(order.total_amount)
        }), 200

    except Exception as e:
        current_app.logger.error(f"Payment status check error: {str(e)}")
        return jsonify({'error': {'message': 'Failed to check payment status'}}), 500


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """
    Get payment history for current user

    GET /api/v1/payments/history
    """
    try:
        current_user_id = get_jwt_identity()

        # Get all orders with payments
        orders = MasterOrder.query.filter_by(customer_id=current_user_id)\
            .filter(MasterOrder.payment_status != PaymentStatus.PENDING)\
            .order_by(MasterOrder.created_at.desc())\
            .all()

        payments = []
        for order in orders:
            payments.append({
                'order_id': order.id,
                'total_amount': float(order.total_amount),
                'payment_status': order.payment_status.value,
                'payment_method': order.payment_method.value if order.payment_method else None,
                'mpesa_transaction_id': order.mpesa_transaction_id,
                'created_at': order.created_at.isoformat()
            })

        return jsonify({'payments': payments}), 200

    except Exception as e:
        current_app.logger.error(f"Payment history error: {str(e)}")
        return jsonify({'error': {'message': 'Failed to get payment history'}}), 500


@bp.route('/verify/<int:order_id>', methods=['POST'])
@jwt_required()
def verify_payment(order_id):
    """
    Verify payment for an order (manual verification trigger)

    POST /api/v1/payments/verify/<order_id>
    """
    try:
        current_user_id = get_jwt_identity()

        # Get order
        order = MasterOrder.query.filter_by(id=order_id, customer_id=current_user_id).first()

        if not order:
            return jsonify({'error': {'message': 'Order not found'}}), 404

        # Return current payment status
        return jsonify({
            'order_id': order.id,
            'payment_status': order.payment_status.value,
            'is_paid': order.payment_status == PaymentStatus.PAID,
            'mpesa_transaction_id': order.mpesa_transaction_id
        }), 200

    except Exception as e:
        current_app.logger.error(f"Payment verification error: {str(e)}")
        return jsonify({'error': {'message': 'Failed to verify payment'}}), 500


@bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    M-Pesa payment callback

    POST /api/v1/payments/mpesa/callback
    """
    try:
        callback_data = request.json

        # Log callback for debugging
        current_app.logger.info(f"M-Pesa Callback received: {callback_data}")

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

                current_app.logger.info(f"Order {order.id} marked as paid")

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

                current_app.logger.info(f"Order {order.id} payment failed")

                # TODO: Send email notification to customer

            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Accepted'
            }), 200

    except Exception as e:
        current_app.logger.error(f"M-Pesa callback error: {str(e)}")
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': 'Failed'
        }), 500
