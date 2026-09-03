# ADR 0007: Upgrade the backend to NestJS 12

- Status: Accepted
- Proposed date: 2026-08-28
- Accepted date: 2026-08-28

## Context

The backend was migrated from NestJS 11 to NestJS 12. The new major release moves the core framework packages to ESM-only distribution, adds Standard Schema support, replaces legacy GraphQL configuration, adds route-conflict diagnostics, and changes lifecycle-hook ordering.

The migration also exposes an incompatible dependency:

- `nestjs-otel` declares support for NestJS 11 only and is unused because Pleey owns its OpenTelemetry integration directly.

## Decision Drivers

- keep all NestJS core and companion packages on compatible major versions
- avoid deprecated framework and health-check APIs
- preserve the existing GraphQL, validation, health-probe, and telemetry behavior
- adopt useful NestJS 12 diagnostics without forcing unrelated rewrites
- keep the dependency tree free of invalid NestJS peer relationships

## Considered Options

### Option 1: Complete the NestJS 12 migration

Upgrade the NestJS package family together, use the current GraphQL, validation, and health APIs, enable route-conflict diagnostics, and remove the unused NestJS 11 telemetry wrapper.

### Option 2: Remain on NestJS 11

Keep the previous package family and postpone the migration until every optional ecosystem package publishes a NestJS 12-compatible release.

### Option 3: Force incompatible peer dependencies

Keep NestJS 12 while overriding NestJS 11-only peer ranges for health and telemetry packages.

## Decision

Choose option 1.

- Keep all core NestJS framework, platform, testing, GraphQL, JWT, and Passport packages on their NestJS 12-compatible majors.
- Keep the application module format unchanged; NestJS 12 officially supports consuming its ESM packages from the current NodeNext build.
- Use GraphiQL instead of the removed Apollo Playground configuration and retain `graphql-ws` for subscriptions.
- Enable route specificity resolution and duplicate/shadow diagnostics at bootstrap.
- Continue using `ValidationPipe` for class-based GraphQL and WebSocket DTOs. Use `StandardSchemaValidationPipe` with Zod for schema-first HTTP parameters.
- Remove `nestjs-otel`; Pleey's direct OpenTelemetry SDK integration remains the observability implementation.
- Upgrade `@nestjs/terminus` to version 12 and use `HealthIndicatorService` results instead of the removed `HealthCheckError` API.
- Treat lifecycle hooks as independent signals and avoid relying on provider traversal order.

## Consequences

### Positive

- no NestJS 11-only direct dependency remains in the backend
- legacy GraphQL Playground and deprecated Terminus errors are removed
- route conflicts are detected rather than silently shadowed
- validation approaches follow the supported NestJS 12 guidance for both class DTOs and Standard Schema
- health probes use a Terminus release with a compatible NestJS peer range

### Negative

- the backend still needs coordinated upgrades for future NestJS majors
- switching the application itself to ESM remains a separate optional migration

### Follow-Up

- run `nest upgrade --dry-run` during future NestJS major upgrades
- keep the backend Node.js runtime and development prerequisites aligned with the NestJS CLI requirements
- reevaluate the official NestJS observability SDK separately if its lifecycle integration provides clear value over the existing OpenTelemetry setup
