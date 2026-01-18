# MarketHub Backend API

A comprehensive multi-vendor marketplace platform backend built with Flask, featuring product management, order processing, payment integration, delivery coordination, and advanced analytics.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Backups](#database-backups)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

### Core Functionality
- **Multi-vendor Marketplace**: Support for multiple merchants selling products
- **Order Management**: Split orders by merchant with individual tracking
- **Payment Integration**: M-Pesa STK Push and Cash on Delivery (COD)
- **Hub-based Delivery**: Centralized delivery coordination through hubs
- **Product Reviews**: Customer reviews and ratings system
- **Refund System**: Comprehensive refund request and processing workflow

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Customer, Merchant, Hub Staff, Admin)
- Password hashing with Bcrypt
- Email verification and password reset
- Session management

### Security Features
- Rate limiting to prevent abuse
- CORS enabled with configurable origins
- Input validation with Marshmallow schemas
- SQL injection prevention via SQLAlchemy ORM
- Secure password storage
- Environment-based configuration

### Third-party Integrations
- **Cloudinary**: Image uploads for products and evidence
- **M-Pesa (Safaricom)**: Payment processing for Kenya
- **Flask-Mail**: Email notifications
- **Sentry**: Error monitoring and tracking (optional)

### Analytics & Reporting
- Admin analytics dashboard
- Merchant analytics dashboard
- Revenue tracking and reporting
- Order statistics and trends
- Product performance metrics

### Additional Features
- Shopping cart management
- Product categories and search
- Merchant application system
- Delivery partner management
- Automated daily database backups

## Tech Stack

- **Framework:** Flask 3.0+
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic (Flask-Migrate)
- **Authentication:** Flask-JWT-Extended
- **Validation:** Marshmallow
- **Password Hashing:** Flask-Bcrypt
- **Email:** Flask-Mail
- **Rate Limiting:** Flask-Limiter
- **Image Storage:** Cloudinary
- **Payment Gateway:** M-Pesa (Daraja API)
- **Error Monitoring:** Sentry (optional)
- **CORS:** Flask-CORS

## Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Application factory
│   ├── models/               # Database models
│   │   ├── user.py          # User, UserRole
│   │   ├── product.py       # Product model
│   │   ├── category.py      # Category model
│   │   ├── cart.py          # Cart, CartItem
│   │   ├── order.py         # MasterOrder, SubOrder, OrderItem
│   │   ├── review.py        # Review model
│   │   ├── refund.py        # Refund, RefundReason, RefundStatus
│   │   ├── hub.py           # Hub model
│   │   ├── delivery_partner.py  # DeliveryPartner
│   │   └── merchant_application.py  # MerchantApplication
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # Authentication routes
│   │   ├── products.py      # Product management
│   │   ├── cart.py          # Shopping cart
│   │   ├── orders.py        # Customer orders
│   │   ├── payments.py      # Payment processing
│   │   ├── merchant.py      # Merchant dashboard
│   │   ├── merchant_orders.py   # Merchant order management
│   │   ├── merchant_reviews.py  # Merchant reviews
│   │   ├── merchant_analytics.py # Merchant analytics
│   │   ├── admin.py         # Admin management
│   │   ├── admin_orders.py  # Admin order management
│   │   ├── admin_hub_staff.py   # Hub staff management
│   │   ├── admin_analytics.py   # Admin analytics
│   │   ├── admin_merchant_applications.py  # Merchant approvals
│   │   ├── hub_staff.py     # Delivery coordination
│   │   ├── reviews.py       # Review endpoints
│   │   └── profile.py       # User profiles
│   ├── services/            # Business logic
│   │   ├── email_service.py     # Email notifications
│   │   ├── mpesa_service.py     # M-Pesa integration
│   │   └── cloudinary_service.py # Image uploads
│   └── utils/               # Utilities
│       ├── decorators.py    # Auth decorators
│       └── validators.py    # Input validators
├── migrations/              # Database migrations
├── scripts/                 # Utility scripts
│   ├── backup_db.sh        # Database backup script
│   ├── restore_db.sh       # Database restore script
│   └── README.md           # Backup documentation
├── backups/                # Database backups (gitignored)
├── config.py               # Configuration classes
├── run.py                  # Application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 16+
- pip (Python package manager)
- virtualenv (recommended)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd MarketHub/backend
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate 
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

