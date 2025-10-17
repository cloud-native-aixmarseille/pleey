# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuizMaster is an interactive quiz application similar to Kahoot, featuring real-time gameplay with WebSockets, scoring based on accuracy and speed, live leaderboards, and an admin interface for creating and managing quizzes.

**Tech Stack:**
- Backend: Node.js + Express + Socket.io + SQLite
- Frontend: React 18 + Vite + Tailwind CSS
- Deployment: Docker + Nginx
- Authentication: JWT tokens with bcrypt password hashing

## Development Commands

### Primary Development Workflow

```bash
# First time setup
make install              # Complete installation (copies .env, builds, starts containers)

# Daily development
make up                   # Start application
make down                 # Stop application
make restart              # Restart containers
make logs                 # View all logs in real-time
make logs-backend         # Backend logs only
make logs-frontend        # Frontend logs only

# Building
make build                # Build Docker images
make rebuild              # Full rebuild (down, build, up)

# Database operations
make backup               # Backup SQLite database to backups/
make restore              # Restore latest backup
make db                   # Access SQLite CLI

# Monitoring
make health               # Check application health
make ps                   # Container status
make monitoring-up        # Start with Prometheus/Grafana/Loki stack
```

### Manual Development (without Docker)

```bash
# Backend
cd backend
npm install
npm start                 # Production mode
npm run dev               # Development mode with nodemon

# Frontend
cd frontend
npm install
npm run dev               # Development server (port 5173)
npm run build             # Production build
npm run preview           # Preview production build
```

### Testing

Run the test script:
```bash
./test.sh                 # Comprehensive test suite
```

## Architecture

### High-Level System Design

The application uses a **monolithic architecture** with separate frontend and backend containers:

1. **Frontend (React + Nginx)**: Serves static files via Nginx, proxies API calls to backend
2. **Backend (Node.js)**: Handles REST API, WebSocket connections, authentication, and database operations
3. **Database (SQLite)**: Single-file database stored in persistent Docker volume

**Communication Flow:**
- REST API: Frontend → Nginx proxy → Backend Express routes
- WebSockets: Frontend Socket.io client ↔ Backend Socket.io server (real-time gameplay)
- Auth: JWT tokens stored in memory on frontend, verified via middleware on backend

### Database Schema

Five main tables with foreign key relationships:

1. **users**: User accounts (username, email, hashed password, is_admin flag)
2. **quizzes**: Quiz definitions (title, description, created_by FK to users)
3. **questions**: Questions per quiz (quiz_id FK, question_text, type, correct_answer, options, time_limit, points)
4. **game_sessions**: Active game instances (quiz_id FK, unique PIN, status, current_question index)
5. **scores**: Individual player answers (session_id FK, user_id FK, question_id FK, points, answer_time, is_correct)

**Key indexes** (if not already present, consider adding):
- `questions(quiz_id)` - Fast question lookup per quiz
- `game_sessions(pin)` - Fast PIN validation
- `scores(session_id, user_id)` - Fast leaderboard generation

### Backend Structure

All backend logic is in `backend/server.js` (monolithic single-file architecture):

**REST API Endpoints:**
- `POST /api/register` - User registration (public)
- `POST /api/login` - User authentication (public)
- `GET /api/health` - Health check (public)
- `GET /api/quizzes` - List all quizzes (authenticated)
- `POST /api/quizzes` - Create quiz (authenticated admin)
- `DELETE /api/quizzes/:id` - Delete quiz (authenticated admin)
- `GET /api/quizzes/:id/questions` - Get quiz questions (authenticated)
- `POST /api/questions` - Add question to quiz (authenticated admin)
- `DELETE /api/questions/:id` - Delete question (authenticated admin)
- `POST /api/sessions/create` - Create game session with PIN (authenticated admin)

**WebSocket Events** (Socket.io):
- `join-game` → Server: Player joins game session with PIN
- `player-joined` ← Server: Broadcast new player to lobby
- `start-game` → Server: Admin starts the game
- `game-started` ← Server: Broadcast game start, send first question
- `submit-answer` → Server: Player submits answer with timestamp
- `answer-result` ← Server: Send individual result (correct/incorrect, points earned)
- `next-question` → Server: Admin progresses to next question
- `question-update` ← Server: Broadcast next question to all players
- `game-ended` ← Server: Send final leaderboard
- `player-left` ← Server: Broadcast player disconnection

