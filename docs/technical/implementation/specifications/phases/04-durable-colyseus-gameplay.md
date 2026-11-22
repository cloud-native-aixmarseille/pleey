# Phase 4 - Replace the complete game runtime with durable Colyseus gameplay

## PR outcome

Replace the current Socket.IO game implementation, its custom snapshots/reconnect protocol and its frontend runtime ownership with Colyseus, PostgreSQL-backed game commands and an XState browser journey. Preserve the complete supported game product. Reuse the temporary/registered Better Auth identities, anonymous-retirement lifecycle and durable participants delivered in Phase 2 and the REST management application delivered in Phase 3.

**This PR is a complete production release. Persistence, security, process recovery, correct multiple-worker routing, mobile recovery and measured release capacity must work before merge. Phase 5 adds operational automation; it must not supply missing correctness. Phase 6 adds optional PWA behavior; ordinary mobile browsers must already work.**

Suggested PR title: `feat(game)!: replace realtime gameplay with durable Colyseus rooms`.

## Required inputs

Read [EXECUTION-CONTRACT](../EXECUTION-CONTRACT.md), [DOMAIN-CONTRACTS](../DOMAIN-CONTRACTS.md), [ACCEPTANCE-CATALOG](../ACCEPTANCE-CATALOG.md), [SOURCES](../SOURCES.md), this file and the merged evidence for Phases 1-3. Read current repository/scoped instructions and the complete Phase 1 product inventory. Update implemented ADRs and obsolete runtime documentation in this PR.

Do not begin by recreating generic session, transport, retry or event-sourcing frameworks. Use the pinned Colyseus public server/SDK APIs, Better Auth integration, PostgreSQL transaction primitives and a narrow application boundary. Do not import an unlicensed React wrapper or depend on private Colyseus internals.

## Observable result at merge

- Hosts can author/publish through REST, create and run a complete quiz or prediction party, exercise every current host control, manage players, and see results/history.
- Anonymous and registered players join on desktop or mobile, answer, observe results and resume the same membership after disconnect, reload or process failure while their native identity remains valid.
- An accepted answer survives loss of its reply and termination of the game worker. A retry cannot score it twice.
- A stale controller or former game owner cannot mutate the party.
- Unrevealed answers cannot be inferred from initial state, patches, scores, receipts or unauthorized media/history responses.
- Expired guest identities are retired through the new runtime boundary while durable history and still-active parties remain intact.
- Two game workers and the production proxy use the same origin and route each room to its actual owner.
- The old game implementation is absent from production code, routes, dependencies and configuration.

## 1. Establish package boundaries and one authoritative path

Create `apps/game` and the server/client-safe packages described by DOMAIN-CONTRACTS:

- `game-domain`: pure game values, transitions, timing and scoring. It imports no Nest, Colyseus, Prisma, browser or network implementation.
- `game-application`: ordered use cases, authorization predicates and transaction-scoped ports. No arbitrary table writes are exposed to presentation code.
- `game-contracts`: validated safe wire messages and public/private view types. No answer keys, database clients or auth secrets may be imported by the browser.
- Existing `server-identity` and `server-persistence`: reuse the single identity module and single Prisma schema owner. Do not copy them into the game app.

`apps/game` composes these packages with Colyseus rooms, the standard WebSocket transport, presence/driver adapters and persistence. `apps/web` uses the SDK and a small React external-store projection. `apps/api` retains management and native Better Auth HTTP.

All active-game UI actions, including actions from administrative screens, use the same authenticated Colyseus SDK/controller and room command path. Host controls require a registered account with ACTIVE HOST membership and that participant's controller; an organization administrator does not implicitly become a host. Remove any REST route that directly mutates active game state, replacing its UI call atomically. Active-party deletion requires an explicit authorized end through the room first. Keep REST for management, authorized reads and explicitly defined creation/publication before runtime ownership. Do not introduce a second Nest command implementation or a custom internal RPC service merely for the admin screen. Never call a private MatchMaker bootstrap function.

Preserve Phase 2's server-originated identity-transfer recovery explicitly. Nest persists verified intents only. Game owners poll applicable VERIFIED/APPLYING intents and enqueue internal ApplyVerifiedIdentityTransfer steps in their room lane, using idempotent database claim/step records. Notifications are optional wake-up hints. A game-side coordinator claims/reconstructs an absent owner through supported public Colyseus APIs before applying an active-party step; inactive history-only ownership uses the defined application transaction. Validate the persisted proof, cancellation, fixed one-hour PREPARED/24-hour verified-work deadlines and affected identities. Timeout finalization preserves committed steps and exposes EXPIRED/EXPIRED_PARTIAL; it must not leave a source identity pinned indefinitely. No browser SDK command is required to resume a verified transfer after restart, and the API must not write active membership directly. Keep this narrow workflow; do not add a generic broker/outbox just for room updates.

