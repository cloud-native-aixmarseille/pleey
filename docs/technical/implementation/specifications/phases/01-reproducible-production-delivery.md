# Phase 01 - Reproducible production delivery

## PR outcome and dependencies

Produce one PR that makes the existing complete Pleey product build, verify, install, upgrade and restore through a reproducible pnpm workspace and documented production deployment. This phase does not introduce Better Auth, REST replacement, Colyseus, XState or a PWA. Its deployment must remain useful if every later phase is cancelled.

Read `../EXECUTION-CONTRACT.md`, `../DOMAIN-CONTRACTS.md`, `../ACCEPTANCE-CATALOG.md` and `../SOURCES.md` first. Read repository `AGENTS.md` and its linked architecture/development documents. Create the relevant proposed ADRs before implementation. Follow the already selected architecture; do not conduct a new framework selection exercise.

Suggested branch: `refactor/reproducible-production-delivery`.

Suggested PR title: `refactor!: establish reproducible workspace and production delivery`.

Prerequisite: the current production release/source revision is recorded. No later phase is a prerequisite. This PR changes build/deployment conventions, not authentication, game rules or the public application contract.

## Scope and rules

MUST preserve all currently supported user journeys: anonymous and registered play, registration and password recovery, profile/session management, organization/project permissions, quiz and prediction authoring/import, themes, private parties, host controls, question media, scoring/results, English/French translations and user guides.

MUST NOT merge unused new application directories, empty game services, disabled replacement endpoints, a parallel V2 application or runtime feature flags selecting old versus new architecture.

MUST NOT treat a successful development server or `prisma db push` as production installation evidence. MUST NOT automatically repair dependencies, mark failed migrations applied, or mutate the lockfile while verifying.

## 1. Record product behavior and the release baseline

Create `docs/technical/runbooks/production-delivery.md`, `docs/technical/runbooks/backup-and-restore.md`, `docs/technical/testing/product-behavior-inventory.md` and a machine-readable inventory under `e2e/contracts/product-behavior.json`.

For every inventory item record a stable ID, actor, route or operation, permission, expected result, existing implementation/documentation source, and acceptance-test location. Record existing defects separately; do not turn security defects into normative requirements. No invented feature retirement is allowed.

Use accepted ADR 0017 for scoring. Both quiz and prediction use the selected option's predefined `isCorrect` value. Players submit one option, including when several options are marked correct. Timed correct answers receive the approximately 80% base plus bounded 20% speed bonus; incorrect answers receive zero; expiry is rejected before scoring. Untimed correct answers receive all stage points. Preserve deterministic ranking and separate points earned from places gained/lost. Correct any guide implying that prediction scoring is based on popularity, a later external event, or a host decision. Update its manifest, translations, generated text and screenshots together.

Record the deployed source SHA, application image digests, chart digest/version, PostgreSQL major, schema migration history and configured media backend. Use sanitized fixtures for tests; never copy production credentials or personal records into Git.

## 2. Create one workspace and update every consumer

Apply this path/package mapping in one change:

| Existing path/package | Required target |
| --- | --- |
| `application/backend`, `quiz-backend` | `apps/api`, `@pleey/api` |
| `application/frontend`, `pleey-frontend` | `apps/web`, `@pleey/web` |
| `application/shared`, `@pleey/domain` | `packages/contracts`, `@pleey/contracts` |
| `e2e` | Retain path; name package `@pleey/e2e` |

Add root `package.json`, `pnpm-workspace.yaml` and one `pnpm-lock.yaml`. Include application packages, E2E and repository Node tooling in the workspace. Replace local `file:` application dependencies with `workspace:` dependencies. Remove superseded package locks for packages now managed by this workspace. No source copy may remain at the old application paths.

