# 🤖 Agent Instructions - QuizMaster

This document provides instructions for AI agents (like GitHub Copilot, Claude, ChatGPT, and other AI assistants) working with the QuizMaster codebase.

## 📚 Primary Documentation References

**All detailed information is now centralized in the `/docs` folder via Docusaurus.**

### For complete technical documentation:
- **[Architecture](docs/docs/technical/architecture/index.md)** - Complete technical architecture and system design
- **[Design System](docs/docs/technical/design-system.md)** - Cyber Arcade design system guide (colors, typography, components)
- **[Testing](docs/docs/technical/testing.md)** - Testing setup, running tests, and writing new tests
- **[Docker Guide](docs/docs/technical/docker-guide.md)** - Docker commands and container management
- **[Deployment](docs/docs/technical/deployment.md)** - Production deployment steps and checklists
- **[Monitoring](docs/docs/technical/monitoring.md)** - Monitoring setup and metrics
- **[Security](docs/docs/technical/security.md)** - Security guidelines and best practices
- **[Quick Reference](docs/docs/technical/quick-reference.md)** - Command cheat sheet
- **[i18n](docs/docs/technical/i18n.md)** - Internationalization guide
- **[Accessibility](docs/docs/technical/accessibility.md)** - Accessibility guide
- **[Documentation Guide](docs/docs/technical/documentation-guide.md)** - How to write and maintain documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Code standards and contribution guidelines

## 🎯 Agent-Specific Guidelines

### Core Principles for AI Agents

When working with this codebase, AI agents should:

1. **Reference existing documentation first** - All details are in `/docs` - don't duplicate
2. **Make minimal, surgical changes** - Change as few lines as possible
3. **Preserve working code** - Never delete/modify working code unless absolutely necessary
4. **Test changes** - Always validate changes don't break existing functionality
5. **Follow existing patterns** - Maintain consistency with the codebase style
6. **Document significant changes** - Update relevant documentation in `/docs`
7. **DO NOT create new root-level .md files** - All documentation belongs in `/docs` folder structure
8. **Enforce translations and error enums** - All user-facing text must use locale files and every error must originate from an enum that maps to translated messages.
9. **Remove `console.*` before committing** - Frontend contributions must not rely on browser console logging.

### Quick Architecture Reference

**Project Type**: Interactive quiz application  
**Stack**: NestJS + Prisma + PostgreSQL (backend) | React 19 + Vite + Tailwind (frontend)  
**Deployment**: Docker + Nginx  
**Authentication**: JWT tokens with bcrypt  

📘 **See [Architecture](docs/docs/technical/architecture/index.md) for complete details**

## 🚨 Critical Constraints (Agent-Specific)

### 1. Backend Architecture
- **Backend**: NestJS with DDD principles (domain, application, infrastructure, presentation layers)
- **Frontend**: React with Clean Architecture + DDD (organized by domains and features)
- See [Architecture](docs/docs/technical/architecture/index.md) for complete details

### 2. Database - Prisma ORM
- Uses Prisma ORM with PostgreSQL
- Migrations managed by Prisma
- See [Architecture](docs/docs/technical/architecture/index.md) for schema details

### 3. Styling - Cyber Arcade Design System
- **Critical**: Follow the Cyber Arcade design system (purple/pink/cyan neon colors)
- Use Tailwind CSS with custom theme
- See [Design System](docs/docs/technical/design-system.md) for complete guide

### 4. WebSocket State
- Server maintains game state
- Client state updates ONLY from server events
- No optimistic updates on client side

### 5. Environment Variables
- Never commit `.env` file
- Always use `.env.example` as template
- Validate environment variables at startup

## 🛠️ Quick Task Patterns

### When Adding Features
1. Check [Architecture](docs/docs/technical/architecture/index.md) for existing patterns
2. Follow DDD principles for backend (domain, application, infrastructure)
3. Follow Clean Architecture for frontend (domains, features, shared)
4. Add tests (see [Testing](docs/docs/technical/testing.md))
5. Update documentation in `/docs` if needed

### When Styling Components
1. **ALWAYS** reference [Design System](docs/docs/technical/design-system.md)
2. Use Cyber Arcade colors (purple/pink/cyan)
3. Apply retro effects (neon glow, pixel shadows, CRT scanlines)
4. Follow typography guidelines (Press Start 2P, VT323, Orbitron)

