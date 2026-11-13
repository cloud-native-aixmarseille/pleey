# Implementation plan: ADR 0023 - Optimize CI execution and caching

- Issue: [#475](https://github.com/cloud-native-aixmarseille/pleey/issues/475)
- Decision: [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md)
- Created: 2026-11-05
- Implementation status: P0 reviewed and merged in [PR #552](https://github.com/cloud-native-aixmarseille/pleey/pull/552); P1 and released P2.1–P2.4 adoption reviewed in [PR #553](https://github.com/cloud-native-aixmarseille/pleey/pull/553); P3 implementation reviewed with passing final CI and report/digest checks, controlled performance comparison pending; P2.5 candidate publication and gated promotion reviewed and released in 0.43.0; P4 released consumer adoption validated and reviewed in #553, rollout and performance acceptance pending; P5 deferral reviewed; P7 Helm secret prerequisite in progress in #553; P6 and remaining P7/P8 work pending

Delivery: passing CI and user review between phases. At the user's request, continue Pleey implementation in existing PR #553, including P3 and subsequent Pleey phases while that PR remains open. Upstream phases are reviewed in their own PRs before adoption.

The ADR owns architecture, dated evidence, cache contracts and acceptance
requirements. This file owns execution and progress. Unchecked items describe planned work. Completed items link the implementation
and its verification; proposed upstream interfaces remain future work.

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
| P3: Service lanes                    | Pleey                                       | P0; current upstream API suffices   | Actual overlap and measured setup cost              |
| P4: Candidate DAG                    | Pleey + container tooling                   | P2.5, P3 and promotion gate         | Tested digests promoted only after validation       |
| P5: Parallel operations within a job | Pleey / container tooling                   | Profiled independent operations     | Correct joins, cleanup and measured overlap         |
| P6: Frontend shards                  | Pleey + Node tooling                        | P1.5 tuning and updated DAG timings | Complete merged results and net benefit             |
| P7: Remaining experiments            | Relevant repository                         | Updated bottleneck measurements     | Adopt/reject/defer result per experiment            |
| P8: Acceptance and documentation     | All affected repositories                   | Selected work complete              | Before/after and correctness evidence               |

P1's workflow/build, frontend and Helm work can proceed independently, as can
P2's Node, common and container work. P3 need not wait for all upstream changes.
P4 must wait for the publication contract and its validation gate. P5 does not depend on P4. Start P6
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

Implementation: [PR #553](https://github.com/cloud-native-aixmarseille/pleey/pull/553).
[Local validation evidence](../architecture/adr/evidence/0023-p1-local-validation.json)
records fault checks, cache probes, test inventories, memory and cold-install timing.
**5/5 measured CI runs passed:** median elapsed **14m08s (−8.92%)** and summed
job time **24m49s (−7.97%)**. See the [completed comparison](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p1-comparison-2026-11-06).
The combined 10% target remains for later phases. Experimental dispositions are recorded in the
[dated P1 ADR entry](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p1-implementation-candidate-2026-11-06).

### P1.1: Remove duplicate compilation

**Files:** [shared workflow](../../../.github/workflows/__shared-ci.yml),
[backend Dockerfile](../../../application/backend/Dockerfile) and
[frontend Dockerfile](../../../application/frontend/Dockerfile).

- [x] Compare Dockerfile compilation and the Node build: source, generated Prisma/GraphQL inputs, environment/build arguments and compiler configuration. Confirm tests do not consume the second build's artifacts.
- [x] Set the existing reusable-workflow `build` input to `""` for prebuilt-image callers, retaining lint/tests.
- [x] Exercise both services and a deliberate compile failure in an isolated validation change. The image build must still reject that failure.
- [x] Measure removed build action steps: median summed duration 11s → 0s. Empty build jobs still consume a median 64s in total; P2.1 removes that overhead.

**Rollback:** restore the caller's build input if equivalence fails.

### P1.2: Use explicit reports and supported Biome output

**Files:** shared workflow and both application `package.json` files.

- [x] Change `_lint:biome:ci` to emit `biome-report.sarif` with the supported SARIF reporter. Preserve `biome ci`, warning/error policy and every lint guard.
- [x] Set existing `lint`/`test` JSON inputs with explicit `report-file` paths relative to `/usr/src/app`. Preserve container-to-source path mapping.
- [x] Verify JUnit/LCOV outputs and annotations resolve to the correct service's source files.
- [x] Inject lint/test failures separately: nonzero producer exits and failure reports were retained. Direct parser calls reject missing/malformed files; action-level zero-match discovery only warns. Strict missing-report enforcement is explicitly deferred to P2.2.
- [x] Compare report discovery/parsing: median summed duration across four jobs 28.584s → 1.309s. Parser installation remains separate P2.2 work.

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

- [x] Investigate P0 recompilation: imports and unchanged source/base inputs are recorded, but logs do not expose the differing cache-record inputs. The cause remains unresolved; defer upstream tracing to P2.4. Do not attribute layer misses to the npm mount correction.
- [x] Inspect `npm config get cache` and effective UID/GID in the install stage. Verify `/home/node/.npm` before replacing `/root/.npm` and setting mount ownership.
- [x] Keep npm authentication in BuildKit secrets. A scoped package/lockfile root-version change forced `npm ci`; retained mounts served 475 frontend and 884 backend cache-hit events with no download misses. The dependency graph was unchanged. The first full backend repeat downloaded again; that result remains in the evidence.
- [x] Repeat with both layer and mount caches bypassed. Cache absence must not change correctness.
- [x] Review `git ls-files` and Dockerfile `COPY` instructions before excluding local dependencies, build output, reports, caches and credentials. Retain committed schema/codegen inputs and shared scripts.
- [x] Build both services from clean archived inputs and locally built/tested checkouts. Context probes exclude 20 synthetic artifacts/credential files and retain all 1,857 tracked application/shared-script inputs, including schema and the committed environment example.

**Measure:** invalidated-install time, download-cache use and context size. Context
filtering is input hygiene until timing demonstrates a gain. **Rollback:** revert
mount/ignore rules independently without weakening `npm ci`.

### P1.4: Avoid repeated greeting work

**File:** [greetings workflow](../../../.github/workflows/greetings.yml).

- [x] Restrict the PR lifecycle trigger to `opened`, preserving issue-opened behavior and branch scope.
- [x] Verify first-interaction semantics and that synchronize/reopen events avoid unnecessary runs. Use fixtures or controlled validation without posting test greetings on unrelated PRs.

**Measure:** avoided invocations, separately from shared CI elapsed time.
**Rollback:** restore event selection if intended behavior changes.

### P1.5: Reduce frontend environment and worker overhead

**Files:** [Vitest config](../../../application/frontend/vitest.config.js),
[shared setup](../../../application/frontend/test/setup.ts), selected tests under
`application/frontend/src` (including domains and application services), and a
minimal Node setup if needed.

- [x] Export discovered files/test cases from unchanged CI configuration; save coverage inclusion/exclusion and denominator.
- [x] Classify tests by imports and behavior, starting with plain value objects/services. Directory or `.ts` extension alone does not establish DOM independence.
- [x] Trial named `node`/`jsdom` projects with disjoint discovery rules; their union matched the original inventory. **Rejected:** the split added no benefit over four workers with the original jsdom setup.
- [x] Keep DOM setup out of the Node trial and preserve project inheritance semantics. The trial setup was removed with the rejected split; the original setup remains.
- [x] Preserve aliases, plugins, globals, timeout, isolation, mocks and coverage rules. Trial project runs and full-suite runs passed; all 228 files, 1,178 expanded cases and coverage denominators match.
- [x] Compare the existing 50% limit with four workers on four CPUs. Three worker-only runs passed at 165.53s–186.96s; three subsequent warm-cache two-worker controls passed at 245.88s–247.57s. A separate four-CPU container passed with 2,134,478,848 bytes aggregate peak memory. Local timings remain exploratory; the CI series measures the combined phase.
- [x] Repeat promising configurations without changing isolation/retries; reject flakes, memory pressure or worse total job time.
- [x] Record the result before shards: use `maxWorkers: '100%'` to adapt to available CPUs, preserving four workers on four-CPU hosts. The initial fixed-worker Actions job median is 270s versus 267s, so an isolated Actions worker gain is unproven. The [frontend testing guide](../development/frontend/tooling-and-testing.md) reflects the retained configuration; reassess in P6.
- [x] Verify CPU-relative sizing at 1, 2, 4, 8 and 12 CPUs and native CLI overrides; record review validation in [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p1-review-cpu-relative-frontend-workers-2026-11-06).

Inventory and validation commands from `application/frontend`:

```sh
npm exec -- vitest list --filesOnly --json=/tmp/pleey-frontend-files.json
npm exec -- vitest list --json=/tmp/pleey-frontend-tests.json
npm run test:ci
npm run test:ci -- --maxWorkers=50%
npm run lint:ci
```

Save baseline/candidate inventories under distinct filenames. The 50% limit is the
control setting; 100% is the retained candidate. **Rollback:** restore the previous
50% worker limit.

### P1.6: Remove the chart database-startup race

**Files:** backend Dockerfile; proposed
`application/backend/scripts/wait-for-database.mjs`; backend chart
[deployment](../../../charts/application/charts/backend/templates/deployment.yaml),
[migration job](../../../charts/application/charts/backend/templates/migration-job.yaml),
helpers, values and schemas.

- [x] Reproduce healthy fresh installation; time secret availability, database readiness, migration attempts and total install separately.
- [x] Add a small readiness command to the production image, reusing direct production dependencies `@prisma/client`/`@prisma/adapter-pg`. Verify imports/generated client in the pruned image first.
- [x] Query authenticated `SELECT 1` using the existing secret-file URI without bootstrapping Nest. Preserve external-database/TLS parameters; `pg_isready` alone does not prove authentication.
- [x] Bound missing-secret waiting and connection/query attempts with one deadline. Use one connection, bounded attempts, disconnect and signal cleanup. Log sanitized error codes and timing, never credentials/URLs.
- [x] Pass secret path and timing controls as arguments, respecting the environment-access boundary. The cold install reached authenticated readiness at 78–90 seconds, within the 180-second default. Validate and document the timeout schema.
- [x] Use `pleey.backend.image` for both init containers, matching the workload digest. Replace BusyBox defaults/helpers coherently; preserve enablement, resource overrides, security context and secret mounts. Raise the default memory limit to 128 MiB after the 64 MiB cold-install OOM.
- [x] Add focused Vitest tests for late secret, transient failure, invalid credentials, deadline, redaction and cleanup, plus a pruned-image smoke check.
- [x] Exercise fresh CNPG, external URI/secret, unreachable DB, invalid credentials, slow query, disabled waiting and migration failure after readiness. Preserve migration command/retry policy and useful diagnostics.
- [x] Run `make test-chart` with isolated kind and kubeconfig: passed with one successful migration pod, zero failed migration pods and no init restarts. The global Helm timeout is unchanged.

The existing target builds images, creates fresh kind, runs umbrella lint/install
and cleans up. Use its isolated test context. **Rollback:** revert command, image
copy and chart integration together; do not mask migration errors.

## P2: Improve shared upstream tooling

Work in the owning repositories, preserving supported callers and their existing
validation/documentation-generation workflows. Adopt reviewed releases by SHA
independently; unavailable upstream work does not block P1 or P3.

### P2.1: Lightweight Node preparation and optional build

**Repository:** `hoverkraft-tech/ci-github-nodejs`.
Upstream [PR #571](https://github.com/hoverkraft-tech/ci-github-nodejs/pull/571) is merged; [its ADR](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/fbd3522b68c55a6314aadbededaa487825ba9b35/docs/adr/0002-lightweight-ci-preparation.md) records contract tests and controlled measurements. Pleey adoption and measurements are tracked below.
**Files:** `.github/workflows/continuous-integration.yml`,
`actions/{build,lint,test}/action.yml` and
`.github/workflows/__test-workflow-continuous-integration.yml`.

- [x] Move pure command/environment/artifact/path normalization from container `setup` to lightweight `prepare`, preserving supported input forms/defaults.
- [x] Resolve paths lexically in preparation; retain existence/access/workspace-boundary validation in actual application jobs. Host preparation cannot inspect container `/usr/src/app`.
- [x] Switch consumers to preparation outputs, then remove the metadata-only container job.
- [x] Make build conditional on normalized nonempty commands, preserving `build: ""`. Schedule tests after successful preparation and either intentionally omitted build or successful requested build.
- [x] Preserve build-artifact transfer for callers that use it. Validate default/empty/malformed build, missing directory, preparation/build/lint/test failures, optional checks and container/noncontainer callers.
- [x] Adopt the released Node workflow and compare preparation latency and summed job time in the combined tooling adoption. The [five-pair results](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p2-adoption-comparison-2026-11-11) separate preparation overhead from whole-workflow timing; this is not an isolated Node-only experiment.

**Rollback:** restore the pin on scheduling or artifact-transfer regression.

### P2.2: Bundle the report parser once

**Repository:** `hoverkraft-tech/ci-github-common`.
Upstream [PR #643](https://github.com/hoverkraft-tech/ci-github-common/pull/643) and consumer [PR #588](https://github.com/hoverkraft-tech/ci-github-nodejs/pull/588) are merged. The [released Node integration CI](https://github.com/hoverkraft-tech/ci-github-nodejs/actions/runs/42783148575) passed all 11 report scenarios; Pleey validation remains separate.
**Files:** `actions/quality/parse-ci-reports/action.yml`, its package/lockfile and `src/**`,
parser tests and `.github/workflows/__test-action-parse-ci-reports.yml`.

- [x] Add a reproducible distribution build using upstream conventions, including runtime dependencies/license material; do not assume an existing bundler.
- [x] Execute the bundle without action-time dependency installation. Remove setup/`NODE_PATH` only after supported runner/container execution succeeds.
- [x] Preserve inputs/outputs, formats, path mapping and annotations. Verify distribution matches source in upstream CI.
- [x] Validate supported fixtures, missing/malformed files, rewritten paths and error outputs without parser `node_modules`; preserve original lint/test failure when reporting succeeds. Require explicit report paths to match files, closing the zero-match warning behavior observed in P1.
- [x] Adopt the released parser through Node 3.0.0 and measure startup, processing and total action preparation/download cost. The [comparison](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p2-adoption-comparison-2026-11-11) records the additional artifact work and the limit on isolating parser-only transfer time.

**Rollback:** restore parser/consumer pins if compatibility regresses.

### P2 adoption validation in Pleey

See the [dated adoption decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p2-released-tooling-adoption-2026-11-10) for released commits, compatibility changes and the measurement protocol.

- [x] Audit all existing callers against the released interfaces, including semantic permissions and the release creation target input.
- [x] Validate the candidate locally and in full PR CI, preserving application inventories, reports, signatures/attestations and chart installation. [Candidate attempt 1 passed](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42903991722/attempts/1); the ADR records inventories, coverage denominators and resolved tools.
- [x] Collect fresh baseline and candidate series: one priming run plus five consecutive samples each, with unchanged application inputs and recorded runner/tool versions. All ten measured runs passed; no samples were replaced.
- [x] Record elapsed time, summed job time, preparation overhead and report overhead; retain failures and cache misses with their classification. [Median elapsed fell 12.1% and summed job time 12.0%](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p2-adoption-comparison-2026-11-11); overlapping ranges, priming misses and the superseded premeasurement run remain explicit.
- [x] Complete nonpublishing release-helper and explicit missing-report failure checks against the released bundles and input-resolution scripts. See the local preflight results in the dated adoption decision; hosted Pleey validation remains separate.
- [ ] Validate generated distribution commits on real dependency-bot PRs separately; merging the reusable workflow is not end-to-end evidence.
- [x] Update PR #553 with the final scope and results. **Reviewed on 2026-11-11** as part of PR #553.

### P2.3: Remove redundant publication/security setup

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** `.github/workflows/docker-build-images.yml` and
`actions/docker/{build-image,create-images-manifests,sign-images,attest-image}/action.yml`.

Upstream [PR #953](https://github.com/hoverkraft-tech/ci-github-container/pull/953)
is merged and released in [0.41.0](https://github.com/hoverkraft-tech/ci-github-container/releases/tag/0.41.0).
Its [final CI](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/42933849404)
passed 167 jobs with 10 intentional skips. The [adoption decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p23-released-container-adoption-2026-11-11)
defines the separate Pleey validation and comparison.

- [x] Validate a complete single-platform result and reuse its existing build digest. Manifest creation already skips this case; remove redundant Docker/Buildx setup and tag inspection.
- [x] Preserve the `built-images` output shape, tags, registry/repository metadata and ordering expected by callers.
- [x] Initialize Buildx where manifest assembly is required; validate multi-platform and mixed batches.
- [x] Remove daemon/Buildx setup used only for security metadata while preserving registry authentication, cosign, subjects, provenance and narrow permissions. Do not move signing privileges into untrusted builds.
- [x] Use upstream platform/signing/attestation integration workflows to verify digest equality, manifest contents, signatures, attestation subjects and authentication failures.
- [x] Record upstream publication/security setup observations with their limitations in the [upstream ADR](https://github.com/hoverkraft-tech/ci-github-container/blob/bb7e3e5891e27a155182332537774b8653cf3531/docs/adr/0003-reuse-build-digests-and-limit-publication-setup.md).
- [x] Adopt the released pin in Pleey and validate full PR CI, preserving digests, signing, attestations, reports and chart installation. The [candidate primer](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42992775410/attempts/1) passed all 23 executed jobs; the ADR records input, inventory and digest-handoff checks.
- [x] Compare five post-priming baseline/candidate pairs, including publication/security setup and total elapsed/summed job time; keep toolchain changes explicit. All ten runs passed. [Median elapsed fell 11.5% and summed job time 7.4%](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p23-adoption-comparison-2026-11-11); overlapping elapsed ranges, the tied second pair and frontend variability remain explicit.
- [x] Record final evidence and submit the updated PR #553 for review before P2.4. **Reviewed on 2026-11-11**; P2.4 follows separately.

**Rollback:** restore the pin on digest/output/security regression.

### P2.4: Improve cache reuse and invalidation

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** container workflow, `actions/docker/build-image/action.yml`,
`actions/docker/build-image/internal/action.yml` and caching integration workflow.

Upstream implementation: [PR #957](https://github.com/hoverkraft-tech/ci-github-container/pull/957).
Its [ADR](https://github.com/hoverkraft-tech/ci-github-container/blob/79ab741d853f0cb8efd0823b497882c2d5995fc1/docs/adr/0004-scope-build-cache-imports-and-mount-snapshots.md)
owns the revised design and distinguishes earlier-proposal evidence from current
validation. Review on 2026-11-11 narrowed this phase to internal fixes with no new
public inputs. The reviewed fix is released in
[0.41.1](https://github.com/hoverkraft-tech/ci-github-container/releases/tag/0.41.1).
The [adoption decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p24-released-container-adoption-2026-11-11)
defines Pleey's first-run and warm-rerun correctness checks.

- [x] Remove the proposed raw import, export-mode and dependency-pattern inputs, including per-image overrides. Keep the released public interface and `max` export mode.
- [x] Isolate mount snapshots by image/context/target/platform/Dockerfile/build arguments, including separate local directories. Remove fallbacks that discard identity.
- [x] Use restore-only access and skip extraction on read-only GHA triggers. Preserve extraction before builder teardown, exact-hit reuse and cache bypass.
- [x] Validate the revised candidate's contracts, independent-runner snapshot restore/isolation, bypass and failed builds, plus existing integration tests. [CI run 43046729837](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/43046729837) passed 172 jobs with 10 intentional skips, without reruns. Controlled contexts cover read-only event policy; live untrusted events and application installers remain untested.
- [x] Simplify cache usage documentation and retain the rejected proposal's dated evidence in the upstream ADR.
- [x] Submit the narrowed PR #957 for review with passing implementation CI. The upstream ADR records the revised candidate separately from the rejected proposal.
- [x] Verify reviewed PR #957 is merged and release 0.41.1 points to `79ab741d853f0cb8efd0823b497882c2d5995fc1`; update all eight existing pins in PR #553 without new caller settings.
- [x] Validate consumed contracts, full application CI and a same-commit warm rerun; record exact snapshot isolation/restoration and submit the adoption for review. [Both attempts](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p24-released-container-adoption-2026-11-11) passed 23 jobs with 12 intentional skips; all four new mount keys were saved and then restored exactly. Application inventories, coverage denominators and digest handoffs were preserved. No speedup is claimed.
- [x] Review the released P2.4 adoption in PR #553 before starting P2.5 or later DAG work. User review completed on 2026-11-11.

**Deferred work:**

- [ ] Trace historical unchanged-input compilation misses if reproduced; recent controlled Pleey runs retained those layers. Do not attribute them to mount freshness without evidence.
- [ ] Design cross-image reuse around at most a source-image relationship, with branch/registry/platform resolution inside the workflow. Keep separate exporters and permitted branch access.
- [ ] Find a justified automatic dependency-refresh strategy before implementation. Exact mount snapshots currently do not refresh on dependency-only changes; avoid a brittle Dockerfile parser or package-manager heuristics.
- [ ] Revisit export-mode tuning only if representative total import/build/export measurements justify it. The local fixture showed no meaningful size benefit from `min`.

**Rollback:** restore the released pin or use the existing cache bypass. Old mount
snapshots start cold once after adoption. Registry caching remains a conditional
P7 experiment; P2.4's deferred features are not prerequisites for P3 service lanes.

### P2.5: Candidate publication and exact-digest promotion

**Repository:** `hoverkraft-tech/ci-github-container`.
**Files:** metadata/build/publication actions and the
`docker-promote-images.yml` reusable workflow.

Deliver P2.5 in two reviewable increments: candidate publication, then gated
promotion. Candidate publication was reviewed and merged in
[upstream PR #959](https://github.com/hoverkraft-tech/ci-github-container/pull/959).
The [2026-11-12 refinement](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p25-candidate-publication-increment-2026-11-12)
keeps `images[].tag` as the intended final version and lets the workflow generate
temporary identities behind one opt-in mode. Both increments are now released;
Pleey candidate-mode adoption is tracked in P4 below.

- [x] Add opt-in candidate publication with repository/run/attempt/call isolation; verify normal/latest tags are untouched without caller-generated identities. Implemented in upstream PR #959; metadata contracts and hosted registry checks passed.
- [x] Preserve intended destinations and final OCI version/release metadata, including the existing forced final tag. Hosted single/multi-platform candidates retain version `1.2.3`; event-derived metadata is compared with normal mode.
- [x] Return the digest, source revision, run identity and destinations through the existing output; validate single/multi-platform publication and retained signatures/attestations. [Candidate-specific CI checks](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/43119465301) passed on `26e58f07`, including failed builds without output. Build identity is not validation evidence; promotion is covered below.
- [x] Review the candidate-publication increment before implementing promotion. Upstream PR #959 was merged and released in [0.42.0](https://github.com/hoverkraft-tech/ci-github-container/releases/tag/0.42.0); see the [release adoption decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p25-released-publication-support-2026-11-12).
- [x] Pin all nine existing container references to released commit `ca71afa42c37bdd67ec2ca685fd2ff73d76190e8` in PR #553, keeping normal publication mode and existing dependencies.
- [x] Validate normal-mode adoption with consumed-contract checks, workflow/documentation lint and full PR CI; submit it for review. [Run 43167373851](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/43167373851) passed 25 jobs with 12 intentional skips on its first attempt; normal tags, digest handoffs, security results and report inventories were verified in the ADR.
- [x] Review normal-mode 0.42.0 adoption in PR #553 before starting gated promotion. User review completed on 2026-11-12.

Promotion was reviewed and merged in [upstream PR #962](https://github.com/hoverkraft-tech/ci-github-container/pull/962), then released in 0.43.0. See the [released adoption decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p4-released-promotion-adoption-2026-11-12) and the earlier [promotion evidence](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p25-gated-promotion-increment-2026-11-12).

- [x] Bind verification evidence to the candidate contract for promotion. The caller supplies actual dependency results and exact candidate entries from its validation jobs; it owns the required check inventory.
- [x] Promote the tested digest without rebuilding/changing manifest bytes, retaining signatures/provenance. Hosted single/multi-platform checks passed on `4d85b07`.
- [x] Require every supplied dependency to succeed; reject missing/different digests, stale run/attempt evidence, incomplete destinations and unauthorized repositories. Covered by the focused promotion contracts.
- [x] Define reruns, cancellation, superseded runs, idempotency and partial-tag failures. A repository lock and durable publication claims reject older overlapping writers; a new attempt rebuilds and revalidates. Controlled contracts cover interruption, conflicting claims and partial writes.
- [x] Define candidate cleanup without deleting promoted content or another run's evidence. Promotion performs no deletion; registry retention must preserve consumer-tagged content and the publication journal. Test cleanup targets only isolated packages and records from its own run/attempt.
- [x] Validate controlled PR/main/release destination metadata and publication/security failures. Real hosted promotion and repeat calls are tracked separately below; controlled contexts do not establish live main/release execution.
- [x] Validate hosted promotion, unchanged manifest bytes, retained security evidence and repeat calls using the existing single/multi-platform candidates. [Run 43175617613](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/43175617613) verifies exact destination digests, both successful journal records and isolated test cleanup.
- [x] Review and release the promotion increment, then replace P4's preview pin with released 0.43.0 commit `ed1e90302235365110f9b4b05df96840f715a14f` in PR #553. All 11 container references use the same release.
- [ ] Exercise Pleey's main/release paths during rollout; PR-only CI is not evidence of a real release.

**Rollback:** retain/restore gated production ordering. Do not enable speculative
builds merely by removing `needs` before this contract is validated.

## P3: Parallelize service jobs

**Files:** shared workflow and [PR](../../../.github/workflows/pull-request-ci.yml),
[main](../../../.github/workflows/main-ci.yml),
[release](../../../.github/workflows/release.yml) callers.
The existing one-image-list API supports this stage. P3 starts before P2.5, as
allowed by the execution order; P4 still requires both. See the
[P3 ADR entry](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p3-service-lanes-2026-11-11).

- [x] Create `build-backend-ci-image` and `build-frontend-ci-image` caller jobs, preserving inputs, authentication, security results and digest-qualified output use. Implemented in [PR #553](https://github.com/cloud-native-aixmarseille/pleey/pull/553); local contracts pass.
- [x] Give `check-backend` and `check-frontend` only their own image dependencies. Keep repository lint and independent checks concurrent.
- [x] Confirm independent scheduling and record the initial overlap/setup observations. Backend checks started 1s before frontend image completion; summed CI-image preparation/publication took 43s versus 28s in an earlier warm P2.4 run. This is an uncontrolled observation, not demonstrated net benefit; see the [final P3 evidence](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p3-final-validation-and-review-2026-11-12).
- [ ] Complete a controlled overlap/setup-cost comparison before claiming a P3 performance improvement.
- [x] Run focused local workflow/security/documentation lint and contract checks, covering dependencies, inputs, permissions and documentation links.
- [x] Validate hosted PR CI with the clarified job names. [Run 43103908128](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/43103908128) passed before removal of the aggregate job.
- [x] Validate final hosted CI after cleanup, image digest handoffs, signing/attestations and application reports. [Run 43108346715](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/43108346715) passed 25 jobs with 12 intentional skips; inventories and coverage denominators match.
- [x] Record user review of the P3 implementation in PR #553 on 2026-11-12 and authorization to continue. Controlled performance validation remains open above.

The aggregate job and required-check rollout are deferred at the user's request.
Revisit them before candidate promotion in P4. No repository rules change in P3.
The ADR preserves the earlier gate checks and incident-affected initial runs as
historical evidence.

**Rollback:** restore the shared CI-image barrier and matching application
workflow dependencies.

## P4: Overlap candidates and Helm with application checks

**Prerequisites:** P2.5 and P3. **Files:** shared workflow, release caller and adopted
promotion interface. Follow the [ADR DAG](../architecture/adr/0023-optimize-ci-execution-and-caching.md#execution-graph-and-publication-gates).

The [released adoption](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p4-released-promotion-adoption-2026-11-12)
in PR #553 uses ci-github-container 0.43.0 and the promotion workflow itself as the
aggregate gate, without a separate `ci-result` job. It replaces the earlier
consumer preview. Required-check enforcement and the remaining validation below
are rollout requirements; release adoption does not complete P4.

- [x] Validate and review the released 0.43.0 adoption in PR #553. [Run 43252004563](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/43252004563) passed on `c96a0f13`; user review completed on 2026-11-12. See the [dated validation record](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p4-release-validation-and-user-review-2026-11-12).

- [x] Implement and locally validate the promotion job's aggregate gate: run after failures/skips, supply every required result through `toJSON(needs)` and require `success` before publication. Consumer contracts against the released implementation reject 39 unsuccessful-result/evidence scenarios; hosted validation is tracked in PR #553.
- [x] Verify the emitted check name: `ci / Promote validated production images / Promote validated image digests` in run 43252004563.
- [ ] Enable its narrowly scoped required-check rule once the gate exists on `main`, preserving unrelated semantic/security settings. Verify enforcement on a PR before retiring any existing required checks.

- [x] Validate that each production candidate starts after its own CI image alongside its lint/tests. Run 43252004563 observed backend/frontend build-test overlap of 65s/57s; this is not a controlled performance comparison.
- [ ] Import permitted completed CI caches once the upstream cross-image reuse contract is available; the released workflow does not add this capability.
- [x] Supply candidate identity and planned final metadata; verify consumer tags stay unchanged while validation is pending. Registry reads during run 43252004563 confirmed both normal PR tags retained their previous digests before promotion.
- [x] Start Helm once both candidates/security results are ready, passing immutable digests through existing image values. The released-adoption Helm job successfully installed both candidate digests.
- [x] Join repository/application checks, required reports, chart results and candidate/security results in the promotion job's gate without a dependency cycle. Local checks cover its complete ancestor inventory.
- [x] Compare build, signature/provenance-subject, chart-tested and promoted digests explicitly. Run 43252004563 and registry reads matched both candidate digests across all four destination tags; see the dated ADR evidence.
- [x] Preserve `built-prod-images` for release consumers, sourcing it from successful promotion; preserve planned release tags/metadata. Local caller-contract checks pass; live main/release validation remains open.
- [ ] Validate rendered release charts again after release-file mutations; application evidence does not validate different chart content.
- [ ] Exercise lint/test/chart/security failures, skips, cancellation, superseded runs and reruns. Verify no unchecked promotion and correct cleanup.
- [ ] Benchmark separately from P3, including speculative work wasted on unsuccessful runs.

**Rollback:** restore gated production/Helm ordering and output mapping, retaining
independently proven setup/cache improvements.

## P5: Parallelize suitable operations within one job

**Assessment:** defer implementation for the current profile. The [P5 decision](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p5-parallelization-assessment-2026-11-12) records the observed 5–7s Helm overlap ceiling, non-critical application lint and orchestration costs. The remaining trial checkboxes below are conditional on a new profile justifying the work.

- [x] Review the P5 deferral before starting another implementation. User approval recorded on 2026-11-13; continue with the measured Helm secret-availability wait.

### P5.1: Choose the concurrency mechanism

At workflow level, prefer native `parallel` for an independent group, or
`background` with explicit `wait` for staged dependencies. Both `run` and `uses`
are supported. Composite internals need a different implementation. See
[GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsparallel).

- [x] Verify the documented native workflow syntax and composite-action restriction through current GitHub documentation. No runner compatibility test or parallel prototype has been run.
- [ ] Before adopting a trial, verify target runner/parser and workflow-linter support. Limit it to two operations and measure shared CPU/memory pressure.
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

- [x] Time the existing phases after tool installation: preparation plus lint took 5.37s/7.39s in the two observed runs, versus about 40s to create/select the cluster. These are observational bounds, not a parallel benchmark.
- [ ] Before a trial, verify disjoint writes to chart paths, kubeconfig and tool configuration.
- [x] Assess native orchestration over shared stages versus supervised CLI children. Defer both: the observed maximum saving does not justify a new staged API or process supervision. Keep the existing one-call action interface.
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

- [x] Profile existing checks: frontend/backend lint commands took about 27.5s/25.5s and both jobs finished over four minutes before Helm in run 43252004563. Inspect the existing TypeScript harness; its module cache is process-local. Defer extra processes/API changes until job cost or the critical path justifies a trial.
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
- [ ] Execute the complete discovered frontend suite across shards with identical source/image/Vitest/config and produce blob/coverage payloads; P1 retained the original jsdom setup.
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

### P7.2: Helm setup and installation

**Owners:** container tooling/docker-base-images and Pleey chart manifests/locks.

Selected increment: [require the database secret before starting workload containers](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p7-helm-database-secret-prerequisite-2026-11-13). Keep the existing authenticated readiness and fresh-cluster install checks.

- [x] Rebase PR #553 onto main, preserving current dependency updates and reviewed CI behavior.
- [x] Identify the secret-file wait in the reviewed Helm logs: readiness took 77.8s/87.7s, with repeated `ENOENT` while the operator had already reported a healthy cluster.
- [x] Require the database secret/key for both the Deployment and migration Job, including CloudNativePG; document the changed missing-secret diagnostics and timeout boundary.
- [x] Verify rendered manifests for both database providers, including disabled readiness init containers, and pass strict Helm lint.
- [ ] Review fresh-cluster PR CI and the comparison with the rebased control before another implementation. Keep observed timings distinct from controlled performance acceptance.

Remaining setup/download experiments:

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
