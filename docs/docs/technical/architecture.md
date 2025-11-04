---
sidebar_position: 1
---

# 🏗️ QuizMaster Architecture

Complete documentation of the application's architecture.

## 🎯 Architectural Principles

This application follows modern, maintainable architectural principles:

### Design Principles
- **Separation of concerns**: Frontend, backend, and database are decoupled
- **Intentional monolithic architecture**: Simplicity for the current context (MVP/learning)
- **RESTful API**: Clear, standardized interface between frontend and backend
- **Real-time via WebSocket**: Bidirectional communication for gameplay
- **Stateless backend**: JWT authentication, horizontal scalability is possible

### Modern Technologies
- **React 18**: Modern UI framework with hooks and concurrent features
- **Vite**: Fast, modern build tool (replacement for Webpack/CRA)
- **Tailwind CSS**: Utility-first CSS framework, maintainable and performant
- **NestJS**: Progressive Node.js framework for building efficient, scalable server-side applications
- **Prisma**: Next-generation ORM for type-safe database access
- **PostgreSQL**: Powerful, open-source relational database
- **Socket.io**: Real-time bidirectional event-based communication via NestJS WebSocket Gateways
- **Docker**: Containerization for consistent deployment
- **CNCF-ready**: Architecture compatible with Kubernetes, Prometheus, OpenTelemetry

### Future Scalability
The current architecture can evolve toward:
- **Microservices**: Split services (auth, quiz, game, leaderboard)
- **Kubernetes**: Orchestration and automatic scaling
- **Redis**: Distributed cache and session store
- **Message queue**: RabbitMQ/Kafka for asynchronous events
- **GraphQL**: Optional migration to GraphQL API for more flexible data fetching

## 📐 Overview

```
┌─────────────────────────────────────────────────────────────┐
│                            USERS                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Frontend)                          │
│  - Serve React static assets                                │
│  - Proxy to the backend                                     │
│  - SSL/TLS termination                                      │
│  - gzip compression                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ↓                     ↓
┌─────────────┐      ┌──────────────────┐
│   React     │      │  NestJS Backend  │
│   Frontend  │◄────►│                  │
│             │ WS   │  - REST API      │
│  - UI/UX    │      │  - WebSockets    │
│  - Socket.io│      │  - JWT auth      │
│  - State    │      │  - Prisma ORM    │
└─────────────┘      └────────┬─────────┘
                              │
                              ↓
                     ┌────────────────┐
                     │ PostgreSQL DB  │
                     │                │
                     │  - users       │
                     │  - quizzes     │
                     │  - questions   │
                     │  - sessions    │
                     │  - scores      │
                     └────────────────┘
```

## 🎯 Main Components

### 1. Frontend (React + Vite)

**Technologies:**
- React 18
- Vite (build tool)
- Tailwind CSS
- Socket.io-client

**Structure:**
```
frontend/
├── src/
│   ├── App.tsx                    # Main orchestrator
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── ARCHITECTURE.md            # Frontend architecture documentation
│   ├── domains/                   # Domain logic (DDD)
│   │   ├── auth/                  # Authentication domain
│   │   ├── quiz/                  # Quiz management domain
│   │   └── game/                  # Game domain
│   ├── features/                  # Feature modules
│   │   ├── home/                  # Home page
│   │   ├── authentication/        # Sign in/up
│   │   ├── quiz-management/       # Quiz admin management
│   │   └── game-play/             # Gameplay (lobby, playing, leaderboard)
│   └── shared/                    # Shared infrastructure
│       ├── config/                # Configuration
│       ├── socket/                # WebSocket client
│       ├── types/                 # TypeScript types
│       └── hooks/                 # Custom React hooks
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**Key views:**
- Home
- Login/Register (authentication)
- Admin (quiz management)
- Manage Questions (question editing)
- Join (join a game)
- Lobby (waiting room)
- Playing (live game)
- Leaderboard (ranking)

**Data flow:**
```
User Action → State Update → API Call/WebSocket → Backend
                ↓
            UI Update ← Backend Response
```

### 2. Backend (NestJS + Prisma)

**Technologies:**
- NestJS (Progressive Node.js framework)
- Prisma ORM (Type-safe database access)
- PostgreSQL (Relational database)
- Socket.io (WebSockets via NestJS Gateways)
- JWT (jsonwebtoken)
- bcrypt

**Architecture:**
- **Domain-Driven Design (DDD)**: Business logic organized by domains
- **Clean Architecture**: Separation of concerns (domain, application, infrastructure, presentation)
- **Use Cases**: Application logic encapsulated in use cases
- **Repositories**: Data access abstracted via repository pattern with Prisma

**Structure:**
```
backend/
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

