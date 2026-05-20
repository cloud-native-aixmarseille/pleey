# Development Reference

## Prerequisites

- Docker & Docker Compose V2
- Node.js 18+
- Git

## Setup

```bash
make setup    # builds images, starts stack, runs migrations, seeds DB, generates GraphQL types
```

Access points:

- Frontend: `http://pleey.localhost`
- Backend API: `http://pleey.localhost/api`
- Traefik dashboard: `http://traefik.localhost`

Default accounts:

- Admin: `admin@pleey.com` / `admin123`
- Player: `player@pleey.com` / `player123`

## Available Commands

Run `make help` for the full list of make targets (stack, database, lint, test, etc.).

Per-app npm scripts are in each `package.json`. Key entrypoints:

- `make setup` — full stack bootstrap
- `make ci` — lint-fix + test (pre-push check)
- `make test` — all tests (supports `SCOPE` and `MODE` args)

Test frameworks: **Vitest** (backend + frontend), **Playwright** (end-to-end).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) required:

```text
<type>[scope]: <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

```text
feat(quiz): add timer pause functionality
fix(auth): resolve JWT token expiration issue
refactor(game): simplify score calculation logic
```

## Coding Standards

- SOLID, ACID, DRY, KISS
- Descriptive names, no magic numbers, early returns
- All user-facing text via i18n translation keys (both `en` and `fr`)
- Error messages from domain error code enums, translated at transport layer
- No hardcoded strings in UI
- WCAG 2.1 AA compliance mandatory for UI changes

### Dead Code & Translations

- No dead code: every exported function, class, component, and public method must have consumers
- No orphan translations: every key must be used, every user-facing string must have a key
- Applies to both backend and frontend — enforce on every PR

### Naming

```typescript
const userName = "John"; // variables, functions: camelCase
class UserService {} // classes, components: PascalCase
const API_URL = "http://localhost"; // constants: UPPER_SNAKE_CASE
```

### Error Handling

Domain/application layers throw `Error(ErrorCode.ENUM_VALUE)`. Framework exceptions (`HttpException`, etc.) only in presentation layer.

### i18n

- Backend: `application/backend/src/i18n/`
- Frontend: `application/frontend/src/i18n/locales/`
- Feature-specific keys stay in feature scope — no cross-feature key reads

### HTTP Requests

- No duplicate requests for the same data — colocate queries, use caching, deduplicate at the gateway/facade level

### Dependency Boundaries

Enforced by Biome `noRestrictedImports` in each app's `biome.json`. Violations fail CI. See [architecture](../architecture/) for the conceptual rules.

## PR Process

1. Branch from `main`: `git checkout -b feat/my-feature`
2. Make changes, add tests, update translations
3. `make ci` (lint + test)
4. Commit with conventional commit message
5. Push and open PR
6. PRs blocked if translations or error enum mappings are missing
