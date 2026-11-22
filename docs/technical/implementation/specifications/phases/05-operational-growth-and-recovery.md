# Phase 05 - Operational growth and recovery

## PR outcome and dependencies

Produce one PR that automates operation of the already correct P4 application: planned worker growth, completed drain before scale-down, compatible rolling releases, scheduled backup/restore verification, capacity evidence and actionable observability.

Read `../EXECUTION-CONTRACT.md`, `../DOMAIN-CONTRACTS.md`, `../ACCEPTANCE-CATALOG.md` and `../SOURCES.md`, then the completed P1-P4 specifications and current repository instructions. This phase depends only on P1-P4. It does not depend on PWA work.

Suggested branch: `feat/operational-growth-and-recovery`.

Suggested PR title: `feat(operations): automate safe fleet changes and recovery verification`.

P4 already supplies Better Auth, authorization-before-state, durable command receipts, PostgreSQL ownership fencing, working two-worker routing, native and process-failure recovery, mobile browser recovery and production images. Do not describe any of these as newly deferred P5 correctness work. Fix a regression discovered while implementing this phase before merging.

Anonymous-identity retirement and deletion have been production requirements since P2. P4 already executes active-participant expiry through its fenced game command lane. P5 adds operational visibility, capacity evidence and restore automation around that functioning lifecycle; it is not the phase that first makes guest identities temporary.

## Scope and production capability

After this PR, an operator can inspect the fleet, plan and execute an N-worker change, cancel a drain, deploy a compatible release, create/check a backup and rehearse restoration using documented commands. A completed operation has machine-readable evidence tied to the source release, topology and affected worker identities.

Fixed worker counts remain the production default. Optional automatic growth uses standard Kubernetes HPA and is scale-up only for game workers. Automatic game scale-down is prohibited in this phase. Scale-down uses the explicit completed-drain workflow below. Do not add KEDA, a custom long-running fleet controller, a paid metrics service or another control plane.

The supported release workloads remain 500 players in one party and a separate workload of 20 concurrent parties with 50 participants each. A single party remains on one game process. Adding replicas does not split a large party across processes.

## 1. Define one operational command boundary

Add an operations CLI under `scripts/operations/`, exposed by `pnpm ops`. It uses the operator's existing Kubernetes credentials or authenticated Docker daemon access. It must not mint application service accounts, copy browser cookies into command lines or introduce a second API-key system.

Required commands:

| Command | Required behavior |
| --- | --- |
| `pnpm ops status` | Read current release, topology, worker states and operation status; no mutation |
| `pnpm ops plan-scale --replicas N` | Validate bounds and produce a concrete plan with current resource versions and stable worker IDs |
| `pnpm ops apply-scale --plan FILE` | Execute that exact still-valid plan idempotently; refuse topology drift |
| `pnpm ops cancel-drain --operation ID` | Cancel an incomplete eligible drain and restore admission after checks |
| `pnpm ops plan-release --manifest FILE` | Validate compatibility, capacity and image/schema manifest; produce the release order |
| `pnpm ops apply-release --plan FILE` | Apply the exact supported release plan and record its result |
| `pnpm ops backup` | Create a complete DB/media backup set with manifest/checksums |
| `pnpm ops verify-backup --manifest FILE` | Verify completeness, readability, age and required object checksums |
| `pnpm ops restore-rehearsal --manifest FILE` | Restore only into new isolated resources, run smoke checks and emit evidence |

Document required environment/target flags in the command help. Default mutation commands must require an explicit target deployment; never guess production from a current shell directory. A dry-run or plan cannot mutate resources. Invoke subprocesses with fixed executable/argument arrays, not concatenated shell strings. Do not log kubeconfig, database connection strings, cookies or signed storage URLs.

Every plan records `operationId`, deployment identity, requested count/release, observed replica count, bounds, resource versions, affected worker IDs, source/target manifests and timeout policy. Repeated execution of the same plan must reconcile observed state instead of creating duplicate operations. Unexpected drift returns a conflict with no destructive continuation.

## 2. Add a local worker operations listener

