# QuizMaster Backend (NestJS)

Modern backend for the QuizMaster quiz application, built with NestJS, Prisma, and PostgreSQL, following Clean Architecture, Domain-Driven Design (DDD), and best practices.

## 📚 Documentation

**Complete documentation is available in the [centralized docs](/docs):**
- **[Architecture](/docs/docs/technical/architecture.md)** - Complete system architecture
- **[Testing](/docs/docs/technical/testing.md)** - Testing guide and strategies
- **[Docker Guide](/docs/docs/technical/docker-guide.md)** - Docker setup and commands

**Backend-specific documentation:**
- [Health Checks](./src/infrastructure/health/README.md) - Health monitoring
- [OpenTelemetry](./src/infrastructure/telemetry/README.md) - Observability

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
│   │   ├── telemetry/       # OpenTelemetry logging & tracing
│   │   └── repositories/    # Prisma repositories
│   └── presentation/        # API layer
├── prisma/
│   └── schema.prisma        # Database schema
└── test/                    # E2E tests
```

## 📊 Observability (OpenTelemetry)

The backend includes comprehensive OpenTelemetry integration for:
- **Distributed Tracing**: Track requests across the application
- **Metrics**: Monitor performance and health
- **Structured Logging**: Correlated with traces

### Quick Setup

For development, logs are output to console by default. For production observability:

```bash
# Configure OTLP endpoint (e.g., Jaeger, Grafana Tempo)
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Restart the application
npm run start:dev
```

See [telemetry README](./src/infrastructure/telemetry/README.md) for complete documentation.

### Example: Using the Logger

```typescript
import { OtelLoggerService } from '@infrastructure/telemetry';

const logger = new OtelLoggerService();
logger.setContext('MyService');
logger.log('Operation started');
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

JWT-based authentication with Passport.js strategy. See [Backend Architecture](/docs/docs/technical/architecture/backend.md#security) for complete details.

## 📚 API Documentation

For complete API documentation including REST endpoints and WebSocket events, see [Backend Architecture](/docs/docs/technical/architecture/backend.md).

### Health Check Endpoints

- `GET /health` - Complete health check (database, disk, memory)
- `GET /health/ready` - Readiness probe (database connection)
- `GET /health/live` - Liveness probe (memory check)

See [health check documentation](./src/infrastructure/health/README.md) for details.

## 📖 Documentation

- [Backend Architecture](/docs/docs/technical/architecture/backend.md) - Complete backend architecture
- [Frontend Architecture](/docs/docs/technical/architecture/frontend.md) - Frontend architecture
- [Architecture Overview](/docs/docs/technical/architecture/index.md) - System architecture overview
- [OpenTelemetry Guide](./src/infrastructure/telemetry/README.md) - Observability setup
- [Prisma Schema](./prisma/schema.prisma) - Database schema

## 📜 License

MIT
