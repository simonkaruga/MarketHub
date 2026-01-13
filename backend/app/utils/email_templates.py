"""
Email Templates
HTML email templates for transactional emails
"""


def get_welcome_email_template(user_name):
    """Welcome email for new users"""
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to MarketHub!</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {user_name},</p>
            
            <p>Welcome to MarketHub - Kenya's premier online marketplace! We're excited to have you join our community.</p>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2563eb; margin-top: 0;">What you can do on MarketHub:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Browse thousands of products from verified merchants</li>
                    <li>Shop with confidence using M-Pesa or Cash on Delivery</li>
                    <li>Track your orders in real-time</li>
                    <li>Leave reviews and help the community</li>
                    <li>Enjoy secure and convenient pickup at our hubs</li>
                </ul>
            </div>
            
            <p><strong>Interested in selling?</strong> Apply to become a merchant and reach thousands of customers across Kenya!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://markethub.co.ke" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Shopping</a>
            </div>
            
            <p style="margin-top: 30px;">Happy shopping!</p>
            <p>The MarketHub Team</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">MarketHub - Buy & Sell with Confidence</p>
            <p style="margin: 5px 0;">Nairobi, Kenya | support@markethub.co.ke</p>
        </div>
    </body>
    </html>
    """


def get_order_confirmation_template(customer_name, order):
    """Order confirmation email"""
    items_html = ""
    for suborder in order.suborders:
        for item in suborder.items:
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{item.product.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES {float(item.price_at_purchase):,.2f}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES {item.get_subtotal():,.2f}</td>
            </tr>
            """
    
    payment_method = "M-Pesa" if order.payment_method.value == "mpesa_delivery" else "Cash on Delivery"
    
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Order Confirmed! ✓</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {customer_name},</p>
            
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Summary</h3>
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Payment Method:</strong> {payment_method}</p>
                <p><strong>Order Date:</strong> {order.created_at.strftime('%B %d, %Y')}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                        <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">KES {float(order.total_amount):,.2f}</td>
                    </tr>
                </tfoot>
            </table>
            
            <p>We'll send you updates as your order progresses.</p>
            
            <p style="margin-top: 30px;">Thank you for shopping with MarketHub!</p>
            <p>The MarketHub Team</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Need help? Contact us at support@markethub.co.ke</p>
        </div>
    </body>
    </html>
    """


def get_order_status_update_template(customer_name, suborder):
    """Order status update email"""
    status_messages = {
        'paid_awaiting_shipment': 'Your order has been paid and is awaiting shipment.',
        'shipped': 'Your order has been shipped!',
        'in_transit': 'Your order is on the way!',
        'delivered': 'Your order has been delivered!',
        'at_hub_ready_for_pickup': 'Your order is ready for pickup at the hub!',
        'completed': 'Your order is complete. Thank you!'
    }
    
    message = status_messages.get(suborder.status.value, 'Your order status has been updated.')
    
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Order Update</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {customer_name},</p>
            
            <p>{message}</p>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> #{suborder.master_order_id}</p>
                <p><strong>Status:</strong> {suborder.status.value.replace('_', ' ').title()}</p>
            </div>
            
            <p>Track your order anytime by logging into your account.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
        </div>
    </body>
    </html>
    """


def get_payment_confirmation_template(customer_name, order):
    """Payment confirmation email"""
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Received ✓</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {customer_name},</p>
            
            <p>We've received your payment for Order #{order.id}.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount Paid:</strong> KES {float(order.total_amount):,.2f}</p>
                <p><strong>Payment Method:</strong> M-Pesa</p>
                <p><strong>Transaction ID:</strong> {order.mpesa_transaction_id}</p>
            </div>
            
            <p>Your order is now being processed and will be shipped soon.</p>
            
            <p style="margin-top: 30px;">Thank you!<br>The MarketHub Team</p>
        </div>
    </body>
    </html>
    """


def get_review_reminder_template(customer_name, product):
    """Review reminder email"""
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">How was your purchase?</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {customer_name},</p>
            
            <p>We hope you're enjoying your recent purchase! Your feedback helps other customers make informed decisions.</p>
            
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{product.name}</h3>
                <p>Share your experience with this product.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://markethub.co.ke" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Write a Review</a>
            </div>
            
            <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
        </div>
    </body>
    </html>
    """


def get_merchant_application_status_template(user_name, application):
    """Merchant application status email"""
    if application.status.value == "approved":
        content = f"""
            <p>Congratulations! Your merchant application has been <strong style="color: #10b981;">approved</strong>.</p>
            
            <p>You can now start selling on MarketHub! Log in to your account to:</p>
            <ul>
                <li>Set up your merchant profile</li>
                <li>Add your products</li>
                <li>Start receiving orders</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://markethub.co.ke" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
            </div>
        """
    else:
        content = f"""
            <p>Thank you for your interest in selling on MarketHub. We've reviewed your application and it needs some revisions.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0;">Reason for Revision:</h3>
                <p>{application.rejection_reason}</p>
            </div>
            
            <p>Don't worry! You can update your application and resubmit it.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://markethub.co.ke" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Application</a>
            </div>
        """
    
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Merchant Application Update</h1>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi {user_name},</p>
            
            {content}
            
            <p style="margin-top: 30px;">Best regards,<br>The MarketHub Team</p>
        </div>
    </body>
    </html>
    """