Provide an HTTP listener bound only to `127.0.0.1` inside each game container, on an explicit operations port. Do not expose it through a Service, Ingress, Compose host port or `0.0.0.0`. The CLI reaches it using `kubectl exec` or `docker compose exec` and a small in-container Node client. Container exec authorization is the operator boundary; there is no public administration-to-worker RPC.

Required routes:

- `GET /status`: worker ID, process instance ID, release, lifecycle state, owned room count, in-flight command count, pending seat count, lease count and active drain operation.
- `POST /drain`: JSON containing operation ID and expected process instance; begins or resumes the same drain.
- `POST /resume`: cancels a matching incomplete drain after checking current identity and topology.

Reject browser-origin requests, CORS preflight, unsupported content types/methods and mismatched process identities. Accept mutation JSON only with the dedicated nonsecret local-operation header used by the in-container client. This blocks incidental browser form requests; it does not replace the loopback/exec boundary. Treat all containers sharing the game Pod network namespace as privileged and do not add untrusted sidecars.

The listener changes infrastructure lifecycle only. It cannot award points, impersonate a player, bypass authorization, edit submissions or perform direct game-table mutations. Existing business actions continue through P4's command queue, transaction and ownership checks.

Persist drain intent against the stable worker ID and operation generation so a restarted worker cannot begin admitting new rooms during a scale-down. A new process reads that intent before becoming admission-ready. Keep operation state and audit records separate from gameplay records; use bounded retention and no secret payloads.

## 3. Implement completed drain and predictable scale-down

Worker lifecycle is `ACCEPTING -> DRAINING -> DRAINED`. Cancellation may return `DRAINING -> ACCEPTING` only while the worker remains in the desired fleet and the operation generation matches. A drained worker never starts a new room until an explicit valid resume or later scale-up clears its drain intent.

Entering `DRAINING` must atomically prevent new room assignment/creation. Existing rooms remain available, and existing participants can reconnect or reattach through their current valid owner. Do not mark the only Kubernetes readiness probe false if that removes endpoints required by those rooms. Separate admission readiness from transport readiness.

`DRAINED` requires all of the following, observed under the worker's lifecycle guard:

- No resident rooms that can still execute commands.
- No pending native seat reservations.
- No in-flight or queued game mutations.
- No retained party ownership leases.
- No pending post-commit projection work.

Rooms finish naturally or follow P4's safe empty-runtime disposal/reconstruction policy. Do not end parties, discard answers or silently restart rounds to accelerate draining. An active party may outlast the maintenance budget. In that case the operation remains blocked or is cancelled; it must not declare success and kill the worker.

Use stable ordinal worker identities in Kubernetes and set the game StatefulSet's `updateStrategy.type` to `OnDelete`. Applying a new Helm/GitOps pod template must not automatically replace undrained game Pods. Reduce the highest ordinal first, matching StatefulSet scale-down behavior. Pre-create routes/services for the configured maximum worker count so scale-up does not publish an owner address before its route exists. A room's native path still includes the framework process/room identifiers required by P4.

The CLI must request drain, observe `DRAINED`, recheck the process/operation identity and topology preconditions, and only then reduce desired replicas. A 30-second `preStop` delay is not this workflow. Graceful shutdown hooks remain a fallback for unexpected termination and use P4 durability; they are not evidence that voluntary scale-down waited correctly.

For Compose, generate explicit stable worker services/routes from the desired count. Do not blindly use generic `docker compose --scale` against a route that cannot identify each owner. The generated override is an operational artifact derived from configuration, not a second hand-maintained deployment definition.

If Kubernetes HPA is enabled for games, suspend/remove that managed HPA through the same deployment configuration before manual downscale, wait until it no longer controls replicas, then create the scale plan. Re-enable it only after completing and reconciling the new bounds. If a GitOps controller owns these values, generate the desired configuration change and wait for that owner; never fight reconciliation with repeated live patches.

## 4. Add optional automatic growth and capacity bounds

