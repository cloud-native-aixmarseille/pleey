# Development Reference

## Prerequisites

- Docker & Docker Compose V2
- Node.js 22.22.3+, 24.15+, or 26+ for NestJS CLI workflows
- Git

## Setup

```bash
make setup    # builds images, prepares DB, starts stack, seeds DB, generates GraphQL types
```

Access points:

- Frontend: `http://pleey.localhost`
- Backend API: `http://pleey.localhost/api`
- Traefik dashboard: `http://traefik.localhost`

Default accounts:

- Admin: `admin@pleey.com` / `admin123`
- Player: `player@pleey.com` / `player123`

## Available Commands

Run `make help` for the full list of make targets (stack, database, lint, test, etc.).

Per-app npm scripts are in each `package.json`. Key entrypoints:

- `make setup` - full stack bootstrap
- `make ci` - npm-audit-fix (non-blocking) + lint-fix + test (pre-push check). Use `MODE=ci` for backend/frontend tests with coverage; the default also runs end-to-end tests, which reset the development database and session state.
- `make test` - all tests (supports `SCOPE` and `MODE` args)
- `make npm-update` - interactively select npm dependency upgrades in containers for the backend, frontend, and end-to-end projects, sequentially. Use `SCOPE=backend|frontend|e2e` to select one project.
- `make npm-audit-fix` - run `npm audit fix` in containers for all three projects, sequentially. Use `SCOPE=backend|frontend|e2e` to select one project.

Both dependency commands require Docker Compose, registry access, and the development
networks (`make setup-traefik`). They use temporary
containers for the `backend`, `frontend`, and `e2e-tests` services without starting
their dependencies. They use the host user's UID/GID and a writable temporary npm
cache. The existing source mounts persist manifest and lockfile changes on the host.

`make npm-update` requires an interactive terminal. Inside each container, npx runs
the latest npm-check-updates, then npm install runs after confirmed upgrades. Major
upgrades are included in the selection.

