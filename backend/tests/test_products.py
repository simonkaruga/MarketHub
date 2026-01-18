"""
Test Product Routes
"""
import pytest
from app import create_app, db
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product


class TestProducts:
    """Test product endpoints"""

    @pytest.fixture
    def app(self):
        """Create test app"""
        app = create_app('testing')
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    @pytest.fixture
    def init_database(self, app):
        """Initialize database"""
        with app.app_context():
            db.create_all()

            # Create test data
            category = Category(name="Electronics", description="Test category")
            db.session.add(category)

            merchant = User(
                email="merchant@test.com",
                name="Test Merchant",
                role=UserRole.MERCHANT
            )
            merchant.set_password("testpass")
            db.session.add(merchant)
            db.session.commit()  # Commit to get IDs

            product = Product(
                merchant_id=merchant.id,
                category_id=category.id,
                name="Test Product",
                description="Test description",
                price=100.00,
                stock_quantity=10
            )
            db.session.add(product)
            db.session.commit()

            yield

            db.drop_all()

    def test_get_products(self, client, init_database):
        """Test getting products list"""
        response = client.get('/api/v1/products')
        assert response.status_code == 200

        data = response.get_json()
        assert data['success'] is True
        assert 'products' in data['data']
        assert len(data['data']['products']) > 0

    def test_get_product_by_id(self, client, init_database):
        """Test getting single product"""
        # Get first product ID
        response = client.get('/api/v1/products')
        products = response.get_json()['data']['products']
        product_id = products[0]['id']

        # Get product details
        response = client.get(f'/api/v1/products/{product_id}')
        assert response.status_code == 200

        data = response.get_json()
        assert data['success'] is True
        assert data['data']['name'] == "Test Product"