**Authentication Middleware:**
The `authenticateToken` middleware extracts JWT from `Authorization: Bearer <token>` header and verifies it. Attach user info (id, username, isAdmin) to `req.user`.

### Frontend Structure

React application with standard Vite structure:

**Views (state-based routing via `currentView`):**
- `home` - Landing page
- `login` - Login form
- `register` - Registration form
- `admin` - Admin dashboard (quiz management)
- `manageQuestions` - Question editor for specific quiz
- `join` - Enter PIN to join game
- `lobby` - Waiting room before game starts
- `playing` - Active gameplay with question display
- `leaderboard` - Final results and podium

**State Management:**
Uses React hooks (`useState`) with Socket.io event handlers. Key state variables:
- `user` - Current authenticated user
- `token` - JWT token for API calls
- `currentView` - Determines which view to render
- `socket` - Socket.io connection instance
- `gameState` - Current game session data (PIN, question, players, scores)

### Real-Time Game Flow

1. **Admin creates session** → Backend generates 6-digit PIN, stores in `game_sessions` table
2. **Players join** → Validate PIN, add to lobby, emit `player-joined`
3. **Admin starts game** → Backend emits `game-started`, sends first question
4. **For each question:**
   - Backend broadcasts question with countdown timer
   - Players submit answers via `submit-answer` with timestamp
   - Backend calculates points: `basePoints + timeBonus` where `timeBonus = (timeLeft / timeLimit) * 500`
   - Backend stores score in database, sends individual `answer-result`
5. **Admin proceeds** → Emit `next-question`, repeat step 4
6. **Game ends** → Backend queries leaderboard (aggregate scores per user), emits `game-ended`

## Docker Configuration

### Development Setup (`docker-compose.yaml`)

- Backend: Port 3001, mounts `quiz-data` volume for SQLite persistence
- Frontend: Port 80, Nginx serves built React app and proxies `/api` to backend
- Health checks: Backend checks `/api/health`, frontend checks HTTP 200 on root

### Production Setup (`docker-compose.prod.yaml`)

Additional considerations:
- Multi-stage builds for smaller images
- SSL/TLS termination via Nginx
- Optimized Nginx configuration (`nginx.prod.conf`)

### Monitoring Stack (`docker-compose.monitoring.yaml`)

Optional monitoring with:
- Prometheus (port 9090) - Metrics collection
- Grafana (port 3000, admin/admin123) - Dashboards
- Loki (port 3100) - Log aggregation
- cAdvisor (port 8080) - Container metrics

Start with: `make monitoring-up`

## Key Configuration Files

- `.env` - Environment variables (JWT_SECRET, NODE_ENV, PORT, CORS_ORIGIN, VITE_API_URL)
- `backend/server.js` - All backend logic (API, WebSockets, DB initialization)
- `frontend/src/app.tsx` - Complete React application
- `frontend/src/main.jsx` - React entry point (imports app.tsx)
- `frontend/src/index.css` - Tailwind CSS imports
- `frontend/index.html` - HTML entry point
- `frontend/vite.config.js` - Vite configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration (required!)
- `frontend/postcss.config.js` - PostCSS configuration (required for Tailwind)
- `frontend/nginx.conf` - Nginx reverse proxy config
- `Makefile` - Simplified command aliases

## Default Credentials

**Admin Account:**
- Email: `admin@quiz.com`
- Password: `admin123`
- ⚠️ Created automatically on first backend startup via `server.js:88-90`

**Grafana (if monitoring enabled):**
- Username: `admin`
- Password: `admin123`

## Common Development Tasks

### Adding a New API Endpoint

1. Add route in `backend/server.js` after existing routes
2. Use `authenticateToken` middleware for protected routes
3. Database queries use callbacks (not async/await): `db.all()`, `db.run()`, `db.get()`
4. Return JSON: `res.json({ data })` or errors: `res.status(500).json({ error: 'message' })`

### Adding a New WebSocket Event

