---
name: "Pleey Backend NestJS Rules"
description: "Use when working on Pleey backend NestJS, Prisma, GraphQL, Socket.IO, or Vitest files under application/backend."
applyTo: "application/backend/**/*.{ts,js,mts,cts}"
---

# Pleey backend NestJS rules

Use `docs/technical/architecture/backend.md` and `docs/technical/development/backend.md` for the full backend design. This file only captures non-obvious backend rules that should load automatically.

- Keep domain and application code free of NestJS, Prisma, and transport concerns because backend boundary checks assume the core stays framework-agnostic.
- Keep resolvers, controllers, and gateways thin because orchestration belongs in use-cases and application services behind ports.
- Throw `Error(ErrorCode.VALUE)` from domain and application layers because transport code is responsible for mapping domain failures to framework responses.
- Read `process.env` only from `application/backend/src/app/config/` because runtime configuration must be normalized once and then injected.
- Use NestJS DI tokens and provider bindings for runtime collaborators because manual instantiation bypasses container wiring and test seams.
- Validate GraphQL, HTTP, and WebSocket input at transport boundaries because missing DTO validation is a common source of production bugs.
- Prefer minimal Prisma `select` and `include` shapes, and use DataLoader-style batching for nested reads, because GraphQL overfetching and N+1 queries are easy to introduce.
- Use Vitest for backend tests because the repository test stack and examples assume it.

Preferred pattern:

```ts
throw new Error(GameErrorCode.GAME_NOT_FOUND);
```

Avoid throwing framework exceptions from domain or application code.