### When Testing
1. See [Testing Guide](docs/docs/technical/testing.md)
2. Run tests: `npm test` (backend), `npm test` (frontend)
3. E2E tests: `./scripts/test-runner.sh e2e`

### When Deploying
1. See [Deployment Checklist](docs/docs/technical/deployment.md)
2. Use Docker: `make install && make up`
3. Monitor: See [Monitoring Guide](docs/docs/technical/monitoring.md)

## 🔐 Security Reminders

**See [Security Policy](docs/docs/technical/security.md) for complete guidelines**

**NEVER:**
- ❌ Commit `.env` file
- ❌ Hardcode secrets
- ❌ Log sensitive data (passwords, tokens)
- ❌ Use SQL string concatenation (Prisma prevents this)

**ALWAYS:**
- ✅ Use Prisma ORM for database queries
- ✅ Use `process.env.VARIABLE_NAME` for environment variables
- ✅ Hash passwords with bcrypt
- ✅ Validate and sanitize user input

## 📝 Code Style Quick Reference

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete style guidelines

### Naming Conventions
```typescript
// Variables and functions: camelCase
const userName = 'John';
const getUserById = (id) => {};

// Classes and React components: PascalCase
class UserService {}
const QuizCard = () => {};

// Constants: UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3001';
```

## 🐛 Common Issues

### Backend won't start
```bash
make logs-backend  # Check logs
grep JWT_SECRET .env  # Verify JWT_SECRET is set
make restart
```

### Frontend shows blank page
```bash
# Check Tailwind config
ls frontend/tailwind.config.js frontend/postcss.config.js
# Rebuild if needed
docker-compose build frontend --no-cache
make restart
```

See [Architecture](docs/docs/technical/architecture/index.md) for detailed troubleshooting

## ⚠️ Critical "DO NOT" List

- ❌ Do NOT duplicate content from `/docs` documentation
- ❌ Do NOT create new markdown files in project root (use `/docs` folder structure)
- ❌ Do NOT change database queries without using Prisma ORM
- ❌ Do NOT remove or modify working code without clear reason
- ❌ Do NOT commit `.env` file or secrets
- ❌ Do NOT break backward compatibility without discussion
- ❌ Do NOT ignore Cyber Arcade design system guidelines
- ❌ Do NOT skip testing after making changes
- ❌ Do NOT merge code with hardcoded user-facing strings or untranslated error messages
- ❌ Do NOT commit `console.*` usage in frontend code

## ✅ Agent "ALWAYS" List

- ✅ ALWAYS reference `/docs` documentation first
- ✅ ALWAYS update existing documentation in `/docs` (never create root-level .md files)
- ✅ ALWAYS test changes locally before committing
- ✅ ALWAYS follow existing code patterns
- ✅ ALWAYS preserve backward compatibility
- ✅ ALWAYS use Prisma ORM for database operations
- ✅ ALWAYS handle errors explicitly
- ✅ ALWAYS make minimal, focused changes
- ✅ ALWAYS check [Design System](docs/docs/technical/design-system.md) when styling
- ✅ ALWAYS use Cyber Arcade colors (purple/pink/cyan)
- ✅ ALWAYS ensure new strings and error codes have translations in `en` and `fr`
- ✅ ALWAYS prefer telemetry or UI feedback instead of browser console logs

## 📚 Documentation Structure

All documentation is centralized in `/docs` using Docusaurus:

**❗ IMPORTANT: Never create standalone .md files in project root. All documentation must go in the `/docs` folder structure.**

### Functional Documentation (User-Facing)
- [Introduction](docs/docs/functional/intro.md)
- [Quickstart](docs/docs/functional/quickstart.md)
- [Admin/Host Guide](docs/docs/functional/admin-host-guide.md)

### Technical Documentation (Developer-Facing)
- **Architecture & Design**: [Architecture](docs/docs/technical/architecture/index.md), [Design System](docs/docs/technical/design-system.md)
- **Development**: [Docker](docs/docs/technical/docker-guide.md), [Testing](docs/docs/technical/testing.md), [i18n](docs/docs/technical/i18n.md), [Accessibility](docs/docs/technical/accessibility.md)
- **Operations**: [Deployment](docs/docs/technical/deployment.md), [Monitoring](docs/docs/technical/monitoring.md), [Security](docs/docs/technical/security.md)
- **Reference**: [Quick Reference](docs/docs/technical/quick-reference.md)

---

**Last Updated**: 2025-11-04  
**Version**: 3.0.0 (Docusaurus migration)  
**Maintained by**: QuizMaster Development Team