**REST API endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registration | ✗ |
| POST | `/login` | Login | ✗ |
| GET | `/health` | Health check | ✗ |
| GET | `/health/ready` | Readiness probe | ✗ |
| GET | `/health/live` | Liveness probe | ✗ |
| GET | `/quizzes` | List quizzes | ✓ |
| POST | `/quizzes` | Create a quiz | ✓ |
| GET | `/quizzes/:id` | Get quiz details | ✓ |
| PUT | `/quizzes/:id` | Update a quiz | ✓ |
| DELETE | `/quizzes/:id` | Delete a quiz | ✓ |
| GET | `/quizzes/:id/questions` | Questions of a quiz | ✓ |
| POST | `/quizzes/:id/questions` | Add a question | ✓ |
| PUT | `/questions/:id` | Update a question | ✓ |
| DELETE | `/questions/:id` | Delete a question | ✓ |
| POST | `/sessions` | Create a game session | ✓ |
| GET | `/sessions/:pin` | Get session by PIN | ✓ |

**WebSocket events:**

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-game` | Client → Server | Join a game |
| `player-joined` | Server → Clients | New player |
| `start-game` | Client → Server | Start the game (admin) |
| `game-started` | Server → Clients | Game started |
| `submit-answer` | Client → Server | Submit an answer |
| `answer-result` | Server → Client | Answer result |
| `next-question` | Client → Server | Next question (admin) |
| `game-ended` | Server → Clients | Game ended |
| `player-left` | Server → Clients | Player disconnected |

### 3. Database (PostgreSQL + Prisma)

**Schema (Prisma):**

Prisma manages the database schema and migrations. The schema is defined in `backend/prisma/schema.prisma`.

**Key Models:**

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
│ correctAnswer      │
│ optionA            │
│ optionB            │
│ optionC            │
│ optionD            │
│ timeLimit          │
│ points             │
└─────────────────────┘
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

**Migrations:**
Prisma migrations are stored in `backend/prisma/migrations/`. To create a new migration:
```bash
cd backend
npx prisma migrate dev --name description_of_change
```
```

## 🔐 Security

### Authentication

**JWT flow:**
```
1. User login → Email + password
2. Backend verifies → bcrypt.compare()
3. JWT generated → jwt.sign({id, username, isAdmin})
4. Token returned → Client stores in memory
5. Subsequent requests → Header: Authorization: Bearer <token>
6. Middleware verifies → jwt.verify()
```

**Password storage:**
- Hash with bcrypt (salt rounds: 10)
- Never store in plain text
- Validate on the server side

### Route protection

NestJS uses Guards for route protection:

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

## 🎮 Game Flow

### 1. Creating a game

```
Admin → Selects quiz → Creates session → PIN generated
                                              ↓
                                        Share PIN
```

### 2. Joining a game

```
Player → Enters PIN → Validates session → Joins lobby
                                              ↓
                                        Waits for start
```

### 3. Running the game

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

### 4. Scoring calculation

```javascript
const basePoints = question.points; // e.g., 1000
const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
const totalPoints = isCorrect ? basePoints + timeBonus : 0;

// Example:
// - Correct answer in 5s out of 20s
// - Points: 1000 + (5/20 * 500) = 1125 points
```

## 🐳 Docker Architecture

### Development

```yaml
┌──────────────────┐
│  docker-compose  │
│      dev         │
└────────┬─────────┘
         │
    ┌────┴─────┬──────────┐
    ↓          ↓          ↓
┌─────────┐ ┌──────────┐ ┌──────────┐
│ Backend │ │ Frontend │ │PostgreSQL│
│ NestJS  │ │ React +  │ │ Database │
│ Port    │ │ Vite     │ │ Port     │
│ 3001    │ │ Port 5173│ │ 5432     │
└─────────┘ └──────────┘ └──────────┘
```

### Production

```yaml
┌──────────────────────┐
│  docker-compose.prod │
└──────────┬───────────┘
           │
    ┌──────┴──────┬────────────┐
    ↓             ↓            ↓
┌─────────────┐ ┌──────────┐ ┌──────────┐
│   Backend   │ │ Frontend │ │PostgreSQL│
│   NestJS    │ │ Multi-   │ │ Database │
│ Production  │ │ stage:   │ │ Port     │
│ Port 3001   │ │ 1. Build │ │ 5432     │
└─────────────┘ │ 2. Nginx │ └──────────┘
                │ Port     │
                │ 80/443   │
                └──────────┘
```

