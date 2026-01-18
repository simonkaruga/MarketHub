"""
Application entry point
"""
import os
from app import create_app, db

# Create Flask app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Run database migrations (for development)
    # In production, migrations should be run separately
    with app.app_context():
        from flask_migrate import upgrade
        upgrade()

    # Run the application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
