"""
API routes package
Blueprints will be imported here as we create them
"""
from app.routes import auth, categories, products, merchant, admin

__all__ = ['auth', 'categories', 'products', 'merchant', 'admin']