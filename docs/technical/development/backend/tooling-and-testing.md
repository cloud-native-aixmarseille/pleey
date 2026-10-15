# Backend Tooling and Testing

## Commands

See `package.json` scripts and `make help` for available commands.

Prisma uses `DATABASE_URL` for the application database. `SHADOW_DATABASE_URL` is optional and is omitted from Prisma configuration when unset or blank; `make setup` does not require it. Both settings also support their `_FILE` variants.

## Lint Pipeline

Lint pipeline runs targeted custom scripts before and after Biome, including naming, module exports, DI-instantiation, domain-error-context, and invariant-argument checks. Domain-error throw shape is enforced in Biome via a shared GritQL plugin, while the custom checker is kept for alias-based empty-context cases that the plugin cannot resolve. Path-boundary rules are enforced in `biome.json` via app-local GritQL plugins alongside `noRestrictedImports` overrides.

`npm run _lint:resolvers` is part of the pre-Biome lint pipeline. It checks GraphQL operation delegation and prevents resolver dependencies on business services, repository ports, and infrastructure adapters. Identifier parsing and presentation helpers are allowed. Its Vitest fixtures cover both accepted and rejected code, including aliases and reexports.

## Translation watcher

The backend scopes a Chokidar 5.0.0 override to `nestjs-i18n`; see [ADR 0015](../../architecture/adr/0015-use-chokidar-5-for-translation-watching.md). Translation watching uses directory paths and is covered by the loader integration test.

## Testing Conventions

Unit tests are colocated with source (`*.spec.ts`). Integration tests live in `test/`.

- Follow arrange-act-assert.
- For backend error assertions, prefer `await expect(...).rejects.toThrow(ERROR_CODE)` so the same logic is not executed twice.
- Keep Arrange explicit inside each test when practical; avoid hidden setup that makes failures harder to trace.

Run `npm run test:import-templates` from `application/backend` to check `scripts/quiz-import-templates.spec.ts`. This cross-application contract test imports the real frontend template factory and translation resources and validates every supported locale and format through the backend quiz mapper. It requires a full repository checkout with both applications' dependencies installed. Run it when changing import formats or template translations; the regular backend suite covers localized parser behavior independently and runs in the backend-only CI container.
