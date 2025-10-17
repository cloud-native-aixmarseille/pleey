# 🤖 Agent Instructions - QuizMaster

This document provides instructions for AI agents (like GitHub Copilot, Claude, ChatGPT, and other AI assistants) working with the QuizMaster codebase. These guidelines help agents understand where to find information and what agent-specific considerations to keep in mind.

## 📚 Primary Documentation References

**For detailed information, always refer to the human-readable documentation first:**

- **[README.md](README.md)** - Project overview, installation, and basic usage
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical architecture and system design
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Code standards, conventions, and contribution guidelines
- **[TESTING.md](TESTING.md)** - Testing setup, running tests, and writing new tests
- **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** - Docker commands and container management
- **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Production deployment steps and checklists
- **[MONITORING-GUIDE.md](MONITORING-GUIDE.md)** - Monitoring setup and metrics
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command cheat sheet
- **[SECURITY.md](SECURITY.md)** - Security guidelines and best practices

## 🎯 Agent-Specific Guidelines

### Core Principles for AI Agents

When working with this codebase, AI agents should:

1. **Reference existing documentation first** - Don't duplicate information from the files listed above
2. **Make minimal, surgical changes** - Change as few lines as possible to achieve the goal
3. **Preserve working code** - Never delete/modify working code unless absolutely necessary
4. **Test changes** - Always validate changes don't break existing functionality
5. **Follow existing patterns** - Maintain consistency with the codebase style
6. **Document significant changes** - Update relevant documentation when making architectural changes

### Quick Architecture Reference

**Project Type**: Interactive quiz application (Kahoot-style)  
**Architecture**: Monolithic with separate frontend/backend containers  
**Backend**: Node.js + Express + Socket.io + SQLite  
**Frontend**: React 18 + Vite + Tailwind CSS  
**Deployment**: Docker + Nginx  
**Authentication**: JWT tokens with bcrypt  

**Key Files:**
- `backend/server.js` - **All backend logic** (monolithic)
- `frontend/src/app.tsx` - **All frontend logic** (monolithic)
- See [ARCHITECTURE.md](ARCHITECTURE.md) for complete details

## 🚨 Critical Constraints (Agent-Specific)

### 1. Monolithic Architecture - DO NOT SPLIT

**⚠️ CRITICAL**: This project uses intentional monolithic single-file architecture.

- **Backend** (`backend/server.js`): All API endpoints, WebSocket logic, DB operations in ONE file
- **Frontend** (`frontend/src/app.tsx`): All views, state management, and UI in ONE file
- **DO NOT** split into separate route files or component files unless explicitly requested
- Keep related logic together in the same file

### 2. Database - Use Callbacks, NOT async/await

**⚠️ CRITICAL**: SQLite queries use CALLBACKS (not async/await or Promises).

```javascript
// ✅ CORRECT - Use callbacks
db.all(query, params, (err, rows) => {
  if (err) return callback(err);
  callback(null, rows);
});

// ❌ WRONG - Do not use async/await
const rows = await db.all(query, params);
```

### 3. Tailwind CSS - Both Config Files Required

