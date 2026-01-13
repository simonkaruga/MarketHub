"""
Email Service
Send emails for notifications (order confirmations, low stock alerts, etc.)
"""
from flask import current_app, render_template_string
from flask_mail import Message
from app import mail
from threading import Thread


def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Failed to send email: {str(e)}")


def send_email(subject, recipient, body, html=None):
    """
    Send email
    
    Args:
        subject: Email subject
        recipient: Recipient email address
        body: Plain text body
        html: HTML body (optional)
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            body=body,
            html=html,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        
        # Send asynchronously to avoid blocking
        app = current_app._get_current_object()
        Thread(target=send_async_email, args=(app, msg)).start()
        
        return True
    except Exception as e:
        print(f"Email error: {str(e)}")
        return False


def send_low_stock_alert(merchant_email, merchant_name, product_name, stock_quantity):
    """
    Send low stock alert to merchant
    
    Args:
        merchant_email: Merchant's email
        merchant_name: Merchant's name
        product_name: Product name
        stock_quantity: Current stock quantity
    """
    subject = f" Low Stock Alert: {product_name}"
    
    body = f"""
Hi {merchant_name},

Your product "{product_name}" is running low on stock.

Current Stock: {stock_quantity} units

Please restock soon to avoid running out of inventory. You can update your product stock in your merchant dashboard.

Best regards,
The MarketHub Team
    """
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .alert-box {{ background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .stock-info {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2> Low Stock Alert</h2>
        
        <p>Hi {merchant_name},</p>
        
        <div class="alert-box">
            <strong>Your product is running low on stock!</strong>
        </div>
        
        <div class="stock-info">
            <p><strong>Product:</strong> {product_name}</p>
            <p><strong>Current Stock:</strong> {stock_quantity} units</p>
        </div>
        
        <p>Please restock soon to avoid running out of inventory. You can update your product stock in your merchant dashboard.</p>
        
        <div class="footer">
            <p>Best regards,<br>The MarketHub Team</p>
        </div>
    </div>
</body>
</html>
    """
    
    return send_email(subject, merchant_email, body, html)


def send_product_created_notification(merchant_email, merchant_name, product_name):
    """
    Send notification when product is successfully created
    
    Args:
        merchant_email: Merchant's email
        merchant_name: Merchant's name
        product_name: Product name
    """
    subject = f" Product Listed: {product_name}"
    
    body = f"""
Hi {merchant_name},

Your product "{product_name}" has been successfully listed on MarketHub!

Your product is now live and visible to customers. You can manage your product from your merchant dashboard.

Best regards,
The MarketHub Team
    """
    
    return send_email(subject, merchant_email, body)