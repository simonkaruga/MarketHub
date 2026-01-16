"""
OTP (One-Time Password) Service
Handles generation and verification of email OTPs
"""
import random
import string
from datetime import datetime, timedelta
from flask import current_app
from flask_mail import Message
from app import mail, db


class OTPService:
    """Service for managing email OTP verification"""

    @staticmethod
    def generate_otp(length=6):
        """
        Generate a random numeric OTP

        Args:
            length (int): Length of OTP (default 6)

        Returns:
            str: Generated OTP
        """
        return ''.join(random.choices(string.digits, k=length))

    @staticmethod
    def send_verification_email(user, otp):
        """
        Send OTP verification email to user

        Args:
            user (User): User object
            otp (str): OTP code

        Returns:
            bool: True if email sent successfully
        """
        try:
            msg = Message(
                subject='Verify Your MarketHub Email',
                sender=current_app.config['MAIL_DEFAULT_SENDER'],
                recipients=[user.email]
            )

            # HTML email body
            msg.html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background-color: #3B82F6;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: #f9fafb;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                    }}
                    .otp-box {{
                        background-color: #ffffff;
                        border: 2px dashed #3B82F6;
                        padding: 20px;
                        text-align: center;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        margin: 20px 0;
                        color: #3B82F6;
                    }}
                    .footer {{
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #6b7280;
                    }}
                    .warning {{
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user.name}!</h2>
                        <p>Thank you for creating an account with MarketHub. To complete your registration, please use the following verification code:</p>

                        <div class="otp-box">
                            {otp}
                        </div>

                        <p>This code will expire in <strong>10 minutes</strong>.</p>

                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. MarketHub staff will never ask for your verification code.
                        </div>

                        <p>If you didn't create an account with MarketHub, please ignore this email.</p>

                        <p>Best regards,<br>
                        The MarketHub Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 MarketHub. All rights reserved.</p>
                        <p>This is an automated email, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Plain text version
            msg.body = f"""
            Hello {user.name}!

            Thank you for creating an account with MarketHub. To complete your registration, please use the following verification code:

            {otp}

            This code will expire in 10 minutes.

            SECURITY NOTICE: Never share this code with anyone. MarketHub staff will never ask for your verification code.

            If you didn't create an account with MarketHub, please ignore this email.

            Best regards,
            The MarketHub Team

            © 2026 MarketHub. All rights reserved.
            This is an automated email, please do not reply.
            """

            mail.send(msg)
            current_app.logger.info(f"OTP email sent to {user.email}")
            return True

        except Exception as e:
            current_app.logger.error(f"Failed to send OTP email to {user.email}: {str(e)}")
            return False

    @staticmethod
    def create_verification_token(user):
        """
        Create and store verification token for user

        Args:
            user (User): User object

        Returns:
            str: Generated OTP
        """
        otp = OTPService.generate_otp()
        user.email_verification_token = otp
        user.email_verification_expires = datetime.utcnow() + timedelta(minutes=10)
        db.session.commit()

        return otp

    @staticmethod
    def verify_otp(user, otp):
        """
        Verify OTP for user

        Args:
            user (User): User object
            otp (str): OTP to verify

        Returns:
            tuple: (success: bool, message: str)
        """
        if not user.email_verification_token:
            return False, "No verification code found. Please request a new one."

        if user.email_verified:
            return False, "Email already verified."

        if user.email_verification_expires < datetime.utcnow():
            return False, "Verification code has expired. Please request a new one."

        if user.email_verification_token != otp:
            return False, "Invalid verification code."

        # Mark email as verified
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        db.session.commit()

        return True, "Email verified successfully!"

    @staticmethod
    def resend_verification_code(user):
        """
        Resend verification code to user

        Args:
            user (User): User object

        Returns:
            tuple: (success: bool, message: str)
        """
        if user.email_verified:
            return False, "Email already verified."

        # Generate new OTP
        otp = OTPService.create_verification_token(user)

        # Send email
        if OTPService.send_verification_email(user, otp):
            return True, "Verification code sent successfully!"
        else:
            return False, "Failed to send verification email. Please try again later."
