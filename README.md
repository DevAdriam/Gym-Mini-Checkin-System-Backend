# Gym Mini Check-in System Backend

A comprehensive backend system for managing gym memberships, check-ins, and member administration built with NestJS, Prisma, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [WebSocket Events](#websocket-events)
- [Authentication](#authentication)
- [Scripts](#scripts)
- [Testing](#testing)

## ✨ Features

### Member Management
- **Member Registration**: Members can register with profile photo and payment screenshots
- **Member Authentication**: JWT-based authentication for members
- **Member Profile**: Members can view and manage their profiles
- **Status Management**: Members can check their registration status and current check-in status
- **Subscription Cancellation**: Members can cancel their subscriptions

### Admin Features
- **Admin Authentication**: Secure admin login/logout with JWT
- **Member Management**: 
  - List, view, approve, reject members
  - Soft delete and restore members
  - Filter by status (pending/approved/rejected), active/expired, and search
- **Membership Package Management**:
  - Create, update, activate/deactivate packages
  - Soft delete and restore packages
  - Filter active/inactive packages
- **Image Management**: Upload and manage member profile photos and payment screenshots
- **Check-in Logs**: View all check-in logs with filtering options

### Check-in System
- **Member Check-in**: Members can check in using their member ID
- **Member Check-out**: Members can check out and track their visit duration
- **Automatic Validation**: System validates membership status and expiration before allowing check-in
- **Check-in History**: Track all check-in/check-out activities

### Real-time Features
- **WebSocket Support**: Real-time notifications for:
  - New member registrations
  - Member approval/rejection events
- **Event Broadcasting**: Admin and member-specific event channels

### Additional Features
- **File Upload**: Support for profile photos and payment screenshots
- **Static File Serving**: Images served via HTTP endpoints
- **API Versioning**: URI-based API versioning
- **Swagger Documentation**: Interactive API documentation
- **Input Validation**: Comprehensive request validation with class-validator
- **Error Handling**: Centralized error handling and custom exceptions

## 🛠 Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL
- **ORM**: Prisma 5.x
- **Authentication**: JWT (Passport.js)
- **File Upload**: Multer
- **WebSocket**: Socket.io
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcrypt
- **Environment Config**: zod
- **Code Quality**: ESLint, Prettier, Husky

## 📦 Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- PostgreSQL database
- Git

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
   cd Gym-Mini-Checkin-System-Backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npx prisma migrate dev

   # Generate Prisma Client
   npx prisma generate

   # Seed the database (optional)
   pnpm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   pnpm run start:dev

   # Production mode
   pnpm run build
   pnpm run start:prod
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gym_db?schema=public"

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here
TOKEN_EXPIRATION_TIME=7d

# Password Hashing
HASH_ROUND=10

# API Configuration
API_VERSION=v1
DEFAULT_API_VERSION=1

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
BASE_URL=http://localhost:4000

# Email Configuration (Optional)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/redirect
```

## 🗄 Database Setup

### Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Database Schema

The system uses the following main models:
- **Admin**: Admin users with authentication
- **Member**: Gym members with membership information
- **MembershipPackage**: Available membership packages
- **MemberPaymentScreenshot**: Payment proof images
- **CheckInLog**: Check-in/check-out records

See `prisma/schema.prisma` for the complete schema definition.

## 🏃 Running the Application

### Development Mode
```bash
pnpm run start:dev
```

The application will be available at `http://localhost:4000`

### Production Mode
```bash
pnpm run build
pnpm run start:prod
```

### Debug Mode
```bash
pnpm run start:debug
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:4000/docs
```

### Generate Swagger JSON
```bash
pnpm run swagger:generate
```

This generates `swagger.json` in the root directory.

### API Endpoints Overview

#### Authentication
- `POST /api/v1/admin/login` - Admin login
- `POST /api/v1/admin/logout` - Admin logout
- `POST /api/v1/members/login` - Member login
- `POST /api/v1/members/register` - Member registration

#### Member Endpoints
- `GET /api/v1/members/profile` - Get member profile (authenticated)
- `GET /api/v1/members/check-status` - Check member status by email
- `PATCH /api/v1/members/cancel-subscription` - Cancel subscription (authenticated)

#### Admin - Member Management
- `GET /api/v1/members` - List all members (with filters)
- `GET /api/v1/members/:id` - Get member details
- `PATCH /api/v1/members/:id/approve` - Approve member
- `PATCH /api/v1/members/:id/reject` - Reject member
- `DELETE /api/v1/members/:id` - Soft delete member
- `PATCH /api/v1/members/:id/restore` - Restore deleted member

#### Admin - Membership Packages
- `GET /api/v1/membership-packages` - List packages
- `GET /api/v1/membership-packages/:id` - Get package details
- `POST /api/v1/membership-packages` - Create package
- `PATCH /api/v1/membership-packages/:id` - Update package
- `PATCH /api/v1/membership-packages/:id/status` - Activate/deactivate
- `DELETE /api/v1/membership-packages/:id` - Soft delete
- `PATCH /api/v1/membership-packages/:id/restore` - Restore package

#### Admin - Images
- `GET /api/v1/members/:id/images` - Get member images
- `POST /api/v1/members/:id/images` - Upload image
- `DELETE /api/v1/images/:id` - Delete image
- `PATCH /api/v1/images/:id` - Update image metadata

#### Admin - Check-in Logs
- `GET /api/v1/checkins` - List all check-in logs
- `GET /api/v1/members/:id/checkins` - Get member check-in logs

#### Check-in/Check-out
- `POST /api/v1/checkin` - Member check-in
- `POST /api/v1/checkin/checkout` - Member check-out

## 📁 Project Structure

```
src/
├── application/          # Application layer (business logic)
│   ├── admin/           # Admin management
│   ├── auth/            # Authentication
│   ├── checkin/         # Check-in/check-out logic
│   ├── image/           # Image management
│   ├── member/          # Member management
│   └── membership-package/  # Package management
├── domain/              # Domain layer (repositories)
│   ├── admin/
│   ├── checkin/
│   ├── image/
│   ├── member/
│   └── membership-package/
├── infrastructure/      # Infrastructure layer
│   ├── auth/           # Authentication strategies & guards
│   ├── config/         # Configuration
│   ├── database/       # Database service (Prisma)
│   ├── storage/        # File storage service
│   └── websocket/      # WebSocket gateway
├── presentation/        # Presentation layer (controllers)
│   └── controllers/   # API controllers
├── common/              # Shared utilities
│   ├── decorators/     # Custom decorators
│   ├── service/        # Shared services
│   └── types/          # Type definitions
└── core/               # Core functionality
    ├── exceptions/     # Custom exceptions
    ├── filters/        # Exception filters
    └── pipes/          # Validation pipes
```

## 🔌 WebSocket Events

The system uses WebSocket (Socket.io) for real-time notifications.

### Connection
Connect to the WebSocket server at:
```
ws://localhost:4000/members
```

### Admin Events

**Subscribe to admin events:**
```javascript
socket.emit('subscribe:members');
```

**Listen for events:**
- `member:registered` - New member registration
- `member:approved` - Member approved
- `member:rejected` - Member rejected

### Member Events

**Subscribe to member-specific events:**
```javascript
socket.emit('subscribe:member-events', { memberId: 'member-uuid' });
```

**Listen for events:**
- `member:approved` - Your registration was approved
- `member:rejected` - Your registration was rejected

### Event Data Structure

```typescript
{
  event: 'member:approved' | 'member:rejected' | 'member:registered',
  data: {
    id: string,
    memberId: string,
    name: string,
    email: string,
    phone?: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    // ... additional fields
  },
  timestamp: string
}
```

## 🔒 Authentication

### Admin Authentication

1. **Login**
   ```bash
   POST /api/v1/admin/login
   Body: { "email": "admin@example.com", "password": "password" }
   ```

2. **Use Token**
   Include the token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

### Member Authentication

1. **Register**
   ```bash
   POST /api/v1/members/register
   Body: { "name": "...", "email": "...", "password": "...", ... }
   ```

2. **Login**
   ```bash
   POST /api/v1/members/login
   Body: { "email": "member@example.com", "password": "password" }
   ```

3. **Use Token**
   Include the token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

## 📜 Scripts

```bash
# Development
pnpm run start:dev        # Start in development mode with watch
pnpm run start:debug     # Start in debug mode

# Production
pnpm run build           # Build the application
pnpm run start:prod      # Start in production mode

# Code Quality
pnpm run lint            # Run ESLint
pnpm run format          # Format code with Prettier

# Testing
pnpm run test            # Run unit tests
pnpm run test:watch      # Run tests in watch mode
pnpm run test:cov        # Run tests with coverage
pnpm run test:e2e        # Run end-to-end tests

# Database
pnpm run seed            # Seed the database

# Documentation
pnpm run swagger:generate  # Generate Swagger JSON
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📝 Additional Notes

### File Uploads

- Profile photos are stored in `uploads/profiles/`
- Payment screenshots are stored in `uploads/payments/`
- Files are accessible via: `http://localhost:4000/uploads/{type}/{filename}`

### Soft Delete

The system uses soft deletes for members and packages. Deleted records have a `deletedAt` timestamp and can be restored.

### Membership Status

- **PENDING**: Member registration pending approval
- **APPROVED**: Member approved and active
- **REJECTED**: Member registration rejected

### Check-in Status

- **ALLOWED**: Check-in successful (member is approved and membership is valid)
- **DENIED**: Check-in denied (member not approved, expired, or other reason)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and unlicensed.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and open-source libraries used in this project