Move Phase 2's `AnonymousRetirement` workflow to this same server-originated application boundary. The identity maintenance entrypoint discovers eligible temporary users and persists resumable work. The current game owner executes each internal `ExpireAnonymousParticipant` step in its bounded lane with the current ownership epoch. If the runtime is absent, a game-side coordinator obtains/reconstructs the authoritative owner through supported public Colyseus APIs before changing an active participation. Ended/history-only detachment uses its defined transaction-scoped path. A closed browser, empty room or process restart must not prevent cleanup. Keep startup/15-minute scheduling, batches of at most 100 identities, bounded catch-up and final identity deletion functional in this PR. Remove the replaced Socket.IO maintenance path; do not leave both writers live or defer retirement to Phase 5.

## 2. Persist reconstructable domain state

Implement the final model in DOMAIN-CONTRACTS and migrate old progress into it where the recorded data policy requires preservation. Required records include immutable published revisions, Party, the existing PartyParticipant/UserParticipationClaim, RoundInstance, Submission, result/ranking projections, CommandReceipt and PartyRuntimeOwnership. Keep verified IdentityTransfer workflows and transient AnonymousRetirement work compatible with the new game command boundary. PartyParticipant.userId remains a nullable current-auth binding; historical records use the stable participant ID, not a required guest User/Session parent.

Do not persist serialized Colyseus Schema instances as authoritative state. The Schema is a projection of committed records. A process must reconstruct a complete party using PostgreSQL plus immutable content/media references; Valkey and the old process's memory must not be needed to recover accepted answers.

### Required invariants

1. A party uses one immutable published content revision. Subsequent draft edits cannot change it.
2. Stage order is fixed for the party. Per-participant option order is fixed for the relevant round; reload and reconnect do not reshuffle it. True/false presentation retains its prescribed order.
3. Every execution/restart of a stage has a new RoundInstance ID. Validate option ownership against that round's published content.
4. At most one effective submission exists per participant/round. If answer changes are allowed, the new accepted version replaces its contribution rather than adding to it.
5. Score totals derive from accepted, non-voided records. Restart/rewind retains audit records while excluding the appropriate contributions.
6. Membership and controller identity are the Phase 2 records. Enforce unique party/user only for non-null bindings; many detached historical participants may have a null userId in one party. No transport session ID, display name or IP address substitutes for a currently authorized binding.
7. A command's business effect and receipt commit atomically. A durable revision advances with the committed authoritative transition.
8. A runtime owner is a process incarnation with an epoch, not merely a reused pod/hostname. Ownership and mutation checks use the same authoritative PostgreSQL row.

Add SQL uniqueness/checks/foreign keys supporting these rules. Do not rely exclusively on in-memory queues. Prevent anonymous-user cleanup or resource deletion from cascading through durable game history. Historical participation, submission, score, ranking and participant-scoped receipt rows never block deletion of an eligible guest auth user. Do not create a permanent global Actor/Guest identity registry or preserve deleted guest User IDs in an unbounded archive. Published content referenced by history must remain readable under the retention/access policy.

### Result history

Persist complete before/after ranking snapshots at the defined round boundaries, with stable participant IDs and captured ordering inputs. A late join, username change or anonymous-auth retirement must not rewrite the previous roster, points or rank order. Retained names/history remain subject to their own privacy and retention policy; removing the auth binding does not guarantee anonymization. Keep stage points separate from rank movement. If imported history lacks an actual baseline, mark it unavailable and omit deltas; never manufacture a zero-score history.

## 3. Define and implement every game transition

Use the defaults, score formula and role policy in DOMAIN-CONTRACTS. In particular: reading defaults to 3 seconds, answer changes are enabled by default, late joining is disabled by default, randomization flags default to false, and the supported authored time model distinguishes an explicit untimed value from positive limits.

Quiz and prediction preserve the accepted binary selected-option behavior. A player submits one option; any authored marked-correct option is correct. Do not introduce live host-resolved prediction outcomes or multi-select answers. Update misleading guide copy accordingly.

### Lifecycle requirements