API HPA may use normal measured CPU/resource policies. Game HPA MUST set `behavior.scaleDown.selectPolicy: Disabled`. Game automatic scale-up is opt-in, bounded by configured minimum/maximum replicas and PostgreSQL connection budgets. Fixed/manual topology is fully supported without a metrics server.

When HPA owns game replica count, Helm/GitOps must not reapply a stale fixed replicas value. Implement and rehearse the actual field-ownership/ignore policy for the deployment tool, preserving the observed count when enabling or disabling HPA. Removing a replicas field must not transiently reset the workload to a default count and terminate undrained workers. Any intended count decrease still goes through the completed-drain path after HPA ownership is safely relinquished.

Use standard HPA metrics available in the target cluster. Fail validation if autoscaling is enabled without its required metrics API. Do not treat missing metrics as zero load. Choose conservative scale-up steps and stabilization from the measured workload; record the values and evidence. CPU thresholds alone are not a claim that a particular participant capacity is guaranteed.

Before admitting a new party, enforce the configured safe per-worker capacity and queue/resource bounds already supported by the application. A worker is eligible only when its dependencies, routing, runtime version and admission state are valid. New capacity becomes usable only after those checks pass.

Compute the database connection budget across API workers, game workers, migrations and operations. Reject a replica plan that exceeds the declared database budget. Reserve explicit operational/migration headroom. Do not multiply every process's previous pool default by the maximum replica count.

The original replica bounds and HPA state are retained in operation evidence. If scale-up fails partway, keep the last healthy valid topology and report incomplete work. If downscale stalls, retain the worker and original capacity; an operation timeout is not authorization to force termination.

## 5. Implement compatible release automation

P1's immutable manifest expands through P4 to logical API/web/game roles. P5 release planning must validate all digests, source/version metadata, database migration requirements, wire compatibility and runtime reconstruction format before mutating infrastructure.

For compatible releases, use a tested ordered procedure: validate/preflight, run the one migration job, make replacement capacity ready where needed, apply the OnDelete game pod template, drain one game worker completely, then explicitly delete/recreate ONLY that worker after rechecking its DRAINED process/operation identity. Verify readiness and room admission before continuing. Template application alone must not terminate another worker. Keep existing room routes available until their owner is drained. API/web may use ordinary tested rolling behavior and must preserve the currently declared wire contract and stale-client handling.

Compatibility means the exact source/target release pair was tested against the target schema and game contract. A version string or a broad semver range is insufficient. Do not keep a legacy protocol adapter merely to advertise rolling upgrades. When schema/wire/game reconstruction is incompatible, the tool must refuse the rolling plan and generate the documented maintenance procedure with an explicit admission freeze.

Unexpected process termination still uses P4 recovery and persisted deadlines. This phase does not promise uninterrupted connections during every deployment. It promises that the declared deployment procedure preserves committed game effects and completes within its measured recovery behavior.

On failure, halt further replacements. Continue serving through healthy compatible workers. A rollback may use prior images only when the recorded schema/wire compatibility allows it. Never automatically restore a database snapshot after new gameplay writes. Prefer a forward fix for incompatible post-write failures.

## 6. Schedule backups and prove restoration

Extend P1's tested backup/restore tools into scheduled operation using ordinary CronJobs or host scheduling. Support local durable backup storage and a self-hosted private S3-compatible destination. No proprietary backup service is required. Restrict backup credentials and protect stored backups and transport using the deployment's configured encryption/access controls; never implement custom cryptography.

A backup set contains database dump/snapshot metadata, referenced media manifest, media object checksums/version identifiers, release manifest, schema identifier, timestamps and completion status. Keep secrets outside the distributable manifest.

Coordinate the database snapshot and media inventory. Suspend destructive media garbage collection for the snapshot/copy window, or use the implemented protection record that guarantees every referenced immutable object remains available. New uploads may continue; the backup includes exactly the media referenced by its database snapshot. Release protection safely after success or an explicitly handled failure. A database-only dump is not a complete Pleey backup.

