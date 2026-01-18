"""
Database seeding script for MarketHub
Run this to populate the database with initial data
"""

from app import create_app, db
from app.models import User, Category, Product, Hub, UserRole
from datetime import datetime
import os

# Sample data
categories_data = [
    {'name': 'Electronics', 'description': 'Electronic devices and gadgets'},
    {'name': 'Clothing', 'description': 'Fashion and apparel'},
    {'name': 'Home & Garden', 'description': 'Home improvement and garden supplies'},
    {'name': 'Books', 'description': 'Books and educational materials'},
    {'name': 'Sports', 'description': 'Sports equipment and fitness gear'},
    {'name': 'Food & Beverages', 'description': 'Food products and beverages'},
]

products_data = [
    {
        'name': 'Samsung Galaxy S23',
        'description': 'Latest Samsung flagship smartphone with stunning camera and performance. Features a 6.1-inch display, 128GB storage, and all-day battery life.',
        'price': 45000.00,
        'category': 'Electronics',
        'stock_quantity': 15,
        'image_url': 'https://images.unsplash.com/photo-1679061009298-7f2e3b3ffb0f?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': 'Sony WH-1000XM5 Headphones',
        'description': 'Premium noise-cancelling wireless headphones with exceptional sound quality. Perfect for music lovers and travelers.',
        'price': 18500.00,
        'category': 'Electronics',
        'stock_quantity': 20,
        'image_url': 'https://images.unsplash.com/photo-1606813909081-11f2e3e3c5a6?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': "Men's Cotton T-Shirt",
        'description': 'Comfortable 100% cotton t-shirt available in multiple colors. Premium quality fabric that lasts long.',
        'price': 850.00,
        'category': 'Clothing',
        'stock_quantity': 50,
        'image_url': 'https://images.unsplash.com/photo-1618354692259-cf1d4d8d6e6c?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': "Women's Summer Dress",
        'description': 'Elegant floral summer dress perfect for any occasion. Lightweight and breathable fabric.',
        'price': 1850.00,
        'category': 'Clothing',
        'stock_quantity': 30,
        'image_url': 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': 'LED Desk Lamp',
        'description': 'Modern LED desk lamp with adjustable brightness and color temperature. Energy efficient and eye-friendly.',
        'price': 1250.00,
        'category': 'Home & Garden',
        'stock_quantity': 40,
        'image_url': 'https://images.unsplash.com/photo-1580910051072-7f945f87f1c0?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': 'The Psychology of Money',
        'description': 'Bestselling book about understanding wealth, greed, and happiness. Essential reading for financial literacy.',
        'price': 950.00,
        'category': 'Books',
        'stock_quantity': 25,
        'image_url': 'https://images.unsplash.com/photo-1588666309991-2ff1f1c1d2e6?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': 'Yoga Mat Premium',
        'description': 'Non-slip premium yoga mat with carrying strap. Perfect for home workouts and yoga practice.',
        'price': 1450.00,
        'category': 'Sports',
        'stock_quantity': 35,
        'image_url': 'https://images.unsplash.com/photo-1599058917211-b624f97b7f90?auto=format&fit=crop&w=500&q=60'
    },
    {
        'name': 'Organic Green Tea (100g)',
        'description': 'Premium organic green tea leaves imported from Kenya. Rich in antioxidants and delicious flavor.',
        'price': 450.00,
        'category': 'Food & Beverages',
        'stock_quantity': 100,
        'image_url': 'https://images.unsplash.com/photo-1601456359640-84166a7e914e?auto=format&fit=crop&w=500&q=60'
    },
]

hubs_data = [
    {
        'name': 'Nairobi Central Hub',
        'address': '123 Moi Avenue, Nairobi CBD',
        'city': 'Nairobi',
        'phone_number': '+254700000001',
        'operating_hours': 'Mon-Fri: 8AM-8PM, Sat: 9AM-5PM',
        'is_active': True
    },
    {
        'name': 'Westlands Hub',
        'address': '456 Westlands Road, Westlands',
        'city': 'Nairobi',
        'phone_number': '+254700000002',
        'operating_hours': 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
        'is_active': True
    }
]

