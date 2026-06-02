# Pleey Backend (NestJS)

Modern backend for the Pleey community game platform, built with NestJS, Prisma, and PostgreSQL, following Clean Architecture, Domain-Driven Design (DDD), and best practices.

## 📚 Documentation

**Complete documentation is available in the [centralized docs](/docs):**

- **[Architecture](/docs/docs/technical/architecture.md)** - Complete system architecture
- **[Testing](/docs/docs/technical/testing.md)** - Testing guide and strategies
- **[Prisma Schema](./prisma/schema.prisma)** - Database schema

## 📁 Project Structure

```text
backend/
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

- `GET /healthz` - Kubernetes liveness probe. Lightweight Terminus check with no downstream dependency checks.
- `GET /ready` - Kubernetes readiness probe. Terminus check for application readiness and database connectivity.

## 📜 License

MIT
