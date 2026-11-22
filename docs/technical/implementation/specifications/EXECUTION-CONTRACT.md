# Implementation and production release contract

This is normative for all six phases. MUST means a merge requirement. A later phase is never a valid remedy for an incomplete requirement in the current phase.

## E01. Execution discipline

1. Begin from the current main branch with the immediately preceding phase merged. Read actual repository instructions before changing code. Compare the current tree against the recorded baseline; adapt paths to already merged changes without reintroducing deleted architecture.
2. Implement only the assigned phase. Keep one working branch and one PR. Internal commits and local implementation order are unrestricted.
3. Write the required ADR before its associated implementation, inside the same PR. Use the next available ADR number and the existing template. An earlier ADR is updated or superseded explicitly when this specification changes it. Do not silently edit repository instructions to bypass checks.
4. Replace a responsibility completely. Its UI, server handling, permissions, validation, migration, deployment configuration, tests and documentation ship together.
5. Do not leave exposed TODOs, dummy implementations, empty screens, hardcoded fixtures, disabled assertions, skipped required tests or required future migrations. Do not use an allow-failure CI job to satisfy a release gate.
6. Every claim in the PR distinguishes executed evidence from unexecuted procedures. Lack of a device, deployment credential or real test environment leaves that gate incomplete; a mock is not evidence for the unavailable layer.
7. Opening a PR does not authorize merging it or changing a live environment beyond the user's separately established authorization. Nevertheless, produce all code, candidate artifacts, test evidence and rollout procedures needed to review and deploy the PR without another coding phase.

## E02. Production completeness

For every PR, answer these questions in its description:

- What can an actual user do after this version is deployed?
- Which previously usable workflows remain usable, and which intentional breaking contract changes have a complete replacement?
- What code and services were deleted?
- Which data is preserved or converted, and what happens to active sessions/parties during cutover?
- What exact test evidence proves the new behavior, negative paths and recovery?
- How is the version deployed and verified? What is the safe response if rollout fails before or after writes reopen?
- What expires, which durable references survive deletion, and what proves transient data cannot accumulate with every past visitor? From Phase 02, include DOMAIN-CONTRACTS D12 guest-lifecycle evidence.
- Why can production stay on this version indefinitely without the next phase?

Changing a package manifest or adding an unused skeleton is not a complete phase. Releasing only a backend endpoint while its current UI still calls a removed contract is forbidden.

## E03. Target source layout

Phase 01 performs the actual mechanical workspace move and updates every reference. These are new target paths, not claims about the baseline tree.

| Baseline path | Phase 01 path | Package name |
| --- | --- | --- |
| `application/backend` | `apps/api` | `@pleey/api` |
| `application/frontend` | `apps/web` | `@pleey/web` |
| `application/shared` | `packages/contracts` | `@pleey/contracts` |
| `e2e` | `e2e` | Keep or assign one explicit workspace package name |
| `charts/application` | `charts/application` | Existing Helm distribution |

Create `packages/server-identity` in Phase 02 with working consumers. Create `packages/server-persistence` when Phase 02 centralizes the Prisma schema/client and identity transactions. Do not create an independently deployed identity service.

Create `apps/game`, `packages/game-domain`, `packages/game-application` and `packages/game-contracts` in Phase 04 with working implementations. `packages/game-domain` contains pure rules; `game-application` contains use cases and narrow persistence/clock/identity ports; `game-contracts` contains safe public message/view schemas. Server persistence and identity packages cannot be imported by `apps/web`.

Keep one canonical Prisma schema and generated server client. Maintain explicit package exports and import-boundary checks. Shared code is a library, not a new network service.

Preserve the established Helm `backend` and `frontend` value/subchart names and image repositories through Phase 01; source folder renames do not require an infrastructure identity rename. The release manifest uses logical roles `api` and `web`, then adds `game` in Phase 04. There are no placeholder game images in earlier releases.

## E04. Code and dependency policy

