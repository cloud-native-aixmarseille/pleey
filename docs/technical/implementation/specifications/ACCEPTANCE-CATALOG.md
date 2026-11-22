# Acceptance catalog and evidence rules

The detailed scenarios and assertions live in the acceptance table of each phase file. This catalog indexes them without creating a second, potentially different definition. Each ID is a stable requirement identifier, not proof that a test has already run.

| Phase | Required IDs | Main verification boundary |
| --- | --- | --- |
| [01](phases/01-reproducible-production-delivery.md) | DEL-001 through DEL-017 | Workspace, immutable artifacts, isolated migrations, HTTPS deployment, media, restore and compatibility bootstrap |
| [02](phases/02-unified-identity-and-sessions.md) | AUTH-01 through AUTH-26 | Real cookie sessions, current HTTP/game consumers, SQL uniqueness, account transfer, revocation, reset, nullable history, migration and bounded anonymous retirement |
| [03](phases/03-rest-management-and-frontend-data.md) | HTTP-001 through HTTP-017 | Full operation migration, generated contract, permissions, uploads, caches and current timed/untimed gameplay |
| [04](phases/04-durable-colyseus-gameplay.md) | GAME-01 through GAME-29 | Domain rules, ordered transactions, receipts, private state, two-worker failures, mobile recovery and measured load |
| [05](phases/05-operational-growth-and-recovery.md) | OPS-001 through OPS-019 | Actual fleet changes, completed drains, template replacement, backup/media consistency and operational diagnostics, anonymous churn and restore-time identity retirement |
| [06](phases/06-installable-pwa-and-safe-updates.md) | PWA-001 through PWA-016 | Built HTTPS service workers, cache privacy, installed/ordinary mobile contexts, updates and retirement |

Total: 124 named acceptance cases. A case can contain several necessary race/failure variants. The count is not a target for test-file count or a claim of coverage percentage.

Revision 2 (2026-11-22) adds AUTH-19 through AUTH-26, HTTP-017, GAME-27 through GAME-29 and OPS-018 through OPS-019. These 14 cases make guest retention a release gate, not an optional cleanup phase.

## Cumulative behavior, current transport

After a phase merges, its product invariants remain required. When a later phase removes a transport, port the behavioral assertion to the sole new transport and record that mapping. For example, AUTH-04 proves exclusive identity across current consumers: Phase 02 uses GraphQL and Socket.IO; Phase 03 replaces GraphQL with REST; Phase 04 replaces Socket.IO with Colyseus. Do not retain deleted technologies merely to keep an old test fixture passing.

Only requirements applicable to the current phase's deployed capabilities block that phase. A Phase 01 test must not import a future Colyseus application. This is not allow-failure: the new behavior's tests become mandatory in the same PR that introduces it. Already required invariants cannot be postponed.

## Test layers

| Layer | What it proves | Insufficient substitute |
| --- | --- | --- |
| Pure rules | Lifecycle/scoring invariants and model-based command sequences | Snapshotting implementation internals |
| Real database | Unique membership, shared transactions, locks, receipts, takeover and revocation ordering | Mock repository always returning success |
| Real server/SDK | Admission/reconnect/auth-before-state, messages, routing and projections | Handwritten imitation of the SDK wire protocol |
| Browser | Cookies, identity changes, UI states, multiple tabs, route lifetime and actual worker lifecycle | Calling a use case directly |
| Physical devices | OS suspension/discard, installed behavior, screen lock and network change | Merely setting a desktop viewport/user agent |
| Production artifacts | Built process entrypoints, proxy, migration jobs, image/schema compatibility | Development server with hot reload |
| Load/fault environment | Declared latency, overload behavior, process failure and bounded recovery | Connection counts without commands or faults |

Use deterministic barriers where the claim depends on order. Examples: suspend after admission but before authorization/write; after database commit but before reply; after old-owner pause but before takeover; after verified transfer proof but before application; during service-worker install/waiting/activation. Avoid sleeps as the only proof that a race was exercised.

## Evidence record

Record at least the following per case:

```json
{
  "caseId": "GAME-10",
  "status": "passed|failed|not_executed",
  "sourceCommit": "actual commit SHA",
  "releaseManifest": "actual candidate manifest artifact",
  "environment": "identified isolated environment and versions",
  "command": "actual executed invocation",
  "expected": "observable invariant under the injected failure",
  "observed": "actual measured or asserted outcome",
  "evidence": ["actual report/log/trace artifact paths"],
  "limitations": []
}
```

The strings above describe a schema; they are not acceptable literal values in a completed report. Use a finite status value, actual commit/environment and sanitized evidence. Missing evidence cannot be replaced by a guessed success.

## Review release independence

For the selected phase, execute an isolated deployment using only the repository state and artifacts of that PR plus its merged predecessors. Do not mount files from a future branch or manually configure a service that only a later phase supplies.

Exercise the complete exposed product and leave the deployment running long enough to cover its relevant lifecycle: auth refresh/expiry with controlled clocks, reconnect leases, pending verified work, scheduled transitions or service-worker updates as applicable. Assert that deferred optional capabilities remain unnecessary, not merely hidden by the test.

The reviewer must inspect the replacing PR's deletion list and runtime/package scan: no old credential verifier after 02, no GraphQL/Apollo after 03, no Socket.IO/game fallback after 04. Historical ADRs, offline migration/rollback evidence and retained static assets for supported clients do not constitute an active compatibility implementation.

## Real-device and capacity gates

Phase 04 requires actual iPhone Safari and Android Chrome evidence for ordinary browser play. Record OS/browser versions, device context, screen lock, app switch, process discard where reproducible, and Wi-Fi/cellular transition. Phase 06 repeats the relevant cases in installed contexts. Manual physical-device execution is acceptable when documented; fabricated device evidence is not.

The Phase 04 supported and stress workloads and latency/recovery thresholds are fixed in DOMAIN-CONTRACTS D11. Record individual latency distributions including queue wait and database commit, command outcomes, hardware, pools, duration and fault schedule. At supported load, repeated overload rejection does not count as meeting a capacity target. At stress load above the advertised limit, explicit bounded rejection is expected to preserve integrity.

## Blocking completion rule

All required cases must be passed before the PR is labeled mergeable. A draft PR can carry failed/not-executed cases with a concrete blocker; it cannot claim the phase is complete. Production authorization, when needed, comes after a concrete tested candidate and rollout plan exist, not before the implementation work.
