# Architecture Reference

## Overview

Pleey is a real-time interactive game platform (quiz, prediction) with a host/player model. The stack is a monorepo with two applications (`application/backend`, `application/frontend`), shared tooling (`scripts/`), end-to-end tests (`e2e/`), and Helm charts (`charts/`).

Both apps follow **Clean Architecture** with strict dependency rules enforced at lint time via Biome `noRestrictedImports` and shared GritQL plugins.

### Dependency Rule

```text
domain ← application ← infrastructure
                      ← presentation
                      ← app (composition root)
```

Inner layers never import outer layers. The `app/` layer is the composition root that wires everything together.

### Layer Responsibilities

| Layer              | Owns                                                         | Never imports                                  |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------- |
| **domain**         | Entities, value objects, enums, error codes, port interfaces | application, infrastructure, presentation, app |
| **application**    | Use-cases, DTOs, application ports, facades                  | infrastructure, presentation, app              |
| **infrastructure** | Adapters (DB, GraphQL, storage, i18n, routing, UI)           | —                                              |
| **presentation**   | Resolvers, controllers, screens, routes, UI components       | infrastructure, app                            |
| **app**            | Composition root, DI wiring, config, bootstrap               | — (wires everything)                           |

### Domain Subdomains

| Subdomain               | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `identity`              | Users, guests, auth sessions, avatars                       |
| `organization`          | Multi-tenant organizations, members, roles                  |
| `project`               | Projects within organizations, game ownership               |
| `game/management`       | Game CRUD, catalog                                          |
| `game/party`            | Party (game session instance) lifecycle — host/player split |
| `game/types/quiz`       | Quiz-specific rules, questions, answers                     |
| `game/types/prediction` | Prediction-specific rules, prompts, options                 |
| `game-session`          | Live runtime: lobby, stages, scoring                        |
| `shared`                | Cross-cutting value objects, permissions                    |

### Ports & Adapters

Domain and application layers define **ports** (interfaces + DI tokens). Infrastructure provides **adapters** (concrete implementations). Binding happens in the composition root.

- **Backend**: Ports use `Symbol` tokens or `abstract class` as NestJS provider tokens. Bound in `app/modules/` via `{ provide: TOKEN, useExisting: Adapter }`.
- **Frontend**: Ports use Inversify `Symbol` service identifiers defined in `application/*/contracts/`. Bound in `app/composition/container-modules/`.

### Error Handling Strategy

Domain/application layers throw plain `Error(errorCode)` using enum error codes. Transport-level filters/mappers translate these to HTTP status codes and localized messages. No framework exceptions leak into domain or application.

### Boundary Enforcement

Biome `noRestrictedImports` overrides, app-local GritQL plugins under `application/backend/biome/plugins/` and `application/frontend/biome/plugins/`, plus targeted custom scripts:

- `scripts/check-naming.mjs` — enforces naming conventions for exports

### Tech Stack Summary

| Concern       | Backend                                      | Frontend                                     |
| ------------- | -------------------------------------------- | -------------------------------------------- |
| Language      | TypeScript 5.7                               | TypeScript 5.7                               |
| Framework     | NestJS 11                                    | React 19                                     |
| Build         | nest-cli                                     | Vite 7                                       |
| API           | GraphQL (Apollo Server 5, code-first)        | Apollo Client 4                              |
| Realtime      | Socket.IO (via `@nestjs/platform-socket.io`) | socket.io-client                             |
| DI            | NestJS built-in                              | Inversify                                    |
| ORM / DB      | Prisma 7 + PostgreSQL                        | —                                            |
| Auth          | Passport JWT                                 | Context-based session                        |
| i18n          | nestjs-i18n                                  | react-i18next                                |
| UI            | —                                            | Mantine 8 (behind port abstraction)          |
| Forms         | —                                            | TanStack Form (behind port abstraction)      |
| Routing       | —                                            | react-router-dom 7 (behind port abstraction) |
| Observability | OpenTelemetry + OTLP                         | —                                            |
| Cache         | Redis                                        | —                                            |
| Tests         | Vitest                                       | Vitest + Testing Library                     |
| Lint          | Biome                                        | Biome                                        |

### Data Model (Prisma)

Core entities:

```text
User ─┬─ avatar → Media
      ├─ OrganizationMember → Organization
      └─ hosts → Party

Organization → Project → Game ─┬─ Quiz → Question → QuestionAnswer
                                ├─ Prediction → PredictionPrompt → PredictionOption
                                └─ Party ─┬─ Guest
                                          └─ Score (User or Guest)
```

All tables: `snake_case` mapping, soft-delete via `deletedAt`, `createdAt`/`updatedAt` timestamps.
