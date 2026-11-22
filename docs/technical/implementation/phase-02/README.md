# Phase 2 implementation report

## Applied decision

- ADR 0028: replace custom JWT/refresh/guest credentials with Better Auth 1.7.27 cookie sessions.

## Implemented in this change

- Better Auth server and browser dependencies
- PostgreSQL session/account/verification schema and migration
- Durable party participant, participation claim and identity transfer Prisma records
- Cookie-backed GraphQL guard, Socket.IO cookie session resolution and removal of bearer/guest handshake fields
- Frontend removal of token/guest localStorage orchestration

## Exact dependency versions

- Node: 26.13.1
- pnpm: 10.32.1
- Better Auth: 1.7.27 (MIT)
- Prisma: 7.10.1
- @prisma/adapter-pg: 7.10.1
- XState: 5.33.4

## Remaining release gates

The implementation must not be merged until real isolated HTTP, browser, PostgreSQL, SMTP, migration, release and rollback evidence is available. AUTH-01 through AUTH-18 are recorded in `evidence.json`.

## Deletion and migration inventories

- `deletion-inventory.json`
- `migration-inventory.json`

## Verification

Actual commands and outcomes are recorded in `evidence.json`. Raw test output should remain in CI artifacts rather than source reports.
