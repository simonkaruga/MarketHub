"""
Email Service
Send transactional emails using Flask-Mail
"""
from flask import current_app, render_template_string
from flask_mail import Mail, Message
from threading import Thread
from app.utils.email_templates import (
    get_welcome_email_template,
    get_order_confirmation_template,
    get_order_status_update_template,
    get_payment_confirmation_template,
    get_review_reminder_template,
    get_merchant_application_status_template,
    get_password_reset_template
)

mail = Mail()


def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Email sending error: {str(e)}")


def send_email(subject, recipients, html_body, text_body=None):
    """
    Send email
    
    Args:
        subject: Email subject
        recipients: List of recipient emails
        html_body: HTML email body
        text_body: Plain text fallback (optional)
    """
    try:
        msg = Message(
            subject=subject,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
            recipients=recipients if isinstance(recipients, list) else [recipients]
        )
        
        msg.html = html_body
        if text_body:
            msg.body = text_body
        
        # Send asynchronously
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
        
        return True
    except Exception as e:
        print(f"Email preparation error: {str(e)}")
        return False


def send_welcome_email(user):
    """Send welcome email to new user"""
    html = get_welcome_email_template(user.name)
    
    return send_email(
        subject="Welcome to MarketHub!",
        recipients=user.email,
        html_body=html
    )


def send_order_confirmation_email(order):
    """Send order confirmation email"""
    customer = order.customer
    html = get_order_confirmation_template(customer.name, order)
    
    return send_email(
        subject=f"Order Confirmation - Order #{order.id}",
        recipients=customer.email,
        html_body=html
    )


def send_order_status_update_email(suborder):
    """Send order status update email"""
    customer = suborder.master_order.customer
    html = get_order_status_update_template(customer.name, suborder)
    
    return send_email(
        subject=f"Order Update - Order #{suborder.master_order_id}",
        recipients=customer.email,
        html_body=html
    )


def send_payment_confirmation_email(order):
    """Send payment confirmation email"""
    customer = order.customer
    html = get_payment_confirmation_template(customer.name, order)
    
    return send_email(
        subject=f"Payment Received - Order #{order.id}",
        recipients=customer.email,
        html_body=html
    )


def send_merchant_new_order_email(merchant, suborder):
    """Send new order notification to merchant"""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">New Order Received!</h2>
        <p>Hi {merchant.name},</p>
        <p>You have received a new order on MarketHub.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #{suborder.id}</p>
            <p><strong>Status:</strong> {suborder.status.value}</p>
            <p><strong>Subtotal:</strong> KES {float(suborder.subtotal_amount):,.2f}</p>
            <p><strong>Your Payout:</strong> KES {float(suborder.merchant_payout_amount):,.2f}</p>
        </div>
        
        <p>Please log in to your merchant dashboard to view and process this order.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
    </body>
    </html>
    """
    
    return send_email(
        subject=f"New Order #{suborder.id} - Action Required",
        recipients=merchant.email,
        html_body=html
    )


def send_review_reminder_email(customer, order_item):
    """Send review reminder email"""
    html = get_review_reminder_template(customer.name, order_item.product)
    
    return send_email(
        subject="How was your recent purchase?",
        recipients=customer.email,
        html_body=html
    )


def send_merchant_application_status_email(user, application):
    """Send merchant application status update"""
    html = get_merchant_application_status_template(user.name, application)
    
    status_text = "Approved" if application.status.value == "approved" else "Needs Revision"
    
    return send_email(
        subject=f"Merchant Application {status_text}",
        recipients=user.email,
        html_body=html
    )


def send_password_reset_email(user, reset_token):
    """Send password reset email"""
    html = get_password_reset_template(user.name, reset_token)
    
    return send_email(
        subject="Reset Your Password - MarketHub",
        recipients=user.email,
        html_body=html
    )


def send_low_stock_alert_email(merchant, product):
    """Send low stock alert to merchant"""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Alert</h2>
        <p>Hi {merchant.name},</p>
        <p>One of your products is running low on stock:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>{product.name}</h3>
            <p><strong>Current Stock:</strong> {product.stock_quantity} units</p>
            <p><strong>Price:</strong> KES {float(product.price):,.2f}</p>
        </div>
        
        <p>Please restock this product to avoid missing sales opportunities.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
    </body>
    </html>
    """
    
    return send_email(
        subject=f"Low Stock Alert - {product.name}",
        recipients=merchant.email,
        html_body=html
    )


def send_order_cancelled_email(order, cancellation_reason):
    """Send order cancellation confirmation"""
    customer = order.customer
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Hi {customer.name},</p>
        <p>Your order has been cancelled as requested.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Total Amount:</strong> KES {float(order.total_amount):,.2f}</p>
            <p><strong>Cancellation Reason:</strong> {cancellation_reason}</p>
        </div>
        
        <p>If you paid via M-Pesa, your refund will be processed within 3-5 business days.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
    </body>
    </html>
    """
    
    return send_email(
        subject=f"Order #{order.id} Cancelled",
        recipients=customer.email,
        html_body=html
    )