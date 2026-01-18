"""
Enhanced seed script with real data - 3 merchants and 25+ products
This script creates realistic marketplace data for testing
"""
from app import create_app, db
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.hub import Hub
from werkzeug.security import generate_password_hash

def seed_real_data():
    """Seed the database with realistic marketplace data"""
    app = create_app()

    with app.app_context():
        print("\n" + "="*70)
        print("MARKETHUB - REALISTIC DATA SEEDING")
        print("="*70)

        # Create categories
        print("\n STEP 1: Creating Categories...")
        categories_data = [
            {'name': 'Electronics', 'description': 'Smartphones, laptops, tablets, and electronic accessories'},
            {'name': 'Fashion & Clothing', 'description': 'Men and women clothing, shoes, and accessories'},
            {'name': 'Home & Living', 'description': 'Furniture, home decor, and household items'},
            {'name': 'Books & Media', 'description': 'Books, magazines, and educational materials'},
            {'name': 'Sports & Fitness', 'description': 'Sports equipment, gym gear, and outdoor activities'},
            {'name': 'Beauty & Health', 'description': 'Cosmetics, skincare, and health products'},
            {'name': 'Food & Beverages', 'description': 'Groceries, snacks, and beverages'},
            {'name': 'Baby & Kids', 'description': 'Baby products, toys, and kids items'},
        ]

        categories = {}
        for cat_data in categories_data:
            category = Category.query.filter_by(name=cat_data['name']).first()
            if not category:
                category = Category(**cat_data)
                db.session.add(category)
                print(f"   ✓ Created: {cat_data['name']}")
            else:
                print(f"   • Exists: {cat_data['name']}")
            categories[cat_data['name']] = category

        db.session.commit()

        # Create Hubs
        print("\n STEP 2: Creating Delivery Hubs...")
        hubs_data = [
            {'name': 'Nairobi Central Hub', 'address': 'Kenyatta Avenue, CBD', 'city': 'Nairobi', 'phone_number': '0712000001', 'operating_hours': 'Mon-Sat: 8AM-8PM'},
            {'name': 'Westlands Hub', 'address': 'Westlands Shopping Mall', 'city': 'Nairobi', 'phone_number': '0712000002', 'operating_hours': 'Mon-Sun: 9AM-9PM'},
            {'name': 'Thika Road Hub', 'address': 'Thika Road Mall, 2nd Floor', 'city': 'Nairobi', 'phone_number': '0712000003', 'operating_hours': 'Mon-Sat: 8AM-7PM'},
        ]

        hubs = []
        for hub_data in hubs_data:
            hub = Hub.query.filter_by(name=hub_data['name']).first()
            if not hub:
                hub = Hub(**hub_data)
                db.session.add(hub)
                hubs.append(hub)
                print(f"   ✓ Created: {hub_data['name']}")
            else:
                hubs.append(hub)
                print(f"   • Exists: {hub_data['name']}")

        db.session.commit()

        # Create Admin User
        print("\n STEP 3: Creating Admin User...")
        admin_email = "admin@markethub.com"
        admin = User.query.filter_by(email=admin_email).first()

        if not admin:
            admin = User(
                email=admin_email,
                password_hash=generate_password_hash("admin123"),
                name="System Administrator",
                phone_number="0700000000",
                role="ADMIN",
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            print(f"    Created admin: {admin_email}")
            print(f"    Password: admin123")
        else:
            print(f"    Admin exists: {admin_email}")

        # Create 3 Merchant Users
        print("\n STEP 4: Creating Merchant Accounts...")
        merchants_data = [
            {
                'email': 'techstore@markethub.com',
                'name': 'TechStore Kenya',
                'phone': '0712345001'
            },
            {
                'email': 'fashionhub@markethub.com',
                'name': 'Fashion Hub Nairobi',
                'phone': '0712345002'
            },
            {
                'email': 'homeessentials@markethub.com',
                'name': 'Home Essentials Store',
                'phone': '0712345003'
            }
        ]

        merchants = []
        for merch_data in merchants_data:
            merchant = User.query.filter_by(email=merch_data['email']).first()
            if not merchant:
                merchant = User(
                    email=merch_data['email'],
                    password_hash=generate_password_hash("merchant123"),
                    name=merch_data['name'],
                    phone_number=merch_data['phone'],
                    role="MERCHANT",
                    is_active=True
                )
                db.session.add(merchant)
                merchants.append(merchant)
                print(f"    Created: {merch_data['name']}")
                print(f"       {merch_data['email']} / merchant123")
            else:
                merchants.append(merchant)
                print(f"    Exists: {merch_data['name']}")

        db.session.commit()

        # Create Customer Users
        print("\n STEP 5: Creating Customer Accounts...")
        customers_data = [
            {'email': 'john.doe@gmail.com', 'name': 'John Doe', 'phone': '0723456001'},
            {'email': 'jane.smith@gmail.com', 'name': 'Jane Smith', 'phone': '0723456002'},
        ]

        for cust_data in customers_data:
            customer = User.query.filter_by(email=cust_data['email']).first()
            if not customer:
                customer = User(
                    email=cust_data['email'],
                    password_hash=generate_password_hash("customer123"),
                    name=cust_data['name'],
                    phone_number=cust_data['phone'],
                    role="CUSTOMER",
                    is_active=True
                )
                db.session.add(customer)
                print(f"   ✓ Created: {cust_data['name']} ({cust_data['email']})")
            else:
                print(f"   • Exists: {cust_data['name']}")

        db.session.commit()

        # Create 25+ Products across 3 merchants
        print("\n STEP 6: Creating Products...")

        # Products use placeholder images from placeholder.com
        # In production, these would be actual Cloudinary URLs after upload

        products_data = [
            # TechStore Kenya Products (Merchant 1)
            {
                'merchant_idx': 0,
                'name': 'Samsung Galaxy S23 Ultra',
                'description': 'Premium flagship smartphone with 200MP camera, 12GB RAM, 256GB storage. Stunning 6.8" Dynamic AMOLED display with S Pen support. Perfect for photography and productivity.',
                'price': 129999.00,
                'category': 'Electronics',
                'stock': 8,
                'image': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'Apple iPhone 14 Pro',
                'description': 'Latest iPhone with A16 Bionic chip, ProMotion display, and advanced camera system. 128GB storage, all-day battery life. Experience the power of iOS.',
                'price': 149999.00,
                'category': 'Electronics',
                'stock': 5,
                'image': 'https://images.unsplash.com/photo-1592286927505-1b71d6ecb768?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'Sony WH-1000XM5 Headphones',
                'description': 'Industry-leading noise cancellation wireless headphones. Crystal clear sound, 30-hour battery life, comfortable for all-day wear. Perfect for music lovers.',
                'price': 32999.00,
                'category': 'Electronics',
                'stock': 15,
                'image': 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'MacBook Air M2 2023',
                'description': 'Ultra-thin and powerful laptop with Apple M2 chip. 13.6" Liquid Retina display, 8GB RAM, 256GB SSD. All-day battery life for work and creativity.',
                'price': 159999.00,
                'category': 'Electronics',
                'stock': 4,
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'iPad Air (5th Generation)',
                'description': '10.9" Liquid Retina display, M1 chip, 64GB storage. Perfect for work, learning, and entertainment. Compatible with Apple Pencil and Magic Keyboard.',
                'price': 79999.00,
                'category': 'Electronics',
                'stock': 10,
                'image': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'Samsung 4K Smart TV 55"',
                'description': 'Crystal UHD 4K TV with HDR, smart features, and sleek design. Built-in streaming apps, voice control. Transform your living room entertainment.',
                'price': 69999.00,
                'category': 'Electronics',
                'stock': 6,
                'image': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'Canon EOS R50 Camera',
                'description': 'Mirrorless camera with 24.2MP sensor, 4K video, and beginner-friendly features. Includes 18-45mm lens. Capture stunning photos and videos.',
                'price': 89999.00,
                'category': 'Electronics',
                'stock': 7,
                'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'
            },
            {
                'merchant_idx': 0,
                'name': 'JBL Flip 6 Bluetooth Speaker',
                'description': 'Portable waterproof speaker with powerful bass. 12-hour battery life, PartyBoost feature. Perfect for outdoor adventures and parties.',
                'price': 12999.00,
                'category': 'Electronics',
                'stock': 20,
                'image': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'
            },

            # Fashion Hub Products (Merchant 2)
            {
                'merchant_idx': 1,
                'name': "Men's Premium Cotton Shirt",
                'description': 'Classic fit cotton shirt in navy blue. Wrinkle-resistant, breathable fabric. Perfect for office or casual wear. Available in sizes S-XXL.',
                'price': 2499.00,
                'category': 'Fashion & Clothing',
                'stock': 30,
                'image': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800'
            },
            {
                'merchant_idx': 1,
                'name': "Women's Summer Maxi Dress",
                'description': 'Elegant floral maxi dress perfect for any occasion. Lightweight, breathable fabric with adjustable straps. Sizes S-XL available.',
                'price': 3499.00,
                'category': 'Fashion & Clothing',
                'stock': 25,
                'image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
            },
            {
                'merchant_idx': 1,
                'name': 'Nike Air Max Sneakers',
                'description': 'Comfortable running shoes with Air Max cushioning. Breathable mesh upper, durable rubber sole. Perfect for running and everyday wear.',
                'price': 8999.00,
                'category': 'Fashion & Clothing',
                'stock': 18,
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'
            },
            {
                'merchant_idx': 1,
                'name': 'Designer Leather Handbag',
                'description': 'Premium leather handbag with multiple compartments. Elegant design suitable for work and casual outings. Comes in black, brown, and tan.',
                'price': 6999.00,
                'category': 'Fashion & Clothing',
                'stock': 12,
                'image': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'
            },
            {
                'merchant_idx': 1,
                'name': "Men's Denim Jeans",
                'description': 'Classic slim fit denim jeans. Premium quality denim, comfortable stretch, reinforced stitching. Timeless style for any wardrobe.',
                'price': 3999.00,
                'category': 'Fashion & Clothing',
                'stock': 35,
                'image': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'
            },
            {
                'merchant_idx': 1,
                'name': 'Sunglasses UV Protection',
                'description': 'Stylish polarized sunglasses with 100% UV protection. Lightweight frame, anti-glare lenses. Perfect for driving and outdoor activities.',
                'price': 1999.00,
                'category': 'Fashion & Clothing',
                'stock': 40,
                'image': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'
            },
            {
                'merchant_idx': 1,
                'name': 'Casio G-Shock Watch',
                'description': 'Durable sports watch with shock resistance and water resistance up to 200m. Multiple time zones, stopwatch, alarm. Built to last.',
                'price': 7999.00,
                'category': 'Fashion & Clothing',
                'stock': 15,
                'image': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'
            },
            {
                'merchant_idx': 1,
                'name': 'Winter Jacket - Unisex',
                'description': 'Warm and stylish winter jacket with hood. Water-resistant outer shell, thermal insulation. Available in multiple colors and sizes.',
                'price': 5499.00,
                'category': 'Fashion & Clothing',
                'stock': 22,
                'image': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
            },

            # Home Essentials Products (Merchant 3)
            {
                'merchant_idx': 2,
                'name': 'Modern LED Floor Lamp',
                'description': 'Elegant floor lamp with adjustable brightness and color temperature. Energy-efficient LED, sleek minimalist design. Perfect for reading corner.',
                'price': 4999.00,
                'category': 'Home & Living',
                'stock': 15,
                'image': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Coffee Maker Machine',
                'description': 'Programmable drip coffee maker with 12-cup capacity. Keep-warm function, auto shut-off. Start your mornings right with fresh coffee.',
                'price': 6499.00,
                'category': 'Home & Living',
                'stock': 10,
                'image': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Non-Stick Cookware Set',
                'description': '10-piece non-stick cookware set. Includes pots, pans, and lids. Heat-resistant handles, dishwasher safe. Complete kitchen essentials.',
                'price': 8999.00,
                'category': 'Home & Living',
                'stock': 8,
                'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Memory Foam Pillow Set',
                'description': 'Set of 2 premium memory foam pillows. Hypoallergenic, breathable cover, perfect support for neck and head. Better sleep guaranteed.',
                'price': 3999.00,
                'category': 'Home & Living',
                'stock': 25,
                'image': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Electric Kettle 1.7L',
                'description': 'Fast-boiling electric kettle with auto shut-off. Stainless steel body, cordless design, boil-dry protection. Essential kitchen appliance.',
                'price': 2499.00,
                'category': 'Home & Living',
                'stock': 30,
                'image': 'https://images.unsplash.com/photo-1563822249548-9a72b6ae8eea?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Indoor Plant - Snake Plant',
                'description': 'Low-maintenance indoor plant in decorative pot. Air-purifying, drought-tolerant. Adds life and freshness to any room.',
                'price': 1299.00,
                'category': 'Home & Living',
                'stock': 50,
                'image': 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Yoga Mat with Carry Bag',
                'description': 'Premium non-slip yoga mat 6mm thick. Includes carrying strap and bag. Perfect for yoga, pilates, and home workouts.',
                'price': 2999.00,
                'category': 'Sports & Fitness',
                'stock': 35,
                'image': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'
            },
            {
                'merchant_idx': 2,
                'name': 'Blender 1000W',
                'description': 'Powerful blender for smoothies, soups, and more. Multiple speed settings, 1.5L capacity, dishwasher-safe parts. Healthy living made easy.',
                'price': 5499.00,
                'category': 'Home & Living',
                'stock': 12,
                'image': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800'
            },
        ]

        created_count = 0
        for prod_data in products_data:
            merchant = merchants[prod_data['merchant_idx']]
            category = categories[prod_data['category']]

            # Check if product exists
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
                    stock_quantity=prod_data['stock'],
                    image_url=prod_data['image'],  # Placeholder image
                    is_active=True
                )
                db.session.add(product)
                created_count += 1
                print(f"    {prod_data['name']} - KES {prod_data['price']:,.2f}")
            else:
                print(f"    {prod_data['name']} (exists)")

        db.session.commit()

        # Final Summary
        print("\n" + "="*70)
        print(" DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\n SUMMARY:")
        print(f"   Categories: {Category.query.count()}")
        print(f"   Hubs: {Hub.query.count()}")
        print(f"   Users: {User.query.count()}")
        print(f"   Products: {Product.query.count()} ({created_count} new)")

        print(f"\n TEST ACCOUNTS:")
        print(f"\n    Admin:")
        print(f"       admin@markethub.com")
        print(f"       admin123")

        print(f"\n    Merchants (all use: merchant123):")
        for merch_data in merchants_data:
            print(f"       {merch_data['email']}")

        print(f"\n    Customers (all use: customer123):")
        for cust_data in customers_data:
            print(f"       {cust_data['email']}")

        print(f"\n NEXT STEPS:")
        print(f"   1. Start the application: ./start.sh")
        print(f"   2. Login with any account above")
        print(f"   3. Merchants can upload actual product images")
        print(f"   4. Test the full marketplace functionality!")

        print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    seed_real_data()
