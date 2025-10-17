# 🤖 Agent Instructions - QuizMaster

This document provides instructions for AI agents (like GitHub Copilot, Claude, ChatGPT, and other AI assistants) working with the QuizMaster codebase. These guidelines help agents understand where to find information and what agent-specific considerations to keep in mind.

## 📚 Primary Documentation References

**For detailed information, always refer to the human-readable documentation first:**

- **[README.md](README.md)** - Project overview, installation, and basic usage
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical architecture and system design
- **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** - Cyber Arcade design system guide (colors, typography, components)
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
- `frontend/src/App.tsx` - **Main application orchestrator** (refactored following Clean Architecture + DDD)
- See [ARCHITECTURE.md](ARCHITECTURE.md) and `frontend/src/ARCHITECTURE.md` for complete details

## 🚨 Critical Constraints (Agent-Specific)

### 1. Backend Monolithic - Frontend Modular

**⚠️ IMPORTANT**: Architecture has been updated:

- **Backend** (`backend/server.js`): Remains monolithic - All API endpoints, WebSocket logic, DB operations in ONE file
- **Frontend** (`frontend/src/`): Now follows **Screaming Architecture + Clean Architecture + DDD principles**
  - Organized by domains (`auth/`, `quiz/`, `game/`)
  - Features are separated (`home/`, `authentication/`, `quiz-management/`, `game-play/`)
  - Shared infrastructure (`shared/config/`, `shared/socket/`, `shared/types/`, `shared/hooks/`)
- Frontend refactoring maintains full backward compatibility

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
2. Add service method in appropriate `frontend/src/domains/` service (auth, quiz, or game)
3. Add socket event listener in `frontend/src/shared/hooks/useGameSocket.ts` if needed
4. Update feature components in `frontend/src/features/` to use the new functionality
5. See [ARCHITECTURE.md](ARCHITECTURE.md) for game flow details

### When Modifying Database Schema

**⚠️ WARNING**: Schema changes require database reset or manual migration!

1. Edit table creation in `backend/server.js` in `db.serialize()` block
2. For development: `docker-compose down -v && docker-compose up -d`
3. For production: Manual SQL via `make db` before deploying
4. See [ARCHITECTURE.md](ARCHITECTURE.md) for current schema

### When Adding Frontend Views

1. Create new component in appropriate `frontend/src/features/[feature]/components/` directory
2. Add domain service methods in `frontend/src/domains/` if needed
3. Update routing logic in `frontend/src/App.tsx`
4. Follow existing Tailwind CSS patterns (see [CONTRIBUTING.md](CONTRIBUTING.md))
5. See `frontend/src/ARCHITECTURE.md` for detailed structure

### When Styling Components

**⚠️ IMPORTANT**: Follow the Cyber Arcade design system!

