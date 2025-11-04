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
- **Express.js**: Minimalist, flexible web framework
- **Socket.io**: Mature, well-maintained WebSocket library
- **Docker**: Containerization for consistent deployment
- **CNCF-ready**: Architecture compatible with Kubernetes, Prometheus, OpenTelemetry

### Future Scalability
The current architecture can evolve toward:
- **Microservices**: Split services (auth, quiz, game, leaderboard)
- **Kubernetes**: Orchestration and automatic scaling
- **PostgreSQL**: Migrate from SQLite for high concurrency
- **Redis**: Distributed cache and session store
- **Message queue**: RabbitMQ/Kafka for asynchronous events

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
│   React     │      │   Node.js/Express│
│   Frontend  │◄────►│     Backend      │
│             │ WS   │                  │
│  - UI/UX    │      │  - REST API      │
│  - Socket.io│      │  - WebSocket     │
│  - State    │      │  - JWT auth      │
└─────────────┘      └────────┬─────────┘
                              │
                              ↓
                     ┌────────────────┐
                     │  SQLite DB     │
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

### 2. Backend (Node.js + Express)

**Technologies:**
- Express.js
- Socket.io
- SQLite3
- JWT (jsonwebtoken)
- bcrypt

**Structure:**
```
backend/
├── server.js             # Main server
├── package.json
└── data/
    └── quiz.db          # Database
```

**REST API endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Registration | ✗ |
| POST | `/api/login` | Login | ✗ |
| GET | `/api/health` | Health check | ✗ |
| GET | `/api/quizzes` | List quizzes | ✓ |
| POST | `/api/quizzes` | Create a quiz | ✓ |
| DELETE | `/api/quizzes/:id` | Delete a quiz | ✓ |
| GET | `/api/quizzes/:id/questions` | Questions of a quiz | ✓ |
| POST | `/api/questions` | Add a question | ✓ |
| DELETE | `/api/questions/:id` | Delete a question | ✓ |
| POST | `/api/sessions/create` | Create a game session | ✓ |

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

### 3. Database (SQLite)

**Schema:**

```sql
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ username           │
│ email              │
│ password (hash)    │
│ is_admin           │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│      quizzes        │
├─────────────────────┤
│ id (PK)            │
│ title              │
│ description        │
│ created_by (FK)    │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│     questions       │
├─────────────────────┤
│ id (PK)            │
│ quiz_id (FK)       │
│ question_text      │
│ type               │
│ correct_answer     │
│ option_a           │
│ option_b           │
│ option_c           │
│ option_d           │
│ time_limit         │
│ points             │
└─────────────────────┘
         │
         │ N:1
         ↓
┌─────────────────────┐
│   game_sessions     │
├─────────────────────┤
│ id (PK)            │
│ quiz_id (FK)       │
│ pin (unique)       │
│ status             │
│ current_question   │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│       scores        │
├─────────────────────┤
│ id (PK)            │
│ session_id (FK)    │
│ user_id (FK)       │
│ question_id (FK)   │
│ points             │
│ answer_time        │
│ is_correct         │
│ answered_at        │
└─────────────────────┘
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

```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Usage
app.get('/api/quizzes', authenticateToken, (req, res) => {
  // Protected route
});
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
    ┌────┴─────┐
    ↓          ↓
┌─────────┐ ┌──────────┐
│ Backend │ │ Frontend │
│ Node:18 │ │ Node:18  │
│ Port    │ │ + Vite   │
│ 3001    │ │ Port 5173│
└────┬────┘ └──────────┘
     │
     ↓
┌─────────────┐
│ SQLite DB   │
│ Volume      │
└─────────────┘
```

### Production

```yaml
┌──────────────────────┐
│  docker-compose.prod │
└──────────┬───────────┘
           │
    ┌──────┴────────────────┐
    ↓                       ↓
┌─────────────┐      ┌──────────────┐
│   Backend   │      │   Frontend   │
│   Node:18   │      │ Multi-stage: │
│ Production  │      │ 1. Build     │
│ Port 3001   │      │ 2. Nginx     │
└──────┬──────┘      │ Port 80/443  │
       │             └──────────────┘
       │
       ↓
┌──────────────┐
│  SQLite DB   │
│  Volume      │
│  Persistent  │
└──────────────┘
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

```sql
-- Indexes to improve performance
CREATE INDEX idx_quiz_created_by ON quizzes(created_by);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_sessions_pin ON game_sessions(pin);
CREATE INDEX idx_scores_session ON scores(session_id);
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

- ~100 concurrent users
- ~10 concurrent quizzes
- SQLite (limited for concurrent writes)

### Potential improvements

1. **PostgreSQL**: Better concurrency
2. **Redis**: Caching and sessions
3. **CDN**: Static assets
4. **Load balancer**: Multiple instances
5. **Message queue**: Asynchronous tasks

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