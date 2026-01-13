"""
Validation Helpers
Common validation functions
"""
import re


def validate_price(price):
    """
    Validate price is >= 10.00
    
    Args:
        price: Price value
        
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        price_float = float(price)
        if price_float < 10.00:
            return False, "Price must be at least KES 10.00"
        return True, None
    except (ValueError, TypeError):
        return False, "Invalid price format"


def validate_stock(stock):
    """
    Validate stock quantity is non-negative integer
    
    Args:
        stock: Stock quantity
        
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        stock_int = int(stock)
        if stock_int < 0:
            return False, "Stock quantity cannot be negative"
        return True, None
    except (ValueError, TypeError):
        return False, "Invalid stock quantity"


def validate_phone_number(phone):
    """
    Validate Kenyan phone number format
    
    Args:
        phone: Phone number string
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not phone:
        return True, None  # Phone is optional
    
    # Kenyan format: 07XXXXXXXX or +2547XXXXXXXX or 2547XXXXXXXX
    pattern = r'^(\+?254|0)[17]\d{8}$'
    
    if re.match(pattern, phone):
        return True, None
    return False, "Invalid Kenyan phone number format (e.g., 0712345678)"