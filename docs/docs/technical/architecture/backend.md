---
sidebar_position: 3
---

# ⚙️ Backend Architecture

NestJS backend with Domain-Driven Design (DDD) and Clean Architecture principles.

## 🛠️ Technologies

- **NestJS**: Progressive Node.js framework for building efficient, scalable server-side applications
- **Prisma ORM**: Next-generation ORM for type-safe database access
- **PostgreSQL**: Powerful, open-source relational database
- **Socket.io**: Real-time bidirectional communication via NestJS WebSocket Gateways
- **JWT**: JSON Web Token for authentication
- **bcrypt**: Password hashing
- **OpenTelemetry**: Observability and monitoring

## 🏗️ Architecture Patterns

The backend follows **Domain-Driven Design (DDD)** and **Clean Architecture**:

- **Domain-Driven Design (DDD)**: Business logic organized by domains
- **Clean Architecture**: Separation of concerns (domain, application, infrastructure, presentation)
- **Use Cases**: Application logic encapsulated in use cases
- **Repositories**: Data access abstracted via repository pattern with Prisma

## 📁 Project Structure

```
application/backend/
├── src/
│   ├── domain/              # Core business logic (entities, value objects)
│   │   ├── auth/            # Authentication domain
│   │   ├── quiz/            # Quiz management domain
│   │   └── game/            # Game play domain
│   ├── application/         # Use cases and DTOs
│   │   ├── auth/            # Auth use cases
│   │   ├── quiz/            # Quiz use cases
│   │   └── game/            # Game use cases
│   ├── infrastructure/      # External implementations
│   │   ├── database/        # Prisma repositories
│   │   ├── auth/            # Auth controllers
│   │   ├── quiz/            # Quiz controllers
│   │   ├── game/            # Game controllers & gateway
│   │   ├── health/          # Health check endpoints
│   │   └── telemetry/       # OpenTelemetry observability
│   └── main.ts              # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
├── package.json
└── test/                    # E2E tests
```

## 🔌 REST API Endpoints

All HTTP routes are exposed under the global `/api` prefix (e.g. `/api/login`).

### Health Checks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Complete health check (database, disk, memory) | ✗ |
| GET | `/health/ready` | Readiness probe (database connection) | ✗ |
| GET | `/health/live` | Liveness probe (memory check) | ✗ |

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ✗ |
| POST | `/login` | Login and get JWT token | ✗ |

### Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile/me` | Retrieve authenticated user profile | ✓ |
| PATCH | `/profile/me` | Update username / email | ✓ |
| POST | `/profile/me/avatar` | Regenerate deterministic avatar | ✓ |

### Avatar Media

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/avatars/users/:userId` | Stream the latest SVG avatar for a registered user. Responses include cache-busting `?v=` fingerprint query parameters. | ✗* |
| GET | `/avatars/sessions/:sessionId/:seed` | Generate transient SVG avatars for lobby/game participants (seeded per session). | ✗* |

> \*Avatars are intentionally served without authentication to enable CDN/browser caching. The `?v=` fingerprint is derived from the stored SVG payload to ensure browsers fetch the most recent avatar immediately after regeneration.

### Quiz Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quizzes` | List all quizzes | ✓ |
| POST | `/quizzes` | Create a new quiz | ✓ |
| GET | `/quizzes/:id` | Get quiz details | ✓ |
| PUT | `/quizzes/:id` | Update a quiz | ✓ |
| DELETE | `/quizzes/:id` | Delete a quiz | ✓ |

### Question Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quizzes/:id/questions` | Get all questions for a quiz | ✓ |
| POST | `/quizzes/:id/questions` | Add a question to a quiz | ✓ |
| PUT | `/questions/:id` | Update a question | ✓ |
| DELETE | `/questions/:id` | Delete a question | ✓ |

### Game Sessions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sessions` | Create a game session | ✓ |
| GET | `/sessions/:pin` | Get session by PIN | ✓ |

## 🔌 WebSocket Events