| Command/transition | Required behavior |
| --- | --- |
| `startParty` | Requires WAITING, valid published stages and at least one eligible PLAYER. Opens a new round with reading/answer timing. HOST-only membership is not a player. |
| Reading completion | Opens answering according to the persisted deadline; cannot accept answers early. A zero reading duration opens immediately. |
| `submitAnswer` | Requires active PLAYER role, current controller, current round, answering eligibility and a valid option. Performs the configured replacement/no-change rule. |
| `pauseParty` | Freezes remaining reading and answering durations independently; rejects new answers while paused. Works in supported question/result views. |
| `resumeParty` | Restores deadlines from remaining durations using authoritative server time; does not reset to full time. |
| `revealRound` / deadline closure | Closes submission eligibility and makes the result visible atomically. Preserve the original deadline for scoring/audit. |
| `advanceRound` | Requires result state. Opens the next new RoundInstance, or ends the party when no stage remains. |
| `restartRound` | Voids this execution and relevant later contributions, creates a fresh execution ID for the same stage, and uses the configured reading/answer durations. |
| `rewindRound` | Starts the previous stage as a fresh execution and voids its previous/later contributions. Preserve the fixed party order. |
| `rewindParty` | Returns to lobby, voids played contributions and retains membership. A subsequent start has distinct round execution IDs. |
| `endParty` | Ends gameplay, preserves results and releases active PLAYER participation claims according to the common contract. |
| `takeControl` | An authorized observing connection compares expected generation and atomically advances/binds control; it need not already be controller. Concurrent takeovers cannot both succeed. |
| `leaveParty` | Removes PLAYER and releases its claim; preserves ACTIVE HOST authority if present, otherwise sets LEFT. Not called merely because a transport disconnected or a component unmounted. |
| `kickParticipant` | Authorized moderation sets persistent KICKED state and revokes control/admission; it cannot target a HOST/the issuing host. Automatic rejoin cannot undo it. |

New admission, deliberate rejoin, account transfer and relevant moderation must use the same ordered mutation boundary. The participant role set permits HOST and PLAYER only where explicitly authorized. Administrative UI controls do not bypass these rules.

### Timing and scoring

Use one authoritative server execution time per accepted submission. Never use a browser timestamp or first-click time as proof of deadline eligibility. For the initial policy, `now >= answerDeadline` is too late. Queue delay counts; bound it and test deadline bursts. A changed answer is scored at that new accepted execution time. A replay of the same committed command preserves its original timestamp and award.

Use the accepted approximately 80/20 correctness/speed formula from DOMAIN-CONTRACTS. Preserve its integer rounding and boundaries. For a 1000-point timed correct answer, 50% remaining yields 900; 1% yields 802; an expired answer is rejected. Wrong answers yield zero. Correct untimed answers receive all configured points. Nonnegative points and valid content are enforced at publication/import.

Reading and paused durations do not consume answering speed time. Pause records remaining answering time separately; resume computes the new deadline from remaining reading plus remaining answer time. Divide remaining answering time by the original configured answering duration, not a shortened duration after resume.

On a process crash, wall-clock deadlines continue. Reconstruction closes an expired round using committed submissions and shows its results before advancing. It never silently restarts the clock or accepts an uncommitted late answer. An explicit host restart/rewind follows the voiding rules above.

## 4. Native request protocol and business receipts

Use `room.request(type, payload, options)` for authoritative actions and the SDK's native responses/errors. Do not create parallel transport request IDs, ACK channels, snapshot diffing or a bespoke reconnect protocol.

Wire command names are the lowerCamelCase names above. Add authorized read requests `getMySubmission` and `getCommandOutcome`. Define runtime validation schemas for all payloads and finite typed response/error unions in `game-contracts`.

The business envelope contains a stable `commandId`, the relevant `roundInstanceId`, current controller context and command-specific fields. The server derives actor, membership, role, session and runtime ownership. A client-supplied user or score is never authoritative. Do not require every answer to match an exact global party revision: another player's accepted answer must not invalidate it.

Receipt identity is stable across connections and account ownership transfer: use the authenticated participant scope, or the explicitly authorized stable actor scope defined in DOMAIN-CONTRACTS. Hash canonical business fields such as command kind, round ID, selected option and target participant. Exclude transport connection/session IDs, controller generation and runtime epoch from that semantic hash. Repeating an authorized command after reattachment returns its committed result; changing its business payload under the same ID returns COMMAND_ID_CONFLICT.

Current authorized membership/role may retrieve an already committed safe receipt without being the active controller. Executing a new effect requires current control. Reauthorize every receipt read, especially after role changes, kick or account transfer. Receipts must not contain unrestricted full room snapshots.

### Unknown outcomes

A request timeout or connection close means the outcome may be unknown. The client keeps the same command ID while it reconciles. `getCommandOutcome` returns an explicit found/not-found/unavailable result with only safe data. Not-found while a transaction might still be executing is not proof that the command can never commit. Retrying uses the same business ID; it never generates a new command merely because a reply was lost.

After reload, when an in-memory command ID is unavailable, reconcile the authoritative current submission/round state. The UX must not promise that an unsent action was accepted. Do not require IndexedDB to make accepted server data recoverable.

Native `request` rejects when offline in the pinned SDK. Disable plain gameplay `send` buffering. Never replay a queued answer into a new round execution.