Default scheduled backup frequency is at least daily. Record the configured disaster-recovery RPO separately from the P4 guarantee of no acknowledged effects lost after a game-process failure with intact PostgreSQL. Do not imply a daily backup provides zero-loss database disaster recovery.

Run an automated restore rehearsal at least weekly into isolated resources, including account ownership, content, quiz/prediction history and private media access. Never send real recovery emails from rehearsal or connect restored sessions to the public deployment. Validate the restored release/schema pair before running application smoke tests. Cleanup only rehearsal-owned resources; retain sanitized evidence and backup health status.

Before reopening a deployment restored from a historical backup, execute the D12 authentication cutover: invalidate restored native sessions, room/seat capabilities and one-time reset/Verification records. Before transfer workers run, terminalize all restored nonterminal transfers as RESTORE_INVALIDATED or RESTORE_INVALIDATED_PARTIAL, preserving only ownership steps already committed in the restored database. Do not replay restored verification proof, even if its deadline has not expired; new transfer work requires fresh verification. Require fresh registered-account sign-in, then reconcile anonymous retirement using current time and the bounded idempotent workflow. Run lifecycle checks before admitting public traffic and keep normal bounded sweeps active. Preserve participants/results without recreating deleted guest auth users or issuing replacement cookies from a migration map.

A database snapshot cannot reveal revocations, deletions or transfer outcomes committed after its recovery point. The restored deployment must not treat old credentials as proof that those later actions never occurred. Document this limitation, the session cutover and its effect on guest recovery in the disaster procedure. A lost guest credential has no nickname/IP-based recovery route; a registered account can authenticate again. This disaster restore policy is separate from an ordinary compatible release and from P4 game-process recovery with intact PostgreSQL.

Retention cleanup must preserve the configured minimum successful restore-tested sets. A failed new backup or failed rehearsal cannot delete the last known recoverable backup. Alert on stale, incomplete or unreadable backup sets.

Backup sets have their own explicit retention/access policy and may still contain identities deleted from the live database. Do not describe a live-row deletion as immediate erasure from every backup. Record when each backup set expires, prevent accidental restoration into a public environment, and preserve the minimum recoverable sets according to the documented backup policy.

## 7. Make observability actionable

Use the existing OpenTelemetry integration. Export remains optional for startup/gameplay, and self-hosted collection works without paid services. Provide collector configuration, metric definitions and a documented dashboard/alert recipe usable with the selected deployment's observability backend.

Measure command queue delay, transaction latency, request outcome, receipt replay/conflict, current room count, native reconnect versus durable reattachment, ownership changes, rejected stale owners, lease-renewal failure, projection reloads, room admission rejection, worker lifecycle, release version and backup/restore health.

Add low-cardinality anonymous-lifecycle measurements: current registered-account and live-anonymous counts separately; anonymous creation and successful deletion rates; eligible backlog count and oldest eligibility age; last successful sweep and sweep duration; retry/failure counts; transfer counts/oldest age by finite workflow status; and pending active-participant detach work. History participation count is a separate storage-growth measure, not a failed authentication cleanup count. Surface protection reasons such as a still-valid session or an unexpired verified transfer separately from retryable failures, without publishing identity IDs or proof material.

Measure PostgreSQL live/dead tuples, table/index sizes, autovacuum progress/age, WAL generation and database pool pressure for the relevant tables. Guest creation/deletion causes churn even when the live identity population is bounded. Validate the existing indexed candidate selection, batches of 100, bounded work budget and catch-up behavior under the declared supported gameplay workload. The scheduler supplied by P2 remains `@nestjs/schedule` plus durable PostgreSQL coordination; multiple API replicas and worker restarts must not multiply effects or create an unbounded in-memory backlog. P4 retains exclusive ownership of live membership transitions. Add neither a separate cleanup service nor direct operations-CLI writes to active game rows.

Tune measured indexes, sweep budgets and ordinary autovacuum settings before introducing physical partitioning. A 99% guest ratio alone is not evidence that sharding or partitioning is required. Do not schedule `VACUUM FULL`, disable autovacuum or hold one transaction across an entire historical cleanup as a routine fix. Physical disk allocation need not shrink immediately after deletion; report live row growth and reusable space separately from the filesystem footprint.

