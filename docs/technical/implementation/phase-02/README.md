# Phase 2 implementation report

## Applied decision

- ADR 0028: replace custom JWT/refresh/guest credentials with Better Auth 1.7.27 cookie sessions.
- ADR 0029: bound temporary anonymous identity lifetime independently from retained party history.

## Implemented in this change

- Better Auth server and browser dependencies
- PostgreSQL session/account/verification schema and migration
- Durable nullable party participant, participation claim, identity transfer and retirement Prisma records
- Explicit `ExpireAnonymousParticipant` transition that preserves scores and detaches temporary auth ownership
- PostgreSQL-backed startup and 15-minute retirement sweeps with 100-item claims and finite work budgets
- Server-side anonymous admission budgets and operational lifecycle metrics
- Awaited Better Auth anonymous-link hook with collision rollback and source-session revocation
- Durable active-player claims in join, leave and kick paths
- Cookie-backed GraphQL guard, per-command Socket.IO cookie revalidation and removal of bearer/guest handshake fields
- Native Better Auth registration, password recovery and session listing/revocation
- CAPTCHA verification before Better Auth registration or password-reset dispatch
- Frontend removal of token and guest-secret localStorage orchestration
- Cookie-aware anonymous player joins and anonymous/registered route boundaries
- XState browser session actor with deliberate anonymous-play intent and same-origin Web Lock bootstrap
- Multi-tab convergence through cookie recheck, with a documented one-tab fallback for non-secure development origins
- Compose, Helm and generated chart-document updates for `BETTER_AUTH_SECRET` and `SMTP_URL`

## Exact dependency versions

- Node: 26.13.1
- pnpm: 10.32.1
- Better Auth: 1.7.27 (MIT)
- Prisma: 7.10.1
- @prisma/adapter-pg: 7.10.1

## Anonymous retention

Anonymous Better Auth users exist only while a native unexpired session or finite transfer deadline
requires them. Historical participants use stable `participantId` references and nullable `userId`
bindings. A valid session always blocks cleanup. Expired identities are removed without deleting
accepted scores or result history, and deleted participant identifiers never become a recovery
credential for a fresh cookie.

## Deletion and migration inventories

- `deletion-inventory.json`
- `migration-inventory.json`

## Verification

Actual commands and outcomes are recorded in `evidence.json`. Raw test output remains in CI artifacts
rather than source reports. The 99% anonymous churn fixture and historical-only guest upgrade
rehearsal run in the isolated Phase 02 integration command.