## 5. Serialize and commit commands correctly

Create one bounded `p-queue` with concurrency 1 per party runtime. Route all authoritative mutations and relevant timer transitions through it. A Node event loop or independent async handlers do not guarantee transaction ordering across awaits. The Colyseus command dispatcher must not be assumed to provide this serialization.

Follow the limits and global lock order in DOMAIN-CONTRACTS. Return a typed BUSY response before admitting excess work; bound per-participant and per-party work. Multiple parties execute concurrently. Timers request transitions through the same lane rather than directly modifying the Schema.

For each command:

1. Validate schema and establish the stable server-derived actor.
2. Enter a short PostgreSQL transaction. Acquire the relevant rows in the global order: deployment capacity/admission row when quotas change, User, Session, IdentityTransfer rows followed by AnonymousRetirement rows, each ordered by ID, UserParticipationClaim, PartyRuntimeOwnership, PartyParticipant, then round/submission/receipt records, each multi-row group sorted by stable ID. Select/claim workflow work in short transactions and release those locks before cross-process calls; reclaim/revalidate the workflow under this full order when applying a step. Ordinary commands take only the required subset; never acquire earlier classes of locks after later ones.
3. Lock the same ownership record used by takeover and retain protection until commit. Check owner incarnation, epoch and lease using current DB time after lock acquisition, not a timestamp captured before waiting.
4. For browser actors, validate current session, membership and permission to access the requested operation/result. Session checks must conflict with actual native revocation. Authorization ordered before revocation may finish before revocation commits; authorization after committed revocation must fail. Internal timer/verified-transfer/anonymous-retirement actors use the explicit authority predicates in DOMAIN-CONTRACTS instead of a fabricated SessionIdentity.
5. Check the receipt. Return the safe stored result for an authorized identical operation, or reject a hash conflict. This step must not re-execute already committed rules simply because the current phase has advanced.
6. For a new browser effect, validate current controller binding/generation and mutation role, then current lifecycle/round/deadline, and execute the pure domain transition. Admission/takeControl use their explicit controller exceptions. Server-generated timer transitions, verified identity-transfer steps and ExpireAnonymousParticipant use the trusted internal actor rules in DOMAIN-CONTRACTS; they cannot be selected by public payloads and do not fabricate a browser session. Persist effects, relevant projections and the safe receipt atomically. Current read access to a prior receipt does not grant permission to execute a new command.
7. Commit. Only now update the Colyseus Schema and send an accepted result.
8. If projection/publication fails after commit, stop processing normal work and reload committed state before another mutation. Receipt retries still return the stored effect.

Apply bounded transaction/deadlock retries with the same business command ID. A queue timeout must not let the next item start while the previous SQL operation is still running. Bound or cancel database work, await rollback/cleanup, and test that sequence explicitly. Do not treat a rejected JavaScript Promise as proof the database has stopped.

For operations affecting many memberships, collect and lock the complete necessary scope in the common order and revalidate it within the transaction. Do not nest a cross-party mutation inside a room transaction in an order that can deadlock. The durable identity-transfer and anonymous-retirement workflows coordinate idempotent steps with explicit intermediate state; neither can bypass the owner lane. The current-user/session test, claim release, control invalidation and participant detachment in ExpireAnonymousParticipant share the same transaction and fenced owner scope. Check every native session, not a cached session or last-seen timestamp. A valid session or changed registered/transfer state cancels the affected retirement step; a stale retirement claim is not authorization.

Do not introduce an outbox/event broker merely to mirror every native room patch. Durable current state plus receipts is sufficient for this product boundary. Genuine future external side effects require a separate explicit delivery requirement.

## 6. Recover safely across game processes

### Owner claims and leases

Implement PartyRuntimeOwnership claim, renewal, release and takeover in one narrow persistence adapter. A claim for an unowned/expired party atomically advances the epoch. Normal writes and takeover synchronize on the same row, so a previous owner cannot commit after a successor has claimed authority. Merely reading a lease or using a timeout-only Valkey lock is insufficient.

Use the initial renewal/lease values recorded in DOMAIN-CONTRACTS, validate them under load and process pauses, and use PostgreSQL time for lease decisions. Track a conservative local monotonic publication deadline for the confirmed lease. Delayed renewal responses must not extend local authority past what was actually granted.

A worker that cannot verify or renew authority stops accepting commands and publishing state. Its health/room status becomes unavailable or draining as appropriate. It must not infer ownership from an absent Valkey room listing.

Native patch publication has its own timer. Disable automatic patch cadence using the supported public API and invoke native broadcasts only while the local confirmed ownership lease is valid. Do not put an async database check in `onBeforePatch` and assume the framework awaits it. Keep this a narrow Colyseus adapter; do not build a new distributed actor platform.