Do not use party, participant, session, command or room identifiers as metric labels. Authorized structured logs may carry relevant identifiers for investigation, with retention/access controls. Never emit cookies, reset links, reconnect capabilities, private answers or signed media URL queries.

Define alerts with a symptom, threshold/window, operator action and runbook link. Include failed/stalled drain, rising command queue latency, repeated process recovery, inability to establish ownership, database pool exhaustion and stale/failed backups. Test alerts by producing their actual condition in isolation, not by asserting that a YAML file exists.

Include a missed anonymous sweep, growing oldest-eligible age, transfer work exceeding its defined deadline and sustained auth-table churn or autovacuum backlog. The runbook must first restore safe processing or investigate a protected record; it must never recommend deleting a valid session, silently dropping transfer proof or cascading through results to reduce a count. Measure drain time for the test backlog and record the supported intake/catch-up envelope. Satisfy the common contract's one-hour eligible-backlog gate under healthy dependencies and the declared supported churn. A healthy steady workload must not produce an indefinitely increasing eligible backlog. Use successive cohorts with 99% anonymous participants and controlled expiry to demonstrate that live anonymous identity counts reach a bounded steady state while retained participation history can continue growing.

## 8. Acceptance cases and measurements

| ID | Scenario and required result |
| --- | --- |
| OPS-001 | Status/plan commands are read-only and include exact current release, worker IDs, bounds and resource versions. |
| OPS-002 | The operations listener is reachable through authorized container exec but unreachable from public ingress, other application containers/Pods and published host ports. Browser-origin mutations fail. |
| OPS-003 | Drain stops new room assignment while existing gameplay and authorized reconnection continue through the same owner. |
| OPS-004 | Scale-down keeps the highest-ordinal worker running until every drained condition holds; long-lived parties block or cancel the operation without forced termination. |
| OPS-005 | A draining worker restart retains the drain intent before admission; stale process IDs or stale plans cannot resume or remove a different instance. |
| OPS-006 | Repeating an interrupted scale operation converges without duplicate workers, conflicting routes or duplicate durable game effects. |
| OPS-007 | Scale-up creates routing before eligibility, respects DB pool/capacity bounds and leaves a healthy topology on partial failure. |
| OPS-008 | Optional game HPA scales up within bounds, never down. Enable/disable and Helm/GitOps reconciliation preserve replica ownership/count without terminating undrained workers. Missing metrics fail explicitly; fixed-count deployment still works. |
| OPS-009 | Applying the OnDelete game template alone leaves all undrained Pods running. A compatible release then drains/replaces only confirmed workers in order with the exact three-image manifest; incompatible rolling release is rejected before mutation. |
| OPS-010 | Kill/pause/lease-loss tests during an operational change preserve P4 ownership and durable-command invariants. |
| OPS-011 | A complete backup taken while media uploads/cleanup race restores a consistent database and every referenced media object. |
| OPS-012 | Failed backup/rehearsal cannot remove the last recoverable set; stale backup status triggers an actionable alert. |
| OPS-013 | Restore rehearsal uses isolated resources and suppresses external email/telemetry leakage; cleanup cannot affect production. |
| OPS-014 | Actual queue, ownership, drain and backup failures produce sanitized telemetry and the documented alerts. |
| OPS-015 | Declared 500-player single-party and 20-by-50 concurrent-party workloads meet P4 latency/recovery gates on recorded hardware. |
| OPS-016 | Twice each workload preserves integrity and bounded overload behavior; report observed limits rather than claiming unmeasured capacity. |
| OPS-017 | Disabling new automation restores the supported P4 fixed topology without erasing game state or requiring P6. |
| OPS-018 | Under the supported gameplay workload and declared churn, create/expire successive cohorts with 99% guests, stall/restart sweep and game workers, then resume processing across multiple replicas. With healthy dependencies, the eligible backlog meets the common one-hour drain gate and live anonymous counts reach a bounded steady state without duplicate retirement, valid-session deletion, lost scores, unauthorized mutations or failure of P4 latency/recovery gates. Missed sweeps, overdue transfers and backlog growth trigger the documented alerts; history growth is reported separately. |
| OPS-019 | Restore a backup containing expired guests, sessions later revoked in the source deployment, detached history and transfer workflows at multiple stages. Before public admission, the authentication cutover invalidates restored sessions/seats and one-time reset capabilities, terminalizes all restored nonterminal transfers without replay of old proof, preserves restored committed steps, and safely reconciles anonymous retirement using current time. History remains readable to authorized users, deleted guest identities are not recreated for attribution, and the report states the recovery-point and backup-retention limits. |