1. Add listener in `backend/server.js` inside `io.on('connection', (socket) => { ... })`
2. Add emitter in `frontend/app.tsx` via `socket.emit('event-name', data)`
3. Add listener in `frontend/app.tsx` via `socket.on('event-name', (data) => { ... })`
4. Update game state accordingly in both client and server

### Modifying Database Schema

1. Edit table creation in `backend/server.js` `db.serialize()` block
2. ⚠️ Changes require database reset or manual migration
3. For production, manually run SQL commands via `make db` before deploying

### Styling Changes

Uses Tailwind CSS utility classes:
- Colors: `bg-purple-600`, `text-pink-500`, etc.
- Spacing: `p-4`, `mt-8`, `gap-4`
- Responsive: `sm:text-lg`, `md:grid-cols-2`
- Refer to component classes in `frontend/src/app.tsx` for existing patterns

**Important**: Tailwind requires both `tailwind.config.js` and `postcss.config.js` to generate styles. Without these files, the CSS output will be minimal (~60 bytes instead of ~18KB).

## Important Constraints

1. **Single-file components**: Both `backend/server.js` and `frontend/src/app.tsx` are monolithic. Keep related logic together.

2. **SQLite limitations**:
   - Not ideal for high-concurrency writes
   - Limited to ~100 concurrent users per the architecture docs
   - Use transactions for batch operations

3. **WebSocket state synchronization**:
   - Server is source of truth for game state
   - Client state updates must come from server events, not optimistic updates

4. **JWT stored in memory**:
   - Token not persisted (lost on page refresh)
   - Consider sessionStorage/localStorage for better UX (trade-off: XSS risk)

5. **No hot module reload in production**:
   - Frontend requires full rebuild (`make rebuild`) for changes
   - Use `npm run dev` locally for HMR

6. **Environment variables**:
   - Backend uses `process.env` variables
   - Frontend uses Vite's `import.meta.env.VITE_*` variables
   - Must set `CORS_ORIGIN` for production
   - Must set `VITE_API_URL` to match backend URL in production

## Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` in `.env` (generate with `openssl rand -base64 32`)
- [ ] Change default admin password via SQLite: `UPDATE users SET password = ? WHERE email = 'admin@quiz.com'`
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure SSL certificates (see `setup-ssl.sh` and `DEPLOYMENT-CHECKLIST.md`)
- [ ] Enable firewall (ports 80, 443 only)
- [ ] Set up automated backups (`make backup` in cron)
- [ ] Configure monitoring stack
- [ ] Test health endpoint: `curl https://yourdomain.com/api/health`

## Troubleshooting

**Backend won't start:**
- Check logs: `make logs-backend`
- Verify SQLite database permissions in volume
- Ensure `JWT_SECRET` is set in `.env`

**Frontend shows blank page:**
- Check browser console for errors
- Verify API_URL matches backend (default: `http://localhost:3001`)
- Rebuild frontend: `docker-compose build frontend --no-cache`

**WebSocket connection fails:**
- Check CORS config in `backend/server.js` (line 14)
- Verify Socket.io client version matches server version
- Ensure port 3001 is accessible from frontend

**Database locked errors:**
- SQLite doesn't handle concurrent writes well
- Add proper error handling and retries
- Consider migrating to PostgreSQL for production scale

## Performance Considerations

- **Current limits**: ~100 concurrent users, ~10 simultaneous quiz sessions
- **Optimization ideas**:
  - Add Redis for session caching and leaderboard computation
  - Implement connection pooling if migrating to PostgreSQL
  - Use CDN for static assets
  - Add rate limiting to API endpoints (see `ARCHITECTURE.md:472-479`)
  - Enable gzip compression in Nginx (already configured in `nginx.prod.conf`)

## Related Documentation

- `README.md` - User-facing overview and installation
- `ARCHITECTURE.md` - Detailed technical architecture
- `CONTRIBUTING.md` - Code standards and conventions
- `QUICK-REFERENCE.md` - Command cheat sheet
- `DOCKER-GUIDE.md` - Docker-specific documentation
- `DEPLOYMENT-CHECKLIST.md` - Production deployment steps
- `MONITORING-GUIDE.md` - Monitoring setup and metrics
