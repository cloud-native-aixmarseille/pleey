# QuizMaster Backend (NestJS)

Modern, refactored backend for the QuizMaster quiz application, built with NestJS, Prisma, and following Clean Architecture, Domain-Driven Design (DDD), and Test-Driven Development (TDD) principles.

## 🏗️ Architecture

This backend is built following industry best practices:

- **Clean Architecture**: Clear separation between domain, application, infrastructure, and presentation layers
- **Domain-Driven Design (DDD)**: Rich domain models, value objects, and domain services
- **Screaming Architecture**: Directory structure that clearly shows the domain (auth, quiz, game)
- **SOLID Principles**: Single responsibility, dependency inversion, and interface segregation
- **Test-Driven Development**: Comprehensive test coverage at all layers

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/quizdb"
# JWT_SECRET="your-secret-key"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with admin user
npx prisma db seed
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend-nestjs/
├── src/
│   ├── domain/              # Core business logic (DDD)
│   │   ├── auth/            # Authentication domain
│   │   ├── quiz/            # Quiz management domain
│   │   └── game/            # Game play domain
│   ├── application/         # Use cases and DTOs
│   ├── infrastructure/      # External implementations
│   └── presentation/        # API layer
├── prisma/
│   └── schema.prisma        # Database schema
└── test/                    # E2E tests
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🔒 Authentication

JWT-based authentication. See [ARCHITECTURE.md](./ARCHITECTURE.md) for API examples.

## 📚 API Documentation

### Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/quizzes` - Get all quizzes (protected)
- `POST /api/quizzes` - Create a quiz (protected)
- `POST /api/sessions/create` - Create game session (protected)

### WebSocket Events

- `join-game` - Join a game
- `start-game` - Start the game
- `submit-answer` - Submit an answer
- `get-leaderboard` - Get leaderboard

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete API documentation.

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [Prisma Schema](./prisma/schema.prisma) - Database schema

## 📜 License

MIT