1. **Always reference** [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for:
   - Color palette (Purple, Pink, Cyan neon colors)
   - Typography (Press Start 2P, VT323, Orbitron fonts)
   - Component patterns (buttons with retro-shadow, CRT effects)
   - Visual effects (neon glow, pixel shadows, scanlines)

2. **Use Cyber Arcade Tailwind patterns**:
   - Colors: `primary-500` (purple), `secondary-500` (pink), `accent-500` (cyan)
   - Effects: `retro-shadow`, `neon-border`, `text-neon`, `crt-screen`
   - Fonts: `font-display` (arcade), `font-mono` (terminal), `font-body` (sci-fi)
   - Backgrounds: `bg-game-gradient` (grid), `bg-dark-500` (deep space)

3. **Component Examples**:
   ```tsx
   // Arcade button with pixel shadow
   <Button variant="primary" className="retro-shadow">
     ► LOGIN
   </Button>
   
   // Terminal-style input
   <Input label="Email" className="font-mono" />
   
   // Neon heading
   <h1 className="font-display text-5xl uppercase text-neon">
     QUIZMASTER
   </h1>
   
   // CRT screen container
   <div className="crt-screen bg-game-gradient">
     {content}
   </div>
   ```

4. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for complete patterns and agent reference section

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

- ❌ Do NOT split `backend/server.js` into multiple files (backend remains monolithic)
- ❌ Do NOT change SQLite callback patterns to async/await
- ❌ Do NOT remove or modify working code without clear reason
- ❌ Do NOT commit `.env` file or secrets
- ❌ Do NOT break backward compatibility without discussion
- ❌ Do NOT ignore existing patterns and conventions
- ❌ Do NOT duplicate content from existing documentation files
- ❌ Do NOT skip testing after making changes
- ❌ Do NOT use old color schemes (cyan/orange/lime from Electric Dreams)
- ❌ Do NOT apply rounded corners >12px on arcade-style elements
- ❌ Do NOT use gradients on primary buttons (solid colors only)
- ✅ Frontend IS NOW modular following Clean Architecture + DDD (not monolithic anymore)
- ✅ Design system IS NOW Cyber Arcade (retro synthwave theme)

## ✅ Agent "ALWAYS" List

- ✅ ALWAYS reference existing documentation first
- ✅ ALWAYS test changes locally before committing
- ✅ ALWAYS follow existing code patterns
- ✅ ALWAYS preserve backward compatibility
- ✅ ALWAYS use parameterized SQL queries
- ✅ ALWAYS handle errors explicitly
- ✅ ALWAYS make minimal, focused changes
- ✅ ALWAYS link to existing docs rather than duplicating content
- ✅ ALWAYS check [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) when styling components
- ✅ ALWAYS use Cyber Arcade colors (purple/pink/cyan)
- ✅ ALWAYS apply retro-shadow to primary buttons
- ✅ ALWAYS use uppercase text with Press Start 2P font

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

## 🎨 Design System Quick Reference for Agents

**Critical**: All UI changes must follow the Cyber Arcade design system documented in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

### Color Tokens (Tailwind)
```typescript
primary-500    // #6b48ff - Electric Purple (main actions)
secondary-500  // #ff33c6 - Hot Pink (highlights)
accent-500     // #00ffcc - Cyber Cyan (terminal text)
success-500    // #00ff41 - Matrix Green (success)
danger-500     // #ff0000 - Pure Red (errors)
dark-500       // #0a0a1f - Deep Space (backgrounds)
```

### Font Classes
```typescript
font-display   // Press Start 2P - Arcade/headings (uppercase)
font-mono      // VT323 - Terminal/technical text
font-body      // Orbitron - Body/UI text
```

### Essential Effects
```typescript
retro-shadow     // 8px pixel shadow on buttons
neon-border      // Triple-layer glow border
text-neon        // Glowing text effect
crt-screen       // CRT scanlines + flicker
bg-game-gradient // Grid background (Tron-style)
glass-effect     // Frosted glass overlay
```

### Component Patterns
```tsx
// Primary button with arcade style
<Button variant="primary" className="retro-shadow font-display">
  ► LOGIN
</Button>

// Terminal input
<Input className="font-mono" placeholder="> enter_text" />

// Neon heading (always uppercase)
<h1 className="font-display text-5xl uppercase text-neon">
  QUIZMASTER
</h1>

// Full-page CRT container
<div className="crt-screen bg-game-gradient min-h-screen">
  {content}
</div>
```

### Critical Design Rules
1. **Colors**: Only purple/pink/cyan neon on dark backgrounds
2. **Buttons**: Must have retro-shadow (8px pixel shadow)
3. **Typography**: Press Start 2P always uppercase
4. **Corners**: Max 12px radius for arcade elements
5. **Fills**: Solid colors on buttons, no gradients
6. **Effects**: Apply CRT screen to full-page views

See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) "Agent Reference" section for complete technical details.

---

**Last Updated**: 2025-10-17  
**Version**: 2.0.0  
**Maintained by**: QuizMaster Development Team

For questions or suggestions about these agent instructions, please open an issue or discussion on GitHub.
