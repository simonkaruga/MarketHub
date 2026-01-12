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
    
 
    app.config.from_object(config[config_name])
    
    
    if app.config.get('SENTRY_DSN'):
        sentry_sdk.init(
            dsn=app.config['SENTRY_DSN'],
            integrations=[FlaskIntegration()],
            environment=config_name,
            traces_sample_rate=1.0 if config_name == 'development' else 0.1
        )
    
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    
 
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', '*'),
         supports_credentials=True)
    
    from app.routes import auth
    app.register_blueprint(auth.bp, url_prefix='/api/v1/auth')
    
   
    @app.route('/api/v1/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'message': 'MarketHub API is running',
            'environment': config_name
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'The requested resource was not found'
            }
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'An internal server error occurred'
            }
        }), 500
    
    return app