- Use the existing Biome and Vitest conventions, typed domain errors, translations and generated user-guide workflow. Update obsolete transport-specific guards when their transport is removed; retain the underlying architectural and correctness checks.
- Use explicit construction and narrow interfaces at genuine domain boundaries. Do not add generic repository frameworks, service locators, a plugin engine, or frontend DI merely to hide normal React/Mantine/router APIs.
- Put configuration parsing in the designated configuration module. Do not scatter environment reads or browser storage access through domain code.
- Pin an exact supported Node LTS and pnpm version, a single lockfile, exact container digests and a tested dependency compatibility matrix. All node runtime code must execute from the built production artifact, not depend on a development TypeScript loader.
- The previous investigation checked Colyseus 0.18 APIs and Better Auth 1.7.27 with Prisma 7. Treat these as an audited starting set, not permission to install unverified repository HEAD or a vulnerable version. Check current advisories and prove the selected exact public releases together. Never use `latest` in production image/dependency configuration.
- Use officially supported interfaces. No monkey-patching framework internals or importing private paths to make authentication or reconnect appear to work.
- Record the license of every introduced runtime dependency. Colyseus core's MIT license does not establish a license for another repository. `@colyseus/react` is excluded unless a later separately evidenced decision resolves its license; Phase 04 uses the SDK and a small React adapter.
- Use open-source local/self-hosted fixtures for SMTP, object storage, database and coordination. Do not require a SaaS account to run verification.

## E05. Common verification commands