Expose runtime epoch and durable revision as safe view metadata. Clients reject callbacks from replaced actor/room generations. Native synchronization can coalesce revisions, so gaps are not evidence of a missing custom event stream.

### Reconstruction

When the prior owner is unavailable, wait for the authoritative claim rule, obtain a new epoch, load the published revision and committed party records, reconcile deadlines, construct the projection and only then admit clients. Many simultaneous recovery requests must converge on one owner/runtime, not create parallel parties.

Use public Colyseus admission/matchmaker APIs and a room definition filtered by durable party identity. Prove the exact API sequence against the pinned version. Creating a framework room listing is not the ownership commit; a competing room must fail its claim and retry/resolve the actual owner. Reject/clean stale listings using supported mechanisms only after verifying the relevant owner/epoch so an old entry cannot erase a new owner.

The shared driver lists rooms; it is not the durable source for answers, scores or reconnect tokens. Colyseus development restart restoration must not be used as production persistence. `onDispose` is not the moment when accepted progress first gets saved.

Permit idle room disposal under the configured policy because authoritative progress is already durable. Keep membership for an active party while its auth binding remains valid or is otherwise protected by the defined retention workflow, and keep historical records under their independent retention policy. An explicit guarded ExpireAnonymousParticipant may detach an identity whose native sessions all expired; it releases the PLAYER claim/control, preserves KICKED or records LEFT/IDENTITY_EXPIRED, retains scores and does not end the party. Native connection departure updates ephemeral presence; it never calls the explicit LeaveParty transition by itself.

## 7. Authenticate every admission and resume before private state

Reuse Phase 2 Better Auth cookies and membership. Do not put the durable auth token in `client.auth.token`, a query parameter or a custom game ticket. Browser HTTP and WebSockets use the same origin and cookie.

Validate configured trusted Origin on matchmaking and every upgrade. The transport's internal URL may appear as HTTP behind TLS termination; do not derive the trust decision from that URL. Use explicitly configured external origin/proxy behavior.

The inspected version supports matchmaking prevalidation through static `onAuth` returning true, followed by fresh instance `onAuth` over WebSocket headers. Verify the actual pinned behavior. Returning cached principal metadata from static auth must not accidentally bypass validation of a changed/revoked cookie at upgrade.

Native reconnection does not automatically repeat initial admission authentication. `beforeUpgrade` sees current headers; `onReconnect` receives retained client/auth information. Maintain an application-owned runtime seat binding through public hooks, associating room/session to the authorized user/session/participant. Bind the currently validated cookie to that retained seat. A valid cookie for another account must not resume it.

Await current session/membership/control checks and rebuild the private StateView in `onReconnect` before initial/private state is sent. Prove this order with raw-wire tests. Do not access framework private fields to retrieve handshake context. If the pinned API cannot meet this invariant, the PR is blocked until a supported integration is established; do not weaken auth to pass.

Warm resume retains control only if its generation remains current. Fresh reattachment can automatically claim only when the server confirms there is no other active controller; otherwise it observes until explicit TakeControl. Do not use visibility events or copied sessionStorage tab IDs as authority. Browser storage availability is not an identity prerequisite.

Keep native reconnect capabilities in memory and redact their URL representations from proxy logs, errors and traces. Reload uses cookie-backed durable reattachment. Revocation/account-switch behavior and the healthy-worker passive closure bound remain mandatory from Phase 2.

## 8. Project public and private state without leaking answers

Define explicit allowlisted projection builders. Keep grading keys, unrevealed content, passwords, session data and server-only audit fields entirely outside public Schema classes. StateView is an additional per-client visibility mechanism, not an excuse to include all database fields and hide them in the UI.

During READING and paused-from-READING, expose the question/permitted media but no answer options, even in raw state. During ANSWERING, add safe selectable options and the participant's own selected option/accepted status. Before RESULTS, other exposed fields are phase/deadlines, appropriate participant display state, aggregate submitted count and previously revealed leaderboard totals. Other participants' selections and per-option counts remain private until the explicit product reveal point.

Persisting an award at answer time must not expose it early. Do not return correctness/earned points in the answer receipt, publish current-round score increases, or reveal the same information through an authorized history/media/management endpoint available to ordinary players. Public totals remain at the last revealed boundary until results. At reveal, publish the committed result and appropriate scores/counts atomically in the projection.

Separate host/admin permissions from player permissions in raw state and receipt reads. A client losing a role or being kicked must receive no further unauthorized private view. On identity change, clear the old private UI even if it still looks harmless. Update private media access to the same current membership/reveal policy.

## 9. Replace the complete frontend room journey

