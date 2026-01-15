"""
Seed script to populate the database with initial data
"""
from app import create_app, db
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from werkzeug.security import generate_password_hash

def seed_database():
    """Seed the database with initial data"""
    app = create_app()

    with app.app_context():
        print("Starting database seeding...")

        # Create categories
        print("\n1. Creating categories...")
        categories_data = [
            {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
            {'name': 'Clothing', 'description': 'Fashion and apparel'},
            {'name': 'Home & Garden', 'description': 'Home improvement and garden supplies'},
            {'name': 'Books', 'description': 'Books and educational materials'},
            {'name': 'Sports', 'description': 'Sports equipment and fitness gear'},
            {'name': 'Toys', 'description': 'Toys and games for all ages'},
            {'name': 'Food & Beverages', 'description': 'Food items and drinks'},
            {'name': 'Beauty', 'description': 'Beauty and personal care products'},
        ]

        categories = []
        for cat_data in categories_data:
            category = Category.query.filter_by(name=cat_data['name']).first()
            if not category:
                category = Category(**cat_data)
                db.session.add(category)
                categories.append(category)
                print(f"   ✓ Created category: {cat_data['name']}")
            else:
                categories.append(category)
                print(f"   - Category already exists: {cat_data['name']}")

        db.session.commit()
        print(f"Categories created: {len(categories)}")

        # Create a merchant user
        print("\n2. Creating merchant user...")
        merchant_email = "merchant@example.com"
        merchant = User.query.filter_by(email=merchant_email).first()

        if not merchant:
            merchant = User(
                email=merchant_email,
                password_hash=generate_password_hash("password123"),
                name="Test Merchant",
                phone_number="0712345678",
                role="MERCHANT",
                is_active=True
            )
            db.session.add(merchant)
            db.session.commit()
            print(f"   ✓ Created merchant: {merchant_email}")
            print(f"   Password: password123")
        else:
            print(f"   - Merchant already exists: {merchant_email}")

        # Create a regular customer
        print("\n3. Creating customer user...")
        customer_email = "customer@example.com"
        customer = User.query.filter_by(email=customer_email).first()

        if not customer:
            customer = User(
                email=customer_email,
                password_hash=generate_password_hash("password123"),
                name="Test Customer",
                phone_number="0723456789",
                role="CUSTOMER",
                is_active=True
            )
            db.session.add(customer)
            db.session.commit()
            print(f"   ✓ Created customer: {customer_email}")
            print(f"   Password: password123")
        else:
            print(f"   - Customer already exists: {customer_email}")

        # Create sample products
        print("\n4. Creating sample products...")
        products_data = [
            {
                'name': 'Samsung Galaxy S23',
                'description': 'Latest Samsung flagship smartphone with stunning camera and performance. Features a 6.1-inch display, 128GB storage, and all-day battery life.',
                'price': 45000.00,
                'category': 'Electronics',
                'stock_quantity': 15
            },
            {
                'name': 'Sony WH-1000XM5 Headphones',
                'description': 'Premium noise-cancelling wireless headphones with exceptional sound quality. Perfect for music lovers and travelers.',
                'price': 18500.00,
                'category': 'Electronics',
                'stock_quantity': 20
            },
            {
                'name': "Men's Cotton T-Shirt",
                'description': 'Comfortable 100% cotton t-shirt available in multiple colors. Premium quality fabric that lasts long.',
                'price': 850.00,
                'category': 'Clothing',
                'stock_quantity': 50
            },
            {
                'name': "Women's Summer Dress",
                'description': 'Elegant floral summer dress perfect for any occasion. Lightweight and breathable fabric.',
                'price': 1850.00,
                'category': 'Clothing',
                'stock_quantity': 30
            },
            {
                'name': 'LED Desk Lamp',
                'description': 'Modern LED desk lamp with adjustable brightness and color temperature. Energy efficient and eye-friendly.',
                'price': 1250.00,
                'category': 'Home & Garden',
                'stock_quantity': 40
            },
            {
                'name': 'The Psychology of Money',
                'description': 'Bestselling book about understanding wealth, greed, and happiness. Essential reading for financial literacy.',
                'price': 950.00,
                'category': 'Books',
                'stock_quantity': 25
            },
            {
                'name': 'Yoga Mat Premium',
                'description': 'Non-slip premium yoga mat with carrying strap. Perfect for home workouts and yoga practice.',
                'price': 1450.00,
                'category': 'Sports',
                'stock_quantity': 35
            },
            {
                'name': 'Organic Green Tea (100g)',
                'description': 'Premium organic green tea leaves imported from Kenya. Rich in antioxidants and delicious flavor.',
                'price': 450.00,
                'category': 'Food & Beverages',
                'stock_quantity': 100
            },
        ]

        for prod_data in products_data:
            # Find category
            category = Category.query.filter_by(name=prod_data['category']).first()
            if not category:
                print(f"   ✗ Category not found: {prod_data['category']}")
                continue

            # Check if product already exists
            existing = Product.query.filter_by(
                name=prod_data['name'],
                merchant_id=merchant.id
            ).first()

            if not existing:
                product = Product(
                    merchant_id=merchant.id,
                    category_id=category.id,
                    name=prod_data['name'],
                    description=prod_data['description'],
                    price=prod_data['price'],
                    stock_quantity=prod_data['stock_quantity'],
                    is_active=True
                )
                db.session.add(product)
                print(f"   ✓ Created product: {prod_data['name']}")
            else:
                print(f"   - Product already exists: {prod_data['name']}")

        db.session.commit()

        # Summary
        print("\n" + "="*60)
        print("DATABASE SEEDING COMPLETE!")
        print("="*60)
        print(f"\nCategories: {Category.query.count()}")
        print(f"Users: {User.query.count()}")
        print(f"Products: {Product.query.count()}")
        print("\nTest Accounts:")
        print("  Merchant: merchant@example.com / password123")
        print("  Customer: customer@example.com / password123")
        print("\nYou can now login and start using the application!")
        print("="*60 + "\n")

if __name__ == '__main__':
    seed_database()
