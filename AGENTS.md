# 🤖 Agent Instructions - QuizMaster

This document provides comprehensive instructions for AI agents (like GitHub Copilot, Claude, ChatGPT, and other AI assistants) working with the QuizMaster codebase. These guidelines ensure agents understand the architecture, constraints, and best practices when making code changes or providing assistance.

## 📋 Quick Reference

**Project Type**: Interactive quiz application (Kahoot-style)  
**Architecture**: Monolithic with separate frontend/backend containers  
**Backend**: Node.js + Express + Socket.io + SQLite  
**Frontend**: React 18 + Vite + Tailwind CSS  
**Deployment**: Docker + Nginx  
**Authentication**: JWT tokens with bcrypt  

## 🎯 Agent Responsibilities

When working with this codebase, AI agents should:

1. **Understand context fully** before making changes
2. **Make minimal, surgical changes** - change as few lines as possible
3. **Preserve working code** - never delete/modify working code unless absolutely necessary
4. **Test changes** - always validate changes don't break existing functionality
5. **Follow existing patterns** - maintain consistency with the codebase style
6. **Document changes** - update relevant documentation when making significant changes

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────┐
│  Users                                          │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│  Nginx (Port 80/443)                            │
│  - Serves React static files                    │
│  - Proxies /api to backend                      │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴────────┐
      ↓               ↓
┌──────────┐   ┌──────────────┐
│ React    │   │ Node.js      │
│ Frontend │◄──┤ Backend      │
│          │WS │              │
│Port 5173 │   │ Port 3001    │
└──────────┘   └──────┬───────┘
                      │
                      ↓
               ┌──────────────┐
               │ SQLite DB    │
               │ (quiz.db)    │
               └──────────────┘
```

### Key Files

| File | Purpose | Critical Notes |
|------|---------|----------------|
| `backend/server.js` | **All backend logic** | Monolithic single-file architecture |
| `frontend/src/app.tsx` | **All frontend logic** | Monolithic single-file React app |
| `frontend/src/main.jsx` | React entry point | Imports app.tsx |
| `frontend/tailwind.config.js` | Tailwind config | **REQUIRED** for CSS to work |
| `frontend/postcss.config.js` | PostCSS config | **REQUIRED** for Tailwind |
| `docker-compose.yaml` | Dev environment | Development setup |
| `docker-compose.prod.yaml` | Production environment | Production setup |
| `.env` | Environment variables | Never commit this file |

## 🚨 Critical Constraints

### 1. Monolithic Architecture

**Backend** (`backend/server.js`):
- All API endpoints, WebSocket logic, DB operations in ONE file
- Do NOT split into separate route files unless explicitly requested
- Keep related logic together

**Frontend** (`frontend/src/app.tsx`):
- All views, state management, and UI in ONE file
- Do NOT split into separate component files unless explicitly requested
- State-based routing via `currentView` variable

### 2. Database (SQLite)

```javascript
// Database queries use CALLBACKS (not async/await)
db.all(query, params, (err, rows) => {
  if (err) return callback(err);
  callback(null, rows);
});

db.run(query, params, function(err) {
  if (err) return callback(err);
  callback(null, this.lastID);
});

db.get(query, params, (err, row) => {
  if (err) return callback(err);
  callback(null, row);
});
```

**Important**:
- SQLite is NOT ideal for high concurrency (max ~100 concurrent users)
- Use transactions for batch operations
- Database file stored in Docker volume `/app/data/quiz.db`

### 3. Authentication (JWT)

```javascript
// Token generation
const token = jwt.sign(
  { id: user.id, username: user.username, isAdmin: user.is_admin },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Middleware usage
app.get('/api/quizzes', authenticateToken, (req, res) => {
  // req.user contains { id, username, isAdmin }
});
```

**Important**:
- JWT stored in memory on frontend (lost on page refresh)
- Token sent in `Authorization: Bearer <token>` header
- Admin routes check `req.user.isAdmin`

### 4. WebSocket (Socket.io)

**Server-side** (`backend/server.js`):
```javascript
io.on('connection', (socket) => {
  socket.on('join-game', (data) => {
    // Handle join
    io.to(sessionPin).emit('player-joined', playerData);
  });
});
```

**Client-side** (`frontend/src/app.tsx`):
```javascript
useEffect(() => {
  const newSocket = io('http://localhost:3001');
  
  newSocket.on('player-joined', (data) => {
    // Update state
  });
  
  setSocket(newSocket);
  return () => newSocket.close();
}, []);
```

**Important**:
- Server is source of truth for game state
- Client state updates ONLY from server events
- No optimistic updates on client

### 5. Tailwind CSS

**CRITICAL**: Both files MUST exist:
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`

Without these, CSS output will be ~60 bytes instead of ~18KB!

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}

// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🛠️ Common Tasks for Agents

### Adding a New API Endpoint

1. Add route in `backend/server.js` after existing routes
2. Use `authenticateToken` middleware for protected routes
3. Use callback-based database queries (not async/await)
4. Return JSON with appropriate status codes

```javascript
// Example: Add new endpoint
app.get('/api/my-endpoint', authenticateToken, (req, res) => {
  db.all('SELECT * FROM table WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});
```

### Adding a New WebSocket Event

1. Add listener in `backend/server.js` inside `io.on('connection', ...)`
2. Add emitter in `frontend/app.tsx`
3. Add listener in `frontend/app.tsx`
4. Update game state on both client and server

```javascript
// Backend
socket.on('new-event', (data) => {
  // Process data
  io.to(sessionPin).emit('event-response', responseData);
});

// Frontend
socket.emit('new-event', { data: 'value' });

socket.on('event-response', (data) => {
  setGameState(prev => ({ ...prev, ...data }));
});
```

### Modifying Database Schema

**⚠️ WARNING**: Schema changes require database reset or manual migration!

1. Edit table creation in `backend/server.js` in `db.serialize()` block
2. For development: `docker-compose down -v && docker-compose up -d`
3. For production: Manual SQL via `make db` before deploying

```javascript
// In server.js, db.serialize() block
db.run(`CREATE TABLE IF NOT EXISTS my_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

### Adding a New View (Frontend)

1. Add view name to existing conditions in `app.tsx`
2. Create view rendering logic within the same file
3. Update navigation functions to support new view
4. Follow existing Tailwind CSS patterns

```javascript
// Add to the view switching logic in app.tsx
{currentView === 'myNewView' && (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-white mb-8">My New View</h1>
      {/* View content */}
    </div>
  </div>
)}
```

### Styling Changes

Use existing Tailwind CSS utility patterns:

```javascript
// Colors
className="bg-purple-600 text-white hover:bg-purple-700"
className="bg-pink-500 text-white hover:bg-pink-600"
className="bg-blue-500 text-white hover:bg-blue-600"

// Spacing
className="p-4 mt-8 mb-4 gap-4"
className="space-y-4 space-x-2"

// Layout
className="flex justify-center items-center"
className="grid grid-cols-2 gap-4"

// Responsive
className="sm:text-lg md:grid-cols-2 lg:grid-cols-3"

// Gradients
className="bg-gradient-to-br from-purple-600 to-pink-500"
```

## 📁 Directory Structure

```
quiz-app/
├── .env                      # Environment variables (NEVER commit)
├── .env.example             # Environment template
├── docker-compose.yaml      # Development setup
├── docker-compose.prod.yaml # Production setup
├── Makefile                 # Command shortcuts
│
├── backend/
│   ├── server.js           # ⭐ ALL BACKEND LOGIC
│   ├── package.json
│   └── data/
│       └── quiz.db         # SQLite database (created at runtime)
│
├── frontend/
│   ├── src/
│   │   ├── app.tsx         # ⭐ ALL FRONTEND LOGIC
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Tailwind imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js  # ⭐ REQUIRED FOR TAILWIND
│   ├── postcss.config.js   # ⭐ REQUIRED FOR TAILWIND
│   └── nginx.conf          # Nginx reverse proxy config
│
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md
    ├── CLAUDE.md           # Instructions for Claude AI
    ├── AGENTS.md           # ⭐ This file
    ├── CONTRIBUTING.md
    ├── TESTING.md
    ├── DEPLOYMENT-CHECKLIST.md
    └── MONITORING-GUIDE.md
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# Full test suite
./test.sh

# Docker-based testing
docker-compose exec backend npm test
```

### Writing Tests

**Backend** (Jest):
```javascript
const request = require('supertest');

describe('API Endpoint', () => {
  test('should return data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
```

**Frontend** (Vitest):
```javascript
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

## 🐳 Docker Commands

```bash
# Development
make install         # Complete setup
make up             # Start containers
make down           # Stop containers
make logs           # View all logs
make restart        # Restart containers

# Database
make backup         # Backup SQLite database
make restore        # Restore latest backup
make db             # Access SQLite CLI

# Building
make build          # Build Docker images
make rebuild        # Full rebuild (down, build, up)