Pin pnpm using the exact `packageManager` field. Use a supported Node LTS release, a tested ESM-compatible TypeScript/Nest build and compatible Prisma 7 packages. The existing Dockerfiles use Node 26; verify the official support status and select a patched supported release before pinning. Record exact Node patch, pnpm version, TypeScript, Nest, Prisma client/CLI/adapter versions and image digests in `docs/technical/development/version-matrix.md`. Ranges such as `node:latest`, an unrecorded floating LTS or inconsistent Prisma versions do not satisfy this requirement.

Use real ESM output for server workspace packages, with consistent package exports and module resolution. Production must execute built JavaScript through Node, without ts-node, tsx or a development loader. Preserve Nest metadata/initialization, translation assets, Prisma generation, runtime configuration, source maps and shared package availability. Package contracts must not import server persistence or secrets. Browser bundles must not include server-only modules.

Update Dockerfiles, Makefile targets, Compose mounts, TypeScript aliases, Biome boundaries, scripts, GraphQL code generation, documentation generators, screenshot fixtures, test coverage paths, CI cache inputs, dependency scanning and scoped instruction paths. GraphQL/Socket.IO remain the current protocols in this phase, so their current guards remain functional after path changes. Do not remove those checks early.

Search tracked files for old paths and package names. Historical ADR quotations may remain with a historical label; executable imports, build contexts and current documentation must use current paths.

## 3. Implement the root command contract

The following commands MUST exist at the end of this PR and fail nonzero when a required check fails:

| Command | Required behavior |
| --- | --- |
| `pnpm verify` | Locked dependency verification, format/lint, typecheck, unit tests, architecture guards and documentation freshness; no tracked-file mutation |
| `pnpm test:integration` | Integration tests against run-owned PostgreSQL/Valkey; real adapters and checked-in migrations |
| `pnpm test:e2e` | Critical browser journeys through the production proxy and images |
| `pnpm test:release` | Build/validate the complete current two-image release, production Compose and Helm install, signed media and authentication smoke |
| `pnpm test:upgrade` | Upgrade a seeded previous-release database/deployment to this exact candidate and verify invariants |
| `pnpm test:restore` | Back up the test database and media, restore into separate fresh resources, and verify application behavior |
| `pnpm deploy:render` | Validate explicit configuration and render production Compose/Helm manifests without applying them or printing secrets |

Use scripts under `scripts/verification/` and `scripts/operations/` where orchestration is needed. Keep one implementation per command; Make targets may be thin wrappers. Support a documented case selector for the acceptance IDs in this file. The unfiltered command must run every case applicable to its category.

Remove `npm audit fix`, automatic lint fixes and permissive `|| true` from verification paths. Keep dependency-update and formatting commands separate and explicitly named. Align JUnit, coverage and SARIF producers with existing CI report consumers; a missing expected report fails the gate.

## 4. Make test setup isolated and migration-based

Replace the destructive shared-stack behavior in `scripts/test-runner.sh`. Every acceptance run creates a unique Compose project or Kubernetes namespace, isolated volumes, database and Valkey instance. Cleanup may delete only resources whose run ownership is verified.

Apply `prisma migrate deploy` from checked-in migrations. Do not use `db push`, `--force-reset`, generic `FLUSHALL`, or production migration auto-repair. Do not edit a released migration to conceal drift. If the existing chain does not produce the supported schema, add a correct forward migration and test it from the preceding supported schema.

Maintain separate fixtures for empty install and upgrade from the previous production schema. Seed only disposable test resources. Reject externally supplied destructive-test database URLs unless the harness has created and positively identified that resource as its own.

Run browser acceptance against production builds through one HTTPS origin and the intended proxy using a trusted test CA. Cookie, forwarded-protocol and WebSocket Origin behavior must execute as deployed. Adapt the existing E2E hostname restriction so it permits the isolated test proxy rather than bypassing it through backend ports. Enable Chromium, Firefox and WebKit critical journeys. Record real-device validation separately; browser emulation is not an iPhone test.

## 5. Supply an explicit production deployment