`make npm-audit-fix` runs without an interactive terminal and applies the compatible
updates available through [npm audit fix](https://docs.npmjs.com/cli/commands/npm-audit/).
It does not pass `--force`. All selected projects are attempted even if one fails;
the target fails if any invocation fails, including when vulnerabilities remain.
Review dependency changes and run the affected project's checks after either command.

## Shared domain package

[`packages/pleey-domain/`](../../../packages/pleey-domain) is the private
repository package `@pleey/domain` for contracts and deterministic policies
consumed by backend and frontend. [ADR 0022](../architecture/adr/0022-evaluate-a-shared-frontend-backend-library.md)
owns the decision and eligibility scope.

Extract a declaration only when it has an identified cross-application consumer
and remains framework-neutral. Keep the following in the application that owns
them:

- NestJS, React, Prisma, Apollo, Socket.IO, browser and Node runtime capabilities;
- authorization enforcement, persistence and side effects;
- signing, hashing, media bytes and storage access;
- private or audience-incomplete runtime state;
- translation copy and transport-specific client diagnostics.

Use one explicit feature entry point such as `@pleey/domain/game` or
`@pleey/domain/identity`. Do not add a catch-all package barrel or application
reexport wrapper for a shared declaration. Preserve an application adapter only
when its runtime representation or enum vocabulary intentionally differs from
the shared public contract.

Shared JavaScript and declaration files must remain aligned. Update both
applications to consume a moved contract before deleting the superseded local
file. A runtime projection must be mapped at its infrastructure or presentation
boundary; importing a shared type does not grant the frontend access and does
not authorize the backend to expose a private field.

[`@pleey/domain/i18n`](../../../packages/pleey-domain/i18n) owns localized
meaning only for exported public business error codes. Screen labels,
accessibility copy, email content and application-local errors remain in their
application catalogs. Add a shared message only when the same error code is
public in both runtimes and follows [ADR 0025](../architecture/adr/0025-share-business-error-translations.md).

For package, lockfile, policy or API-surface changes, run:

```bash
node scripts/check-shared-domain-package.mjs
node scripts/check-shared-translations.mjs
npm --prefix application/backend run lint:ci
npm --prefix application/frontend run lint:ci
npm --prefix application/backend run test
npm --prefix application/frontend run test
```

After changing `packages/pleey-domain/i18n/index.js`, regenerate generated
backend namespaces with:

```bash
node scripts/check-shared-translations.mjs --write
```

Changes under `packages/pleey-domain/` and to the shared guard take the full PR CI
route. [P7 contract tests](../../../.github/actions/determine-pr-checks/shared-package-docker.spec.js)
also verify Docker build, production, CI, Compose and lockfile wiring. Use a cold
Docker build when changing package layout or Docker inputs, then verify a warm
build reuses the expected layers:

```bash
docker compose --env-file /dev/null build --no-cache backend frontend
docker compose --env-file /dev/null build backend frontend
```

## Application base images

The [backend](../../../application/backend/Dockerfile) and
[frontend](../../../application/frontend/Dockerfile) use base-image tags pinned to
multi-platform index digests. Keep the two Node references aligned when updating
them. Weekly Docker [Dependabot checks](../../../.github/dependabot.yml) cover both
files; review digest updates to receive base-image fixes. Validate updates with
the application image builds, application checks and chart installation in CI.
See [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-input-pinning-and-restarted-baseline-2026-11-05)
for the decision and measurement constraints.

## Repository Static Linting

Pull requests limited to the root `README.md` and Markdown files under `docs/`
run repository lint, Actions CodeQL, action pinning and the user-documentation reference/freshness checks. Application builds,
application lint/tests, CI routing tests, Helm installation and image promotion are skipped for
that scope. All other PRs, main and release run full CI, including isolated browser validation of user guides. Documentation-only
commits within a mixed PR still run full CI.

The shared Node CI workflow enables Dependency Review and CodeQL for the CI routing
action (`javascript`), backend (`typescript`) and frontend (`typescript`) jobs.

The [PR workflow](../../../.github/workflows/pull-request-ci.yml) uses the
[local classification action](../../../.github/actions/determine-pr-checks/action.yml)
to check the full paginated PR file list against its triggering head/base
revisions. Both paths of a rename must qualify. Missing, stale or incomplete API data selects full CI;
failure to execute the scope job blocks the workflow. `Validate PR checks`
verifies the selected route and the exact results of every shared CI job,
rejecting failed, cancelled, missing or unexpectedly skipped checks. A successful
reusable workflow can contain skipped jobs; the final check rejects a skipped
backend check when the full route requires it. Configure required-check rules
against this stable result when enforcing PR CI. The workflow does not configure
those repository rules itself.

The classification policy and its Vitest suite live beside the local action.
Run `npm ci --ignore-scripts` and `npm run test:ci` from
`.github/actions/determine-pr-checks` to produce JUnit and LCOV reports. On full CI,
`Test CI routing` uses the shared Node workflow independently of application image
builds, and must succeed before image promotion. Dependabot maintains the action's
test dependencies; neither application image includes this package.

Repository lint publishes each validator's result in its job summary, PR comment
and uploaded native summary. Individual validator commit-status posts are disabled
through `MULTI_STATUS=false` in the shared workflow. Validator failures still fail
the lint job and the PR result check.

On the full CI route, the `build-backend-ci-image` and `build-frontend-ci-image` jobs compile, publish,
sign and attest the application CI images. The `check-backend` and
`check-frontend` jobs run lint and tests after their own image workflow completes.
The shared Node workflow prepares metadata on the host and omits its build job
when the build command is empty; Docker compilation remains the build gate. Biome emits
`biome-report.sarif`, and tests emit `junit.xml`
and `coverage/lcov.info`. The [shared workflow](../../../.github/workflows/__shared-ci.yml)
declares these paths and maps absolute container paths and relative test paths to
the owning application. Each declared report path must match a file; a missing
report fails the action. The bundled parser runs without installing its own
dependencies or changing the application's Node.js version. Keep report
producers, consumers and mappings aligned.

CI images and production candidates build independently. Each application's
lint and tests wait for its own CI image. Candidates use separate image-specific
caches; they do not import the current run's CI-image cache. On the full route, the shared Helm CI workflow installs both
candidates by digest, including for application-only changes. Its single job prepares the
umbrella archive and validates its checksum, chart-testing policies and rendering
with the packaged CI recovery values. Static validation must succeed before a
cluster is created. Installation verifies the same archive/checksum and uses an
isolated extraction with candidate image overrides. Prepare, Lint and Test manage
their required tools and reuse installed versions. Test does not check out source
or rebuild dependencies. The prepared archive is cleaned on success or failure.

The umbrella chart's `.helmignore` excludes generated backend/frontend archives
because their source directories already supply those dependencies. Keep these
rules aligned with local subcharts to avoid duplicate files in packaged charts.

The shared workflow returns `validated-images` only after successful validation
and cleanup. The promotion job requires repository lint, routing-policy tests, both
application checks and their reports, both candidate builds and Helm validation
to succeed before updating consumer tags. Release steps receive only promoted
metadata through `built-prod-images` and wait for the entire shared workflow.
See [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md)
for the workflow decisions and remaining rollout work.

For cache diagnosis, set the container workflow's `cache-type` input to the string
`"false"` on the affected image jobs. This bypasses layer imports/exports and
persisted mount snapshots without deleting existing cache entries. Run the full
validation pipeline, then restore the normal cache setting. Cached builds do not
guarantee fresh OS packages; keep base-image updates and dependency maintenance
separate from cache-hit measurements.

Image promotion requires candidates built and validated in the current workflow
run and attempt. After a failed or cancelled promotion, rerun the full workflow;
rerunning only promotion with previous-attempt outputs is rejected. Published
tags are updated individually, so an interrupted promotion can leave a partial
set of tags. The promotion journal prevents an older run from overwriting a newer
claim. Preserve that journal and use the full validation path for recovery.

Release chart publication consumes the artifact ID, archive name and checksum
from `Validate final release chart`. A publication-only retry can reuse that
validated artifact while it remains available; do not rebuild or mutate the archive
in the publication job. If the artifact is unavailable, validate a new archive
before publishing it.

`make lint` runs both application lint pipelines, then Super-linter with the configurations under `.github/linters/`.

Local lint commands use the shared CI workflow's Kubeconform exclusions for Helm templates, chart metadata, and bundled CRDs. Use `make test-chart` for chart lint and installation checks.

Checkov renders the umbrella chart using [the CI recovery values](../../../charts/application/ci/recovery-values.yaml), including the frontend and backend templates. Only the two local subchart `Chart.yaml` entrypoints are excluded from duplicate standalone discovery; their directories remain eligible for scanning. Keep the fixture complete when chart schemas add required values, and verify that security checks still detect missing release policies and unsafe service workloads.

Trivy loads package-specific, expiring exceptions from
[its ignore file](../../../.github/linters/.trivyignore.yaml). Keep each exception
limited to the verified advisory and package version.

The root and application Biome configurations use the installed CLI schema.

## Release Notes

The [release workflow](../../../.github/workflows/release.yml) generates a Gemini
summary followed by the complete changelog when it creates the draft release.
The model and provider are configured in its `changelog-summary` input.

After preparing and committing release metadata and image defaults,
`Validate final release chart` calls the shared Helm CI workflow to check out that
commit, package the final chart, and run static validation and installation tests.
Tests use its committed image digests,
packaged recovery values and cluster-specific operator/pull-secret overrides.
Validation has read-only registry permissions. `Publish validated release chart`
waits for validation and draft creation, then passes the immutable artifact ID,
archive basename and original checksum to `release-chart`. The action validates
these inputs, downloads only that artifact, verifies its digest and archive
checksum, publishes and signs the unchanged bytes, and cleans downloaded files
on success or failure. Test configuration belongs only to validation. The chart remains at
`ghcr.io/cloud-native-aixmarseille/pleey/charts/application/pleey`.

GitHub release publication waits for chart publication. Release runs are serialized
without automatic cancellation. If chart publication fails, rerun the failed job
to reuse the successful validation's archive. Deleted or expired artifacts fail
closed; after their seven-day retention, rerun the full workflow to validate again.

## Documentation Maintenance

The [main workflow](../../../.github/workflows/main-ci.yml) generates Helm docs
after successful CI when chart or generator inputs may have changed. The
`helm/generate-docs` action compares the triggering checkout with the latest
successful main push run, including
changes left pending by failed or cancelled runs. Only changes confined to
`application/`, `docs/`, `e2e/` and the root `README.md` can skip generation.
Charts, generated chart docs, shared scripts, workflow/action pins, root
configuration and unknown paths require generation.

Missing history, API/Git failures, incomplete comparisons, local changes, checkout
mismatches and uncertain ancestry keep generation enabled. Rerun main CI to force
regeneration. If chart-doc
templates or configuration begin consuming an excluded tree, update the
`skip-if-only-changed` input in the main workflow. Keep the action after required
checks on every default-branch push; independent filters would make its successful
workflow baseline unreliable.
Release documentation generation remains unconditional after release metadata
changes. Bot writes still wait for successful CI.

Development docs under `docs/technical/development/**` describe the current approved repository state only.

- Update the relevant development docs in the same change as any tooling, behavior, contract, workflow, or deployment change.
- Do not keep superseded, transitional, compatibility, rollout, or upgrade-only guidance in these reference pages.
- Put decision history in ADRs and put time-bounded operational procedures in dedicated runbooks instead of preserving them in long-lived reference docs.

## Application Guides

- [Backend development](./backend/index.md)
- [Frontend development](./frontend/index.md)

## Frontend Implementation Specs

Test frameworks: **Vitest** (backend + frontend), **Playwright** (end-to-end).

Keep the Playwright image tag in [`compose.yaml`](../../../compose.yaml) aligned
with the resolved `@playwright/test` version in
[`e2e/package-lock.json`](../../../e2e/package-lock.json). The container supplies
the browser binaries required by that exact Playwright version.

The end-to-end container uses the same host UID/GID as the application containers and a
temporary npm cache, so dependencies and test reports remain writable on the host.
If existing end-to-end artifacts were created as root, repair their ownership before
running dependency commands or tests:

```bash
docker compose run --rm --no-deps -T --user root e2e-tests \
  chown -R "$(id -u):$(id -g)" node_modules playwright-report test-results
```

Include only artifact directories that exist in `e2e/`.

## Test Writing Rules

- Follow Arrange-Act-Assert explicitly: keep setup, execution, and verification distinct, and do not resume acting after the assertion phase starts.
- Avoid testing the same behavior multiple times in one test. For async failures, prefer one assertion chain per execution instead of reusing the same promise for class and payload checks.
- Prefer shared fixtures and test doubles from `src/test-utils/` over inline helpers inside spec files.
- Keep fixture defaults broad and override only the fields that matter for the scenario.
- Use mocks, stubs, and spies only for collaborators or boundaries that need isolation; do not replace simple value objects or deterministic domain state with doubles.
- Keep unit specs colocated with the module they validate and name them after that module with a `.spec.ts` or `.spec.tsx` suffix. Keep the existing dedicated integration locations for `test/` and `*.int.spec.ts`.

Repository enforcement:

- Lint rejects `beforeEach` and `afterEach` inside spec files so Arrange stays local to each test.
- Lint rejects inline `create*Fixture` and `create*Mock` helper declarations inside spec files so reusable setup stays in shared test utilities.
- Lint rejects repeated async `expect(...).rejects` or `expect(...).resolves` chains on the same subject inside a single test.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) required:

