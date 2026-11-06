# Frontend Tooling and Testing

## Commands

See `package.json` scripts and `make help` for available commands.

## GraphQL Codegen

Schema source: `../backend/src/schema.gql`. Operations: `.graphql` files in `src/infrastructure/**/graphql/operations/`. Output: `src/infrastructure/graphql/generated/graphql.ts`. Run via `npm run graphql:codegen` or `make graphql-types`.

## Lint Pipeline

Custom scripts run before and after Biome: `check-naming.mjs`, `check-module-exports.mjs`, `check-presentation-screens.mjs`, `check-di-instantiation.mjs`, `check-domain-errors.mjs`, and `check-invariant-arguments.mjs`. Architectural boundaries are enforced primarily via `biome.json` `noRestrictedImports` overrides and shared Biome plugins. App-local GritQL plugins enforce path-boundary rules, `check-di-instantiation.mjs` is limited to direct `new` and selected static-call checks, shared-wrapper plus direct `*Service` presentation imports are enforced in Biome, and domain-error throw shape is enforced through a shared Biome GritQL plugin while the script remains for alias-based empty-context checks.

## Testing Conventions

Unit tests are colocated (`*.spec.ts` / `*.spec.tsx`). Screen tests require the shared `MantineProvider` wrapper. Route specs mock the exact import paths of auth, organization, and game contexts.

The Vitest setup wraps the real `MantineProvider` with `env="test"`, following [Mantine's Vitest guidance](https://mantine.dev/guides/vitest/). This applies to both shared render helpers and app-container providers, keeping dropdowns interactive without browser layout measurements and disabling Mantine transitions in jsdom.

The [Vitest configuration](../../../../application/frontend/vitest.config.js) uses
jsdom with the shared browser setup and a limit of four workers. `npm run test:ci`
emits JUnit and LCOV reports. Changes to worker limits or test environments require
repeat measurements of time and memory on the CI runner, with matching tests and
coverage totals. Keep isolation, mocks and coverage inclusion unchanged during
performance experiments. See [ADR 0023](../../architecture/adr/0023-optimize-ci-execution-and-caching.md).
