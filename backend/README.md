# MarketHub Backend API

Multi-vendor marketplace platform backend built with Flask.

## Features

- User authentication (register, login, password reset)
- JWT token-based authentication
- Role-based access control (Customer, Merchant, Hub Staff, Admin)
- Password hashing with Bcrypt
- Input validation with Marshmallow
- Rate limiting to prevent abuse
- CORS enabled
- Error monitoring with Sentry (optional)

## Tech Stack

- **Framework:** Flask 3.0+
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **ORM:** SQLAlchemy
- **Authentication:** JWT (Flask-JWT-Extended)
- **Validation:** Marshmallow
- **Password Hashing:** Bcrypt
- **Email:** Flask-Mail
- **Error Monitoring:** Sentry

## Setup

See SETUP_GUIDE.md for detailed setup instructions.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Health Check

- `GET /api/v1/health` - Check API health

## Development

```bash
# Run the application
python run.py

# Application will be available at http://localhost:5000
```

## License

MIT