def seed_database():
    """Seed the database with initial data"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))

    with app.app_context():
        print("🌱 Starting database seeding...")

        # Create categories (check if they exist first)
        print("📂 Creating categories...")
        categories = {}
        categories_created = 0
        for cat_data in categories_data:
            existing = Category.query.filter_by(name=cat_data['name']).first()
            if existing:
                categories[cat_data['name']] = existing
                print(f"   ⚠️  Category '{cat_data['name']}' already exists, skipping")
            else:
                category = Category(
                    name=cat_data['name'],
                    description=cat_data['description']
                )
                db.session.add(category)
                categories[cat_data['name']] = category
                categories_created += 1

        # Create hubs (check if they exist first)
        print("🏢 Creating delivery hubs...")
        hubs_created = 0
        for hub_data in hubs_data:
            existing = Hub.query.filter_by(name=hub_data['name']).first()
            if existing:
                print(f"   ⚠️  Hub '{hub_data['name']}' already exists, skipping")
            else:
                hub = Hub(**hub_data)
                db.session.add(hub)
                hubs_created += 1

        # Create admin user (check if exists first)
        print("👤 Creating admin user...")
        admin_created = 0
        try:
            existing_admin = User.query.filter_by(email='admin@markethub.com').first()
            if existing_admin:
                admin = existing_admin
                print("   ⚠️  Admin user already exists, skipping")
            else:
                admin = User(
                    email='admin@markethub.com',
                    name='MarketHub Admin',
                    phone_number='+254700000000',
                    role=UserRole.ADMIN,
                    is_active=True
                )
                admin.set_password('Admin123!')
                db.session.add(admin)
                admin_created = 1
        except Exception as e:
            print(f"   ❌ Error creating admin user: {e}")
            # Create admin with raw SQL to avoid enum issues
            db.session.execute(db.text("""
                INSERT OR IGNORE INTO users (email, password_hash, name, phone_number, role, is_active, created_at, updated_at)
                VALUES (:email, :password_hash, :name, :phone_number, :role, :is_active, :created_at, :updated_at)
            """), {
                'email': 'admin@markethub.com',
                'password_hash': 'pbkdf2:sha256:600000$dummy$dummy',
                'name': 'MarketHub Admin',
                'phone_number': '+254700000000',
                'role': 'admin',
                'is_active': True,
                'created_at': db.func.now(),
                'updated_at': db.func.now()
            })
            admin_created = 1

        # Create sample merchants (check if they exist first)
        print("🏪 Creating sample merchants...")
        merchants = []
        merchants_created = 0
        merchant_data = [
            {'email': 'techstore@markethub.com', 'name': 'TechStore Kenya', 'phone': '+254711000001'},
            {'email': 'fashionhub@markethub.com', 'name': 'FashionHub', 'phone': '+254722000002'},
            {'email': 'homestore@markethub.com', 'name': 'Home & Garden Store', 'phone': '+254733000003'},
        ]

        for data in merchant_data:
            try:
                existing = User.query.filter_by(email=data['email']).first()
                if existing:
                    merchants.append(existing)
                    print(f"   ⚠️  Merchant '{data['email']}' already exists, skipping")
                else:
                    merchant = User(
                        email=data['email'],
                        name=data['name'],
                        phone_number=data['phone'],
                        role=UserRole.MERCHANT,
                        is_active=True
                    )
                    merchant.set_password('Merchant123!')
                    db.session.add(merchant)
                    merchants.append(merchant)
                    merchants_created += 1
            except Exception as e:
                print(f"   ❌ Error creating merchant {data['email']}: {e}")
                # Create merchant with raw SQL
                db.session.execute(db.text("""
                    INSERT OR IGNORE INTO users (email, password_hash, name, phone_number, role, is_active, created_at, updated_at)
                    VALUES (:email, :password_hash, :name, :phone_number, :role, :is_active, :created_at, :updated_at)
                """), {
                    'email': data['email'],
                    'password_hash': 'pbkdf2:sha256:600000$dummy$dummy',
                    'name': data['name'],
                    'phone_number': data['phone'],
                    'role': 'merchant',
                    'is_active': True,
                    'created_at': db.func.now(),
                    'updated_at': db.func.now()
                })
                merchants_created += 1

        # Get all merchants (both existing and newly created)
        try:
            all_merchants = User.query.filter_by(role=UserRole.MERCHANT).all()
            merchants.extend([m for m in all_merchants if m not in merchants])
        except Exception:
            # Fallback: get merchants by role string
            merchants_result = db.session.execute(db.text("SELECT id FROM users WHERE role = 'merchant'")).fetchall()
            for row in merchants_result:
                merchant = User.query.get(row[0])
                if merchant and merchant not in merchants:
                    merchants.append(merchant)

        # Create products (check if they exist first)
        print("📦 Creating products...")
        products_created = 0
        for i, prod_data in enumerate(products_data):
            existing = Product.query.filter_by(name=prod_data['name']).first()
            if existing:
                print(f"   ⚠️  Product '{prod_data['name']}' already exists, skipping")
                continue

            # Get the merchant (distribute among available merchants)
            if merchants:
                merchant = merchants[i % len(merchants)]
                category = categories.get(prod_data['category'])

                if category:
                    product = Product(
                        merchant_id=merchant.id,
                        category_id=category.id,
                        name=prod_data['name'],
                        description=prod_data['description'],
                        price=prod_data['price'],
                        stock_quantity=prod_data['stock_quantity'],
                        is_active=True,
                        image_url=prod_data.get('image_url')
                    )
                    db.session.add(product)
                    products_created += 1
                else:
                    print(f"   ❌ Category '{prod_data['category']}' not found for product '{prod_data['name']}'")
            else:
                print("   ❌ No merchants available to assign products")

        # Commit all changes
        db.session.commit()
        print("✅ Database seeding completed successfully!")
        print(f"   📂 Created {categories_created} new categories")
        print(f"   🏢 Created {hubs_created} new hubs")
        print(f"   👥 Created {admin_created} new admin + {merchants_created} new merchants")
        print(f"   📦 Created {products_created} new products")

if __name__ == '__main__':
    seed_database()