# Health checks
make health         # Check application health
make ps             # Container status
```

## 🔐 Security Best Practices

### Environment Variables

**NEVER**:
- ❌ Commit `.env` file to Git
- ❌ Hardcode secrets in code
- ❌ Log sensitive data (passwords, tokens)

**ALWAYS**:
- ✅ Use `process.env.VARIABLE_NAME`
- ✅ Validate environment variables at startup
- ✅ Use strong JWT_SECRET (`openssl rand -base64 32`)

### Password Handling

```javascript
// Hashing (registration)
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// Comparison (login)
const isValid = await bcrypt.compare(password, user.password);
```

### SQL Injection Prevention

**ALWAYS** use parameterized queries:
```javascript
// ✅ Good (parameterized)
db.all('SELECT * FROM users WHERE id = ?', [userId], callback);

// ❌ Bad (SQL injection risk)
db.all(`SELECT * FROM users WHERE id = ${userId}`, callback);
```

## 🎮 Game Flow Logic

### 1. Session Creation
```javascript
// Admin creates session
const pin = Math.random().toString().slice(2, 8);
db.run(`INSERT INTO game_sessions (quiz_id, pin, status) VALUES (?, ?, 'waiting')`,
  [quizId, pin], callback);
```

### 2. Players Join
```javascript
// Player joins lobby
socket.on('join-game', ({ pin, username }) => {
  db.get('SELECT * FROM game_sessions WHERE pin = ?', [pin], (err, session) => {
    if (!session) return socket.emit('error', 'Invalid PIN');
    socket.join(pin);
    io.to(pin).emit('player-joined', { username });
  });
});
```

### 3. Game Starts
```javascript
// Admin starts game
socket.on('start-game', ({ pin }) => {
  db.get('SELECT * FROM game_sessions WHERE pin = ?', [pin], (err, session) => {
    db.all('SELECT * FROM questions WHERE quiz_id = ?', [session.quiz_id], (err, questions) => {
      io.to(pin).emit('game-started', { question: questions[0] });
    });
  });
});
```

### 4. Answer Submission
```javascript
// Player submits answer
socket.on('submit-answer', ({ pin, userId, questionId, answer, timeLeft }) => {
  const isCorrect = answer === correctAnswer;
  const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
  const points = isCorrect ? basePoints + timeBonus : 0;
  
  db.run(`INSERT INTO scores (session_id, user_id, question_id, points, is_correct) 
          VALUES (?, ?, ?, ?, ?)`,
    [sessionId, userId, questionId, points, isCorrect ? 1 : 0]);
    
  socket.emit('answer-result', { isCorrect, points });
});
```

### 5. Leaderboard
```javascript
// Calculate leaderboard
db.all(`SELECT user_id, SUM(points) as total_points 
        FROM scores 
        WHERE session_id = ? 
        GROUP BY user_id 
        ORDER BY total_points DESC`,
  [sessionId], (err, leaderboard) => {
    io.to(pin).emit('game-ended', { leaderboard });
  });
```

## 📊 Performance Considerations

### Current Limits
- **Concurrent users**: ~100
- **Simultaneous quiz sessions**: ~10
- **WebSocket connections**: ~100

### Optimization Tips

1. **Database**:
   - Add indexes for frequently queried columns
   - Use transactions for batch operations
   - Consider PostgreSQL for production scale

2. **Frontend**:
   - Use React.memo for expensive components
   - Debounce rapid user inputs
   - Lazy load heavy components

3. **Backend**:
   - Implement rate limiting
   - Enable gzip compression (already in nginx.conf)
   - Use connection pooling (if switching to PostgreSQL)

## 🔄 State Management

### Backend State
- **Game sessions**: Stored in SQLite `game_sessions` table
- **Active sockets**: Managed by Socket.io room system
- **User sessions**: JWT tokens (stateless)

### Frontend State
```javascript
// Main state variables in app.tsx
const [user, setUser] = useState(null);           // Current user
const [token, setToken] = useState(null);         // JWT token
const [currentView, setCurrentView] = useState('home'); // Active view
const [socket, setSocket] = useState(null);       // Socket.io instance
const [gameState, setGameState] = useState({      // Game data
  pin: '',
  question: null,
  players: [],
  scores: []
});
```

## 🐛 Common Issues and Solutions

### Issue: "Backend won't start"
**Solution**:
```bash
# Check logs
make logs-backend

# Verify JWT_SECRET is set
grep JWT_SECRET .env

# Restart containers
make restart
```

### Issue: "Frontend shows blank page"
**Solution**:
```bash
# Check browser console for errors
# Verify API_URL matches backend
grep VITE_API_URL frontend/.env

# Rebuild frontend
docker-compose build frontend --no-cache
make restart
```

### Issue: "WebSocket connection fails"
**Solution**:
```javascript
// Verify CORS in backend/server.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
```

### Issue: "Tailwind CSS not working"
**Solution**:
```bash
# Verify both config files exist
ls frontend/tailwind.config.js frontend/postcss.config.js