Create root `compose.production.yaml`; keep development Compose clearly separate. Production services use prebuilt images, explicit persistent volumes, restart policy, health checks, resource budgets, secret files and TLS configuration. Do not mount source, run hot reload, install dependencies at startup or seed known accounts.

The production profile must include the API/web roles, PostgreSQL, Valkey, reverse proxy, SMTP option and self-hosted private media configuration. Use the existing SeaweedFS S3-compatible approach for the documented self-hosted media option, preserving authenticated origin reads and signed delivery. Retain Postfix support or an explicitly configured existing SMTP service. Mailpit is test/development capture, not production delivery.

Keep the existing Helm `backend`/`frontend` subchart identities and image repositories during this source-layout change; the release manifest maps them to logical `api`/`web` roles. Update source/build paths and render both deployment targets from the same explicit configuration model. Do not create a game image or chart in P1.

Preserve required media binaries, including FFmpeg/FFprobe and Linux resource limits, plus Sharp, writable temporary storage and bounded processing concurrency. Test signed GET/range access, expiry, tampering, private caching and authorized host/editor access. Public bucket reads must fail.

Generate no production credentials from development defaults. Existing deployment secrets are preserved. Fresh install must provide a documented one-time operator bootstrap for the first authorized account using the current authentication domain; no `admin123` or fixed password is accepted. Fail startup on missing required configuration. Secret values and signed URL query strings must not appear in rendered output or logs.

## 6. Seal the release and preserve existing CI safeguards

Update `.github/workflows/__shared-ci.yml`, `pull-request-ci.yml`, `main-ci.yml`, `release.yml`, `.github/actions/determine-pr-checks`, `charts/application`, chart documentation and local install checks.

Preserve the current candidate-image-by-digest validation and immutable validated-chart publication. Emit `release-manifest.json` containing source SHA, logical image roles/repositories/digests, chart checksum, dependency matrix, schema migration identifier and protocol/build version. A release uses one complete manifest; mutable tags are not its atomic selection mechanism.

Implement `GET /api/release` and the browser build-compatibility boundary specified in EXECUTION-CONTRACT E09. Include only the public release ID and identity/HTTP/game contract majors, with no-store. Embed the web build's requirements. A known mismatch disables actions and shows an explicit update-required message; request failure shows unavailable/retry and cannot create a new guest. Keep native health/release reads available. Later phases change their relevant major in the same coordinated release; no version translation adapter is introduced now.

Full CI must run for changed workspace scripts, lockfile, images, chart configuration and unknown paths. Update report path mappings and documentation-generation skip rules for `apps/` and `packages/`. Promotion depends on all required checks with no allow-failure. A cancelled/failed run cannot reuse stale candidate outputs as successful current-run evidence.

Make any AI-generated release summary optional. A deterministic conventional changelog must produce a release without an LLM account. Application deployment and local source builds must not require a private registry or SaaS control plane.

## 7. Acceptance cases

