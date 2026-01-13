"""
API routes package
Blueprints will be imported here as we create them
"""
from app.routes import (
    auth, 
    categories, 
    products, 
    merchant, 
    admin, 
    cart,
    orders,
    payments,
    merchant_orders,
    admin_orders,
    hub_staff,
    admin_hub_staff,
    reviews,
    merchant_reviews
)

__all__ = [
    'auth', 
    'categories', 
    'products', 
    'merchant', 
    'admin', 
    'cart',
    'orders',
    'payments',
    'merchant_orders',
    'admin_orders',
    'hub_staff',
    'admin_hub_staff',
    'reviews',
    'merchant_reviews'
]