Reuse the Phase 2 authentication actor and add one party XState actor above lobby/question/results route changes. It owns SDK room creation, listener lifetime, warm reconnect/fresh reattachment decisions, teardown and the current actor generation. React screen mounts must not create independent room instances.

Implement explicit states for joining, synchronization, active control, observation, native reconnect, durable reattachment, unavailable, ended, kicked and expired/replaced identity. Command outcome reconciliation may be a child/parallel actor; it must have a finite visible outcome. Do not implement another WebSocket heartbeat/backoff protocol over the SDK.

Ready to answer requires current authenticated identity, authorized active PLAYER membership, synchronized current room and current controller generation. A connected socket alone is insufficient. Disable time-sensitive actions while stale/unsynchronized, and show a translated status. Preserve the last view only while recovering the same authorized identity.

Use `@colyseus/sdk` with a small React adapter based on `useSyncExternalStore`. Return a cached immutable projection with stable snapshot identity between changes; subscribe/unsubscribe through public SDK callbacks. Do not mirror editable game state into TanStack Query, an independent Zustand/Redux store or XState context. TanStack Query remains the Phase 3 owner of HTTP management data.

Do not add `@colyseus/react` unless an explicit license and compatible lifecycle ownership are newly established and recorded; the audited package lacked adequate license evidence. The baseline uses the small adapter above.

Use native requests for all host/player/admin commands. Preserve a semantic command ID while retrying/reconciling an uncertain result. Display accepted, rejected, too late, not controller, checking outcome and temporarily unavailable distinctly. Clear old callbacks/caches/private projection when identity changes.

On visibility/online/resume, coalesce a readiness check; do not unconditionally close a healthy room or create another anonymous session. Test a disconnect immediately after joining as well as after an established session. A discarded page uses fresh authenticated reattachment to the same participant. Do not require a service worker, localStorage or an installed PWA for recovery.

Complete mobile and accessibility behavior now: touch targets, keyboard operation, live status announcements, safe-area layout, readable questions/results, focus management and translated copy. Regenerate guides/screenshots and explain reconnect, explicit takeover and the limits of anonymous recovery without cookies.

## 10. Deliver the complete deployment and baseline operations

Build the game OCI image and extend Compose/Helm using the same configuration model. Include Valkey in the canonical production profile, even with one configured game worker. Use the tested official RedisPresence/RedisDriver combination against Valkey; do not keep a Socket.IO adapter.

Use standard Traefik routing under one public origin. Example contract:

- `/api/...` -> Nest and Better Auth.
- SDK base `https://pleey.example/game`.
- `/game/matchmake/...` -> game matchmaking, stripping the framework base prefix as required.
- Worker A advertises `pleey.example/game/nodes/a`; worker B advertises its own stable path.
- The SDK appends its process/room path, and the proxy routes each advertised worker prefix exclusively to that worker.

Use the standard proxy's explicit configuration, not the experimental Colyseus Traefik helper. A single load-balanced WebSocket route that can land on any worker does not satisfy the contract. Render at least two workers with distinct routes and prove cookie/origin behavior through the real proxy.

Provide manual operational procedures now: stop new admissions, drain/restart a worker, handle forced restart through durable recovery, run one migration job, restore database/media backups, inspect readiness and roll back a compatible release. Set DB connection budgets across all replicas and bounded graceful-shutdown/connection timeouts. Phase 5 can automate these procedures; it is not needed to execute them safely.

Instrument queue wait, transaction/request latency, accepted/replayed/conflicting receipts, disconnect categories, warm versus durable recovery, ownership changes, stale-owner rejection, projection failure and release/protocol version. Do not log credentials, reconnect capabilities, raw answers or unbounded user/party metric labels. Optional telemetry export failure must not stop gameplay.

One host or one PostgreSQL instance remains a shared failure domain. State exactly what the deployment recovers from; do not call two game workers full-system high availability.

## 11. One-time migration and deletion

Follow the Phase 1 data policy. Rehearse from a representative Phase 3 database. Preserve registered and still-valid temporary User IDs, all durable PartyParticipant IDs and valuable published content/results. Never recreate a retired guest User to satisfy an old non-null relationship; keep detached history detached. Convert retained legacy game history into the documented durable archive/model with explicit unavailable fields where no trustworthy source exists. This is a one-time import; no live old-format reader or dual writer remains afterward.

Use the documented maintenance window for active-party reset/termination where preserving an in-flight old runtime is not promised. Freeze writes, back up and verify data/media, migrate, deploy the complete API/game/web release and smoke-test before reopening. Reject incompatible old clients with a clear reload requirement; do not serve a translation layer for the old socket protocol.

Delete Socket.IO game packages/adapters, its replaced anonymous-retirement dispatcher, custom snapshots/notices/recovery code, guest credential remnants, obsolete game endpoints/DTOs, old runtime projections and their unused dependencies/configuration. Replace tests with tests for retained behavior rather than preserving old implementation tests as a compatibility requirement. Preserve historical ADRs/Git history only.

