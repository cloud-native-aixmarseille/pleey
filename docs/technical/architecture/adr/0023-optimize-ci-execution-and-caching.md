# ADR 0023: Optimize CI execution and caching

- Status: Accepted
- Proposed date: 2026-11-05
- Accepted date: 2026-11-05

## Context

[Issue #475](https://github.com/cloud-native-aixmarseille/pleey/issues/475) requests
measurable CI improvements without stale caches or reduced reliability. The
[shared pipeline](../../../../.github/workflows/__shared-ci.yml) serves PRs, main,
and releases. Its critical path crosses image building, reusable-workflow setup,
application tests, production image publication, and Helm installation. Improving
Docker caching alone leaves several independent sources of delay unchanged.

### Audit evidence: 2026-11-05

The sample comprises five successful PR runs
([42039011250](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42039011250),
[42007492180](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42007492180),
[41997449273](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41997449273),
[41985424044](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41985424044),
[41978511658](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41978511658))
and five successful main runs
([42004084531](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42004084531),
[41987313343](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41987313343),
[41982073046](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41982073046),
[41975502607](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41975502607),
[41972777934](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/41972777934)).

| Measurement                              | PR median       | Main median     |
| ---------------------------------------- | --------------- | --------------- |
| Workflow elapsed, creation to completion | 16m 39s         | 18m 24s         |
| Workflow elapsed range                   | 14m 02s–20m 35s | 16m 52s–20m 53s |
| Sum of non-skipped job durations         | 27m 23s         | 34m 17s         |
| Backend CI image job                     | 1m 08s          | 3m 02s          |
| Frontend CI image job                    | 1m 52s          | 1m 58s          |
| Frontend test job                        | 4m 19s          | 4m 40s          |
| Backend test job                         | 1m 44s          | 1m 31s          |
| Backend production image job             | 59s             | 2m 29s          |
| Helm chart test job                      | 3m 17s          | 3m 14s          |
| Repository lint job                      | 2m 31s          | 3m 49s          |

These are exploratory samples with different commits and cache histories, not a
controlled before/after benchmark. Job durations include setup and teardown;
parallel jobs must not be added to estimate elapsed time. Their sum is a resource
usage proxy, not billing. The first PR has about 65s of initial queue/dispatch delay.
The latest successful release run, dated 2026-09-09, predates the current pipeline
and is not a current release baseline.

Detailed logs for the first PR and main run establish the following:

- CI images already contain compiled applications, but the Node workflow compiles
  them again. Tests start in separate containers and do not consume that second
  build's output. Container initialization takes 19–33s per application job.
- Image publication adds a shared barrier after both image builds, followed by
  attestation jobs. In the PR publication job, Docker/Buildx setup takes 26.3s,
  while the single-platform manifest script and digest inspection take under 1s
  together. All current application images target only `linux/amd64`.
- Frontend Vitest execution takes about 211–221s across 228 files; backend takes
  29–35s. Frontend import and environment phases each account for about 28% of
  summed tracked phase time. These percentages span workers and are not fractions
  of wall time. All frontend tests currently use jsdom and the shared UI setup.
- Automatic report discovery spends about 8–10s per application lint job and finds
  no supported lint report despite Biome producing JSON. Test report discovery
  scans for files whose names are already known.
- Super-Linter image pulls take 70–87s; actual lint execution takes 64–160s.
  The shared image already derives from Super-Linter slim, and validators already
  run in parallel. Repository lint is off the current critical path.
- Helm setup spends 5–25s on chart-testing tooling, 4–11s preparing dependencies,
  about 45s creating kind, and 109–124s installing/testing the chart. Actual chart
  lint takes under 1s. Both successful runs contain two failed migration pods with
  Prisma `P1001` before a successful retry. The current database wait checks secret
  file existence, not database connectivity.
- BuildKit already uses GitHub Actions layer caches and persists cache mounts with
  `actions/cache` and `buildkit-cache-dance`. CI/prod have separate layer scopes.
  In the main backend builds, installation repeats for 22.7s/21.4s and compilation
  for 9.6s/9.3s. Cache export itself takes 99.2s/70.7s. The warm PR reuses these
  layers successfully, so simply enabling or enlarging caching is not the answer.

The audit follows the pinned
[container workflow](https://github.com/hoverkraft-tech/ci-github-container/blob/5ffc3c81daacc57700a14bb91d67edbc67eedc1d/.github/workflows/docker-build-images.yml),
[Node workflow](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/1f81dd00d941680ab227a6eae5378790d6242e02/.github/workflows/continuous-integration.yml),
and [linter workflow](https://github.com/hoverkraft-tech/ci-github-common/blob/44f6108cef0e9884ea7735f3d62932c2310745d4/.github/workflows/linter.yml).
Proposed upstream capabilities below are not assumed to exist in those revisions.

The same day's GitHub API inspection returned `Branch not protected` for main's
classic protection, a disabled `default-branch` ruleset, and no effective rules
for `main`. Recheck at rollout: the aggregate-check task may require enabling
enforcement, rather than replacing an existing required check.

### P0 baseline protocol: 2026-11-05

The first phase records the accepted direction, validation inventory and a
controlled PR baseline. Its [machine-readable evidence](./evidence/0023-ci-baseline.json)
records source fingerprints, locked tools, enforcement state and attempt-specific
measurements. The starting main commit is
[`aa7d9223`](https://github.com/cloud-native-aixmarseille/pleey/commit/aa7d922386c5b707d19bf5bc8da9715c4f4066f1).
P0 pins application base-image inputs after the initial series exposed tag drift.
Workflow ordering, application commands, cache configuration and charts remain unchanged.

| Existing validation branch | Required inputs and outcome                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository lint            | Current checkout, shared linter image/config and rendered-chart fixture; preserve all enabled checks                                          |
| CI image builds            | Per-service Dockerfile, lockfile, source/generated inputs and shared scripts; build, publication and required signatures/attestations succeed |
| Application lint/tests     | Built service image and source path mapping; both services' lint/build/tests and report processing succeed                                    |
| Production images          | Both application lanes complete; preserve normal tag, signing and provenance behavior                                                         |
| Umbrella chart             | Both immutable production image digests; fresh cluster, dependency preparation, lint, installation and chart tests succeed                    |
| Independent PR checks      | Existing semantic-title and workflow/security checks remain visible alongside shared CI                                                       |

Existing code-query/dependency-review options disabled in the caller are not new
required checks. A passing aggregate enforcement rule does not yet exist; P3 adds
it after validating failure behavior. Current repository rules remain unchanged.

The initial phase PR run validates the inputs and primes its cache. Collect
five comparable successful attempts of an unchanged revision and event. Inspect
resolved image/tool inputs and cache availability before including attempts.
The measurement correction below retains cache misses after priming. Keep failures
and changed-input samples with reasons; do not select only favorable timings. Store attempt-specific job/step timings
and links rather than querying only the latest attempt of a rerun.

For reruns, `created_at` belongs to the original run. Measure each attempt from
its `run_started_at` to the latest job completion, separately reporting initial
queue delay and summed job durations. Preserve job intervals to expose later
scheduling waits. Compare medians and ranges after the full sample completes.

| Subsequent comparison scenario | Controlled inputs and evidence                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Warm                           | Same inputs, event and cache scope after priming; five consecutive attempts, retaining cache misses                           |
| Cold                           | Explicitly bypass both layers and mount restoration in an isolated validation run; record successful declared-input execution |
| Dependency change              | Change one lockfile and record the corresponding install/cache invalidation while the other service remains controlled        |
| Source change                  | Change one source input and verify intended compile/test invalidation without unnecessary dependency installation             |
| Shared/generated/chart change  | Verify all consumers of shared scripts, Prisma/GraphQL inputs and local chart sources invalidate correctly                    |

Cold and changed-input cases are defined here for later implementation comparisons;
P0 does not claim to have executed optimizations or invalidation experiments.
Historical main timings remain separate. A controlled main baseline follows the
reviewed merge; do not rerun an older main publication merely to obtain a sample.
Record runner/image information and test/coverage summaries emitted by the current
pipeline. Label unreported CPU/memory, coverage denominator and cache details as
unavailable; obtain additional telemetry before the relevant P1/P6 comparison.

### P0 controlled PR evidence: 2026-11-05

[Phase PR #552](https://github.com/cloud-native-aixmarseille/pleey/pull/552) validates
the initial, superseded series without changing pipeline behavior. Its revision is
`f29d1fea13d6effd157ef8168b8082281a6edf23`, with the shared workflow resolved from
merge commit `a0b8cbac67b4a36ad5f3662b2234ad68ad53a827`.

| Run / attempt                                                                                             | Classification        | Attempt elapsed | Summed job time | Initial queue |
| --------------------------------------------------------------------------------------------------------- | --------------------- | --------------- | --------------- | ------------- |
| [42088318092 / 1](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42088318092/attempts/1) | diagnostic-excluded   | 6m 53s          | 15m 59s         | 3s            |
| [42089202414 / 1](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42089202414/attempts/1) | warm                  | 16m 24s         | 26m 02s         | 83s           |
| [42089202414 / 2](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42089202414/attempts/2) | warm                  | 16m 06s         | 27m 25s         | 4s            |
| [42089202414 / 3](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42089202414/attempts/3) | warm                  | 14m 14s         | 25m 44s         | 6s            |
| [42089202414 / 4](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42089202414/attempts/4) | input-change-excluded | 15m 31s         | 27m 10s         | 4s            |

The three equivalent warm attempts have a **provisional median of 16m 06s**
(range 14m 14s–16m 24s), with median summed job time **26m 02s**
(range 25m 44s–27m 25s). These are baseline observations, not achieved savings.
This series is superseded by the pinned-input series below. Do not combine its
three warm runs with the restarted five-sample baseline.

Attempt 4 passed CI but resolved `nginx:1.31-alpine` to a different immutable
image. Its digest changed from
`sha256:785835ea65db4bba6f021acc0f3be91b0fef76a53fe41f8588c6698d2aed0606` to
`sha256:a46f57e097e8effc26192437d2e715adf74bcbea836117651ee436c27983fa41`.
The source revision and Node base stayed fixed, and npm/generation/compile steps
were cached, but the production input set changed. Retain this run as
changed-input evidence and exclude it from the equivalent warm group. This is
why source SHA alone does not identify a reproducible build. The user approved pinning application base images and restarting the full
five-run baseline on 2026-11-05.

The first revision's Markdown-formatting failure was corrected. Its cancelled
attempt is retained separately: the first failed step completed after 137s, and
its consumed job time is not included in successful-run statistics.

The [test inventory](./evidence/0023-test-inventory.csv) records 162 backend files
(149 passed, 13 skipped; 1,218 passed and 60 skipped tests) and 228 frontend files
(1,178 passed tests). Inventories and printed coverage summaries match across the
three equivalent runs. Existing optional disabled jobs remain outside the required
validation inventory. Fresh chart logs still contain Prisma `P1001` before a
successful migration; the evidence records log occurrences, not inferred pod counts.

Build/publication hosts reported four CPUs and 15.61 GiB Docker memory. Hosted
Ubuntu image releases varied within the series and are recorded per attempt.
Effective test-worker count, peak process memory and the coverage denominator are
not emitted by the current retained reports; gather them before the corresponding
P1/P6 experiments. Cache transfer spans can overlap and must not be summed to
estimate workflow elapsed time.

Raw job/step intervals, resolved inputs, cache events and test summaries are linked
from the [evidence JSON](./evidence/0023-ci-baseline.json). The plan documents
attempt-specific API collection. Review P0 before starting any P1 implementation;
controlled main/release validation remains subject to the protocol above.

### P0 input pinning and restarted baseline: 2026-11-05

Pin the Node base in both application Dockerfiles and the frontend Nginx base
using `tag@sha256:digest`. Registry inspection verified OCI image-index digests,
including Linux amd64 and arm64 manifests; selecting the index preserves platform
selection for local builds. The chosen Nginx input is the successfully validated
image from the discarded fourth attempt. Keep the readable version tag alongside
the digest. The exact references are maintained in the
[backend](../../../../application/backend/Dockerfile) and
[frontend](../../../../application/frontend/Dockerfile) Dockerfiles.

This is an additional accepted P0 decision: mutable base tags invalidated the
measurement, so fixed application base inputs are a prerequisite to the restarted
baseline. Pinning makes image refresh explicit; security updates now require a
reviewed digest change. Existing weekly Docker
[Dependabot configuration](../../../../.github/dependabot.yml) covers both files.
Review those updates promptly and keep both Node references aligned. See
[Docker's digest-pinning guidance](https://docs.docker.com/build/building/best-practices/#pin-base-image-versions).

The initial restart protocol required five attempts with all dependency/compile
layers cached, identical resolved inputs and matching test inventories. Recurring
misses on unchanged inputs exposed selection bias in that criterion; the dated
measurement correction below supersedes the all-hit filter. The previous
unpinned series contributes no samples to the restarted baseline.

Pinning application images does not freeze apt/apk repositories, hosted runner
releases, tools installed by upstream workflows or chart dependency tags. Record
observable resolved inputs and runner variance; do not claim byte-identical cold
builds. The root linter Dockerfile is not the image used by the pinned shared CI
linter, so changing that unrelated input is outside this baseline adjustment.

### P0 measurement correction: 2026-11-06

Use five consecutive successful attempts after the initial cache-priming run,
with the same source revision, event, cache scope, resolved application images,
reported build tools and test inventories. Cache imports must be available, but
cache hits are a measured result, not an inclusion criterion. Retain failures and
input changes separately and investigate them before completing a comparable
series. Do not rerun until only favorable timings or perfect cache hits remain.

On the pinned revision, attempt 2 reused every dependency/compile layer. Attempts
3 and 4 executed frontend CI compilation and backend production compilation/pruning
again despite successful cache imports. This repeated work is part of the behavior
issue #475 aims to improve. Selecting only the all-hit attempt would hide it. Preserve
the original cache-hit classifications in the JSON alongside baseline inclusion.
The logs establish execution but do not establish the invalidation cause; carry
that investigation into the cache experiments, without changing caching in P0.

For cache telemetry, `cached` means an explicit BuildKit CACHED marker with no
observed command output. Parse each main build invocation separately because step
numbers restart in cache-mount helper builds. A missing CACHED marker can represent
layer materialization; `command_output_observed` distinguishes visible command
execution from that case. Cache transfer spans may overlap and are not additive.

The restarted series is revision
[`7a561944`](https://github.com/cloud-native-aixmarseille/pleey/commit/7a561944cb590b1937f547fe7deb3d6a654f7e17).
Attempt 1 primes the changed Dockerfile inputs; attempts 2–6 form the baseline.
Attempt 6 runs on 2026-11-06 after the session interruption. Record its scheduling
and runner variance alongside the earlier attempts; the revision stays fixed.
All five attempts passed input checks; the completed results follow.

### Completed P0 baseline: 2026-11-06

All five post-priming attempts passed the active validation jobs on the pinned
revision above, with matching source/workflow revisions, observed application and
build-tool image identities, and test-file inventories. Optional jobs disabled by
the caller remained skipped. The initial priming run is retained separately.

| Attempt                                                                                     | Included    | Cache evidence              | Elapsed | Summed job time | Initial queue |
| ------------------------------------------------------------------------------------------- | ----------- | --------------------------- | ------- | --------------- | ------------- |
| [1](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/1) | no: priming | partial reuse               | 17m 08s | 30m 55s         | 3s            |
| [2](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/2) | yes         | all dependency/compile hits | 15m 04s | 26m 58s         | 5s            |
| [3](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/3) | yes         | partial reuse               | 15m 00s | 26m 23s         | 5s            |
| [4](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/4) | yes         | partial reuse               | 15m 31s | 26m 41s         | 5s            |
| [5](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/5) | yes         | partial reuse               | 16m 46s | 28m 14s         | 6s            |
| [6](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42101244328/attempts/6) | yes         | partial reuse               | 15m 44s | 27m 17s         | 5s            |

- Workflow elapsed: median **15m 31s**, range 15m 00s–16m 46s.
- Summed non-skipped job time: median **26m 58s**, range 26m 23s–28m 14s.
- Cache behavior: 1 of 5 samples had explicit hits for every dependency/compile step; 4 retained partial reuse.

These are before-change measurements for later comparisons, not an optimization
gain. Selected job durations include setup and teardown; parallel spans cannot be
added to estimate workflow elapsed time.

| Job                                                    | Median | Range         |
| ------------------------------------------------------ | ------ | ------------- |
| ci / linter / 🧹 Lint Code Base                        | 2m 32s | 2m 26s–2m 39s |
| ci / build / Build image backend-ci for linux/amd64    | 1m 00s | 0m 54s–2m 10s |
| ci / build / Build image frontend-ci for linux/amd64   | 1m 10s | 0m 54s–1m 39s |
| ci / continuous-integration (frontend) / 🧪 Test       | 4m 27s | 3m 33s–5m 31s |
| ci / continuous-integration (backend) / 🧪 Test        | 1m 42s | 1m 27s–1m 48s |
| ci / build-prod / Build image frontend for linux/amd64 | 0m 52s | 0m 44s–1m 20s |
| ci / build-prod / Build image backend for linux/amd64  | 1m 43s | 0m 56s–2m 00s |
| ci / tests-charts                                      | 3m 10s | 3m 04s–3m 55s |

Discovered files and counts remain 162 backend files (1,218 passed / 60 skipped
tests) and 228 frontend files (1,178 passed tests). Printed coverage percentages
vary on unchanged inputs:

| Service  | Statements   | Branches     | Functions    | Lines        |
| -------- | ------------ | ------------ | ------------ | ------------ |
| backend  | 75.17–75.18% | 65.91–65.91% | 67.11–67.17% | 76.37–76.39% |
| frontend | 82.87–83.14% | 75.52–75.74% | 81.86–82.02% | 83.36–83.65% |

The underlying coverage denominator and case-level reports are unavailable in the
retained artifacts, so these percentages do not prove identical coverage maps.
Capture those before changing test environments or shards. Peak process memory
and effective test-worker counts remain unreported. Kind node tags are observed,
but their resolved digests and mutable chart dependency images are not fully
emitted; the baseline is not hermetic. The run evidence also retains Prisma
`P1001` log occurrences before successful chart installation for the planned
readiness work.

The [evidence bundle](./evidence/0023-ci-baseline.json) links every attempt's job
and step CSV, input identity, cache observation, printed test/coverage summary and
runner metadata. Its original strict cache-hit classification remains available
for comparison with the revised inclusion rule. P0 implementation and PR baseline
collection are complete; final documentation CI and user review gate P1. Main and
release measurements follow the publication-safe protocol above after review.

## Decision Drivers

- Shorten the critical path and reduce redundant runner work across all stages.
- Retain application, repository, security, coverage, and installation checks.
- Separate independent computation from approval to publish trusted artifacts.
- Preserve cold execution, deterministic input selection, and useful failure reports.
- Improve shared upstream tooling instead of copying it into Pleey.
- Keep independently useful local changes deliverable while upstream work proceeds.

## Considered Options

### Option 1: Tune Docker caching within the existing DAG

Useful for repeated builds, but leaves serial validation/deployment work, repeated
job setup, frontend browser environments, and Helm retries untouched.

### Option 2: Optimize the full DAG and each measured stage incrementally

Retain container-based checks, remove unnecessary barriers and setup, improve test
execution and readiness, and measure cache transfer as part of total runtime.
Introduce explicit candidate-artifact and publication gates where parallelism needs them.

### Option 3: Replace image-based checks with host jobs and build artifacts

Avoids some image distribution, but introduces another environment and contracts
for native dependencies, generated files, builds, and reporting. Benchmark this
only if the optimized container path remains dominated by image distribution.

### Option 4: Use larger runners or persistent builders/runners throughout

May reduce CPU or download costs, but adds compute expense or maintenance,
isolation, and cache-lifecycle responsibilities. Larger hosted runners are a
targeted experiment after CPU/memory measurement; a persistent runner fleet is
not the initial decision.

## Decision

Choose option 2. Implementation proceeds one phase at a time, with a separate PR
and CI validation for each phase. The user reviews each phase before the next
begins. Acceptance of this direction does not claim that optimizations have been
implemented or savings achieved. Adopt each change only with its correctness
checks and measured benefit; measure elapsed time and resource use separately.

### Execution graph and publication gates

Replace the global sequence of application checks followed by production work with
independent validation branches. The intended graph is:

```mermaid
flowchart TD
    S[Resolved source and build inputs] --> L[Repository and workflow checks]
    S --> B[Backend CI image]
    S --> F[Frontend CI image]
    B --> BC[Backend lint and tests]
    F --> FC[Frontend lint and tests plus merged coverage]
    B --> BP[Backend production candidate]
    F --> FP[Frontend production candidate]
    BP --> H[Fresh Helm installation and tests]
    FP --> H
    L --> G[Required CI result]
    BC --> G
    FC --> G
    H --> G
    BP --> G
    FP --> G
    G --> P[Promote tested digests and prepare release artifacts]
```

Image nodes include their required signing and attestations. Production candidate
builds start after their CI images, in parallel with application checks, and reuse
the completed CI cache. Helm needs both candidate digests, not the outcome of
unit tests. The final gate requires every expected validation branch and security
output to succeed. It evaluates failed, cancelled, and unexpectedly skipped jobs
explicitly; a skipped dependency must not produce a passing aggregate check.
This follows GitHub's [job dependency semantics](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs).

This requires a publication contract before changing `needs`. The existing
`images[].tag` override already selects a forced tag and disables `latest` in the
[metadata action](https://github.com/hoverkraft-tech/ci-github-container/blob/5ffc3c81daacc57700a14bb91d67edbc67eedc1d/actions/docker/get-image-metadata/action.yml).
Reuse it for run/attempt-scoped candidate identifiers without moving consumer tags
early. The missing contract separates temporary tags from planned destinations
and final OCI metadata, then governs promotion, reruns, and cleanup. Promotion
retags the tested immutable digest after the gate, without rebuilding. Supply the
planned release version/OCI metadata at build time, retain signatures/provenance,
and verify the promoted digest matches the chart-tested artifact. Validate the
rendered release chart again after release-file updates. Update required-check
configuration together with job names so branch protection remains effective.

Expose separate backend/frontend completions so frontend checks need not wait for
backend images. The current workflow already accepts a one-image list: Pleey can
use two explicit caller jobs, each with its own downstream lane. A matrix child
cannot release a downstream caller while the entire reusable-workflow call is
still running. Benchmark the extra publication/setup work from separate calls;
retain the shared barrier if that overhead outweighs the overlap until upstream
setup reductions land. Reuse the workflow rather than copying its internals.

For the illustrated PR/main runs, the application branch spans 338s/325s and the
subsequent production-plus-Helm branch spans 405s/506s. Ideal overlap could hide up
to 338s/325s. This is a critical-path model, not a forecast: queueing, contention,
promotion work, and cache changes can reduce the gain. Do not add this estimate
to individual setup/cache estimates. Speculative candidate work also increases
work on failing commits; measure that cost and retain superseded-PR cancellation.

### GitHub Actions parallelization plan

Use job parallelism for separate runners and bounded step parallelism for shared
setup. GitHub's current [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsparallel)
supports a `parallel` group and `background` with `wait`, including `uses` steps.
Joins expose outputs and propagate failures. Native concurrency cannot be declared
inside a composite action; an entire composite can run in the background from a
workflow. Verify runner/parser and workflow-linter support before adoption.

#### Separate jobs and matrices

Translate the intended DAG into the following dependencies. These are proposed
job names, not existing workflow inputs; candidate publication still requires the
contract described above.

| Proposed jobs                                  | Required predecessors (`needs`)                                               | Work that can overlap                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `repository-lint`, `backend-ci`, `frontend-ci` | None beyond resolved workflow inputs                                          | Repository checks and both service builds. Existing independent semantic/security checks remain parallel. |
| `backend-lint`, `backend-tests`                | `backend-ci`                                                                  | Each other, frontend checks, and backend candidate production.                                            |
| `frontend-lint`, `frontend-tests`              | `frontend-ci`                                                                 | Each other, backend checks, and frontend candidate production. Tests may become a shard matrix.           |
| `backend-candidate`                            | `backend-ci`                                                                  | Application lint/tests and frontend candidate production.                                                 |
| `frontend-candidate`                           | `frontend-ci`                                                                 | Application lint/tests and backend candidate production.                                                  |
| `frontend-reports` when sharded                | Every `frontend-tests` matrix entry                                           | Backend checks and candidate/chart work. Merge only after all shard results are available.                |
| `chart-install`                                | `backend-candidate`, `frontend-candidate`                                     | Remaining application tests, lint, and report aggregation.                                                |
| `ci-result`                                    | Every expected validation branch, report merge, and candidate/security result | Final aggregation only; require success rather than merely completion.                                    |
| `promote`                                      | `ci-result`, `backend-candidate`, `frontend-candidate`                        | No early publication; consume the tested digest outputs directly.                                         |

Lint and tests already overlap after the current Node setup/build gates. The
change removes those unnecessary prerequisites for prebuilt images and the wait
for the other service; it does not claim to introduce concurrency already present.

For the two-shard frontend experiment, use this native job-strategy fragment in
the upstream test-only job after shard arguments and artifact merging are supported:

```yaml
strategy:
  fail-fast: false
  max-parallel: 2
  matrix:
    shard: [1, 2]
```

Both shards should finish to provide complete diagnostics; either failure still
fails validation. Keep required jobs' `continue-on-error` disabled. Size
`max-parallel` against measured runner availability and registry/cache pressure;
it limits that matrix, not the entire workflow. The existing workflow `concurrency`
group cancels superseded runs and is not a substitute for matrix scheduling.
See GitHub's [matrix controls](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations).

#### Concurrent operations within one runner

Benchmark these only where shared setup is cheaper than another runner startup:

- In upstream chart preparation, overlap external Helm dependency preparation
  with kind creation after checkout and required tools are ready, after verifying
  they do not mutate shared files. Cluster credentials/secrets and chart installation wait
  for the required outputs; installation requires both operations to succeed.
  This needs an upstream orchestration change because today's operations live
  inside a composite action. The measured preparation span is 4–11s, so that is
  the overlap opportunity in those samples, not the full 45s kind bootstrap.
- After profiling application lint, trial a bounded pair of read-only checks
  with independent inputs, such as typechecking and a compatible source guard.
  Preserve each exit status and log. Keep code generation before its consumers,
  and serialize mutating formatters, dependency installation, and checks sharing
  writable outputs. Retain sequential execution if CPU/memory contention loses
  the benefit; do not parallelize all existing lint scripts indiscriminately.

Prefer native orchestration where phases already have workflow-level interfaces.
For the chart composite, compare exposing shared phases upstream with the smaller
change of supervising two CLI subprocesses internally; do not copy the action into
Pleey or repeat setup by invoking the complete action after external preparation.
For subprocesses, keep separate logs/statuses and propagate every failure. Both
approaches require bounded concurrency, explicit joins, cancellation and timeout
handling, and temporary-cluster cleanup. A successful final command must never
mask a failed child. Do not add an action solely to emulate platform concurrency.

### Reusable-workflow setup and image publication

- Set the existing Node workflow `build` input empty after verifying equivalent
  Dockerfile inputs. This skips duplicate compilation but still starts its build
  job. Upstream should remove that empty job and make tests independent of a
  missing build, while preserving an actual build dependency for non-prebuilt use.
- Move pure container/path/command normalization out of the Node `setup` container
  job. Validate known inputs once in the lightweight preparation job; do not pull
  each application image merely to prepare metadata. Lint and test containers
  can then start independently with the same resolved inputs. Keep filesystem
  existence/access checks inside those actual containers; metadata preparation
  cannot validate another container's `/usr/src/app`.
- Optimize the single-platform publication path to carry forward the build's
  digest/tag metadata without Docker/Buildx initialization or tag inspection.
  Actual manifest creation is already skipped for one platform; retain assembly
  and validation for multi-platform images.
- Give signing/attestation actions only their actual tools and authentication.
  Attestation needs subject metadata and the attestation action, not a Docker
  daemon. Preserve all subjects, signatures, provenance and permissions checks.
  Consider combining tiny metadata/security steps within a suitable job only if
  it does not broaden untrusted build-step privileges.
- Benchmark compiling CI/prod targets on one builder, including a
  [Buildx Bake](https://docs.docker.com/build/bake/) variant, against cross-job cache
  reuse. It may save repeated setup/export, but holding the CI image until both
  targets finish can delay tests. Do not adopt it solely because build time falls.

### Application tests, lint, and reports

Use [frontend Vitest configuration](../../../../application/frontend/vitest.config.js)
and [test setup](../../../../application/frontend/test/setup.ts) to split verified
DOM-free tests into a Node project with minimal setup. Keep component and
browser-dependent tests in jsdom. Classify by actual imports and behavior, not
directory names alone; keep discovery, isolation, mocks, and coverage equivalent.
The [Vitest performance guide](https://vitest.dev/guide/improving-performance.html)
supports reducing environment/setup overhead before adding workers.

Measure effective CPU count, worker count, memory, and slow files. Benchmark the
current `maxWorkers: '50%'` against runner-sized limits without disabling test
isolation or adding retries. Backend execution is much shorter, so keep one
backend test job initially.

If frontend tests remain critical, benchmark two frontend shards before increasing
the count. Use a test-only matrix, not copies of the entire Node workflow. The
current `test.command` is a package-script name passed as one argument; it is not
an arbitrary command line supporting appended shard flags. Upstream needs explicit
test arguments/shards and [Vitest report merging](https://vitest.dev/guide/improving-performance.html#sharding).
Upload uniquely named blob/coverage artifacts, require the complete shard set,
and merge once. Apply any configured coverage thresholds and publish coverage/annotations once
to the merged result. Preserve failures even when report upload/merge succeeds;
verify the same test inventory and coverage denominator as the unsharded run.

For both applications, use the existing explicit report-file inputs instead of
automatic discovery. Point tests at `junit.xml` and `coverage/lcov.info`. For lint,
emit a [supported Biome SARIF report](https://biomejs.dev/reference/cli/#reporter-flags)
and configure its exact path; validate failing-rule annotations and nonzero exit
status before replacing the current JSON output. Upstream should bundle the report
parser to avoid installing its Node dependencies inside every report step.

Do not cache passing tests, coverage decisions, lint decisions, or generated
reports across source revisions. Consider transform/typecheck caches only after
profiling: frontend transform accounts for about 3% of tracked phase time, so
cache transfer may outweigh the computation saved. Profile individual lint guards
and share repeated parsing within a process where demonstrated; do not blindly
parallelize memory-heavy TypeScript checks or remove architecture guards.

### Build, dependency, and artifact caches

Retain the existing GitHub Actions layer backend initially. Add upstream controls
for production to import both its own and its application's CI cache, while keeping
distinct target/platform/branch export scopes. Preserve `mode=max` on the CI graph;
compare production `min`/`max` using total import/build/export time. The pinned
workflow exposes `cache-type`, not arbitrary imports or export modes. Also compare
a registry backend if sustained export cost or eviction remains significant,
with separate trusted/PR write scopes and an explicit retention policy.

| Data                       | Reuse and invalidation contract                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BuildKit layers            | Versioned application/target/platform scopes within permitted branch access. Dockerfile instructions, copied inputs, build arguments and resolved base-image content determine validity. A scope name is not proof of matching content.                                                    |
| npm downloads              | Mount the effective npm cache path with the runtime UID/GID. Versioned key includes application, target, platform, Node/npm toolchain, Dockerfile and lockfile. Restore prefixes retain application/target/platform/toolchain identity. `npm ci` still runs when its layer is invalidated. |
| External Helm dependencies | Cache downloaded external packages using tool version, repository identity and dependency manifests/locks. Repackage local `file://` subcharts from current source; a lockfile alone does not identify their templates or values.                                                          |
| Generated/build output     | Pass the current run's digest-qualified images. Any prepared chart artifact also includes the source SHA and chart/input fingerprint. Do not restore installed dependencies, `dist`, Prisma/GraphQL output, or local chart packages from broad fallback archives.                          |
| Test artifacts             | Run/attempt/project/shard-qualified artifacts, with complete-set checks before merge. They transfer current results and never authorize skipping another commit's checks.                                                                                                                  |

Both Dockerfiles install as UID 1000 but mount `/root/.npm`; verify the effective
cache path and fix its ownership. Upstream cache-mount keys currently omit the
lockfile, and exact hits prevent snapshot refresh. Correct that download-cache
contract without claiming it currently causes stale installed dependencies.
Mount persistence and layer export are
[separate mechanisms](https://docs.docker.com/build/ci/github-actions/cache/#cache-mounts).

Keep dependency manifests ahead of source copies and include Prisma schema/config,
frontend GraphQL inputs, shared scripts, and build configuration in their consumers'
invalidation. Exclude local dependencies, build output, reports, and credentials
from the Docker context. The observed context transfer is only 0.2s, so this is
input hygiene, not a measured speed improvement.

Honor GitHub's [cache access restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#restrictions-for-accessing-a-cache).
Keep credentials outside cache contents and PR writers outside trusted cache refs.
Record cache sizes, hit rates, export duration, and eviction before adding capacity
or cleanup. Provide targeted bypass/reset and base-image refresh; elapsed time and
changed secret values do not automatically invalidate
[package-install layers](https://docs.docker.com/build/cache/invalidation/).
Do not add cache-mount extraction actions already supplied upstream.

### Repository lint

Keep repository lint concurrent with builds. Retain the already slim shared image
and parallel validator execution. Do not split it into jobs that each pay the
70–87s image pull without a measured net gain.

The [pinned shared image](https://github.com/hoverkraft-tech/docker-base-images/blob/f9548de813c9d592cbed18718ad64969c09a91f9/images/super-linter/Dockerfile)
and [Super-Linter documentation](https://github.com/super-linter/super-linter/blob/v9.0.0/README.md)
establish the existing slim/parallel behavior. In `hoverkraft-tech/docker-base-images`
and `ci-github-common`, profile image layers
and per-validator durations, remove demonstrably unused tool content from a
maintained image profile, and benchmark separate security/general-lint profiles
only where smaller pulls outweigh added startup. Preserve enabled scanners and
their input sets, including rendered-chart scans. Time-dependent vulnerability
databases need freshness checks; they are not identified by the application SHA.
CodeQL Actions analysis and action pinning are short independent checks and stay.

### Helm installation and setup

First address the observed database race in the
[migration job](../../../../charts/application/charts/backend/templates/migration-job.yaml)
and [backend deployment](../../../../charts/application/charts/backend/templates/deployment.yaml):
wait for bounded authenticated database readiness rather than only a secret file,
preserving explicit failure and migration diagnostics. The
[PR chart log](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42039011250/job/127291211531)
and [main chart log](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/42004084531/job/127174316167)
show the failed attempts. Measure eliminated retries in fresh installations. Do
not shorten timeouts, suppress migration errors, or reuse a live database to make
the chart job appear faster.

Propose a small readiness command in the production backend image, reusing its
installed Prisma client/adapter for an authenticated query. Both init containers
use the workload image and the existing secret URI, with bounded connection/query
attempts and an overall deadline. Verify imports in the pruned image; replace the
BusyBox-specific defaults coherently. This avoids another client image while
preserving external-database/TLS support and sanitized failure diagnostics.

Keep a fresh kind cluster and the full umbrella installation. Benchmark the existing
upstream [ci-helm tool image](https://github.com/hoverkraft-tech/docker-base-images/blob/3083aa27c7ec3bab1d5f0d200aae1576fabcdb73/images/ci-helm/Dockerfile)
against installing tools, including compatibility and pull cost.
Cache eligible external dependency downloads as above. Record kind bootstrap,
image pulls, operator/database readiness, migrations, tests, and cleanup separately.
Preloading pinned images or larger runners remains an experiment when those
measurements justify the transfer/compute cost; do not archive the entire Docker
daemon or persist cluster state.

The action already exposes separate lint/install switches, but invoking it twice
duplicates preparation for under 1s of lint. Move static chart validation earlier
only if upstream provides reusable prepared inputs/tooling at a net gain. Preserve
local subchart source identity when transferring a prepared artifact. The main
elapsed-time opportunity is overlapping installation with application checks.

### Auxiliary workflows, main, and release

PR/main concurrency cancellation already exists; retain it. Do not cancel an active
release halfway through publication. Keep semantic checks, release preparation,
and issue automation independent from heavy CI; they are short and do not explain
the current critical path. Restrict greetings to the required PR lifecycle event
instead of repeating first-interaction work on every synchronization.

Main's registry cleanup is already parallel. Consolidating its four per-image jobs
upstream may save runner/setup work, but cannot shorten today's critical path.
Prepare generated Helm docs independently when their source inputs are available;
gate bot writes on successful CI, and omit generation when relevant chart/generator
inputs have not changed. Keep generated readmes under their existing generators.

After the core DAG is stable, add conservative job-level input routing for
documentation-only changes and unaffected services. The required aggregate check
must still run and validate the routing decision. Include shared scripts, GraphQL
schema/codegen, workflow/action configuration, Dockerfiles and chart inputs in the
dependency map; unknown changes and routing failures run the full pipeline. Keep
main/release full initially. This is an explicit scheduling policy, not a cached
test result or a top-level path filter that leaves required checks pending.

Release optimization can reuse a previously tested, trusted main image only when
the exact source and complete build-input identity match, provenance is retained,
and freshness policy permits it. Source SHA alone is insufficient for mutable base
images, toolchain inputs, or release-specific metadata. Otherwise rebuild. Do not
promote a PR artifact based only on its branch name. Validate chart packaging after
release-file mutations; do not reuse test evidence for a different rendered chart.
This is a later experiment, not a prerequisite for the candidate DAG.

### Delivery sequence and ownership

| Wave                      | Pleey changes                                                                                                                                                     | Upstream changes / dependency                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: Independent reductions | Disable duplicate compilation; verify npm mount; explicit reports; Node/jsdom test split; profile workers and lint; fix chart readiness; narrow greeting trigger. | None required for the initial candidates. Validate each separately.                                                                                                                                                                                                 |
| 2: Remove setup overhead  | Adopt reviewed pinned releases; retain current publication ordering meanwhile.                                                                                    | `ci-github-nodejs`: lightweight prepare and optional build dependency. `ci-github-common`: bundled report parser. `ci-github-container`: single-platform metadata path, minimal signing/attestation setup, cache controls/keys, measured chart-preparation overlap. |
| 3: Shorten the DAG        | Benchmark explicit per-service calls using existing inputs; add candidate branches, final required gate, branch-protection migration and digest promotion.        | `ci-github-container` candidate-only tag policy and promotion contract. Do not remove existing publication gates before these exist.                                                                                                                                |
| 4: Profile-driven scaling | Two frontend shards if still critical; conservative change routing; compare runner classes and release reuse.                                                     | `ci-github-nodejs` test-only shards and merged reports/coverage; optional linter/tool image profiles in `ci-github-common` and `docker-base-images`.                                                                                                                |

If an upstream change is unavailable, retain the independently measured local
improvements and current safe gate. Do not invent unsupported inputs, fork whole
reusable workflows, or turn upstream dependencies into a blocker for all of #475.
Change action metadata/source and regenerate any affected readmes upstream.

### Measurement and acceptance

Capture source/action revisions, resolved images/toolchains, runner class/CPU,
queue delay, job/step timing, critical-path spans, peak memory, cache transfers,
image bytes, report time, and resource usage. Separate PR, main and release;
separate warm, cold, dependency-changing and source-changing samples. Measure the
whole workflow and time to first actionable failure, not just one faster command.

Compare at least five consecutive runs after cache priming before/after each
candidate, retaining cache misses and recording
median and range. The target for the combined work is at least 10% lower median
elapsed time for targeted workflows, without increasing median summed job time
for successful runs. This is an acceptance target, not a predicted saving.
Measure failed/cancelled-run resource usage separately because speculative work
can increase it. Larger runners also require a cost comparison. Individual changes
may yield smaller gains or fix invalidation/readiness without material regression.
Do not require every small change to achieve the aggregate 10% target.

Validation must include:

- Fully bypassed layer and mount caches; lockfile, source, Prisma/schema,
  shared-script, build-config, Dockerfile/base-image, and local-chart changes.
- Same discovered tests, isolation and coverage denominator after environment or
  shard changes; missing/failed shards fail the gate; reports preserve failures.
- Actual overlap in the Actions timeline, bounded matrix/worker/step concurrency,
  and failure propagation/cleanup for native steps and subprocesses. Confirm
  extra parallel jobs do not just move execution time into the runner queue.
- A deliberate lint/test/chart/security failure and unexpected skip/cancellation;
  none may promote a candidate or produce a passing required check.
- Digest identity through build, signing, attestation, chart testing and promotion;
  release metadata and rendered chart verified after release preparation.
- Fresh database bootstrap without relying on failed-migration retries, recovery
  diagnostics on genuine failure, and unchanged chart validation coverage.
- Safe PR/trusted cache boundaries, reruns, superseded-run cancellation, and a
  representative release path without publishing a release just to benchmark it.

Cold-cache reproducibility means successful builds and equivalent behavior from
declared inputs, not byte-identical images from mutable OS package repositories.
Report variance and reliability failures; collect more samples when timing ranges
overlap substantially. Roll back regressions/flakiness, and record dated results
with the ADR and implementation review. No optimization has been benchmarked here.

## Consequences

### Positive

- Addresses serial waiting, test/runtime overhead, setup, readiness and cache costs.
- Preserves the [test strategy](./0005-adopt-the-current-test-strategy.md) while
  making publication depend on explicit evidence from every required branch.
- Shared improvements benefit other upstream users; local work remains separable.

### Negative

- Candidate promotion and test sharding need upstream contracts; separate service
  calls can use the current workflow but may duplicate setup until optimized.
- Parallelism can increase memory pressure, queueing and wasted work on failures.
- More cache/artifact types need input identity, retention and recovery checks.
- Required-check migration and release metadata need careful validation; elapsed
  gains cannot be inferred by adding individual benchmark savings.

### Follow-Up

- Review each phase PR and its CI evidence before beginning the next phase.
- Track work in the [implementation checklist](../../plans/issue-475-ci-optimization.md)
  under #475, with measurements and reviewable upstream proposals.
- Document adopted inputs, scopes, DAG, routing and recovery in the
  [development guide](../../development/index.md) alongside implementation.
