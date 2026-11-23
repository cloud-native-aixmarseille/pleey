# Phase 01 implementation report

## Implemented requirements

- One pnpm workspace keeps API, web and shared contracts under `application/api`, `application/web` and `application/contracts`.
- The API and web build real production Node/Vite artifacts.
- `/api/release` publishes public release identity and protocol majors with `Cache-Control: no-store`.
- The browser waits for a supported release contract before mounting application actions.
- Production Compose and Helm deployment profiles use explicit API/web image roles and persistent dependencies.
- Phase 01 provides migration, upgrade, restore, render and release command entrypoints.
- Existing GraphQL, Socket.IO and custom identity behavior remains the sole active implementation.

## Source baseline

- Package: specification-inspected baseline `89eba30755f53aced04b596bc1531854a15bc1d5`
- Implementation commit: `b03de2bd753fc7d800896c05ff35f616988e1720`
- Candidate manifest: `artifacts/phase-01/release.json`

## Applied ADR

- [ADR 0027](../../architecture/adr/0027-reproducible-production-workspace-and-delivery.md), Accepted for this implementation.

## Dependency and image evidence

See [version matrix](../../development/version-matrix.md). Candidate release images from the executed Docker build are recorded in `artifacts/phase-01/release.json`.

## Executed verification

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed |
| API production build | Passed |
| Web production build | Passed |
| Shared contracts build | Passed |
| API unit suite | Passed: 1218 passed, 72 skipped |
| Web unit suite | Passed: 1218 passed |
| `pnpm test:integration --phase 01` | Passed migration of 6 checked-in migrations and API unit suite in a run-owned PostgreSQL/Valkey project |
| `pnpm deploy:render --profile helm` | Passed with explicit synthetic required values |
| `pnpm deploy:render --profile compose` | Passed manifest validation |
| `pnpm test:release --phase 01 --profile compose --output artifacts/phase-01/release.json` | Passed API and web production image builds; manifest emitted |

## Not executed

- Chromium, Firefox and WebKit critical journeys (`DEL-009`)
- Production Compose/Helm runtime smoke from real HTTPS credentials (`DEL-010`, `DEL-011`)
- DB and media backup/restore with representative media (`DEL-012`)
- Real browser/physical-device compatibility bootstrap (`DEL-017`)
- Production live deployment

These gates require an isolated credentials-equipped environment and are not represented as passed.

## Rollout and rollback

Follow [production delivery](../../runbooks/production-delivery.md) and [backup and restore](../../runbooks/backup-and-restore.md). Phase 01 has no schema or authentication contract change, so before writes reopen rollback can restore the previous complete image/chart manifest. After writes reopen, roll forward and preserve candidate database/media writes.

## Independence proof

After merge, the API and web can be built and deployed from the workspace with PostgreSQL and Valkey. No deployed user journey depends on a future identity, REST, Colyseus or PWA implementation.