### With Monitoring

```
┌────────────────────────────────────┐
│  docker-compose + monitoring       │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┬──────────────┐
    ↓                 ↓              ↓
┌─────────┐    ┌──────────┐   ┌──────────┐
│ Backend │    │ Frontend │   │Prometheus│
│ +       │    │          │   │          │
│ Metrics │    │          │   │ Port 9090│
└────┬────┘    └──────────┘   └────┬─────┘
     │                              │
     │         ┌────────────────────┤
     │         ↓                    ↓
     │    ┌─────────┐         ┌─────────┐
     │    │ Grafana │         │  Loki   │
     │    │Port 3000│         │Port 3100│
     │    └─────────┘         └─────────┘
     │         ↑                    ↑
     │         │                    │
     └─────────┴────────────────────┘
            Metrics + Logs
```

## 🚀 Deployment

### Deployment strategies

#### 1. Simple deployment (single server)

```
Server VPS/Cloud
├── Docker Engine
├── Application containers
├── Volumes (DB)
└── Nginx (SSL)
```

**Advantages:**
- Simple
- Low cost
- Easy to manage

**Limitations:**
- No high availability
- Limited scalability

#### 2. Deployment with load balancer

```
          ┌─────────────┐
          │Load Balancer│
          └──────┬──────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
    ┌───────┐┌───────┐┌───────┐
    │Server1││Server2││Server3│
    │Backend││Backend││Backend│
    └───┬───┘└───┬───┘└───┬───┘
        └────────┼────────┘
                 ↓
          ┌──────────┐
          │ Database │
          │ (Shared) │
          └──────────┘
```

**Advantages:**
- High availability
- Horizontal scalability
- Load distribution

#### 3. Kubernetes deployment (advanced)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quizmaster-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: quizmaster/backend:latest
        ports:
        - containerPort: 3001
```

## 📊 Performance

### Frontend optimizations

1. **Code splitting**
```javascript
const Admin = lazy(() => import('./views/Admin'));
```

2. **Memoization**
```javascript
const MemoizedComponent = React.memo(ExpensiveComponent);
```

3. **Debouncing**
```javascript
const debouncedSearch = debounce(searchFunction, 300);
```

### Backend optimizations

1. **Connection pooling** (if PostgreSQL)
2. **Redis caching** (optional)
3. **gzip compression**
4. **Rate limiting**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit of 100 requests
});

app.use('/api/', limiter);
```

### Database optimizations

With Prisma and PostgreSQL:

```typescript
// Prisma automatically creates indexes for:
// - Primary keys (@id)
// - Unique fields (@unique)
// - Foreign keys (relations)

// Additional custom indexes can be defined in schema.prisma:
model Quiz {
  id          Int      @id @default(autoincrement())
  title       String
  createdById Int      @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([createdById]) // Custom index
  @@index([createdAt])   // Custom index
  @@map("quizzes")
}
```

**Connection Pooling:**
Prisma manages connection pooling automatically. Configure in `.env`:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

## 🔄 CI/CD

### GitHub Actions pipeline

```
Push to main
    ↓
Build & Test
    ↓
Security Scan (Trivy)
    ↓
Build Docker Images
    ↓
Push to Docker Hub
    ↓
Deploy to Production
    ↓
Health Checks
    ↓
Notifications
```

## 📈 Scalability

### Current limits (single server)

- ~1000 concurrent users (with PostgreSQL)
- ~50 concurrent quizzes
- PostgreSQL (excellent for concurrent reads and writes)
- Horizontal scalability via load balancing

### Potential improvements

1. **Redis**: Caching and sessions
2. **CDN**: Static assets
3. **Load balancer**: Multiple instances
4. **Message queue**: Asynchronous tasks
5. **GraphQL**: Optional migration for more flexible API

## 🛠️ Maintenance

### Logs

```bash
# Log structure
logs/
├── backend.log      # Application logs
├── nginx-access.log # HTTP access
├── nginx-error.log  # HTTP errors
└── docker.log       # Container logs
```

### Monitoring

- **Metrics**: CPU, RAM, disk, network
- **APM**: Latency, errors, throughput
- **Logs**: Aggregation and search
- **Alerts**: Automatic notifications

## 📚 API Documentation

See the full Swagger documentation at `/api/docs` (if implemented)

## 🔗 External Resources

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [Docker](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/)