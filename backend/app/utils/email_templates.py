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

