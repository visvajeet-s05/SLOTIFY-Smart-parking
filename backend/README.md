# Smart Parking Backend API

A production-ready backend API for the Smart Parking System with support for both traditional and crypto payments.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Booking Management**: Complete booking lifecycle management
- **Payment Processing**: Stripe integration for traditional payments
- **Crypto Payments**: Blockchain integration for crypto payments
- **Admin Dashboard**: Audit trails and payment monitoring
- **Blockchain Indexer**: Real-time blockchain event listening

## Tech Stack

- **Node.js** with TypeScript
- **Express.js** for API routing
- **Prisma ORM** for database management
- **PostgreSQL** database
- **Stripe** for payment processing
- **Ethers.js** for blockchain integration
- **JWT** for authentication

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Bookings
- `POST /api/bookings` - Create new booking (requires auth)

### Payments
- `POST /api/payments/stripe` - Create Stripe payment intent (requires auth)

### Crypto Payments
- `POST /api/crypto/pay` - Create crypto payment (requires auth)

### Admin
- `GET /api/admin/payments` - Get all blockchain payments (requires admin role)

## Environment Variables

Required environment variables are defined in `.env.example`. Make sure to set all required variables before running the application.

## Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **User**: User management with roles
- **Booking**: Parking slot bookings
- **BlockchainPayment**: Crypto payment audit trail

## Security

- JWT authentication with secure secrets
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable validation

## Development

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Prisma**: Database schema management

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production database (PostgreSQL)
3. Configure proper JWT secrets
4. Set up SSL/TLS
5. Use a process manager (PM2, etc.)
6. Configure proper CORS origins

## Monitoring

The backend includes:
- Blockchain event monitoring
- Payment audit trails
- Admin dashboard for monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License