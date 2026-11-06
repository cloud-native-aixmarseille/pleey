# Implementation plan: CI optimization (#475)

- Issue: [#475](https://github.com/cloud-native-aixmarseille/pleey/issues/475)
- Decision: [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md)
- Created: 2026-11-05
- Implementation status: P0 implemented and baseline collected; awaiting review; P1–P8 not started

Delivery: one phase per PR, with passing CI and user review before the next phase.

The ADR owns architecture, dated evidence, cache contracts and acceptance
requirements. This file owns execution and progress. Commands below are future
implementation/validation steps, not checks already run. Proposed helper files
and upstream interfaces do not exist yet.

Complete checkboxes with PR/run links and measured results. For experiments,
record "adopted", "rejected" or "deferred" with the reason. Keep independent
changes separately reviewable and reversible. Update generated documentation
through its existing generator.

## Execution order

| Package                              | Owner/location                              | Prerequisites                       | Completion evidence                                 |
| ------------------------------------ | ------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| P0: Baseline                         | Pleey / GitHub Actions                      | ADR agreement                       | Comparable inputs, timings and check inventory      |
| P1: Local reductions                 | Pleey                                       | P0                                  | Independent build/report, frontend and Helm results |
| P2: Shared tooling                   | Node/common/container upstream repositories | P0; parallel with P1                | Contract tests and reviewed pinned releases         |
| P3: Service lanes and required gate  | Pleey                                       | P0; current upstream API suffices   | Actual overlap and enforced aggregate result        |
| P4: Candidate DAG                    | Pleey + container tooling                   | P2.5 promotion contract and P3 gate | Tested digests promoted only after validation       |
| P5: Parallel operations within a job | Pleey / container tooling                   | Profiled independent operations     | Correct joins, cleanup and measured overlap         |
| P6: Frontend shards                  | Pleey + Node tooling                        | P1.5 tuning and updated DAG timings | Complete merged results and net benefit             |
| P7: Remaining experiments            | Relevant repository                         | Updated bottleneck measurements     | Adopt/reject/defer result per experiment            |
| P8: Acceptance and documentation     | All affected repositories                   | Selected work complete              | Before/after and correctness evidence               |

P1's workflow/build, frontend and Helm work can proceed independently, as can
P2's Node, common and container work. P3 need not wait for all upstream changes.
P4 must wait for the publication contract. P5 does not depend on P4. Start P6
only if tests still determine completion time after earlier optimizations.

## P0: Establish a reproducible baseline

**Inspect:** [.github/workflows](../../../.github/workflows), application
Dockerfiles/configurations and the upstream revisions pinned by those workflows.

- [x] Record agreement on ADR 0023 before implementation; keep additional design decisions in the ADR. Accepted for phased implementation on 2026-11-05.
- [x] Export classic branch protection and applicable rulesets: no effective `main` rule and a disabled default-branch ruleset on 2026-11-05. [Snapshot](../architecture/adr/evidence/0023-ci-baseline.json); actual emitted check names will also be retained in run evidence.
- [x] Inventory application lint/tests, repository lint, workflow/security checks, signatures/attestations, reporting and umbrella-chart installation, including their dependencies. See the [P0 protocol](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-baseline-protocol-2026-11-05).
- [x] Record source/action revisions, resolved base/tool images, locked test tools, emitted runner resources and test/coverage inventory. [P0 evidence](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-controlled-pr-evidence-2026-11-05) explicitly records unavailable worker/peak-memory/coverage-denominator telemetry for later collection.
- [x] Define equivalent warm, fully cold, lockfile-changing and source-only scenarios. The [P0 protocol](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-baseline-protocol-2026-11-05) separates PR/main and records later invalidation/release validation requirements.
- [x] Capture queue/dispatch and job/step intervals, cache transfer spans, test summaries and teardown for the P0 attempts. [Raw evidence](../architecture/adr/evidence/0023-ci-baseline.json) retains links and limitations of composite-step timing.
- [x] Calculate attempt elapsed, summed non-skipped job time and first failed-step timing, preserving intervals for critical-path analysis. Failed/cancelled and changed-input attempts are classified separately in the [P0 results](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-controlled-pr-evidence-2026-11-05); job-duration sum is not a bill.
- [x] Pin application Node and Nginx bases to verified multi-platform index digests after the user approved restarting the baseline. Preserve existing Dependabot coverage and document the explicit image-update policy in ADR 0023.
- [x] Collect five consecutive comparable runs after priming on the pinned revision, retaining cache misses per the [measurement correction](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p0-measurement-correction-2026-11-06). **5/5 passed:** median elapsed **15m 31s**, median summed job time **26m 58s**. [Results](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p0-baseline-2026-11-06); priming and unpinned series remain separate.

Read-only collection commands from the root, substituting an observed `RUN_ID`:

```sh
gh run list --repo cloud-native-aixmarseille/pleey --limit 20
gh run view RUN_ID --repo cloud-native-aixmarseille/pleey --json headSha,event,conclusion,createdAt,startedAt,updatedAt,jobs,url
gh api --paginate repos/cloud-native-aixmarseille/pleey/actions/runs/RUN_ID/jobs
gh api repos/cloud-native-aixmarseille/pleey/actions/runs/RUN_ID/attempts/ATTEMPT
gh api --paginate 'repos/cloud-native-aixmarseille/pleey/actions/runs/RUN_ID/attempts/ATTEMPT/jobs?per_page=100'
gh api repos/cloud-native-aixmarseille/pleey/actions/runs/RUN_ID/attempts/ATTEMPT/logs > /tmp/pleey-ci-run-logs.zip
gh api repos/cloud-native-aixmarseille/pleey/branches/main/protection
gh api 'repos/cloud-native-aixmarseille/pleey/rulesets?includes_parents=true'
gh api repos/cloud-native-aixmarseille/pleey/rules/branches/main
```

Replace `ATTEMPT` with the recorded attempt number when collecting reruns; the
unqualified jobs endpoint returns the latest attempt. Keep each downloaded archive
under a distinct local filename. Distinguish an unprotected branch from unavailable
access when interpreting 404s.
Use job timestamps and the latest job finish to separate execution from dispatch
and queueing. P0 is complete when another contributor can reproduce the comparison.

## P1: Deliver independent local reductions

### P1.1: Remove duplicate compilation

**Files:** [shared workflow](../../../.github/workflows/__shared-ci.yml),
[backend Dockerfile](../../../application/backend/Dockerfile) and
[frontend Dockerfile](../../../application/frontend/Dockerfile).

- [ ] Compare Dockerfile compilation and the Node build: source, generated Prisma/GraphQL inputs, environment/build arguments and compiler configuration. Confirm tests do not consume the second build's artifacts.
- [ ] Set the existing reusable-workflow `build` input to `""` for prebuilt-image callers, retaining lint/tests.
- [ ] Exercise both services and a deliberate compile failure in an isolated validation change. The image build must still reject that failure.
- [ ] Measure removed compilation separately from the remaining empty build-container job; P2.1 removes that overhead.

**Rollback:** restore the caller's build input if equivalence fails.

### P1.2: Use explicit reports and supported Biome output

**Files:** shared workflow and both application `package.json` files.

- [ ] Change `_lint:biome:ci` to emit `biome-report.sarif` with the supported SARIF reporter. Preserve `biome ci`, warning/error policy and every lint guard.
- [ ] Set existing `lint`/`test` JSON inputs with explicit `report-file` paths relative to `/usr/src/app`. Preserve container-to-source path mapping.
- [ ] Verify JUnit/LCOV outputs and annotations resolve to the correct service's source files.
- [ ] Inject lint/test failures separately in a disposable validation change. Confirm reporting runs, original failure statuses survive, and missing/malformed reports are not mistaken for successful validation.
- [ ] Compare discovery/startup/processing time; parser installation is separate P2.2 work.

Existing caller input shape, as a fragment of the reusable-workflow call:

```yaml
with:
  build: ""
  lint: '{"command":"lint:ci","report-file":"biome-report.sarif"}'
  test: '{"command":"test:ci","report-file":"junit.xml,coverage/lcov.info"}'
```

**Rollback:** revert reporter and paths together so producer and consumer agree.

### P1.3: Correct npm mounts and Docker context inputs

**Files:** both Dockerfiles and [.dockerignore](../../../.dockerignore).

- [ ] Reproduce the P0 recompilation on unchanged pinned inputs and identify the invalidation cause; compare cache imports, context inputs and exported records before selecting a fix.
- [ ] Inspect `npm config get cache` and effective UID/GID in the install stage. Verify `/home/node/.npm` before replacing `/root/.npm` and setting mount ownership.
- [ ] Keep npm authentication in BuildKit secrets outside cached content. Force an install-layer miss with a scoped lockfile change; confirm download reuse and successful `npm ci`.
- [ ] Repeat with both layer and mount caches bypassed. Cache absence must not change correctness.
- [ ] Review `git ls-files` and Dockerfile `COPY` instructions before excluding local dependencies, build output, reports, caches and credentials. Retain committed schema/codegen inputs and shared scripts.
- [ ] Build both targets from clean and locally built/tested checkouts. Verify local generated artifacts cannot replace declared image inputs.

**Measure:** invalidated-install time, download-cache use and context size. Context
filtering is input hygiene until timing demonstrates a gain. **Rollback:** revert
mount/ignore rules independently without weakening `npm ci`.

### P1.4: Avoid repeated greeting work

**File:** [greetings workflow](../../../.github/workflows/greetings.yml).

- [ ] Restrict the PR lifecycle trigger to `opened`, preserving issue-opened behavior and branch scope.
- [ ] Verify first-interaction semantics and that synchronize/reopen events avoid unnecessary runs. Use fixtures or controlled validation without posting test greetings on unrelated PRs.

**Measure:** avoided invocations, separately from shared CI elapsed time.
**Rollback:** restore event selection if intended behavior changes.

### P1.5: Reduce frontend environment and worker overhead

**Files:** [Vitest config](../../../application/frontend/vitest.config.js),
[shared setup](../../../application/frontend/test/setup.ts), selected tests under
`application/frontend/src` (including domains and application services), and a
minimal Node setup if needed.

- [ ] Export discovered files/test cases from unchanged CI configuration; save coverage inclusion/exclusion and denominator.
- [ ] Classify tests by imports and behavior, starting with plain value objects/services. Directory or `.ts` extension alone does not establish DOM independence.
- [ ] Add named `node`/`jsdom` projects with disjoint discovery rules whose union equals the original inventory.
- [ ] Move DOM `setupFiles` out of the root into the jsdom project. Inline projects inherit root configuration and concatenate setup arrays; `setupFiles: []` does not clear inherited setup. Add only required non-DOM setup to Node. See [Vitest projects](https://vitest.dev/guide/projects.html).
- [ ] Preserve aliases, plugins, globals, timeout, isolation, mocks and root coverage. Run each project and the complete CI command; compare tests and coverage.
- [ ] Record effective workers, available container CPUs, peak memory and slow files. Benchmark the existing 50% limit against explicit runner-sized limits, changing one variable at a time.
- [ ] Repeat promising configurations without changing isolation/retries; reject flakes, memory pressure or worse total job time.
- [ ] Record the result before evaluating shards. Update the [frontend testing guide](../development/frontend/tooling-and-testing.md) when implemented.

Future commands from `application/frontend` after dependencies are available:

```sh
npm exec -- vitest list --filesOnly --json=/tmp/pleey-frontend-files.json
npm exec -- vitest list --json=/tmp/pleey-frontend-tests.json
npm run test -- --project=node
npm run test -- --project=jsdom
npm run test:ci
npm run test:ci -- --maxWorkers=2
npm run lint:ci
```

Save baseline/candidate inventories under distinct filenames. Project commands
apply after creating those projects; two workers is an experiment, not the chosen
setting. **Rollback:** revert classification and worker limits separately.

### P1.6: Remove the chart database-startup race

**Files:** backend Dockerfile; proposed
`application/backend/scripts/wait-for-database.mjs`; backend chart
[deployment](../../../charts/application/charts/backend/templates/deployment.yaml),
[migration job](../../../charts/application/charts/backend/templates/migration-job.yaml),
helpers, values and schemas.

- [ ] Reproduce healthy fresh installation; time secret availability, database readiness, migration attempts and total install separately.
- [ ] Add a small readiness command to the production image, reusing direct production dependencies `@prisma/client`/`@prisma/adapter-pg`. Verify imports/generated client in the pruned image first.
- [ ] Query authenticated `SELECT 1` using the existing secret-file URI without bootstrapping Nest. Preserve external-database/TLS parameters; `pg_isready` alone does not prove authentication.
- [ ] Bound missing-secret waiting and connection/query attempts with one deadline. Use one connection, bounded attempts, disconnect and signal cleanup. Log sanitized error codes and timing, never credentials/URLs.
- [ ] Pass secret path and timing controls as arguments, respecting the environment-access boundary. Select deadlines from cold-start measurements; validate/document any exposed chart values.
- [ ] Use `pleey.backend.image` for both init containers, matching the workload digest. Replace BusyBox defaults/helpers coherently; preserve enable toggle, resources, security context and secret mounts.
- [ ] Add focused Vitest tests for late secret, transient failure, invalid credentials, deadline, redaction and cleanup, plus a pruned-image smoke check.
- [ ] Exercise fresh CNPG, external URI/secret, unreachable DB, invalid credentials, slow query, disabled waiting and migration failure after readiness. Preserve migration command/retry policy and useful diagnostics.
- [ ] Run `make test-chart` from the root with its documented prerequisites. Keep the global Helm timeout unchanged; healthy fresh installs must stop relying on failed migration pods.

The existing target builds images, creates fresh kind, runs umbrella lint/install
and cleans up. Use its isolated test context. **Rollback:** revert command, image
copy and chart integration together; do not mask migration errors.

## P2: Improve shared upstream tooling

Work in the owning repositories, preserving supported callers and their existing
validation/documentation-generation workflows. Adopt reviewed releases by SHA
independently; unavailable upstream work does not block P1 or P3.

### P2.1: Lightweight Node preparation and optional build

**Repository:** `hoverkraft-tech/ci-github-nodejs`.
**Files:** `.github/workflows/continuous-integration.yml`,
`actions/{build,lint,test}/action.yml` and
`.github/workflows/__test-workflow-continuous-integration.yml`.

- [ ] Move pure command/environment/artifact/path normalization from container `setup` to lightweight `prepare`, preserving supported input forms/defaults.
- [ ] Resolve paths lexically in preparation; retain existence/access/workspace-boundary validation in actual application jobs. Host preparation cannot inspect container `/usr/src/app`.
- [ ] Switch consumers to preparation outputs, then remove the metadata-only container job.
- [ ] Make build conditional on normalized nonempty commands, preserving `build: ""`. Schedule tests after successful preparation and either intentionally omitted build or successful requested build.
- [ ] Preserve build-artifact transfer for callers that use it. Validate default/empty/malformed build, missing directory, preparation/build/lint/test failures, optional checks and container/noncontainer callers.
- [ ] Compare prepare-to-first-check latency and summed job time, then adopt the release independently.

**Rollback:** restore the pin on scheduling or artifact-transfer regression.

### P2.2: Bundle the report parser once

**Repository:** `hoverkraft-tech/ci-github-common`.
**Files:** `actions/parse-ci-reports/action.yml`, its package/lockfile and `src/**`,
parser tests and `.github/workflows/__test-action-parse-ci-reports.yml`.

- [ ] Add a reproducible distribution build using upstream conventions, including runtime dependencies/license material; do not assume an existing bundler.
- [ ] Execute the bundle without action-time dependency installation. Remove setup/`NODE_PATH` only after supported runner/container execution succeeds.
- [ ] Preserve inputs/outputs, formats, path mapping and annotations. Verify distribution matches source in upstream CI.
- [ ] Validate supported fixtures, missing/malformed files, rewritten paths and error outputs without parser `node_modules`; preserve original lint/test failure when reporting succeeds.
- [ ] Measure startup, processing and download cost. Release upstream, update the consuming Node action pin where necessary, then adopt that release in Pleey.

**Rollback:** restore parser/consumer pins if compatibility regresses.

### P2.3: Remove redundant publication/security setup

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** `.github/workflows/docker-build-images.yml` and
`actions/docker/{build-image,create-images-manifests,sign-images,attest-image}/action.yml`.

- [ ] Validate a complete single-platform result and reuse its existing build digest. Manifest creation already skips this case; remove redundant Docker/Buildx setup and tag inspection.
- [ ] Preserve the `built-images` output shape, tags, registry/repository metadata and ordering expected by callers.
- [ ] Initialize Buildx where manifest assembly is required; validate multi-platform and mixed batches.
- [ ] Remove daemon/Buildx setup used only for security metadata while preserving registry authentication, cosign, subjects, provenance and narrow permissions. Do not move signing privileges into untrusted builds.
- [ ] Use upstream platform/signing/attestation integration workflows to verify digest equality, manifest contents, signatures, attestation subjects and authentication failures.
- [ ] Measure publication/security setup and adopt separately from cache changes.

**Rollback:** restore the pin on digest/output/security regression.

### P2.4: Improve cache reuse and invalidation

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** container workflow, `actions/docker/build-image/action.yml`,
`actions/docker/build-image/internal/action.yml` and caching integration workflow.

- [ ] Expose validated additional import/export-mode controls through all layers, retaining defaults, bypass and read-only-trigger behavior.
- [ ] Let production import its own cache plus its service's CI cache. Preserve separate versioned exporter scopes and permitted branch access.
- [ ] Retain Dockerfile fingerprinting and add lockfile/toolchain fingerprinting to mount keys. Preserve application/target/platform/toolchain identity in restore prefixes; fix fallbacks that discard it.
- [ ] Ensure dependency changes permit a refreshed download snapshot rather than an obsolete immutable exact hit; keep extraction before builder teardown.
- [ ] Test exact/partial hits, changed dependency/toolchain/Dockerfile, cold/bypass, read-only triggers and failed builds. Confirm `npm ci` runs when its layer is invalidated.
- [ ] Compare production `min`/`max` using total import/build/export time, sizes, hits and eviction. Keep CI's full reusable graph and adopt only beneficial combinations.
- [ ] Document scopes, writer boundaries, freshness and targeted recovery. Do not broadly cache installed dependencies, generated outputs or validation decisions.

**Rollback:** disable new controls independently; cache absence remains supported.
Registry caching is a conditional P7 experiment.

### P2.5: Candidate publication and exact-digest promotion

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** metadata/build/publication actions and a proposed promotion entrypoint
whose name/interface will be chosen upstream.

- [ ] Reuse existing `images[].tag` for run/attempt-scoped candidate tags; verify normal/latest tags are suppressed. A new forced-tag input is unnecessary.
- [ ] Separate temporary tags from intended destinations and final OCI version/release metadata; check the current forced-tag metadata derivation.
- [ ] Return digest, source/build identity, destination plan and verification evidence in a documented contract.
- [ ] Promote the tested digest without rebuilding/changing manifest bytes, retaining signatures/provenance.
- [ ] Require a successful gate; reject missing/different digests, stale run/attempt evidence, incomplete destinations and unauthorized repositories.
- [ ] Define reruns, cancellation, superseded runs, idempotency and partial-tag failures. Prevent an older run replacing a newer validated destination.
- [ ] Define candidate cleanup without deleting promoted content or another run's evidence.
- [ ] Validate PR/main/release metadata and publication/security failures before adopting the interface.

**Rollback:** retain/restore gated production ordering. Do not enable speculative
builds merely by removing `needs` before this contract is validated.

## P3: Parallelize service jobs and introduce the required gate

**Files:** shared workflow and [PR](../../../.github/workflows/pull-request-ci.yml),
[main](../../../.github/workflows/main-ci.yml),
[release](../../../.github/workflows/release.yml) callers; repository rules/settings.
The existing one-image-list API supports this stage.

- [ ] Create explicit backend/frontend CI-image caller jobs, preserving inputs, authentication, security results and digest-qualified output use.
- [ ] Give each service's Node call only its own image dependency. Keep repository lint and independent checks concurrent.
- [ ] Confirm one service starts checks before the other image call finishes; compare overlap against duplicated setup/publication cost.
- [ ] Add stable `ci-result` after all expected validation branches, including current production/chart results. Retain existing production ordering during P3.
- [ ] Schedule aggregation even when dependencies fail/skip, then explicitly require every expected result to be `success`. Completion alone is insufficient.
- [ ] Test failure, cancellation, missing/unexpected skip and successful reporting after failed tests; none may pass the gate.
- [ ] Read the emitted check name from a trial run. If enforcement is absent, enable the verified rule; otherwise require the aggregate alongside existing checks first.
- [ ] Verify enforcement on a test PR, then retire obsolete required-check entries before deleting/renaming their jobs. Preserve unrelated semantic/security requirements.

**Rollback:** restore dependencies and corresponding enforced check names together;
never leave an absent job as the only required check.

## P4: Overlap candidates and Helm with application checks

**Prerequisites:** P2.5 and P3. **Files:** shared workflow, release caller and adopted
promotion interface. Follow the [ADR DAG](../architecture/adr/0023-optimize-ci-execution-and-caching.md#execution-graph-and-publication-gates).

- [ ] Start each production candidate after its CI image alongside its lint/tests, importing the permitted completed CI cache.
- [ ] Supply candidate identity and planned final metadata; verify consumer tags stay unchanged while validation is pending.
- [ ] Start Helm once both candidates/security results are ready, passing immutable digests through existing image values.
- [ ] Join repository/application checks, required reports, chart results and candidate/security results in the gate. Place promotion after it without a dependency cycle.
- [ ] Compare build, security-subject, chart-tested and promoted digests explicitly.
- [ ] Preserve `built-prod-images` for release consumers, sourcing it from successful promotion; preserve planned release tags/metadata.
- [ ] Validate rendered release charts again after release-file mutations; application evidence does not validate different chart content.
- [ ] Exercise lint/test/chart/security failures, skips, cancellation, superseded runs and reruns. Verify no unchecked promotion and correct cleanup.
- [ ] Benchmark separately from P3, including speculative work wasted on unsuccessful runs.

**Rollback:** restore gated production/Helm ordering and output mapping, retaining
independently proven setup/cache improvements.

## P5: Parallelize suitable operations within one job

### P5.1: Choose the concurrency mechanism

At workflow level, prefer native `parallel` for an independent group, or
`background` with explicit `wait` for staged dependencies. Both `run` and `uses`
are supported. Composite internals need a different implementation. See
[GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsparallel).

- [ ] Verify target runner/parser and workflow-linter support. Limit the trial to two operations and measure shared CPU/memory pressure.
- [ ] List inputs, writes and consumers; finish checkout/tool installation/generation first and serialize shared writers.
- [ ] Join before consuming outputs or dependent work; keep failures fatal and validate each operation failing, timeout, cancellation and cleanup.

Workflow-level illustration after profiling and dependency preparation:

```yaml
steps:
  - parallel:
      - name: Typecheck
        working-directory: application/frontend
        run: npm run _lint:typecheck
      - name: Check module exports
        working-directory: application/frontend
        run: node ./scripts/check-module-exports.mjs
```

This fragment does not replace the full lint pipeline. The existing Node workflow
runs one package script; exposing individual native steps needs an upstream API.

### P5.2: Overlap Helm preparation and kind creation

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** `actions/helm/{test-chart,prepare-chart}/action.yml`, shared helpers and
existing Helm integration workflow.

- [ ] Time both phases after tool installation and verify disjoint writes to chart paths, kubeconfig and tool configuration.
- [ ] Compare native workflow orchestration over exposed upstream phases with two supervised CLI children inside the current composite; choose the smaller maintainable improvement.
- [ ] For native orchestration, reuse prepare-chart and kind actions plus a shared staged interface for remaining work. Do not invoke the complete test-chart action afterwards and duplicate setup.
- [ ] For the composite option, install kind with supported `install_only`, then run kind creation and shared preparation concurrently. Preserve cluster/context/wait settings and post cleanup; do not copy action logic into Pleey.
- [ ] Require dependencies before lint, cluster readiness before registry secrets, and both before installation. Preserve lint-only/install-only modes and umbrella checks.
- [ ] Retain separate logs/statuses; supervise every CLI child and terminate children/partial clusters on failure or cancellation.
- [ ] Test download/dependency/kind failure, timeout, cancellation, lint/install failure and cleanup.
- [ ] Compare the complete job including teardown; retain only net gains. Update metadata and regenerate upstream docs.

**Rollback:** restore sequential phases. The dependency-preparation duration bounds
potential overlap; this does not eliminate all kind startup time.

### P5.3: Trial one bounded application-lint pair

**Files:** application scripts/helpers, and upstream Node workflow only if needed.

- [ ] Profile checks first; consider existing `scripts/shared/ts-analysis-harness.mjs` for repeated parsing before adding processes.
- [ ] Trial one verified read-only pair with independent inputs, preserving guards and generation order; serialize installs/formatters/writers.
- [ ] Use native steps with an appropriate interface, otherwise supervised CLI work. Preserve individual diagnostics and every failure status.
- [ ] Compare duration/memory; reject contention, increased cost or worse diagnostics.

**Rollback:** restore sequential scripts while keeping all checks.

## P6: Evaluate two frontend test shards

**Prerequisite:** P1.5 complete and frontend tests still critical. Keep backend
unsharded. **Files:** upstream Node workflow/test action, frontend scripts/config
and aggregate gate.

- [ ] Add explicit arguments/shard support upstream; current `test.command` is a package-script name, not arbitrary shell text.
- [ ] Matrix only the test job: two shards, `max-parallel: 2`, `fail-fast: false`, failures fatal. Keep one preparation/lint/build path.
- [ ] Execute both projects across shards with identical source/image/Vitest/config and produce blob/coverage payloads.
- [ ] Upload payloads even after test failure, including required hidden paths. Distinguish run/attempt/project/shard and prevent stale downloads/overwrites.
- [ ] Merge once after checking the complete set; emit existing JUnit/LCOV paths, apply any configured thresholds and publish once.
- [ ] Gate on every shard and merge/report status. Test failed shard with successful merge, missing artifact, cancellation and previous-attempt data.
- [ ] Compare inventories, coverage denominator, elapsed/startup/merge time, summed job time and memory against optimized unsharded execution.
- [ ] Record adoption/rejection before considering more shards.

Vitest's command shape is `vitest run --shard=1/2 --reporter=blob --coverage`,
then `vitest --merge-reports --reporter=junit --coverage`. Adapt output/coverage
options to preserve the existing report paths and verify payloads with the installed
version. See [Vitest sharding](https://vitest.dev/guide/improving-performance.html#sharding).

**Rollback:** restore one test job while retaining proven environment/worker tuning.

## P7: Evaluate remaining opportunities

Select these from the updated profile. Implementing every candidate is not an
acceptance requirement; record adoption, rejection or explicit deferral.

### P7.1: Repository lint image and validators

**Owners:** `hoverkraft-tech/docker-base-images`, `ci-github-common` and Pleey's
root Dockerfile/linter configuration.

- [ ] Profile layers/pulls and enabled validators; inventory actual tools. The current image is already slim and validators already overlap.
- [ ] Trial maintained smaller profiles or splitting only when smaller pulls outweigh extra jobs/setup. Preserve scanners, rendered-chart coverage and vulnerability-data freshness.
- [ ] Compare elapsed/summed time; restore the existing profile if no net benefit. Do not remove checks to meet targets.

### P7.2: Helm tools and external dependency downloads

**Owners:** container tooling/docker-base-images and Pleey chart manifests/locks.

- [ ] Compare existing `ci-helm` with runtime installation, including pull cost, tool compatibility, host Docker access and cleanup.
- [ ] Cache external downloads by tool/repository/dependency identity; rebuild local `file://` subcharts from current source.
- [ ] Test cold cache, external lock and local template/value changes. Move static lint earlier only with reusable prepared inputs and a measured net gain; retain full installation.

**Rollback:** restore current setup/downloads; misses must always succeed.

### P7.3: Conservative PR routing

**Files:** shared/PR workflows, proposed classifier and aggregate gate.

- [ ] Map dependencies including shared scripts, backend schema/frontend codegen, workflow/action config, Dockerfiles and charts. Unknown changes/classifier errors choose the full pipeline.
- [ ] Route at job level using an explicit expected-check manifest validated by `ci-result`; permit only planned skips. Keep main/release full and required aggregation always present.
- [ ] Compare docs/service/shared/schema/chart/workflow/rename/unknown changes with full-run outcomes before adopting skips.

**Rollback:** select all branches; avoid top-level filters leaving checks pending.

### P7.4: Cleanup and generated Helm docs

**Owners:** main workflow, upstream cleanup and chart-doc generator inputs.

- [ ] Measure four existing parallel cleanup jobs; trial supported batching upstream with unchanged retention/repository boundaries.
- [ ] Make documentation generation depend on chart/generator inputs; prepare independently where safe, gate bot writes on successful CI.
- [ ] Verify no-change, concurrency and rerun behavior; compare avoided work and regenerate from source rather than editing output.

**Rollback:** restore current topology/invocation without changing retention.

### P7.5: Runner sizing and one-builder CI/production work

**Owners:** Pleey runner selection and container workflow.

- [ ] Trial larger runners only for measured CPU/memory limits; compare elapsed/queue time, memory and compute cost.
- [ ] Trial same-builder targets, including Buildx Bake where suitable; measure whether saved installs/exports delay CI-image availability and test start.
- [ ] Compare the complete DAG with separate candidates, preserving digest/security contracts. Restore runner/topology independently if acceptance fails.

### P7.6: Registry-backed cache

**Owners:** container tooling and registry administration.

- [ ] Require evidence that GHA export/eviction still dominates after P2.4.
- [ ] Define trusted/PR writer scopes, retention/quota and targeted bypass. Include authentication, transfer, storage and cleanup costs.
- [ ] Exercise cache absence, denied writes, changed inputs and retention cleanup before adoption; restore GHA/bypass on regression.

### P7.7: Trusted main-image reuse for releases

**Files:** release workflow and promotion contract.

- [ ] Match source/build identity, resolved base/toolchain, freshness and final metadata to a trusted validated main digest; otherwise rebuild. Source SHA alone is insufficient.
- [ ] Preserve signatures/provenance and validate charts after release-file mutations.
- [ ] Exercise matching/mismatching inputs and metadata through representative nonpublishing validation; compare saved work without publishing solely to benchmark.

**Rollback:** use the existing release rebuild path.

## P8: Complete acceptance and documentation

- [ ] Compare at least five consecutive post-priming samples before/after each retained candidate; retain cache misses, report median/range/run links and investigate overlapping timing distributions.
- [ ] Meet the combined target: at least 10% lower median elapsed time on targeted workflows without increased median summed successful-job time. Individual small changes need not each save 10%.
- [ ] Report failed/cancelled-run waste and runner-class compute cost separately.
- [ ] Complete the correctness matrix below, linking evidence and identifying untested cases explicitly.
- [ ] Revert regressions/flakes and record rejected experiments while retaining independently proven changes.
- [ ] Update [current development guidance](../development/index.md) with implemented DAG, inputs, cache scopes, routing and recovery. Regenerate upstream/Helm documentation through existing tooling.
- [ ] Link implementation PRs and dated measurements from the ADR; update decision/plan status and prepare issue completion evidence.

| Scenario                    | Required evidence                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Warm execution              | Same intended inputs/checks, known cache state and full timing breakdown                                  |
| Cold execution              | Both layer and mount caches bypassed; declared-input build/test/install succeed                           |
| Dependency/toolchain change | Lockfile, Dockerfile and resolved base/toolchain changes invalidate intended work                         |
| Application input change    | Source, Prisma/schema/config, GraphQL/codegen, shared scripts and build configuration reach consumers     |
| Chart change                | Current local templates/values repackaged; external dependencies follow declared identity                 |
| Test execution change       | Same inventory, isolation and coverage denominator; complete shards if enabled                            |
| Validation failure          | Lint/test/chart/security/report failures block the gate and promotion                                     |
| Skip/cancel/rerun           | Unexpected skips fail; no stale evidence, orphaned children/clusters or unchecked promotion               |
| Publication                 | Digest identity through build, security, chart and promotion; correct release metadata/rendered chart     |
| Database startup/failure    | Healthy cold initialization avoids failed-migration retries; genuine failures are bounded and diagnosable |
| Cache trust/recovery        | PR/trusted writer boundaries hold; missing/bypassed caches remain correct                                 |
| Release                     | Representative supported path verified without publishing solely for measurement                          |

Close the plan when selected optimizations meet these requirements and remaining
experiments have explicit adopted, rejected or deferred dispositions.
