"""
Update admin password script
"""

from app import create_app, db
from app.models.user import User
import os

def update_admin_password():
    """Update admin password to Admin123!"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))

    with app.app_context():
        print("🔑 Updating admin password...")

        # Find admin user
        admin = User.query.filter_by(email='admin@markethub.com').first()

        if not admin:
            print("❌ Admin user not found")
            return

        # Set new password
        admin.set_password('Admin123!')
        db.session.commit()

        print("✅ Admin password updated successfully")
        print("   Email: admin@markethub.com")
        print("   Password: Admin123!")

if __name__ == '__main__':
    update_admin_password()
