"""
Application entry point
"""
import os
from app import create_app, db

# Create Flask app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Create tables if they don't exist (for development only)
    # In production, use migrations instead
    with app.app_context():
        db.create_all()
    
    # Run the application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )