# Backend Tooling and Testing

## Commands

See `package.json` scripts and `make help` for available commands.

Prisma uses `DATABASE_URL` for the application database. `SHADOW_DATABASE_URL` is optional and is omitted from Prisma configuration when unset or blank; `make setup` does not require it. Both settings also support their `_FILE` variants.

`make setup` starts PostgreSQL and installs backend dependencies in a temporary
container, then runs `make migrate-dev-recover` through temporary backend containers
before starting the application services and waiting for readiness. Startup hooks
can therefore read the migrated schema. These containers use the backend's source
mount and database configuration without starting its application process. Setup
stops if database preparation fails, before proceeding to application startup.

`make migrate-dev-recover` supports existing development databases. It
baselines a non-empty schema and marks duplicate or previously failed migrations
as applied. When an aborted PostgreSQL transaction hides the migration error, it
retries deployment to read the failed migration from Prisma history. The retry
limit allows two attempts per migration, plus baselining and final verification.
This recovery assumes the migration changes already exist; it does not validate or
repair the schema. Use `make migrate` for strict migration deployment.

## Lint Pipeline

Lint pipeline runs targeted custom scripts before and after Biome, including naming, module exports, DI-instantiation, domain-error-context, and invariant-argument checks. Domain-error throw shape is enforced in Biome via a shared GritQL plugin, while the custom checker is kept for alias-based empty-context cases that the plugin cannot resolve. Path-boundary rules are enforced in `biome.json` via app-local GritQL plugins alongside `noRestrictedImports` overrides.

`npm run _lint:resolvers` is part of the pre-Biome lint pipeline. It checks GraphQL operation delegation and prevents resolver dependencies on business services, repository ports, and infrastructure adapters. Identifier parsing and presentation helpers are allowed. Its Vitest fixtures cover both accepted and rejected code, including aliases and reexports.

## OpenTelemetry

Use the backend's declared Node.js engine and the development prerequisites in the
[development reference](../index.md). Containers and CI use the backend Dockerfile.

Telemetry initializes before application imports. Use `@opentelemetry/api` for
logging, tracing, and metrics contracts, and public package entrypoints for SDK
implementations. NodeSDK owns the configured providers and flushes them during
shutdown; application loggers use its registered Logs provider.

The application explicitly configures signal exporters from its
[runtime settings](./operations.md#runtime-configuration). Without an OTLP endpoint,
exporters are disabled unless console exporters are enabled. If the collector is
unreachable at startup, the same console fallback setting applies. Console
exporters cover logs and metrics; traces require an OTLP endpoint. SDK default
exporters do not override these choices. Console log mirroring remains separate.

## Translation watcher

The backend scopes a Chokidar 5.0.0 override to `nestjs-i18n`; see [ADR 0015](../../architecture/adr/0015-use-chokidar-5-for-translation-watching.md). Translation watching uses directory paths and is covered by the loader integration test.

## Testing Conventions

Unit tests are colocated with source (`*.spec.ts`). Integration tests live in `test/`.

- Follow arrange-act-assert.
- For backend error assertions, prefer `await expect(...).rejects.toThrow(ERROR_CODE)` so the same logic is not executed twice.
- Keep Arrange explicit inside each test when practical; avoid hidden setup that makes failures harder to trace.

Run `npm run test:import-templates` from `application/backend` to check `scripts/quiz-import-templates.spec.ts`. This cross-application contract test imports the real frontend template factory and translation resources and validates every supported locale and format through the backend quiz mapper. It requires a full repository checkout with both applications' dependencies installed. Run it when changing import formats or template translations; the regular backend suite covers localized parser behavior independently and runs in the backend-only CI container.