## Configuration

### Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://markethub_user:password@localhost:5432/markethub_db

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# M-Pesa (Safaricom Daraja API)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback

# Sentry (Optional - Error Monitoring)
SENTRY_DSN=your-sentry-dsn

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Database Setup

### Step 1: Install PostgreSQL

On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Step 2: Create Database and User

```bash
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE markethub_db;
CREATE USER markethub_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE markethub_db TO markethub_user;
ALTER DATABASE markethub_db OWNER TO markethub_user;

# Grant schema permissions
\c markethub_db
ALTER SCHEMA public OWNER TO markethub_user;
GRANT ALL ON SCHEMA public TO markethub_user;
\q
```

### Step 3: Run Migrations

```bash
# Initialize migrations (first time only)
flask db init

# Create migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

## Running the Application

### Development Mode

```bash
python run.py
```

The application will be available at `http://localhost:5000`

### Production Mode

```bash
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List all products | No |
| GET | `/products/:id` | Get product details | No |
| POST | `/merchant/products` | Create product | Merchant |
| PUT | `/merchant/products/:id` | Update product | Merchant |
| DELETE | `/merchant/products/:id` | Delete product | Merchant |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user cart | Customer |
| POST | `/cart/items` | Add item to cart | Customer |
| PUT | `/cart/items/:id` | Update cart item | Customer |
| DELETE | `/cart/items/:id` | Remove from cart | Customer |
| DELETE | `/cart/clear` | Clear cart | Customer |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create order | Customer |
| GET | `/orders` | List user orders | Customer |
| GET | `/orders/:id` | Get order details | Customer |
| GET | `/merchant/orders` | List merchant orders | Merchant |
| PUT | `/merchant/orders/:id/status` | Update order status | Merchant |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/mpesa/initiate` | Initiate M-Pesa payment | Customer |
| POST | `/payments/mpesa/callback` | M-Pesa callback | No |
| POST | `/payments/cod/confirm` | Confirm COD payment | Hub Staff |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Create review | Customer |
| GET | `/products/:id/reviews` | Get product reviews | No |
| GET | `/merchant/reviews` | Get merchant reviews | Merchant |

### Refund Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/refunds` | Request refund | Customer |
| GET | `/admin/refunds` | List refund requests | Admin |
| PUT | `/admin/refunds/:id/approve` | Approve refund | Admin |
| PUT | `/admin/refunds/:id/deny` | Deny refund | Admin |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/:id/role` | Update user role | Admin |
| GET | `/admin/analytics` | Get analytics dashboard | Admin |
| GET | `/admin/merchant-applications` | List applications | Admin |
| PUT | `/admin/merchant-applications/:id` | Process application | Admin |

For complete API documentation with request/response examples, see the [API Documentation](docs/API.md).

## Database Backups

The backend includes automated database backup and restore functionality.

### Automated Backups

Backups run automatically daily at 2:00 AM via cron job:
- Creates compressed PostgreSQL dumps (`.sql.gz`)
- 30-day retention policy
- Stored in `backend/backups/`

### Manual Backup

```bash
./scripts/backup_db.sh
```

### Restore from Backup

```bash
./scripts/restore_db.sh backups/markethub_backup_TIMESTAMP.sql.gz
```

See [scripts/README.md](scripts/README.md) for detailed backup documentation.

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Test Database

Tests use a separate test database configured in `config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'postgresql://markethub_user:password@localhost:5432/markethub_test_db'
```

## Deployment

### Production Checklist

- [ ] Set `FLASK_ENV=production` in `.env`
- [ ] Use strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure PostgreSQL with strong passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure Sentry for error monitoring
- [ ] Set up automated backups
- [ ] Configure proper CORS origins
- [ ] Review rate limiting settings
- [ ] Set up monitoring and logging

### Recommended Stack

- **Web Server:** Nginx (reverse proxy)
- **WSGI Server:** Gunicorn
- **Process Manager:** Supervisor or systemd
- **Database:** PostgreSQL 16+ (managed instance recommended)
- **Caching:** Redis (optional)
- **SSL:** Let's Encrypt

### Environment Variables for Production

Ensure all sensitive credentials are set via environment variables, never hardcoded.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue in the repository
- Contact: support@markethub.com

## Acknowledgments

Built with Flask and modern Python ecosystem tools.