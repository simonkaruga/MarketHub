"""
Flask application factory
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

# Initialize extensions (but don't bind to app yet)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
ma = Marshmallow()
mail = Mail()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)


def create_app(config_name='development'):
    """
    Application factory pattern
    
    Args:
        config_name: Configuration to use (development, production, testing)
    
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize Sentry (Error Monitoring) - only if DSN is provided and not a placeholder
    sentry_dsn = app.config.get('SENTRY_DSN')
    if sentry_dsn and sentry_dsn != 'your_sentry_dsn_here':
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FlaskIntegration()],
            environment=config_name,
            traces_sample_rate=1.0 if config_name == 'development' else 0.1
        )
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    
    # Configure CORS
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', '*'),
         supports_credentials=True)
    
 # Register blueprints
    from app.routes import (
        auth, categories, products, merchant, admin, cart,
        orders, payments, merchant_orders, admin_orders,
        hub_staff, admin_hub_staff, reviews, merchant_reviews,
        merchant_applications, admin_merchant_applications,
        admin_analytics, profile, merchant_analytics
    )
    app.register_blueprint(auth.bp, url_prefix='/api/v1/auth')
    app.register_blueprint(categories.bp, url_prefix='/api/v1/categories')
    app.register_blueprint(products.bp, url_prefix='/api/v1/products')
    app.register_blueprint(merchant.bp, url_prefix='/api/v1/merchant')
    app.register_blueprint(admin.bp, url_prefix='/api/v1/admin')
    app.register_blueprint(cart.bp, url_prefix='/api/v1/cart')
    app.register_blueprint(orders.bp, url_prefix='/api/v1/orders')
    app.register_blueprint(payments.bp, url_prefix='/api/v1/payments')
    
    # Merge merchant order routes into merchant blueprint prefix
    from app.routes.merchant_orders import bp as merchant_orders_bp
    app.register_blueprint(merchant_orders_bp, url_prefix='/api/v1/merchant')
    
    # Merge merchant review routes into merchant blueprint prefix
    from app.routes.merchant_reviews import bp as merchant_reviews_bp
    app.register_blueprint(merchant_reviews_bp, url_prefix='/api/v1/merchant')
    
    # Merge admin order routes with existing admin/public routes
    from app.routes.admin_orders import bp as admin_orders_bp
    app.register_blueprint(admin_orders_bp, url_prefix='/api/v1')
    
    # Hub staff routes
    app.register_blueprint(hub_staff.bp, url_prefix='/api/v1/hub')
    
    # Admin hub staff management
    app.register_blueprint(admin_hub_staff.bp, url_prefix='/api/v1')
    
    # Review routes (includes both public and customer routes)
    app.register_blueprint(reviews.bp, url_prefix='/api/v1')
    
    # Merchant application routes
    app.register_blueprint(merchant_applications.bp, url_prefix='/api/v1/merchant-applications')
    
    # Admin merchant application management
    app.register_blueprint(admin_merchant_applications.bp, url_prefix='/api/v1')
    
    # Admin analytics dashboard
    app.register_blueprint(admin_analytics.bp, url_prefix='/api/v1/admin')
    
    # Profile routes
    app.register_blueprint(profile.bp, url_prefix='/api/v1')
    
    # Merchant analytics dashboard (NEW)
    app.register_blueprint(merchant_analytics.bp, url_prefix='/api/v1/merchant')

    return app