Rollback after transformed game data requires the rehearsed matching image/schema/data strategy. An image-only downgrade is not sufficient. Record the recovery point and effects of any restore after new writes. Once live writes resume, use the explicit forward-fix/restore decision rather than silently discarding accepted progress.

## 12. Mandatory acceptance tests

Use real PostgreSQL and Valkey containers, the actual Colyseus server/SDK, real cookies through the configured proxy, deterministic scheduling barriers and browser tests. Unit tests cover pure domain transitions and fast-check model sequences; mocks must not replace the transaction, identity or transport behavior being claimed.

| ID | Required evidence |
| --- | --- |
| GAME-01 | Full product inventory: create/publish, quiz and prediction, private/public join, all host controls, media, results/history, permissions and English/French guides. |
| GAME-02 | Concurrent/duplicate joins and lost join replies retain one participant, roles, active-party claim and prior progress. |
| GAME-03 | Same command ID after a lost response returns the safe committed result with one effect; changed semantic payload conflicts; no receipt leaks current-round correctness. |
| GAME-04 | Answer versus pause/reveal/advance/restart, under forced interleavings, obeys one authoritative order and RoundInstance ID. Internal deadline closure works after host disconnect; forged SYSTEM/transfer/retirement actor fields are rejected. |
| GAME-05 | Enabled answer changes replace the contribution; disabled changes reject a second distinct submission. Replays never rescore. |
| GAME-06 | Exact reading/deadline boundaries, pause/resume, paused reveal/advance, untimed, zero points, 80/20 rounding and authored multiple-correct-option cases match DOMAIN-CONTRACTS. |
| GAME-07 | Restart/rewind preserve PAUSED when applicable; rewind-party returns WAITING; ENDED cannot reopen. Voiding, membership and fresh execution IDs are correct; old buffered answers fail. |
| GAME-08 | Commit failure publishes no accepted state/response. Commit-success/projection-failure halts and reconstructs before further commands. |
| GAME-09 | Queue timeout/cancellation does not overlap still-executing DB work; overflow returns BUSY without an unbounded backlog. |
| GAME-10 | Kill before and after commit, including before reply; only committed effects survive and accepted data is recoverable. |
| GAME-11 | Pause old owner, let successor claim, resume old owner; stale epoch cannot commit, publish authorized new state or replace the new client's view. |
| GAME-12 | Many concurrent reconstruction requests create one effective owner; missing/stale Valkey metadata does not decide DB ownership. |
| GAME-13 | Reconstruction preserves deadlines, randomization, current selection, score and ranking snapshots; elapsed rounds close without silent timer reset. |
| GAME-14 | Current cookie mismatch, revoked session, expired seat and permission change are rejected before private initial/reconnected state. Test exact pinned auth hooks. |
| GAME-15 | Raw initial state/patches omit answer options during reading. All state, receipts and relevant HTTP reads expose no unrevealed grading data, current-round score inference or other-user selection. |
| GAME-16 | An observer can explicitly take control with expected-generation CAS; concurrent attempts produce one winner and old controller fails. Warm resume respects unchanged generation; fresh attachment observes when another controller exists. |
| GAME-17 | Existing identity-transfer and one-active-player-party invariants pass against the new command boundary. After VERIFIED, close the browser and restart API/game workers; game-side intent discovery/reconstruction resumes the same transfer to its defined outcome without new browser action, duplicate effect or API active-membership write. |
| GAME-18 | StrictMode, route changes and repeated visibility events create one room lifecycle; account switch clears private projection and ignores late callbacks. |
| GAME-19 | Early disconnect, reload, 30s background and >5min suspension recover on real iPhone Safari and Android Chrome; no PWA prerequisite or new guest fallback. |
| GAME-20 | Two workers behind production-style proxy route to the correct room with the same secure cookie. DB/Valkey restart/outage produces explicit availability behavior without fabricated acceptance. |
| GAME-21 | Empty-room disposal preserves membership/history; explicit leave/kick/end enforce claims. HOST+PLAYER leave retains HOST, host/self kick fails, and host-only reattachment never silently rejoins as PLAYER. |
| GAME-22 | Administrative-screen live controls require the same current HOST authority/controller; tenant administration alone cannot control a party. No REST or server repository bypass can update active game state. |
| GAME-23 | Complete clean install, Phase 3 upgrade, backup restore, manual worker drain and coordinated rollback run using the shipped scripts/images. |
| GAME-24 | Load and recovery gates below pass on declared hardware; preserve correctness during stress and reject overload explicitly. |
| GAME-25 | Dependency/import/protocol scan confirms old Socket.IO game implementation, token bridges, alternate live state stores and incompatible client paths are absent. |
| GAME-26 | Concurrent party creation/joins across workers cannot exceed durable global/per-party quotas; completion/leave releases claims, rejected admission creates no orphan participant, and 500 players sharing one venue IP can join under the supported profile. |
| GAME-27 | ExpireAnonymousParticipant runs through the fenced lane for a live, empty or reconstructed party. Process kill/freeze/takeover during retirement converges, stale owners cannot detach or publish, valid sessions protect the identity, capacity/control are released once, and committed scores/history survive auth-user deletion. |
| GAME-28 | Verified transfer, its 24h timeout and anonymous retirement race under real locks/owners without deleting a protected source, undoing committed target effects or merging scores. Expired/partial outcomes are durable and user-visible; restarting API/game workers resumes bounded work with no browser required. |
| GAME-29 | The 99%-anonymous retention/catch-up workload passes alongside declared gameplay load. Detached participants/submissions/results/receipts remain reconstructable without auth users; startup/15min scheduling, bounded batches and final purge work without Phase 5, and no obsolete Socket.IO cleanup writer remains. |