Phase 01 MUST implement the following root commands. They are newly specified interfaces; do not claim they already exist in the baseline repository. Later phases extend their actual tests and contract coverage, not their meaning.

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm test:integration
pnpm test:e2e
pnpm deploy:render --profile helm
pnpm test:release --phase 01 --profile compose --output artifacts/phase-01/release.json
pnpm test:upgrade --phase 01 --from path/to/approved-release.json --to path/to/candidate-release.json
pnpm test:restore --profile isolated
```

Replace `01` with the assigned phase number. The manifest paths are explicit CLI inputs selected from real generated artifacts, not literal filenames to fabricate. Document each command's validated arguments and nonzero exit conditions. Support `--help` without infrastructure access.

`pnpm verify` runs deterministic formatting/lint checks, type checks, applicable unit tests, production builds, contract/code-generation drift checks and required documentation checks. It MUST leave tracked files unchanged. Never run dependency repair, automatic formatting, `npm audit fix`, `pnpm update` or network-dependent source edits inside verification.

`test:integration` uses real isolated PostgreSQL/Valkey where the tested requirement depends on transactions, uniqueness, locking, TTL or coordination. `test:e2e` exercises actual browser/server flows. `test:release` boots the production images with the real reverse proxy and runs phase-appropriate smoke tests. `test:upgrade` rehearses the assigned phase's migration/cutover on synthetic prior-version fixtures. `test:restore` verifies a backup into a separate environment; it does not restore over any shared database.

Phase 04 adds `pnpm test:load --profile release` and `--profile stress` with the native Colyseus SDK/load-test tooling. Phase 05 may add operator commands, but prior release verification must work without running them first. Phase 06 adds service-worker lifecycle cases to the existing browser/release commands.

CI can select affected tests locally, but all required release checks for the changed contracts must be blocking before merge. Do not broaden unrelated testing just to produce more output; run the gates that establish the stated release result.

## E06. Test environment isolation

Every test run allocates uniquely named, run-owned containers/databases/buckets/volumes and credentials. Refuse setup if the connection or ownership marker is missing or points to an unowned environment. Never load production secrets or records as default test input.

Use checked-in migrations with `prisma migrate deploy` to establish schemas in release/upgrade tests. A passing `db push --force-reset` test is not migration evidence. No `FLUSHALL`, broad bucket deletion, cluster-wide volume removal or reset operation may target a shared service. Clean only resources created and positively identified by that run.

Use synthetic secrets and identities in fixtures. Keep backup contents, cookies, reset links, tokens and raw private game payloads out of committed logs and PR artifacts.

## E07. Data and cutover policy

Each schema-changing phase supplies:

1. A versioned migration and any offline, idempotent converter.
2. A synthetic previous-version dataset exercising foreign keys, content/media references, histories, permissions, private parties and failures.
3. A dry-run report with source/destination counts, rejected records, ownership mappings and validation errors.
4. A migration rehearsal from the prior supported release, including a repeat run and an interrupted run.
5. A tested backup/restore procedure and the exact point where writes reopen.

Preserve accounts, organization/project ownership, authored games, themes, media and historical results unless the user explicitly authorizes deletion of named data. Keep existing IDs where possible. Never infer identity from an email string alone, nickname, avatar or IP address. Do not mark an imported email verified without evidence.

An offline mapping file or archive format is allowed. It is not an always-on legacy table reader or credential fallback. The active runtime has one model. Destructive legacy table removal occurs only after converter reconciliation succeeds inside the replacing release procedure.

Phases 02 and 04 use a planned cutover: stop new admission, notify/end current parties according to the release runbook, close old connections, back up data, migrate, start the matching application versions, run protected smoke checks, then reopen writes. Never silently mint new identities in an existing active party to pretend migration was seamless.

Before public writes reopen, a failed rollout can restore the preserved database/media state and the previous complete image/configuration set. After new writes are accepted, default to compatible roll-forward. An old snapshot restore may lose those writes; do not automate it or describe an image-only rollback as sufficient. Forward data preservation and recovery must be explicit if rollback after reopening is required.

## E08. Production deployment contract

- `compose.production.yaml` must use built production images, stable volumes, explicit production secrets, health/readiness checks and documented configuration. No development hot reload, seeded known passwords or development JWT keys.
- Helm and Compose expose one HTTPS browser origin. Authentication and gameplay use that origin. Account, media and SMTP support remain functional in both documented deployment paths.
- The same tested OCI images are promoted by digest through the release workflow. The image-role set is exactly the set implemented by that phase. Phase 04 updates every build, promotion, chart validation and artifact path to include `game`.
- A migration job runs once under the deployment's documented lock/ownership mechanism, not independently on every pod startup.
- Readiness answers whether an instance may accept new work. Liveness must not restart every healthy process merely because a shared database is temporarily unavailable. New privileged work fails closed when authority cannot be established.
- Declare application/database/Valkey pools, limits, persistent volumes, backup targets, media-processing memory/CPU bounds, proxy trust and WebSocket idle/upgrade behavior.
- Configuration required for the new release must be documented, validated and present before traffic switches. A missing secret fails startup clearly without being logged.
- Instrument errors, command outcomes, queue delay, recovery category, ownership changes, build/protocol version and migration status. Optional telemetry export failures must not stop the product.

## E09. Compatibility and old clients

Phase 01 introduces `GET /api/release` and a browser bootstrap check. Return only the public release ID and the supported identity/HTTP/game contract majors from the immutable manifest; use no-store. The bundle carries its corresponding major requirements. A mismatch enters an explicit update-required state before user actions. A failed request enters unavailable/retry. Public health/release reads remain reachable for diagnosis. This identifies an unsupported web build and provides a clear update path; it is not a version translation service or an authentication mechanism.

Use an explicit release manifest with application image digests and identity/HTTP/game protocol majors. A phase that intentionally changes a protocol increments its major and deploys matching web/server images. Unsupported clients cannot continue issuing commands. Network failure checking the release is an unavailable state, never a reason to create another anonymous user.

Normal supported releases keep the static assets needed by already loaded compatible clients for the documented release window. Phase 05 implements compatible upgrade/drain automation. Phase 06's service worker must obey the same support boundary and cannot force updates during a party. From Phase 06, an incompatible controlled page must use the service-worker-aware close-all-windows/reopen action; repeatedly reloading a tab that still receives the old cached shell is not a valid recovery path.

## E10. PR evidence and completion

Commit a concise phase report under `docs/technical/implementation/phase-XX/` containing: implemented requirements, source baseline, applied ADRs, migrations and deleted paths, exact dependency/image versions, verification command results, environment/capacity profile, release/rollback procedure and outstanding blockers. Large raw test outputs belong in CI artifacts, linked from the report.

At minimum, structured evidence identifies `phase`, `sourceCommit`, `previousRelease`, `candidateRelease`, `environment`, `commands`, `acceptanceCases`, `migration`, `rollbackRehearsal`, `deviceChecks` and `blockingFailures`. Each case records expected observation, observed result and evidence location. A blanket `passed: true` without cases is insufficient.

The PR is complete only when required cases pass, all affected application paths work, migration/release artifacts are usable, obsolete implementation is removed, and production can remain at this version with no later phase applied.