```text
<type>[scope]: <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

```text
feat(quiz): add timer pause functionality
fix(auth): resolve JWT token expiration issue
refactor(game): simplify score calculation logic
```

## Coding Standards

- SOLID, ACID, DRY, KISS
- Prefer factorization when the same structure or decision repeats; remove redundant abstractions, branches, wrappers, and parameters instead of keeping parallel code paths
- Do not introduce deprecated APIs, config keys, or helper methods into new code; when typings, editor diagnostics, or official docs mark an API as deprecated, switch to the current supported replacement.
- Prefer the current documented API shape over compatibility aliases or chained helpers, even when older syntax still works.
- Descriptive names, no magic numbers, early returns
- All user-facing text via i18n translation keys (both `en` and `fr`)
- Error messages from domain error code enums, translated at transport layer
- No hardcoded strings in UI
- WCAG 2.1 AA compliance mandatory for UI changes

### Dead Code & Translations

- No dead code: every exported function, class, component, and public method must have consumers
- No orphan translations: every key must be used, every user-facing string must have a key
- Applies to both backend and frontend - enforce on every PR

### Naming

```typescript
const userName = "John"; // variables, functions: camelCase
class UserService {} // classes, components: PascalCase
const API_URL = "http://localhost"; // constants: UPPER_SNAKE_CASE
```

### Error Handling

Runtime application code must throw domain errors, not bare `Error`.

- Prefer a domain-specific error class such as `new GameNotFoundError({ gameId })`.
- When a dedicated class does not exist, use `createDomainError(definition, context)`.
- Always pass a non-empty, relevant `context` object with the best local identifiers or failure facts available, such as `projectId`, `userId`, `fileName`, or a short `reason`.
- Framework exceptions (`HttpException`, etc.) stay in presentation or framework-boundary code only.

Process-startup, config, and tooling code outside the runtime application layers may still use plain `Error` when no domain boundary exists.

### i18n

- Backend: `application/backend/src/i18n/`
- Frontend: `application/frontend/src/presentation/**/i18n/`, assembled by `application/frontend/src/i18n/translation-resource-composer.ts`
- Feature-specific keys stay in feature scope - no cross-feature key reads
- Use the straight ASCII apostrophe (`'`, U+0027) in translation values for every locale. Curly apostrophes (U+2018 and U+2019) are forbidden. Use suitable string delimiters or escaping to preserve the straight apostrophe; keep language accents intact.

