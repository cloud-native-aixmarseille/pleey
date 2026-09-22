# Backend Tooling and Testing

## Commands

See `package.json` scripts and `make help` for available commands.

Prisma uses `DATABASE_URL` for the application database. `SHADOW_DATABASE_URL` is optional and is omitted from Prisma configuration when unset or blank; `make setup` does not require it. Both settings also support their `_FILE` variants.

## Lint Pipeline

Lint pipeline runs targeted custom scripts before and after Biome, including naming, DI-instantiation, domain-error-context, and invariant-argument checks. Domain-error throw shape is enforced in Biome via a shared GritQL plugin, while the custom checker is kept for alias-based empty-context cases that the plugin cannot resolve. Path-boundary rules are enforced in `biome.json` via app-local GritQL plugins alongside `noRestrictedImports` overrides.

## Testing Conventions

Unit tests are colocated with source (`*.spec.ts`). Integration tests live in `test/`.

- Follow arrange-act-assert.
- For backend error assertions, prefer `await expect(...).rejects.toThrow(ERROR_CODE)` so the same logic is not executed twice.
- Keep Arrange explicit inside each test when practical; avoid hidden setup that makes failures harder to trace.