Real-time gameplay events via Socket.io:

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-game` | Client → Server | Join a game session |
| `player-joined` | Server → Clients | Notify all players of new player |
| `start-game` | Client → Server | Start the game (admin only) |
| `game-started` | Server → Clients | Notify all players game has started |
| `submit-answer` | Client → Server | Submit an answer to a question |
| `answer-result` | Server → Client | Send answer result to player |
| `next-question` | Client → Server | Move to next question (admin only) |
| `game-ended` | Server → Clients | Notify all players game has ended |
| `player-left` | Server → Clients | Notify all players of disconnection |

## 🗄️ Database Schema

### Database Technology

**PostgreSQL** with **Prisma ORM** for type-safe database access.

Prisma manages the database schema and migrations. The schema is defined in `application/backend/prisma/schema.prisma`.

### Key Models

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)            │
│ username           │
│ email              │
│ password (hash)    │
│ isAdmin            │
│ createdAt          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│       Quiz          │
├─────────────────────┤
│ id (PK)            │
│ title              │
│ description        │
│ createdById (FK)   │
│ createdAt          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│     Question        │
├─────────────────────┤
│ id (PK)            │
│ quizId (FK)        │
│ questionText       │
│ type               │
│ correctAnswer *    │
│ optionA            │
│ optionB            │
│ optionC            │
│ optionD            │
│ timeLimit          │
│ points             │
└─────────────────────┘

* correctAnswer format:
  - For type="multiple": "A", "B", "C", or "D" (option key)
  - For type="truefalse": "true" or "false"
         │
         │ N:1
         ↓
┌─────────────────────┐
│   GameSession       │
├─────────────────────┤
│ id (PK)            │
│ quizId (FK)        │
│ pin (unique)       │
│ status             │
│ currentQuestion    │
│ createdAt          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│       Score         │
├─────────────────────┤
│ id (PK)            │
│ sessionId (FK)     │
│ userId (FK)        │
│ questionId (FK)    │
│ points             │
│ answerTime         │
│ isCorrect          │
│ answeredAt         │
└─────────────────────┘
```

### Database Migrations

Prisma migrations are stored in `application/backend/prisma/migrations/`. 

To create a new migration:
```bash
cd backend
npx prisma migrate dev --name description_of_change
```

To apply migrations in production:
```bash
npx prisma migrate deploy
```

## 🔐 Security

### Authentication Flow

**JWT (JSON Web Token) authentication:**

```
1. User login → Email + password
2. Backend verifies → bcrypt.compare()
3. JWT generated → jwt.sign({id, username, isAdmin})
4. Token returned → Client stores in memory
5. Subsequent requests → Header: Authorization: Bearer <token>
6. Middleware verifies → jwt.verify()
```

### Password Security

- Hash with **bcrypt** (salt rounds: 10)
- Never store passwords in plain text
- Validate on the server side
- Enforce password complexity requirements

### Route Protection

NestJS uses **Guards** for route protection:

```typescript
// JWT Authentication Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Usage in controllers
@Controller('quizzes')
export class QuizController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    // req.user contains the authenticated user
    // Protected route
  }
}
```

## 📊 Observability

The backend includes **OpenTelemetry** integration for comprehensive observability:

- **Distributed Tracing**: Track requests across the application
- **Metrics**: Monitor performance and health
- **Structured Logging**: Correlated with traces

See [Monitoring Guide](../monitoring.md) for details.

## 🎮 Game Flow

### 1. Creating a Game

```
Admin → Selects quiz → Creates session → PIN generated
                                              ↓
                                        Share PIN
```

### 2. Joining a Game

```
Player → Enters PIN → Validates session → Joins lobby
                                              ↓
                                        Waits for start
```

Player roster payloads now include `avatar` fields that point to the session-based `/api/avatars/sessions/:sessionId/:seed` endpoint. Frontend clients should resolve these relative URLs against the configured API origin (see `resolveAvatarUrl` helper) rather than expecting base64 blobs.

### 3. Running the Game

```
Admin starts
    ↓
Question 1 displayed → Timer starts
    ↓
Players answer → Score calculation (accuracy + time)
    ↓
Results displayed → Leaderboard updated
    ↓
Admin moves to Question 2 → Repeat
    ↓
Final question → Final podium
```

### 4. Scoring Calculation

```javascript
const basePoints = question.points; // e.g., 1000
const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
const totalPoints = isCorrect ? basePoints + timeBonus : 0;

// Example:
// - Correct answer in 5s out of 20s
// - Points: 1000 + (15/20 * 500) = 1375 points
```

## 🧪 Testing

- **Unit Tests**: Test domain logic and use cases
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete workflows

See [Testing Guide](../testing.md) for complete details.

## 🔗 Related Documentation

- [Security Policy](../security.md) - Complete security guidelines
- [Testing Guide](../testing.md) - Testing strategies
- [Monitoring Guide](../monitoring.md) - Observability setup
- [Docker Guide](../docker-guide.md) - Containerization
