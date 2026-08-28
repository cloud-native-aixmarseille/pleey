# ADR 0002: Use Clean Architecture with strict boundaries

- Status: Accepted
- Proposed date: 2026-08-15
- Accepted date: 2025-11-17

## Context

Pleey contains multiple long-lived product domains, including identity, organizations, games, parties, and realtime gameplay. The project must remain evolvable while integrating frameworks such as NestJS, React, Prisma, Apollo, Mantine, and Socket.IO.

Without explicit boundaries, framework code and product rules would drift together, making testing, refactoring, and incremental replacement harder.

The current codebase already applies layered separation across backend and frontend.

## Decision Drivers

- preserve business logic independence from frameworks
- keep modules testable in isolation
- support gradual replacement of infrastructure and UI libraries
- enforce maintainable dependency directions in a growing monorepo
- reduce architectural drift over time

## Considered Options

### Option 1: Framework-first feature organization with loose boundaries

Organize code mainly around controllers, services, components, and adapters without strong architectural enforcement.

### Option 2: Clean Architecture with explicit domain, application, infrastructure, presentation, and composition layers

Separate product rules from transport, persistence, and UI concerns, and enforce import boundaries.

## Decision

Choose option 2.

Use Clean Architecture as the repository-wide architectural model.

The enforced baseline is:

- domain owns entities, value objects, errors, and ports
- application owns use-cases, facades, DTOs, and orchestration
- infrastructure owns adapters and framework integrations
- presentation owns GraphQL resolvers, controllers, routes, screens, and UI composition
- app owns composition roots, DI wiring, bootstrap, and configuration entry points

Enforce the model through Biome rules, app-local plugins, DI boundaries, and repository conventions.

## Consequences

### Positive

- domain logic stays portable and testable
- framework changes remain more localized
- boundaries become explicit for contributors and tooling
- large feature work is easier to decompose safely

### Negative

- the architecture adds ceremony compared with ad-hoc feature code
- some flows require more interfaces, adapters, and DI wiring
- contributors must learn the boundary rules before changing code quickly

### Follow-Up

- keep architecture docs aligned with actual boundary rules
- record exceptions or major structural changes through ADRs