At the supported workload, retain p95 command latency below 500 ms, p99 below 1.5 seconds, warm recovery p95 below 3 seconds after execution/network return, and process-failure reattachment p95 below 15 seconds under the declared healthy-storage lease conditions. Include queue delay in latency. Repeatable burst schedules must include many answers near round deadlines. At stress load, no duplicate effects, stale-owner commits, unauthorized actions or unbounded queues are permitted; explicit admission/backpressure is valid.

## 9. Ordered implementation and PR evidence

- [ ] Verify P4 baseline gates and record the source deployment manifest.
- [ ] Add versioned operation plans, idempotent CLI execution and local worker lifecycle control.
- [ ] Add persistent drain intent and prove admission/transport readiness separation.
- [ ] Implement stable N-worker rendering and completed highest-ordinal drain before scale-down.
- [ ] Add opt-in scale-up-only HPA and DB/capacity preflight checks.
- [ ] Implement exact-pair release planning, compatibility refusal and bounded rollout recovery.
- [ ] Automate complete DB/media backup schedules and isolated restore rehearsals.
- [ ] Preserve the already-running guest lifecycle; add backlog/churn diagnostics and prove safe identity cutover and lifecycle reconciliation after restore.
- [ ] Add telemetry, tested alerts, runbooks and measured capacity records.
- [ ] Run OPS acceptance cases and the applicable cumulative release gates.
- [ ] Remove redundant operational scripts and attach the complete evidence bundle to the PR.

Use the command interface in the execution contract. Required examples include:

```bash
pnpm verify
pnpm test:integration --phase 05
pnpm test:e2e --phase 05
pnpm test:release --phase 05 --profile compose --output artifacts/phase-05/release.json
pnpm test:release --phase 05 --profile helm --output artifacts/phase-05/helm-release.json
pnpm test:upgrade --phase 05 --from artifacts/approved-release.json --to artifacts/candidate-release.json
pnpm test:restore --profile isolated
pnpm deploy:render --profile helm
```

Use actual approved/candidate manifest paths in the PR evidence; do not fabricate them. Shared full CI remains required. Do not rerun unrelated suites repeatedly when no new risk remains; use the registered case selector for adaptive investigation.

## 10. Rollout, rollback and independence proof

Deploy P5 with automatic game scaling disabled and the existing known-good replica count. Verify local listener isolation, status/plan, one cancelled drain, one completed scale change and a backup rehearsal. Enable optional HPA only after its exact topology/metrics prerequisites pass. Keep a reproducible fixed-count configuration as the ordinary fallback.

If automation fails, stop it, retain or restore the last valid desired count through the tested workflow, cancel eligible drains and operate the P4-compatible fleet manually. Do not force a scale-down or restore a database to make the operation appear successful. Application/schema rollback follows the recorded compatibility matrix; backup restoration is a separate disaster-recovery action with an explicit recovery point.

**Independence proof:** after merge, Pleey supports fixed-count production operation and the complete tested operational tooling above. No future PWA, metrics service, fleet controller or data-repair PR is needed to use, disable or recover from these capabilities.

## Evidence references

- [Colyseus scaling model](https://docs.colyseus.io/scalability)
- [Colyseus SDK load testing](https://docs.colyseus.io/tools/loadtest)
- [Existing Helm deployment source](https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/charts/application)
- [Existing immutable release validation](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/.github/workflows/release.yml)