**⚠️ CRITICAL**: Both files MUST exist or CSS won't work:
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`

Without these, CSS output will be ~60 bytes instead of ~18KB.

### 4. WebSocket State - Server is Source of Truth

**⚠️ CRITICAL**: 
- Server maintains game state
- Client state updates ONLY from server events
- No optimistic updates on client side

### 5. Environment Variables - Never Commit .env

**⚠️ CRITICAL**:
- Never commit `.env` file
- Always use `.env.example` as template
- Validate environment variables at startup

## 🛠️ Agent-Specific Task Patterns

### When Adding API Endpoints

1. Add route in `backend/server.js` after existing routes
2. Use `authenticateToken` middleware for protected routes
3. Use callback-based database queries (see constraint #2 above)
4. Return JSON with appropriate status codes
5. See [ARCHITECTURE.md](ARCHITECTURE.md) for existing endpoint patterns

### When Adding WebSocket Events

1. Add listener in `backend/server.js` inside `io.on('connection', ...)`
2. Add emitter in `frontend/app.tsx`
3. Add listener in `frontend/app.tsx`
4. Update game state on both client and server
5. See [ARCHITECTURE.md](ARCHITECTURE.md) for game flow details

### When Modifying Database Schema

**⚠️ WARNING**: Schema changes require database reset or manual migration!

1. Edit table creation in `backend/server.js` in `db.serialize()` block
2. For development: `docker-compose down -v && docker-compose up -d`
3. For production: Manual SQL via `make db` before deploying
4. See [ARCHITECTURE.md](ARCHITECTURE.md) for current schema

### When Adding Frontend Views

1. Add view name to existing conditions in `app.tsx`
2. Create view rendering logic within the same file (don't split!)
3. Update navigation functions to support new view
4. Follow existing Tailwind CSS patterns (see [CONTRIBUTING.md](CONTRIBUTING.md))

### When Styling Components

Use existing Tailwind CSS utility patterns from `app.tsx`:
- Colors: `bg-purple-600`, `bg-pink-500`, `bg-blue-500`
- Spacing: `p-4`, `mt-8`, `mb-4`, `gap-4`
- Layout: `flex`, `grid`, `justify-center`, `items-center`
- Responsive: `sm:text-lg`, `md:grid-cols-2`, `lg:grid-cols-3`
- See [CONTRIBUTING.md](CONTRIBUTING.md) for complete style guide

## 🧪 Testing Guidelines for Agents

### Before Making Changes

```bash
# Run existing tests to establish baseline
cd backend && npm test
cd frontend && npm test
./test.sh  # Full test suite
```

### After Making Changes

```bash
# Verify changes don't break existing functionality
cd backend && npm test
cd frontend && npm test
```

See [TESTING.md](TESTING.md) for complete testing documentation.

## 🐳 Docker Commands Reference

```bash
make install    # First time setup
make up         # Start containers
make restart    # Restart containers
make logs       # View all logs
make health     # Check health
```

See [DOCKER-GUIDE.md](DOCKER-GUIDE.md) and [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for complete commands.

## 🔐 Security Reminders for Agents

**NEVER:**
- ❌ Commit `.env` file to Git
- ❌ Hardcode secrets in code
- ❌ Log sensitive data (passwords, tokens)
- ❌ Use string concatenation for SQL queries (SQL injection risk)

**ALWAYS:**
- ✅ Use parameterized queries: `db.all('SELECT * FROM users WHERE id = ?', [userId], callback)`
- ✅ Use `process.env.VARIABLE_NAME` for environment variables
- ✅ Hash passwords with bcrypt
- ✅ Validate and sanitize user input

See [SECURITY.md](SECURITY.md) for complete security guidelines.

## 📝 Code Style Quick Reference

### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = 'John';
const getUserById = (id) => {};

// React components: PascalCase
const QuizCard = () => {};

// Constants: UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3001';

// Database tables: snake_case
CREATE TABLE game_sessions (...);
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete style guidelines.

## 🐛 Common Issues - Quick Fixes

### Backend won't start
```bash
make logs-backend  # Check logs
grep JWT_SECRET .env  # Verify JWT_SECRET is set
make restart  # Restart containers
```

### Frontend shows blank page
```bash
# Verify both Tailwind config files exist
ls frontend/tailwind.config.js frontend/postcss.config.js
# Rebuild if missing
docker-compose build frontend --no-cache
make restart
```

### WebSocket connection fails
Check CORS configuration in `backend/server.js` and verify port 3001 is accessible.

### Database locked errors
SQLite doesn't handle concurrent writes well. Consider adding retry logic or migrating to PostgreSQL for production.

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed troubleshooting.

## 🤝 Multi-Agent Collaboration

When multiple AI agents work on this codebase:

1. **Coordinate changes** - Avoid conflicting modifications
2. **Preserve consistency** - Follow the same patterns and conventions
3. **Test thoroughly** - Each agent should verify their changes
4. **Document changes** - Update this file and relevant docs as needed
5. **Reference primary docs** - Always link to existing documentation rather than duplicating

### Handoff Protocol

When passing work to another agent:
1. Document what was changed and why
2. Note any incomplete work or known issues
3. Reference relevant documentation sections
4. Suggest next steps

## ⚠️ Critical "DO NOT" List for Agents

- ❌ Do NOT split `backend/server.js` or `frontend/src/app.tsx` into multiple files
- ❌ Do NOT change SQLite callback patterns to async/await
- ❌ Do NOT remove or modify working code without clear reason
- ❌ Do NOT commit `.env` file or secrets
- ❌ Do NOT break backward compatibility without discussion
- ❌ Do NOT ignore existing patterns and conventions
- ❌ Do NOT duplicate content from existing documentation files
- ❌ Do NOT skip testing after making changes

## ✅ Agent "ALWAYS" List

- ✅ ALWAYS reference existing documentation first
- ✅ ALWAYS test changes locally before committing
- ✅ ALWAYS follow existing code patterns
- ✅ ALWAYS preserve backward compatibility
- ✅ ALWAYS use parameterized SQL queries
- ✅ ALWAYS handle errors explicitly
- ✅ ALWAYS make minimal, focused changes
- ✅ ALWAYS link to existing docs rather than duplicating content

## 🎯 Decision-Making Framework for Agents

When faced with decisions:

1. **Understand the goal** - What problem are we solving?
2. **Check documentation** - What do the reference docs say?
3. **Review existing patterns** - How is similar code handled?
4. **Consider constraints** - What are the critical architectural limitations?
5. **Evaluate impact** - What could break?
6. **Prefer minimal changes** - Smallest change that works
7. **Test thoroughly** - Verify nothing breaks
8. **Document if needed** - Update docs for significant changes

## 📞 When to Ask for Clarification

Agents should request clarification when encountering:
- Unclear requirements or conflicting instructions
- Requests that violate critical constraints
- Complex architectural changes
- Breaking changes that affect compatibility
- Requirements that conflict with existing documentation

## 🔄 Keeping AGENTS.md Updated

When you discover new insights while working with the codebase:

- **Do update AGENTS.md** when you find agent-specific patterns or constraints
- **Do NOT duplicate** content that belongs in other documentation files
- **Do reference** existing documentation and link to relevant sections
- **Do add** agent-specific interpretations or critical reminders
- **Do note** common pitfalls or gotchas specific to AI assistance

---

**Last Updated**: 2025-10-17  
**Version**: 2.0.0  
**Maintained by**: QuizMaster Development Team

For questions or suggestions about these agent instructions, please open an issue or discussion on GitHub.
