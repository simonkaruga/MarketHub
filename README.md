# MarketHub

A comprehensive multi-vendor marketplace platform with product management, order processing, payment integration (M-Pesa), hub-based delivery coordination, and advanced analytics.

## Quick Start

### Start Both Servers

```bash
./start.sh
```

This will start:
- **Backend** (Flask) on http://localhost:5000
- **Frontend** (Vite/React) on http://localhost:3000
- **LiveLInk** https://markethubz.vercel.app 

### Stop Both Servers

```bash
./stop.sh
```

### Check Server Status

```bash
./status.sh
```

## Project Structure

```
MarketHub/
├── backend/              # Flask API server
│   ├── app/             # Application code
│   ├── migrations/      # Database migrations
│   ├── scripts/         # Utility scripts (backups)
│   ├── Pipfile          # Python dependencies (Pipenv)
│   ├── config.py        # Configuration
│   └── run.py           # Entry point
├── frontend/            # React frontend
│   └── market app/      # Vite + React application
├── start.sh             # Start both servers
├── stop.sh              # Stop both servers
├── status.sh            # Check server status
└── README.md            # This file
```

## Features

### Core Functionality
- Multi-vendor marketplace with merchant management
- Product catalog with categories, search, and advanced filtering
- Shopping cart and checkout with multiple payment options
- Order management with merchant-based splitting
- M-Pesa payment integration (STK Push)
- Cash on Delivery (COD) with hub-based pickup
- Hub-based delivery coordination and verification
- Product reviews and ratings system
- Merchant application workflow
- Password reset and account management

### User Roles & Capabilities

#### Customer
- Browse products with filtering (category, price, search)
- Shopping cart management
- Checkout with M-Pesa or Cash on Delivery
- Order tracking and history
- Product reviews with photos (verified purchases)
- Apply to become a merchant
- Profile management

#### Merchant
- **Dashboard**: Quick stats overview (revenue, orders, products, ratings)
- **Products**: Full CRUD operations with image uploads
- **Orders**: View and manage orders, update status, mark ready for pickup
- **Analytics**: Revenue tracking, top products, growth metrics, charts
- **Reviews**: View customer reviews, respond to feedback, flag inappropriate content

#### Hub Staff
- **Dashboard**: Order verification and pickup management
- QR code scanning for quick verification (placeholder)
- Approve/reject orders after quality checks
- Mark orders as picked up by customers
- Track daily statistics (pending, ready, completed)

#### Admin
- **Dashboard**: Platform overview with quick actions
- **Merchant Applications**: Review, approve, or reject merchant applications
- **Orders**: Platform-wide order management and dispute resolution
- **Analytics**: Revenue trends, user growth, top merchants, top products
- **Hub Staff Management**: Create, edit, assign staff to hubs

### Security
- JWT token authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- CORS protection
- Secure password hashing

### Integrations
- **M-Pesa**: Safaricom Daraja API for payments
- **Cloudinary**: Image storage and management
- **PostgreSQL**: Production-grade database
- **Sentry**: Error monitoring (optional)

## Setup

### Prerequisites

- **Backend**: Python 3.12+, PostgreSQL 16+, Pipenv
- **Frontend**: Node.js 18+, npm

### Backend Setup

```bash
cd backend

# Install dependencies with Pipenv
pipenv install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Setup PostgreSQL database
sudo -u postgres psql
CREATE DATABASE markethub_db;
CREATE USER markethub_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE markethub_db TO markethub_user;

# Run migrations
pipenv run flask db upgrade

# Start server
pipenv run python run.py
```

See [backend/README.md](backend/README.md) for detailed documentation.

### Frontend Setup

```bash
cd "frontend/market app"

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Backups

Automated PostgreSQL backups run daily at 2:00 AM:

```bash
# Manual backup
./backend/scripts/backup_db.sh

# Restore from backup
./backend/scripts/restore_db.sh backend/backups/markethub_backup_TIMESTAMP.sql.gz
```

See [backend/scripts/README.md](backend/scripts/README.md) for details.

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Key Endpoints

- **Auth**: `/auth/register`, `/auth/login`, `/auth/me`
- **Products**: `/products`, `/merchant/products`
- **Cart**: `/cart`, `/cart/items`
- **Orders**: `/orders`, `/merchant/orders`
- **Payments**: `/payments/mpesa/initiate`, `/payments/cod/confirm`
- **Reviews**: `/reviews`, `/products/:id/reviews`
- **Admin**: `/admin/users`, `/admin/analytics`, `/admin/refunds`

See [backend/README.md](backend/README.md) for complete API documentation.

## Development

### Running Tests

```bash
# Backend tests
cd backend
pipenv run pytest

# With coverage
pipenv run pytest --cov=app
```

### Useful Commands

```bash
# Backend
pipenv run flask db migrate -m "description"  # Create migration
pipenv run flask db upgrade                   # Apply migrations
pipenv run flask db downgrade                 # Rollback migration
pipenv shell                                  # Activate virtual environment

# Frontend
npm run build                                 # Production build
npm run preview                               # Preview production build
```

## Tech Stack

### Backend
- Flask 3.0
- SQLAlchemy 2.0
- PostgreSQL 16
- Pipenv (Python 3.12)
- JWT Authentication
- M-Pesa Integration
- Cloudinary

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Axios
- React Hot Toast

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/markethub_db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAIL_SERVER=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Deployment

### Production Checklist

Backend:
- [ ] Set `FLASK_ENV=production`
- [ ] Use strong secret keys
- [ ] Configure PostgreSQL with SSL
- [ ] Set up Nginx reverse proxy
- [ ] Configure Sentry for error monitoring
- [ ] Set up automated backups
- [ ] Configure proper CORS origins
- [ ] Use Gunicorn as WSGI server

Frontend:
- [ ] Build production bundle (`npm run build`)
- [ ] Serve via Nginx or CDN
- [ ] Configure environment-specific API URLs
- [ ] Enable HTTPS

### Recommended Stack
- **Web Server**: Nginx
- **WSGI Server**: Gunicorn
- **Database**: PostgreSQL 16+ (managed)
- **Hosting**: AWS, DigitalOcean, or Heroku
- **SSL**: Let's Encrypt

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions :
- Create an issue in the repository
- Email: support@markethub.com

## Acknowledgments

Built with Flask, React, and modern development tools.