# Phase 2 implementation report

## Applied decision

- ADR 0028: replace custom JWT/refresh/guest credentials with Better Auth 1.7.27 cookie sessions.

## Implemented in this change

- Better Auth server and browser dependencies
- PostgreSQL session/account/verification schema and migration
- Durable party participant, participation claim and identity transfer Prisma records
- Awaited Better Auth anonymous-link hook with collision rollback and source-session revocation
- Durable active-player claims in join, leave and kick paths
- Cookie-backed GraphQL guard, Socket.IO cookie session resolution and removal of bearer/guest handshake fields
- Native Better Auth registration, password recovery and session listing/revocation
- CAPTCHA verification before Better Auth registration or password-reset dispatch
- Frontend removal of token and guest-secret localStorage orchestration
- Cookie-aware anonymous player joins and anonymous/registered route boundaries
- Compose, Helm and generated chart-document updates for `BETTER_AUTH_SECRET` and `SMTP_URL`

## Exact dependency versions

- Node: 26.13.1
- pnpm: 10.32.1
- Better Auth: 1.7.27 (MIT)
- Prisma: 7.10.1
- @prisma/adapter-pg: 7.10.1

## Remaining release gates

The current candidate does not claim a complete Phase 2 release. AUTH-02, AUTH-06, the full account-switch suite, migration upgrade/restore and all real-device cases remain recorded as blockers in `evidence.json`.

The root `pnpm verify`, real isolated PostgreSQL integration suite, production image builds, Helm lint/render, and user-guide capture pass. The first full Playwright run exposed legacy browser expectations around the removed token/captcha flows; the focused native forged-captcha case passes, while the complete browser suite remains a release blocker.

## Deletion and migration inventories

- `deletion-inventory.json`
- `migration-inventory.json`

## Verification

Actual commands and outcomes are recorded in `evidence.json`. Raw test output should remain in CI artifacts rather than source reports.
