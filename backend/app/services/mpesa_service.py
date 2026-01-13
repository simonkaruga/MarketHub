"""
M-Pesa Service
Daraja API integration for STK Push payments
"""
import requests
import base64
from datetime import datetime
from flask import current_app


def get_mpesa_access_token():
    """
    Get M-Pesa OAuth access token
    
    Returns:
        str: Access token or None if failed
    """
    consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
    consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
    
    if not consumer_key or not consumer_secret:
        print("M-Pesa credentials not configured")
        return None
    
    # Create credentials
    credentials = f"{consumer_key}:{consumer_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    # Request access token
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    headers = {
        "Authorization": f"Basic {encoded_credentials}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data.get('access_token')
    
    except Exception as e:
        print(f"M-Pesa access token error: {str(e)}")
        return None


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    """
    Initiate M-Pesa STK Push payment
    
    Args:
        phone_number: Customer phone (format: 254712345678)
        amount: Amount to charge
        account_reference: Order ID or reference
        transaction_desc: Description of transaction
        
    Returns:
        dict: Response with CheckoutRequestID or None if failed
    """
    # Get access token
    access_token = get_mpesa_access_token()
    
    if not access_token:
        return None
    
    # Get config
    shortcode = current_app.config.get('MPESA_SHORTCODE')
    passkey = current_app.config.get('MPESA_PASSKEY')
    callback_url = current_app.config.get('MPESA_CALLBACK_URL')
    
    if not all([shortcode, passkey, callback_url]):
        print("M-Pesa configuration incomplete")
        return None
    
    # Generate timestamp
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Generate password
    password_str = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()
    
    # Format phone number (ensure 254 format)
    if phone_number.startswith('0'):
        phone_number = '254' + phone_number[1:]
    elif phone_number.startswith('+254'):
        phone_number = phone_number[1:]
    elif not phone_number.startswith('254'):
        phone_number = '254' + phone_number
    
    # STK Push request
    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        # Check if successful
        if data.get('ResponseCode') == '0':
            return {
                'success': True,
                'checkout_request_id': data.get('CheckoutRequestID'),
                'merchant_request_id': data.get('MerchantRequestID'),
                'response_description': data.get('ResponseDescription')
            }
        else:
            print(f"M-Pesa STK Push failed: {data}")
            return {
                'success': False,
                'error': data.get('ResponseDescription', 'STK Push failed')
            }
    
    except Exception as e:
        print(f"M-Pesa STK Push error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def process_mpesa_callback(callback_data):
    """
    Process M-Pesa callback response
    
    Args:
        callback_data: Callback data from M-Pesa
        
    Returns:
        dict: Processed payment info
    """
    try:
        # Extract callback data
        stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
        
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        
        # Check if payment was successful
        if result_code == 0:
            # Extract payment details
            callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            
            payment_info = {
                'success': True,
                'checkout_request_id': checkout_request_id,
                'result_desc': result_desc
            }
            
            # Extract metadata
            for item in callback_metadata:
                name = item.get('Name')
                value = item.get('Value')
                
                if name == 'Amount':
                    payment_info['amount'] = value
                elif name == 'MpesaReceiptNumber':
                    payment_info['mpesa_receipt_number'] = value
                elif name == 'TransactionDate':
                    payment_info['transaction_date'] = value
                elif name == 'PhoneNumber':
                    payment_info['phone_number'] = value
            
            return payment_info
        
        else:
            # Payment failed
            return {
                'success': False,
                'checkout_request_id': checkout_request_id,
                'result_code': result_code,
                'result_desc': result_desc
            }
    
    except Exception as e:
        print(f"M-Pesa callback processing error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }