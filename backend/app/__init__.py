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
    
    # Initialize Sentry (Error Monitoring) - only if DSN is provided
    if app.config.get('SENTRY_DSN'):
        sentry_sdk.init(
            dsn=app.config['SENTRY_DSN'],
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
    from app.routes import auth, categories, products, merchant, admin, cart
    app.register_blueprint(auth.bp, url_prefix='/api/v1/auth')
    app.register_blueprint(categories.bp, url_prefix='/api/v1/categories')
    app.register_blueprint(products.bp, url_prefix='/api/v1/products')
    app.register_blueprint(merchant.bp, url_prefix='/api/v1/merchant')
    app.register_blueprint(admin.bp, url_prefix='/api/v1/admin')
    app.register_blueprint(cart.bp, url_prefix='/api/v1/cart')
    
    # Other blueprints will be added as we create them:
    # from app.routes import orders, hub_staff
    # app.register_blueprint(orders.bp, url_prefix='/api/v1/orders')
    # app.register_blueprint(hub_staff.bp, url_prefix='/api/v1/hub')