| ID | Scenario and required result |
| --- | --- |
| DEL-001 | Clean checkout plus `pnpm install --frozen-lockfile` and `pnpm verify` succeeds; `git diff --exit-code` is clean afterward. |
| DEL-002 | API/web production images start from built artifacts with no repository mount or dependency installation; shared imports, Prisma and translations resolve. |
| DEL-003 | Browser artifact inspection finds no server secrets, database package or server-only contract import. |
| DEL-004 | Product inventory covers all existing supported journeys, including quiz and prediction scoring from ADR 0017; generated guides agree. |
| DEL-005 | Empty database install applies the checked-in migration chain and reaches readiness. |
| DEL-006 | Previous production schema with representative content/account/media fixtures upgrades without data or ownership loss. |
| DEL-007 | Broken migration stops deployment; the harness never marks it applied, bypasses it or resets the database. |
| DEL-008 | Test setup presented with a non-owned database/Valkey endpoint refuses destructive operations. |
| DEL-009 | Critical Chromium, Firefox and WebKit journeys run through the HTTPS proxy; public configuration cannot accept development secrets or insecure cookies. |
| DEL-010 | Production Compose starts the complete product; PostgreSQL, Valkey, SMTP and private media dependencies are explicit and self-hostable. |
| DEL-011 | Helm installs the same candidate image digests and passes the application/media/authentication smoke scenarios. |
| DEL-012 | Database and referenced media backup restore into independent resources with intact relationships, authentication ownership and usable assets. |
| DEL-013 | Missing database secret, bad configuration or unavailable mandatory dependency produces bounded startup failure and sanitized diagnostics. |
| DEL-014 | CI refuses missing reports, skipped required jobs, stale candidate metadata or a mismatched chart checksum. |
| DEL-015 | Releasing without optional telemetry or an LLM credential succeeds; secrets never enter release artifacts. |
| DEL-016 | Prior images can be restored against P1's unchanged business schema; the rollback smoke passes. |
| DEL-017 | The real browser compares release contract majors before actions; an incompatible build shows update-required and an unavailable release endpoint shows retry without creating a guest or leaking configuration. |

Use meaningful integration/browser assertions. Do not duplicate implementation details in tests or add brittle source-string checks as substitutes for runtime behavior.

## 8. Ordered implementation checklist

- [ ] Record baseline revision, behavior inventory and ADRs.
- [ ] Create the workspace and exact dependency/version matrix.
- [ ] Move packages and update all executable/current-documentation consumers.
- [ ] Produce functioning ESM API and static web production images.
- [ ] Replace verification orchestration with isolated migration-based runs.
- [ ] Implement every root command above and its report output.
- [ ] Add production Compose and update Helm without changing product semantics.
- [ ] Add release-manifest validation and update CI/promotion/docs paths.
- [ ] Rehearse empty install, prior-release upgrade and DB/media restore.
- [ ] Correct contradictory guides and regenerate their artifacts.
- [ ] Run all acceptance gates and capture evidence in the PR.
- [ ] Remove superseded locks, scripts and executable paths; inspect the final diff.

## 9. Rollout, rollback and merge evidence

Run the required command gates from a clean checkout, using the execution contract's argument handling:

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm test:integration --phase 01
pnpm test:e2e --phase 01
pnpm test:release --phase 01 --profile compose --output artifacts/phase-01/release.json
pnpm test:release --phase 01 --profile helm --output artifacts/phase-01/helm-release.json
pnpm test:upgrade --phase 01 --from artifacts/approved-release.json --to artifacts/candidate-release.json
pnpm test:restore --profile isolated
pnpm deploy:render --profile helm
```

The manifest paths are concrete run inputs produced by the tooling; substitute the actual approved/candidate files and record them in the evidence. Attach the release manifest, test reports, render/install evidence and backup/restore checksums to the PR. Record real results, not a list of tests the next phase will add.

Deploy the two-image manifest using the existing database and explicit production configuration. Verify readiness, registration/recovery, authorized management, guest join/play/results and private media. The database business model and authentication semantics remain unchanged, so rollback uses the prior image/chart manifest and compatible configuration. Verify this with DEL-016; do not promise it if an unplanned schema change was introduced.

Stop rather than merging if product coverage is incomplete, migrations need manual marking, production depends on development seed data, image roles come from different revisions or the package move leaves broken guides/operations.

**Independence proof:** after merge, operators can build, deploy, use, upgrade and restore the same complete Pleey product with a reproducible supported stack. No user action calls a future API, and no service waits for Better Auth, REST, Colyseus or PWA work.

## Evidence references

- [Current CI workflow](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/__shared-ci.yml)
- [Current release workflow](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/release.yml)
- [Existing operations and media requirements](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/development/backend/operations.md)
- [Accepted scoring ADR 0017](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0017-reward-action-quality-before-speed-in-game-scoring.md)