# Rebuild if missing
cd frontend && npm install && npm run build
```

### Issue: "Database locked errors"
**Solution**:
- SQLite doesn't handle concurrent writes well
- Add proper error handling and retries
- Consider migrating to PostgreSQL for production

## 📝 Code Style Guidelines

### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'John';
const getUserById = (id) => {};

// React components: PascalCase
const QuizCard = () => {};

// Constants: UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3001';
const MAX_RETRIES = 3;

// Database tables: snake_case
CREATE TABLE game_sessions (...);
```

### Error Handling
```javascript
// ✅ Good: Explicit error handling
try {
  const result = await fetchData();
  return result;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw new Error('Unable to fetch data');
}

// ❌ Bad: Ignoring errors
const result = await fetchData();
return result;
```

### Comments
```javascript
// ✅ Good: Explain WHY, not WHAT
// Calculate time bonus: faster answers get more points
const timeBonus = Math.floor((timeLeft / timeLimit) * 500);

// ❌ Bad: Redundant comments
// Calculate time bonus
const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
```

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] Change JWT_SECRET in `.env`
- [ ] Change default admin password
- [ ] Set NODE_ENV=production
- [ ] Configure SSL certificates
- [ ] Enable firewall (ports 80, 443)
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Test health endpoint

### Deployment Commands
```bash
# Automatic deployment
./deploy.sh prod

# Manual deployment
cp .env.example .env
# Edit .env with production values
./setup-ssl.sh your-domain.com your-email@example.com
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
curl https://your-domain.com/api/health
```

## 📚 Additional Resources

### Documentation Files
- **README.md**: User-facing overview and installation
- **ARCHITECTURE.md**: Detailed technical architecture
- **CLAUDE.md**: Specific instructions for Claude AI
- **CONTRIBUTING.md**: Code standards and contribution guidelines
- **TESTING.md**: Testing setup and procedures
- **DEPLOYMENT-CHECKLIST.md**: Production deployment steps
- **MONITORING-GUIDE.md**: Monitoring setup and metrics
- **DOCKER-GUIDE.md**: Docker-specific documentation
- **QUICK-REFERENCE.md**: Command cheat sheet

### External Links
- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Docker Documentation](https://docs.docker.com/)
- [SQLite Documentation](https://sqlite.org/docs.html)

## 🤝 Agent Collaboration

### When Multiple Agents Work Together

1. **Coordinate changes**: Avoid conflicting modifications
2. **Communicate context**: Share understanding of what was changed and why
3. **Preserve consistency**: Follow the same patterns and style
4. **Test thoroughly**: Each agent should verify their changes don't break others' work
5. **Document thoroughly**: Update this file and other docs as needed

### Handoff Protocol

When passing work to another agent:
1. Document what was changed and why
2. Note any incomplete work or known issues
3. Highlight any new patterns or approaches used
4. Suggest next steps or areas needing attention

## ⚠️ Critical Warnings

### DO NOT:
- ❌ Split monolithic files without explicit request
- ❌ Change from callbacks to async/await in database code
- ❌ Remove or modify working code without clear reason
- ❌ Commit `.env` file or secrets
- ❌ Break backward compatibility without discussion
- ❌ Ignore existing patterns and conventions
- ❌ Make assumptions about requirements
- ❌ Skip testing after making changes

### ALWAYS:
- ✅ Test changes locally before committing
- ✅ Follow existing code patterns
- ✅ Preserve backward compatibility
- ✅ Update documentation for significant changes
- ✅ Use parameterized SQL queries
- ✅ Handle errors explicitly
- ✅ Verify environment variables
- ✅ Make minimal, focused changes

## 🎯 Decision-Making Framework

When faced with decisions, agents should:

1. **Understand the goal**: What problem are we solving?
2. **Check constraints**: What are the architectural limitations?
3. **Review existing patterns**: How is similar code handled?
4. **Consider impact**: What could break?
5. **Prefer minimal changes**: Smallest change that works
6. **Test thoroughly**: Verify nothing breaks
7. **Document rationale**: Explain why this approach

## 📞 Getting Help

If an agent encounters:
- Unclear requirements → Ask for clarification
- Conflicting constraints → Highlight the conflict and ask for guidance
- Complex architectural changes → Discuss approach before implementing
- Breaking changes → Confirm impact is acceptable
- Unknown patterns → Reference this document or ask for examples

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0  
**Maintained by**: QuizMaster Development Team

For questions or suggestions about these agent instructions, please open an issue or discussion on GitHub.
