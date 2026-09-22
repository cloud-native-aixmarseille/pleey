# Frontend Tooling and Testing

## Commands

See `package.json` scripts and `make help` for available commands.

## GraphQL Codegen

Schema source: `../backend/src/schema.gql`. Operations: `.graphql` files in `src/infrastructure/**/graphql/operations/`. Output: `src/infrastructure/graphql/generated/graphql.ts`. Run via `npm run graphql:codegen` or `make graphql-types`.

## Lint Pipeline

Custom scripts run before and after Biome: `check-naming.mjs`, `check-presentation-screens.mjs`, `check-di-instantiation.mjs`, `check-domain-errors.mjs`, and `check-invariant-arguments.mjs`. Architectural boundaries are enforced primarily via `biome.json` `noRestrictedImports` overrides and shared Biome plugins. App-local GritQL plugins enforce path-boundary rules, `check-di-instantiation.mjs` is limited to direct `new` and selected static-call checks, shared-wrapper plus direct `*Service` presentation imports are enforced in Biome, and domain-error throw shape is enforced through a shared Biome GritQL plugin while the script remains for alias-based empty-context checks.

## Testing Conventions

Unit tests are colocated (`*.spec.ts` / `*.spec.tsx`). Screen tests require the shared `MantineProvider` wrapper. Route specs mock the exact import paths of auth, organization, and game contexts.