### HTTP Requests

- No duplicate requests for the same data - colocate queries, use caching, deduplicate at the gateway/facade level

### Module exports and runtime services

- Import contracts from the module that defines them. Port modules define their own contracts and must not forward exports, including imported aliases or type-only exports.
- Backend domain and application service modules expose classes with instance methods. Inject those classes into runtime consumers and register them in the owning app module; do not export standalone service functions. Domain policy classes stay framework-independent.
- `check-module-exports.mjs` enforces these rules in both application lint pipelines; the existing DI guard enforces container-based consumption.

### Dependency Boundaries

Enforced by Biome `noRestrictedImports` in each app's `biome.json`. Violations fail CI. See [architecture](../architecture/) for the conceptual rules.

## Architecture Decision Records

Every architecture, technology, or design choice must start with an ADR before implementation starts.

- Create the ADR first under [docs/technical/architecture/adr/](../architecture/adr/index.md).
- Use the repository template at [docs/technical/architecture/adr/template.md](../architecture/adr/template.md).
- Name ADR files with a zero-padded sequence and kebab-case title, for example `0001-example-decision.md`.
- Start with `Status: Proposed`, then update the ADR as the decision is accepted, rejected, or superseded.
- Do not use free-form proposal docs for these decisions when an ADR is required.

## PR Process

1. Branch from `main`: `git checkout -b feat/my-feature`
2. For architecture, technology, or design changes, add or update the ADR first
3. Make changes, add tests, update translations
4. `make ci` (lint + test)
5. Commit with conventional commit message
6. Push and open PR
7. PRs blocked if translations or error enum mappings are missing
