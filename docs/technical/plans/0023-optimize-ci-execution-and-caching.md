# Implementation plan: ADR 0023 - Optimize CI execution and caching

- Issue: [#475](https://github.com/cloud-native-aixmarseille/pleey/issues/475)
- Decision: [ADR 0023](../architecture/adr/0023-optimize-ci-execution-and-caching.md)
- Updated: 2026-11-17
- Implementation: [#552](https://github.com/cloud-native-aixmarseille/pleey/pull/552) and [#553](https://github.com/cloud-native-aixmarseille/pleey/pull/553) are merged. Selected P1-P7 changes and released upstream contracts are implemented. P8 pre-merge acceptance and main CI passed; the required PR check is active. Remaining rollout checks are tracked below.

This file tracks current completion and remaining work. The ADR retains dated
measurements and decision history; the [development guide](../development/index.md)
explains the supported pipeline, cache bypass and recovery. Deferred experiments
are conditions for future reconsideration, not unfinished implementation tasks.

## Implemented changes

### P0: Reproducible baseline

- [x] Audit the full PR/main DAG, validation inventory, cache state and branch rules.
- [x] Pin application base images and restart the baseline after mutable-tag drift.
- [x] Record five consecutive comparable attempts after a primer, retaining misses, failures and timing limitations.
- [x] Record median elapsed 15m 31s and summed job time 26m 58s in the [P0 results](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p0-baseline-2026-11-06).

### P1: Local reductions

- [x] Keep Docker compilation as the build gate and remove duplicate Node compilation from prebuilt application checks.
- [x] Declare JUnit, LCOV and Biome SARIF paths and preserve failures, annotations and coverage reporting.
- [x] Use the effective npm cache path/ownership, preserve declared build inputs and exclude generated files/credentials from Docker context.
- [x] Limit greetings to the relevant PR lifecycle event.
- [x] Evaluate the Node/jsdom split, retain the simpler jsdom setup and use CPU-relative workers with native overrides, preserving isolation and coverage.
- [x] Use bounded authenticated database readiness through the production Prisma client, preserve failure/cleanup diagnostics and adopt the verified 128 MiB default.
- [x] Validate the changes and record the [P1 comparison](../architecture/adr/0023-optimize-ci-execution-and-caching.md#completed-p1-comparison-2026-11-06) and [worker review](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p1-review-cpu-relative-frontend-workers-2026-11-06).

### P2: Released shared tooling

- [x] Adopt lightweight Node preparation, independent lint/tests and omission of the empty build job for prebuilt callers.
- [x] Adopt the bundled report parser with explicit report matching and no runtime installation of parser dependencies.
- [x] Reuse single-platform build digests and limit publication/signing/attestation setup to required tools.
- [x] Adopt internally scoped GHA mount snapshots and read-only export protection, retaining the existing public cache interface.
- [x] Adopt run/attempt-scoped production candidates, planned destination metadata and verification before exact-digest promotion.
- [x] Adopt reusable generated-dist build/write workflows with caller inputs and automation-author rules; verify a real [Dependabot distribution commit](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p8-unsuccessful-runs-and-automation-evidence-2026-11-17). A live Renovate write was not exercised.
- [x] Replace previews with immutable released pins and audit caller inputs, outputs, permissions and secrets. See [released adoption](../architecture/adr/0023-optimize-ci-execution-and-caching.md#released-tooling-adoption-2026-11-17) and [Container 4.2.0](../architecture/adr/0023-optimize-ci-execution-and-caching.md#container-420-adoption-2026-11-17).

### P3-P4: Independent jobs and gated publication

- [x] Split backend/frontend CI-image workflows so each application's lint and tests wait only for its own image. Native overlap is verified; no isolated P3-only speedup is claimed.
- [x] Start both production candidates independently of CI-image builds, with separate caches. Retain the [controlled candidate-start comparison](../architecture/adr/0023-optimize-ci-execution-and-caching.md#independent-candidate-start-results-2026-11-16).
- [x] Prepare, lint and install both candidate digests with the reusable Helm workflow, overlapping application checks.
- [x] Require repository/routing/application/chart validation, signatures/provenance and current-run evidence before promotion. Preserve `built-prod-images` for consumers.
- [x] Retain `Validate PR checks` to verify the exact job set and permitted skips, including the local routing package's independent tests.
- [x] Split Helm prepare, lint, test and release responsibilities; keep action internals within their owning action.
- [x] Validate the final release SHA/archive after version and image-default changes. Publication consumes only its immutable artifact ID, basename and checksum; the release action owns download/verification/cleanup.
- [x] Pass the native cold-build and nonpublishing final-chart probe. Actual release publication remains a rollout check.
- [x] Merge #553 as `b9c798e2182a27d42bae7161af1a78cac1a31cbc` after green CI and user approval. Its tree matches reviewed head `aadc07a`.

### P5-P7: Profiling decisions and retained improvements

- [x] Evaluate bounded step parallelism, frontend sharding, lint/tool images, runner sizes, shared builders, registry caches and release-image reuse. Record each disposition below instead of leaving rejected trials as open tasks.
- [x] Require the database secret/key before starting workload containers, retaining authenticated readiness and fresh-cluster tests.
- [x] Adopt conservative documentation-only PR routing with the shared expected-results policy and 40 colocated tests. Main/release retain full CI.
- [x] Remove duplicate per-validator commit-status reporting while retaining repository lint failures, summaries, comments and artifacts.
- [x] Remove redundant PR-state lookups in image cleanup; keep cleanup parallel to main CI.
- [x] Adopt conservative Helm-doc change detection from the last successful main run, with generation on uncertain history and reruns. Keep successful CI as the write gate and release generation unconditional.
- [x] Adopt bundled documentation formatting and remove runtime npm installation from the default generator path. Optional caller plugins remain caller-owned.

## Experiment dispositions

| Experiment                                                                | Disposition and condition for reconsideration                                                                                                                                                    | Decision/evidence                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node/jsdom environment split                                              | Rejected: it did not add a benefit over the same worker count with the simpler jsdom setup.                                                                                                      | [P1 experiment](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p1-implementation-candidate-2026-11-06)                                                                                                                                           |
| Two frontend shards                                                       | Rejected for Pleey; the complete native workflow did not justify adoption. Keep one adaptive-worker test job.                                                                                    | [P6 result](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p6-frontend-sharding-results-2026-11-16)                                                                                                                                              |
| Native step parallelism, lint pairs, Helm preparation/kind overlap        | Deferred. Establish independent writes, supported orchestration, failure joins and measured net gain before a bounded trial.                                                                     | [P5 assessment](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p5-parallelization-assessment-2026-11-12)                                                                                                                                         |
| Cross-image cache imports, automatic mount refresh and export-mode tuning | Deferred. The public raw-input proposal was rejected; a demonstrated bottleneck and a simple owned contract are required before revisiting it.                                                   | [P2.4 review](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p24-upstream-cache-review-2026-11-11)                                                                                                                                               |
| Extra lint/Helm tool images or download caches                            | Deferred. Setup/pull trade-offs did not justify additional interfaces or maintenance. Preserve current validators and installation coverage.                                                     | [Lint profile](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p7-repository-lint-profiling-2026-11-16), [Helm assessment](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p7-review-and-final-release-chart-validation-2026-11-13) |
| Batched main cleanup or parallel docs publication                         | Deferred. Avoid proven duplicate/unchanged work first; cleanup is outside the critical path.                                                                                                     | [P7.4 result](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p74-validation-and-disposition)                                                                                                                                                     |
| Paid larger runners and one shared CI/production builder                  | Deferred. Local suite/build improvements did not establish better native total time and resource cost.                                                                                           | [P7.5 result](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p75-screening-results-and-disposition)                                                                                                                                              |
| Registry-backed caches                                                    | Deferred. Native warm builds retained hits; transfer/eviction was not a demonstrated dominant cost. Adoption needs trusted/PR writer isolation, retention ownership and failure/recovery trials. | [P7.6 result](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p76-findings-and-disposition)                                                                                                                                                       |
| Reusing trusted main images for releases                                  | Deferred. Release-specific OCI metadata changes digest identity. Source SHA alone cannot authorize reuse; preserve rebuild and current-run promotion.                                            | [P7.7 result](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p77-findings-and-disposition)                                                                                                                                                       |

## P8: Complete acceptance and documentation

- [x] Collect five final consecutive PR samples after a separate primer, retaining slow samples and all cache observations.
- [x] Meet the observed combined target: median elapsed 7m 51s versus historical P0's 15m 31s; median summed job time 21m 29s versus 26m 58s. These are 49.4% and 20.3% reductions, with dependency/tool/runner changes limiting causal attribution. See the [full results](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p8-warm-results-2026-11-17).
- [x] Preserve test inventories, coverage denominators and all ten measured production digest handoffs. Reconcile the 40 routing cases relocated from the backend.
- [x] Report failed/cancelled work separately from successful-run performance and billing. Standard hosted compute is free for this public repository; storage is separate.
- [x] Pass native application builds with layer imports/exports and mount persistence disabled, plus full application and fresh-cluster checks.
- [x] Validate representative final release metadata and the exact uploaded chart archive/checksum without publishing a release for measurement.
- [x] Retain the final CI setup outlier: Buildx setup took 600.6s while all 47 application build instructions were cached. Its cause remains unestablished; do not infer a layer-cache problem.
- [x] Update the ADR's current DAG/contracts and contributor recovery guidance. Remove 21 generated evidence files from the source tree while preserving their [immutable history](../architecture/adr/0023-optimize-ci-execution-and-caching.md#historical-evidence-archive).
- [x] Obtain explicit approval for the required-check policy and merge #553. The active main-only [rule](https://github.com/cloud-native-aixmarseille/pleey/rules/27474278) requires `Validate PR checks` from GitHub Actions and strict branch freshness. Only the existing docs bot has a PR-only bypass; the disabled broad ruleset is unchanged.
- [x] Verify the human merge satisfies the new rule without bypass: GitHub rule suite `5181182109` reports `required_status_checks: pass`.
- [x] Verify [main CI](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/44125303893): all 36 executed jobs pass. Docs generation and bundled formatting ran after CI, with no changed files to publish.
- [ ] Exercise a real generated-doc bot PR under the approved exception. Successful no-change generation does not establish the write/merge path.
- [ ] Verify native main cancellation/catch-up behavior. Existing focused tests and read-only probes cover selection; they do not establish publication under concurrent main pushes.
- [x] Verify both ordinary-PR outcomes by read-only inspection: [#571](https://github.com/cloud-native-aixmarseille/pleey/pull/571) is blocked with a failed gate; [#569](https://github.com/cloud-native-aixmarseille/pleey/pull/569) has a successful gate and clean merge state against the same main base. No unrelated PR was merged.
- [ ] Validate the next legitimate Pleey release through bot file preparation, final-chart validation, exact artifact publication and signing. Do not publish solely for measurement.

## Correctness coverage and limits

| Scenario                                 | Evidence and remaining scope                                                                                                                                                                                                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warm execution                           | Five fixed-input full-CI attempts, cache/tool/queue audit and preserved slow samples. The final-versus-P0 comparison is historical.                                                                                                                                                     |
| Cold execution                           | [Native probe](../architecture/adr/0023-optimize-ci-execution-and-caching.md#p8-cold-build-and-final-chart-validation-2026-11-17): all 47 application build instructions execute without layer/mount persistence; JUnit inventories and coverage denominators match warm execution.     |
| Dependency and application input changes | P1's fault/context/invalidation cases remain applicable: Docker input boundaries are unchanged apart from the Nginx digest. Subsequent dependency/tool adoptions passed CI. This is not a newly executed exhaustive native input-change matrix or changed-source performance benchmark. |
| Chart changes                            | Current local subcharts are packaged and installed by production digest. The final-chart probe verifies changed root/subchart versions, dependency locks, image defaults, checksum and unchanged runtime-only test overrides.                                                           |
| Test execution                           | Application inventories/coverage denominators match after accounting for the 40 relocated routing cases. All 60 backend skips predate this work; test sharding remains disabled.                                                                                                        |
| Validation failures                      | P1 compile/lint/test fault probes, P2 strict-report checks, existing routing/promotion tests and a native lint failure establish fail-closed gates. Success runs alone do not establish failure coverage.                                                                               |
| Skip/cancel/rerun                        | Routing cases reject missing/unexpected results; promotion tests cover current-run/attempt evidence and recovery. Native PR cancellation rejects promotion/final gate, and full reruns pass. Main publication/cancellation remains open above.                                          |
| Publication                              | Each measured attempt attests, installs and promotes matching production digests. A real Dependabot distribution commit verifies the shared writer at its recorded revision. Live Pleey release publication remains open above.                                                         |
| Database startup/failure                 | P1's readiness cases and production-client TLS/stall/SIGTERM probes cover bounded failures/cleanup. Native fresh-cluster installations retain authenticated readiness and migrations.                                                                                                   |
| Cache trust/recovery                     | Released GHA scope/writer rules remain unchanged; existing upstream tests cover the contracts and native cold execution verifies bypass. No new live untrusted-fork write trial was run.                                                                                                |
| Cleanup                                  | Native Helm probes verify cluster and prepared-archive cleanup. Temporary probe branches/checkouts are removed; raw review artifacts stay outside the repository.                                                                                                                       |

Keep #475 open until required rollout checks are complete or their disposition is
explicitly reviewed. Future adoption of a deferred experiment requires its own
focused proposal, validation and user review.