### Load and recovery gate

Add `pnpm test:load` using native Colyseus loadtest/SDK clients. Do not reverse-engineer its binary protocol into a raw WebSocket benchmark. Measure end-to-end command latency including queue wait and PostgreSQL commit on declared hardware/network/pool settings.

Run two separate release workloads: (A) 500 players in one party; (B) 20 concurrent parties with 50 players each. Include join bursts, synchronized answer bursts near deadlines, allowed answer changes, host controls and reconnection. Record the generated load schedule and accepted/rejected/unknown outcomes, not only averages.

At the declared supported envelope require p95 command latency below 500 ms and p99 below 1.5 seconds; p95 warm recovery below 3 seconds after usable network/browser execution return; p95 process-failure reattachment below 15 seconds with healthy PostgreSQL/Valkey and the tested lease. Accepted effects must survive game-process failure while committed PostgreSQL storage remains intact. These are acceptance targets to prove, not claims of previously measured capacity.

Then run twice each envelope as stress: 1000-player single party and 40 parties of 50 players. Explicit bounded overload/admission rejection is acceptable beyond the advertised supported bound; silent loss, duplicate effects, stale-owner writes, unauthorized commands or unbounded memory growth are not. Record the resulting supported limits in the release documentation.

If ordered single-command transactions cannot meet the declared release workload, fix the bottleneck within this PR. Ordered batching is permitted only with preserved per-command authorization, receipts, deadline ordering and host/timer barriers, and new focused race evidence. Do not weaken invariants or defer a failed supported-capacity gate to Phase 5.

Run `pnpm verify`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:release`, `pnpm test:upgrade`, `pnpm test:restore`, `pnpm deploy:render` and `pnpm test:load`. Store the evidence required by EXECUTION-CONTRACT with exact commit and environment. No allow-failure gates or placeholders are acceptable.

## Definition of done

Merge only when the replacement is the sole current game runtime, every required product behavior works, all GAME gates and retained AUTH/HTTP gates (including anonymous expiry, retirement and bounded transfer recovery) pass, the two-worker deployment and migration have been rehearsed, and a normal mobile browser can recover accepted progress without any later phase.

Exclude PWA/service-worker work, offline answers, Dexie, new prediction semantics, cross-device guest transfer, an event-sourcing platform, extra identity servers and a generic multiplayer framework. These are not prerequisites for the required production result.

## Primary implementation references

- [Colyseus SDK requests and client behavior](https://docs.colyseus.io/sdk)
- [Colyseus reconnection](https://docs.colyseus.io/room/reconnection)
- [Colyseus scalability](https://docs.colyseus.io/scalability)
- [Colyseus state visibility](https://docs.colyseus.io/state/view)
- [Inspected room admission, reconnect and patch implementation](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/Room.ts)
- [Inspected native message dispatch](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/core/src/RoomMessages.ts)
- [Inspected WebSocket upgrade transport](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/transport/ws-transport/src/WebSocketTransport.ts)
- [Inspected SDK routing/token behavior](https://github.com/colyseus/colyseus/blob/31bb1a8bd1359d742c104a370cb32eb5cdf69721/packages/sdk/src/Client.ts)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [React external-store snapshot requirements](https://react.dev/reference/react/useSyncExternalStore)
- [Colyseus load testing](https://docs.colyseus.io/tools/loadtest)
- [Pleey accepted scoring ADR](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0017-reward-action-quality-before-speed-in-game-scoring.md)

Verify public APIs against the exact locked releases. Framework behavior is supporting evidence; the common domain contract and acceptance gates define Pleey's guarantees.
