# Identity, HTTP and game contracts

This file fixes decisions an implementation agent must not invent independently. Phase 02 introduces the identity/membership requirements. Phase 03 introduces the HTTP contract. Phase 04 introduces the durable game runtime requirements. Earlier phases must remain complete with their existing sole game transport until it is replaced.

## D01. Product behavior and precedence

Preserve organization/project permissions, registration/login/logout/recovery/profile/avatar, game/theme authoring, import/export formats, media handling, published content, private parties, participant settings, host controls, history, French/English UI and accessible desktop/mobile play. Phase 01 records the exact routes, operations, rules and examples in the product inventory. Use accepted ADRs and executable rules to resolve misleading guide text; never preserve a security defect as required behavior.

Party settings resolve in this order: explicit party override, project default, organization default, system default. Freeze the effective values with the party's published revision. Later configuration edits do not alter an active party.

The guest-retention correction dated 2026-11-22 is normative from Phase 02: D12 and the nullable participant binding supersede any earlier requirement to retain an auth user for historical participation.

The explicit `null` untimed representation and nonnegative authored-points normalization below first ship in Phase 03, together with their content migration and updates to the still-current game runtime. Phase 01 records legacy representations; Phase 02 preserves their effective behavior. No earlier phase assumes Phase 03's schema already exists.

| Setting | Normative default and allowed values |
| --- | --- |
| `questionReadingTimeSeconds` | Integer 0 through 30; default 3 |
| `allowJoiningAfterStart` | Boolean; default false |
| `allowOptionChangeAfterVoting` | Boolean; default true |
| `randomizeOptionOrder` | Boolean; default false |
| `randomizeStageOrder` | Boolean; default false |
| Answer duration | `null` means untimed; otherwise integer seconds, minimum 5; editor default 20 |
| Stage points | Non-negative integer; editor default 1000 |

Normalize legacy untimed values into `null` during the relevant offline content conversion. Reject negative or ambiguous new durations. Normalize historical negative points to zero only with an explicit conversion report, preserving their effective existing zero award. Do not change scored historical results when normalizing authored content.

Quiz and prediction both accept one selected option. An authored multiple-choice stage can mark several options correct; selecting any one marked option is correct. This does not authorize multi-select submissions or partial credit. True/false content has one correct option and keeps True/False order even if general option randomization is enabled. Preserve authored correct options for prediction; there is no `resolvePredictionOutcome` command in this program. Correct any guide that claims otherwise. See [ADR 0017](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0017-reward-action-quality-before-speed-in-game-scoring.md).

## D02. One identity system from Phase 02

Better Auth owns authentication users, credentials and sessions. Anonymous players use its anonymous plugin and temporary native user records; no separate guest authenticator or parallel Principal credential hierarchy remains. These technical identities are not registered product accounts. The reported product workload is approximately 99% guest participants, so bounded anonymous retention is a Phase 02 correctness requirement, defined in D12. Do not preserve one authentication user per historical guest or introduce a permanent global Actor/Guest registry as a substitute.

Use one HTTPS origin. Session cookies are Secure, HttpOnly, host-only, Path=/ and SameSite=Lax. Configure exact trusted origins and applicable CSRF checks. Reject unexpected WebSocket origins on public browser entrypoints. Development exceptions must be explicit local configuration and cannot reach the production profile.

Initial chosen session policy: seven-day session expiry and a 24-hour refresh threshold. Active browser journeys check the HTTP session at startup, foreground return and at most every five minutes while executing. Coalesce overlapping checks. These are application configuration values, not claims about undocumented library defaults. A network error creates an unavailable/retry state, never a new guest. Guest session renewal follows an executing, visible play/recovery journey; do not keep refreshing an abandoned landing page or ended-party screen forever. Continuous legitimate play may renew the session, so seven days is not an absolute account-age limit. No inactivity heuristic may delete an actually unexpired native session.

Store sessions in PostgreSQL; disable cookie session caching initially. The Better Auth HTTP handler owns cookie refresh. Validate admission through official library APIs and retain only validated server-side identity context. A function called with refresh disabled may still delete an expired session; do not label it strictly read-only SQL.

The shared server identity adapter returns an immutable result shaped like:

```ts
type SessionIdentity = {
  userId: string;
  sessionId: string;
  isAnonymous: boolean;
  expiresAt: Date;
};

type SessionCheck =
  | { kind: "valid"; identity: SessionIdentity }
  | { kind: "absent" }
  | { kind: "expired" }
  | { kind: "revoked" }
  | { kind: "unavailable" };
```

The example is a contract, not an instruction to log those fields or a required public JSON response. Do not include cookie/token secrets in it. Session IDs are accepted internally only after the admission adapter validated the cookie. `userId` supplied by a client is never proof of identity.

An anonymous subject can play but is not thereby a registered account holder, organization member, content author or administrator. Authorization checks identity category plus the current resource permission; they do not use `user != null` as an account-management permission.

### Anonymous bootstrap

One XState session actor owns read/create/confirm. Create an anonymous session only for an explicit anonymous-play intent, not simply because a landing/login/logout screen has no cookie. Use a short same-origin Web Lock to coordinate simultaneous tabs. Under the lock, check the cookie session again, create an anonymous session only on a confirmed absent session, then confirm the final session before joining any party. On a lost creation response, inspect the current session before retrying; do not blindly create another user. Expired/revoked sessions produce an explicit session-ended journey. A fresh guest join is a deliberate new journey, never automatic recovery of another participant.

If a supported browser lacks Web Locks, use a documented tested equivalent single-bootstrap mechanism, or present a clear unsupported multi-tab bootstrap outcome. Do not silently fall back to parallel anonymous creation. Ordinary one-tab play must not require localStorage/IndexedDB to function.

### Registered-account migration and recovery

Preserve registered user IDs where valid and all owned resources. Do not import old password hashes into a differently configured hasher. Use Better Auth's chosen native password implementation and a complete forced-reset transition for imported accounts, with self-hostable SMTP and tested account recovery. Do not mark imported emails verified without evidence; the migration does not create a new email-verification requirement by itself.

One-time guest mappings preserve historical score attribution but grant no browser a new cookie. Historical-only guests import directly into detached PartyParticipant records with userId=null; never manufacture new Better Auth users or sessions for them. Temporary migration maps have explicit retention and no restrictive foreign key that pins deleted guest identities. Old JWTs, guest credentials and refresh tokens are invalid after the Phase 02 cutoff. Do not use nickname or IP address to recover an anonymous identity.

### Account linking

Keep automatic anonymous deletion disabled during transfer using disableDeleteAnonymousUser:true. This setting protects transfer ordering; it is not a retention policy. The application-owned lifecycle in D12 must remove eligible source users after completion or expiry. Persist a source-authenticated PREPARED intent before account authentication, then obtain source/target proof from the authentication library's verified linking flow before marking it VERIFIED. Record an immutable source user/session binding, a one-time operation identifier, status/version and per-step completion markers; assign the target only from verified library context. Correlate the exact PREPARED flow through a documented library-supported request/context mechanism, not an arbitrary pending row found by username. At most one unresolved transfer may own a given source membership; concurrent link attempts must conflict or resolve the same operation. Client-provided user IDs cannot establish proof. Transfer membership/ownership idempotently and report COMPLETED only after the domain transaction commits. Persist failures for retry within the finite deadlines in D12; no pending transfer can pin a guest forever.

Test the failure windows before verification, after verification but before transfer, after transfer commit and before the UI response. Do not publish the target-account cookie/success response before the source/target proof is durably recorded. Use the documented awaited link hook and public HTTP integration, and prove actual error/Set-Cookie behavior against the pinned library. A failure before verified proof must leave the original guest session usable for retry; a failure after proof can recover using the persisted verified intent. A failed verification hook must not be reported as successful transfer. Never manufacture verified proof after a crash or claim progress is recoverable when neither a valid source session nor verified intent remains.

When the destination account already has membership in the party, initially return `MEMBERSHIP_CONFLICT` and keep both records unchanged. A deliberate KEEP_ACCOUNT decision preserves the destination participant, marks the source guest's active participation LEFT, releases its claim/control and retains its separately attributed history. A CANCEL decision makes no ownership changes and resumes the source journey only while its source session remains valid. A different-active-party collision offers KEEP_ACCOUNT or requires a separate explicit leave of that party before retrying transfer. Do not silently leave the destination party or merge scores. No cross-device anonymous transfer feature is included.

## D03. Durable participation and control from Phase 02

`PartyParticipant` has an opaque stable ID and a nullable userId authentication binding. Enforce unique `(partyId,userId)` for non-null userId, using an explicit PostgreSQL partial unique index or tested equivalent NULLS DISTINCT constraint. Several detached historical participants with userId=null in the same party are allowed; NULLS NOT DISTINCT is wrong here. Keep the foreign key restrictive and explicitly detach through D12 before deleting a guest. Never cascade authentication-user deletion into participants or results. It contains server-owned role membership, status, a captured display name and controller generation. Preserve it when replacing the transport in Phase 04. Submission, score/ranking history and durable command attribution use participantId, not a permanently required authentication user. A detached participant ID is not a credential and cannot be claimed by a new visitor.

Roles can include HOST and PLAYER on the same row when a host deliberately joins as a player. Creating a party requires a registered account with existing organization/game permissions and assigns HOST authority, not an automatic scored PLAYER seat. Anonymous identities cannot own HOST, organization/project membership or authored resources. Joining never grants HOST. Only PLAYER members count toward player capacity and receive answer/scoring behavior. Existing host actions require ACTIVE HOST membership and its controller, regardless of the screen that invokes them. Organization/project administration alone does not grant live-game HOST authority. Administrative screens expose live controls only for the same authorized host. Do not add implicit HOST membership, client-selected administrator roles or an impersonation capability. An HTTP request to delete an active party must require the host to end it through the game boundary first.

Statuses are ACTIVE, LEFT and KICKED. A disconnect or empty runtime does not change ACTIVE to LEFT. Definitive anonymous identity retirement is a different event: D12 expires the affected participation through the current game boundary, releases its claim/control and detaches the identity without waiting for the party to end. An explicit player leave removes PLAYER membership, releases its active claim and invalidates stale controller commands, while keeping history. If HOST remains, keep the row ACTIVE and preserve host authority; otherwise set LEFT. A HOST-only subject cannot use leaveParty to implicitly end or abandon the party. Adding PLAYER to a HOST-only row is a new player admission and obeys the current late-join rule. A deliberate rejoin from LEFT uses current admission rules. Native reconnect never reverses LEFT or KICKED. KICKED remains denied for that same verified identity; reinstatement is outside this scope. Anonymous identity cannot establish that a new cookie/browser context belongs to the same human. A fresh identity follows normal new-admission rules and, if accepted, gets a separate participant/history. Do not promise cookie-resistant bans or human-level deduplication, and do not merge by fingerprint, nickname or IP. kickParticipant cannot target a HOST or the issuing host themselves; use explicit player leave or endParty. Host transfer is outside this program.

Preserve the current one-active-party rule for PLAYER participation through a database-enforced per-user participation claim. HOST-only memberships do not consume this claim. Acquire/release it transactionally with join, explicit leave, kick and party completion. Do not keep an ended party blocking future participation. Existing ACTIVE membership can reattach when late joining is disabled and without retaining a plaintext private-party password.

Use one active controller per participant. First successful control admission can claim an unowned participant. A second live connection observes until an explicit `takeControl` advances the generation. Ordinary browser game mutations require the current generation and the server-bound connection. Exceptions are authenticated initial admission, explicit takeControl from an authorized observing connection, and trusted internal transitions defined in D07. takeControl compares the observed/expected generation under the transaction lock, advances it and binds the calling connection; two concurrent takeovers with the same expected generation cannot both succeed. An obsolete generation returns NOT_CONTROLLER with safe current context. A resumed old tab cannot regain control by sending a visibility event.

Native reconnect retains control only if its generation is still current. Fresh reattachment can automatically claim control only when the server establishes that no other active controller remains; otherwise show the takeover action. A nonsecret tab ID may assist UX but is never a credential. Unavailable browser storage must not create a new participant.

On logout, account switch or detected revocation, increment the frontend identity generation, destroy the old connection/reconnect capability, clear identity-scoped cache data and private rendered room state, then ignore late callbacks. A stale view may be retained only during recovery of the same still-authorized identity.

For a registered account A to registered account B switch in one browser, revoke/sign out the CURRENT A session through Better Auth and confirm that result before starting B's login. Other legitimate A sessions on other devices remain unless the user explicitly revokes them. If revocation is unavailable, keep switching in an explicit retry state and do not leave a frozen A socket authorized while claiming B replaced it. Test raw old-socket mutation after B login, not only client event cleanup. Guest-to-account linking follows its separate verified transfer/revocation ordering in D02.

## D04. Application HTTP from Phase 03

Application routes live under `/api`; Better Auth stays mounted at `/api/auth`. OpenAPI contains actual prefixed paths, and the generated client's base URL is the browser origin. Do not accidentally produce `/api/api/...` URLs.

Use official Nest validation/OpenAPI facilities compatible with the pinned Zod version, plus `openapi-typescript` and `openapi-fetch` for generated static types and the fetch client. Runtime validation remains a server boundary requirement. A typed generated client does not validate untrusted input by itself.

Record every previous operation and its replacement in `docs/technical/contracts/http-operation-map.json`. Emit the management schema at `packages/contracts/openapi/management.openapi.json` and generated types at `packages/contracts/src/http/generated.ts`. Phase 03 implements `openapi:generate`, `http:generate` and `contracts:check` as its spec requires.

Use one TanStack Query cache for application HTTP data, with query keys scoped by actual identity and resource. The identity actor owns the session; Query does not independently create/refresh identities. Colyseus owns live game data after Phase 04; Query does not mirror it as an editable store.

HTTP errors carry a stable domain code, HTTP status, localized-rendering parameters safe for the current actor, and an opaque diagnostic request ID. Never send a stack trace, cookie or database error. Use 400 for malformed input, 401 for absent/expired identity, 403 for denied permission, 404 for absent/non-disclosable resource, 409 for a domain conflict, 413 for body limits, 429 for throttling and 503 for temporary dependency unavailability. Do not return success with an error hidden in a string.

Keep the repository's pagination semantics and tenant/resource scoping. Metadata, uploads, downloads, CAPTCHA, reset delivery and media processing must have real replacements in the same PR. Better Auth remains the authentication writer for its owned identity fields; profile APIs update application-owned fields through the appropriate boundary. The sole maintenance exception is the isolated, schema-tested anonymous-retirement adapter in D12; game/HTTP handlers may not delete native identity rows directly.

## D05. Game model from Phase 04

Store domain records, not serialized Colyseus Schema objects, as durable state.

| Record | Required content/constraint |
| --- | --- |
| PublishedGameRevision | Immutable game/content/settings revision; answer keys remain server-only |
| Party | Revision reference, lifecycle, join code, optional password hash, current round, monotonically increasing revision |
| PartyParticipant | Stable participant ID/roles/status/control; nullable auth user binding; unique party/user when non-null; historical display snapshot |
| RoundInstance | Fresh ID per execution, stage reference, phase, deadlines/paused remaining durations, void metadata |
| Submission | Unique round/participant; current chosen option, accepted server timestamp, revision, stored scoring inputs/award |
| CommandReceipt | Unique party/server-derived actor scope/command ID; semantic payload hash, safe result, committed revision |
| PartyRuntimeOwnership | One party owner; process-incarnation ID, epoch, database lease expiration and current worker/room locator |
| RoundResults | Immutable before/after ranking snapshots and revealed stage results |
| IdentityTransfer | Verified source/target workflow, finite deadlines and committed transfer progress; no permanent source-user history dependency |
| AnonymousRetirement | Temporary durable cleanup intent/claim/steps from Phase 02; removed after completion; never a permanent actor registry |

A process incarnation is a fresh ID on each process start, not a reusable pod name. Join codes locate parties and are not ownership credentials. Keep human-friendly code behavior with sufficient entropy and admission throttling; ownership always comes from a validated identity.

Keep gameplay history and receipts for the entire active party lifetime; D12 may retire an expired guest binding without deleting that history. Keep receipts at least 30 days after the party ends, scoped to stable participant/internal operation IDs rather than an obligatory auth user. History/content deletion follows explicit product retention, not anonymous-user cleanup. Retained history must NEVER block eligible guest deletion. Anonymous identities, sessions, transfer proofs and transient retirement work follow D12; no historical foreign key, migration map or JSON copy may silently restore a permanent guest registry.

Persist the party's stage order and each participant/round option permutation. Reconnect, process recovery and refresh do not reshuffle. Preserve True/False ordering.

## D06. Lifecycle and scoring

Party lifecycle is WAITING, RUNNING, PAUSED or ENDED. A running round has READING, ANSWERING or RESULTS phase. Store the paused-from phase and relevant remaining durations when PAUSED. The implementation can use an equivalent explicit discriminated union, but cannot infer phase from a collection of contradictory booleans.

| Command | Preconditions and durable effect |
| --- | --- |
| `startParty` | WAITING, published stage exists and at least one ACTIVE PLAYER; open first fresh round |
| `pauseParty` | Authorized host/control; freeze current reading/answering time or results state |
| `resumeParty` | PAUSED; reconstruct applicable deadlines from stored remaining durations |
| `submitAnswer` | Current round is ANSWERING, not paused, ACTIVE PLAYER/control, valid option, before deadline |
| `revealRound` | Close eligibility and persist results for the current round through one transition |
| `advanceRound` | Current results are available; open next fresh round or end when no next stage remains |
| `restartRound` | Restart current stage with a new round ID; void that stage's and later effective contributions |
| `rewindRound` | Select previous stage with a new round ID; void target and later effective contributions |
| `rewindParty` | Return to WAITING; void prior run contributions and keep membership |
| `endParty` | Terminal gameplay state; release active participation claims and preserve results/history |
| `kickParticipant` | Authorized current HOST controller; revoke a non-HOST target's play/control and preserve evidence/history |
| `leaveParty` | Remove PLAYER participation, preserve any HOST authority/history, release active player claim; LEFT only when no active role remains |
| `takeControl` | Current authorized membership; advance controller generation and bind the new controller |

Disallow nonsensical transitions with typed errors. Restart/rewind-stage are valid during READING, ANSWERING or RESULTS, including their paused form, provided the requested stage exists. Advance requires RESULTS, including paused RESULTS. When restart/rewind/advance opens a new round while the party is PAUSED, keep PAUSED, store the new round's full configured remaining reading/answer durations and do not start deadlines until resume. Reveal from a paused reading/answering round produces paused RESULTS. Rewind-party returns to WAITING and clears pause; it retains active membership/claims for that still-live party. ENDED rejects every reopen/start/restart/rewind command; creating another party is the new-game action. An already committed receipt can still be read under current authorization. A failed transition has no partial score or timer effect.

Reading and answering have separate server-authoritative durations. In normal operation and recovery, the reading deadline determines when answering would start; answering must not gain extra time merely because a timer callback/process ran late. For timed rounds, persist or deterministically derive `answerDeadline = readingDeadline + configuredAnswerDuration`. At recovery, skip elapsed phases through the ordered transition path; if answering expired, close and show results before any automatic advancement. Untimed rounds have no answer deadline. A process failure is not an implicit pause.

For scoring, use integer points and half-up rounding for nonnegative values:

```text
bonusCap = roundHalfUp(stagePoints * 0.20)
base = stagePoints - bonusCap
ratio = clamp(remainingAnswerTime / configuredAnswerDuration, 0, 1)
award = correct ? base + roundHalfUp(bonusCap * ratio) : 0
```

Check eligibility and the deadline before scoring. At the deadline, reject. Wrong or missing answers earn zero. Correct untimed answers earn the stage's full points. Reading/paused time is not counted as answering time.

With 1000 points, a correct timed answer with 50% remaining earns 900; with 1% remaining, 802. When answer changes are allowed, a new command replaces the prior answer and award using the newly accepted server evaluation time. Retrying the same committed command never recalculates its timestamp or score. When changes are disabled, a different subsequent answer returns `ALREADY_SUBMITTED`.

Rank by total score descending, then username, then stable participant ID. Use one deterministic server ordering and persist whole before/after result snapshots. Show stage points separately from rank movement. If no earlier snapshot exists, omit the delta. If a participant is absent from a valid earlier snapshot, show New. Do not reconstruct past rankings from a changed current roster.

## D07. Commands, receipts and transaction order

Use the native SDK `room.request(type,payload)` transport. Wire names are the lowerCamelCase names in D06 plus `getMySubmission` and `getCommandOutcome`. No custom transport acknowledgement ID or second socket protocol.

The business envelope includes `commandId`, relevant `roundInstanceId`, controller generation and command-specific inputs. The server supplies actor, membership, role and runtime ownership context. The client cannot supply authoritative user ID, score, deadline, correctness, role or epoch.

Hash the canonical semantic command kind and business payload. Exclude transport metadata such as socket/session IDs, current runtime epoch and controller generation so the same logical command can recover its receipt after an authorized reattachment. Reusing the same ID for different business content yields `COMMAND_ID_CONFLICT`.

Receipt actor scope is stable and server-derived, normally the participant ID. Current ownership and role must authorize reads after account transfer. A current observer may read their own already committed safe receipt; controller authority is required for new mutations, not to learn whether an earlier authorized command committed. Do not cache privileged room snapshots as receipts.

Every mutation uses the room's bounded sequential lane. `p-queue` concurrency is one. The lane includes joins, answers, host/admin actions, timer changes, identity transfers, anonymous-participant expiry and control changes. Node's event loop or `@colyseus/command` must not be assumed to serialize independent awaited operations.

Browser commands use a current SessionIdentity. Internal deadline transitions use a server-created SYSTEM actor plus the current owner epoch and round, not a fabricated browser session. Verified transfer work uses the durable VERIFIED intent as its consent proof and rechecks cancellation, affected users/memberships and current runtime authority. Anonymous expiry uses a server-created retirement actor with the persisted D12 intent/generation, current expiry/transfer predicates and owner authority. It does not fabricate a browser session. These internal actor variants cannot be selected or constructed by any public payload. They bypass only the browser controller/session requirement, never owner fencing, rule validation, the ordered lane or atomic persistence.

Within one database transaction:

1. Acquire required rows in the global order below and verify current authority after waiting for locks.
2. For browser actions, confirm the session is current and membership/role permit the operation. For internal actions, validate the server-created actor's deadline/verified-transfer/retirement-intent authority instead. Confirm the same owner epoch/valid lease used by takeover in both cases.
3. Return an existing authorized matching receipt if present; reject a semantic hash conflict.
4. For a new effect, check control generation, lifecycle, round/option ownership and authoritative deadline.
5. Apply pure rules, write business effects plus receipt, and advance the party revision atomically.
6. Commit before applying the native room projection or returning acceptance.

Global lock order for application operations: the deployment capacity/admission row when a quota changes; affected User rows ordered by ID; Session rows ordered by ID; IdentityTransfer rows followed by AnonymousRetirement rows, each ordered by ID; UserParticipationClaim rows ordered by user ID; PartyRuntimeOwnership rows ordered by party ID; PartyParticipant rows ordered by ID; round/submission/receipt rows in stable order. Each operation uses the relevant subset without reversing it. Quota-changing joins, leaves, kicks and completions synchronize through the same capacity row before reading their affected roster, so concurrent admission cannot exceed a global bound or invalidate a completion's claim-release set. Heartbeat/takeover can lock only the ownership row, but must not then acquire earlier-order rows. Cross-party transfer locks affected rows in the same stable order. Handle database deadlock/serialization retries within a bounded transaction retry using the same business command ID.

Use database time after lock acquisition (`clock_timestamp()` or a tested equivalent) for authority/deadline checks. An ordinary READ COMMITTED ownership SELECT does not fence a concurrent takeover. Session-row checks/locks must conflict with the selected library's actual revocation operation; prove this against PostgreSQL. Checks after committed revocation fail. A transaction ordered before revocation may finish before revocation commits.

On projection failure after commit, stop normal processing, reload committed state and then resume. Never process the next command on stale state. Do not release the lane because a JavaScript timeout fired while SQL still runs: bound database operations, cancel/rollback and await cleanup.

Ordered batching is permitted if needed for the declared burst workload, but must preserve command order, authorization, deadline evaluation, receipt atomicity and commit-before-publication. Do not increase concurrency blindly to pass latency tests.

## D08. Safe failure and privacy outcomes

Use typed error codes including `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `MEMBERSHIP_CONFLICT`, `PARTICIPANT_KICKED`, `PARTY_ENDED`, `JOIN_CLOSED`, `PLAYER_ALREADY_IN_ACTIVE_PARTY`, `PRIVATE_PARTY_PASSWORD_REQUIRED`, `PRIVATE_PARTY_PASSWORD_INVALID`, `NOT_CONTROLLER`, `ROUND_CHANGED`, `READING`, `PAUSED`, `DEADLINE_PASSED`, `ALREADY_SUBMITTED`, `COMMAND_ID_CONFLICT`, `BUSY`, `TEMPORARILY_UNAVAILABLE` and `PROTOCOL_INCOMPATIBLE`. Map them to existing/new translated domain messages.

An accepted response identifies the business command, committed revision and a safe command-specific result. A timeout or closed socket is an unknown outcome. `getCommandOutcome` distinguishes FOUND, NOT_FOUND and UNAVAILABLE; NOT_FOUND alone does not prove a delayed request can never commit. Retry only the same command ID/payload, or read authoritative current submission. After reload, current durable submission state can resolve the UI even if the old in-memory command ID was lost.

Disable offline gameplay send buffering. Do not place answers in an IndexedDB outbox, browser service-worker Background Sync, generic mutation retry queue or persisted XState snapshot.

During READING and paused-from-READING, project the question and permitted media but no answer options. During ANSWERING, add safe selectable options and the player's own accepted selection/status. Before RESULTS, expose only these phase-appropriate fields, deadlines, display roster, aggregate submitted count and previously revealed cumulative totals. Do not expose answer keys, future content, current-round awarded points, correctness, per-option counts or other users' selections. Hiding `isCorrect` while updating a leaderboard still leaks correctness. Management authoring access remains separately authorized.

After reveal, expose only the result fields permitted by the product policy; unrevealed future content stays private. Test initial state, patches, receipts, history/media endpoints and reconnect. Default-public Schema fields are not an authorization mechanism. Keep grading secrets entirely outside synchronized Schema.

## D09. Runtime authority and recovery

Use native reconnect for a live retained room; use cookie-authenticated durable reattachment for reload, expired seats or process replacement. The durable participant ID is unchanged even when room/session IDs change while the same identity remains valid. Definitively expired or retired anonymous identities do not acquire historical ownership through a new cookie.

Initial ownership configuration is a 10-second database lease renewed every 2 seconds. These are configurable tested starting values. Use a conservative local monotonic expiry for publication, accounting for renewal round-trip time and event-loop pauses. If ownership cannot be established or renewed, stop admission/mutation/publication. Never infer ownership because Valkey lacks an entry.

Both mutation and takeover synchronize on the same PostgreSQL ownership row and epoch. Disable automatic patch timing where necessary and guard invocation of native publication with valid authority. Do not assume an asynchronous `onBeforePatch` hook blocks publishing. The client ignores callbacks from old identity/room generations after reattachment. Native patches can coalesce revisions, so skipped revision numbers do not require a custom event-gap protocol.

The first production Colyseus release must prove two-worker routing, process kill/reconstruction and freeze/takeover/resume. Use official Redis presence/driver adapters with the tested Valkey version. Room listings do not store authoritative answers or scores; framework devMode restoration is not the production durability mechanism.

The same browser origin routes application HTTP and matchmaking plus distinct worker connection prefixes. A standard proxy maps each prefix to exactly one worker and strips only the intended routing prefix. Verify native SDK-generated URLs using two real worker processes. Do not use the experimental routing helper if its address/key assumptions conflict with these paths.

Validate the fresh cookie at WebSocket upgrade and bind it to the retained participant before native reconnect sends private state. The room's retained auth value is not fresh session proof. Use official public hooks and a small seat-to-identity binding. A valid cookie for account B cannot resume account A's seat. Do not put the Better Auth token in `client.auth.token`; keep native reconnect capabilities only in memory and redact their URL fields from logs/traces.

Check passive socket authority at least every five seconds while workers execute normally, and on every new mutation/admission/resume. If authority cannot be checked, fail closed. This is not a promise that a completely suspended process can execute a timer.

All active-game UI mutations, including administrative controls, use the same game command boundary. Prefer the existing SDK controller from those screens. Nest remains responsible for management, party setup and reads; it must not directly update active game rows. Do not introduce private MatchMaker setup calls or an unsupported RPC merely to preserve a removed HTTP mutation. Update affected HTTP contracts and UI together in Phase 04.

The existing durable identity-transfer workflow is an explicit server-originated exception to the UI entrypoint, not to the game command boundary. Nest records verified intent. Game-side workers check eligible VERIFIED/APPLYING intents at least every two seconds while healthy, with bounded batch size 50 and database claim expiry/retry. The active owner enqueues internal ApplyVerifiedIdentityTransfer steps in its lane. Persist each step under a unique transfer/party key; notifications may wake polling but are never the durable work record. A game-side coordinator recovers an absent runtime through supported public Colyseus room creation/admission APIs before applying an active-party step. Inactive history-only ownership follows its transaction-scoped application path. The target browser may remain closed throughout. No new generic broker, private framework bootstrap call or API direct active-membership mutation is required. Link completion is reported only after all chosen steps reach their persisted final outcome.

## D10. Browser state ownership

The Phase 02 session actor remains the one identity owner. Phase 04 adds a party actor above lobby/question/results route changes. Typical states are checking session, joining, synchronizing, playing, observing, reconnecting, reattaching, ended, kicked, session expired and unavailable. Unknown command outcomes belong in an explicit command actor rather than a Boolean scattered through components.

PLAYING requires a current identity, valid membership, synchronized room and current controller. WebSocket connected is insufficient. Observation remains possible for an authorized noncontrolling tab.

Use the Colyseus SDK plus a small `useSyncExternalStore` adapter with cached immutable snapshots. Do not copy live gameplay into TanStack Query or another editable store. React StrictMode, remounts and stale promise completions must not create duplicate rooms/listeners/controllers.

Foreground/online events trigger a coalesced readiness check, not unconditional disconnect or control takeover. Rendering a local countdown does not authorize an answer; the server decides. Explicitly distinguish pending submission, checking outcome, accepted, rejected and unavailable.

The normal browser journey must pass real iPhone Safari/Android Chrome tests before Phase 04 merges. Phase 06 adds installation/cache/update behavior only. New PWA contexts may have separate cookies; do not promise identity transfer between unrelated browser contexts.

## D11. Initial operating envelope

The Phase 04 release target is 500 players in one party, and a separate workload of 20 concurrent parties with 50 players each. Record hardware, PostgreSQL/Valkey versions, worker count, payload sizes, timed-round length and answer-burst distribution. Test sustained operation and simultaneous answer bursts, not just idle connections.

At the declared supported workload: command latency p95 below 500 ms and p99 below 1.5 seconds including queue wait; warm recovery p95 below 3 seconds after execution/network return; process-failure reattachment p95 below 15 seconds with healthy PostgreSQL/Valkey and the tested lease. Acknowledged committed gameplay has zero game-process-crash loss while PostgreSQL storage remains intact. These are gates to measure, not claimed current results.

Run stress profiles at twice each workload. Beyond the published supported envelope, controlled admission/BUSY rejection is allowed; duplicate effects, unauthorized acceptance, unbounded memory growth and acknowledged data loss are not. Set explicit player/party/connection/message/queue limits from the measured envelope. A higher limit is not released before it passes equivalent tests.

Initial bounds to implement and verify: at most 500 PLAYER members per active party, 20 active parties and 1000 active PLAYER memberships per deployment; at most 3 simultaneous browser connections per participant, 2000 room connections and 4000 game connections per deployment; at most 1000 queued/executing mutation items per room; at most 16 KiB for a game command message before decoding. HTTP media uploads use their separate existing validated limits. Read-only reconciliation traffic must also have an explicit limiter and cannot starve mutations. Capacity configuration cannot remove these bounds accidentally; integer validation rejects negative, zero-as-unlimited and overflow values. Party/member quotas count durable claims and release them on completion, not simply on a socket disconnect.

Rate limits are explicit per identity, party and connection, with a separate generous network admission budget tested against all 500 players joining from one venue IP. Do not apply a per-user budget to the whole shared IP. A rejected admission returns a clear retryable overload result without allocating a duplicate participant. Adapt measured higher bounds only in a complete tested capacity release.

If a gate fails, fix the bottleneck or obtain an explicit product capacity decision before release. Never relabel a failed run as passed, omit queue delay, mock the database or raise a timeout to hide an unresolved outcome.

## D12. Anonymous identity lifecycle from Phase 02

### D12.1. Separate authentication lifetime from retained participation

The reported 99% guest participation is the primary design workload. Better Auth's native anonymous plugin creates an authentication User and Session; this design deliberately permits those temporary rows. It does not promise that the physical authentication table contains registered accounts only. Registered-account lists, counts, permissions and ownership use the explicit registered category. There is no per-guest registered profile, provider credential or management account allocation.

The following lifetimes are independent:

| Data | Owner and retention rule |
| --- | --- |
| Registered authentication User | Explicit account lifecycle; excluded from anonymous cleanup |
| Anonymous authentication User | Only while a valid native session or finite transfer protection requires it, plus measured cleanup lag |
| Native Session | Native expiry/revocation; expired rows are eligible for bounded maintenance deletion |
| PartyParticipant | Party-scoped business identity and display snapshot; nullable userId; retained according to party/history policy |
| Submission, results and command receipt | Stable participant/round/internal operation references; no mandatory anonymous auth-user dependency |
| IdentityTransfer | Bounded live workflow; terminal proof retained 30 days, then deleted/minimized without an auth-user foreign-key pin |
| AnonymousRetirement | Durable temporary work only; deleted with final cleanup, with aggregate operational evidence retained separately |

No permanent global Guest, Actor, Principal, hashed-user lookup or one-tombstone-per-visitor table may replace deleted anonymous users. Retaining one participant per historical party is expected business data; keeping history will still grow storage. The goal is to stop that history from retaining authentication identities and session metadata indefinitely. A table rename, user-list filter, partition or VACUUM job is not a substitute for lifecycle correctness.

A detached participant is pseudonymous historical data, not proven anonymized data. Nicknames, timestamps and associated records may identify people. Keep those records behind existing authorized history access. Never expose a detached user's personal history to whoever provides its participant ID, nickname, IP address or a new cookie. Do not silently claim data anonymization or introduce a historical-results deletion policy in the guest cleanup job.

### D12.2. Expiry and eligibility

Use the native seven-day expiry and 24-hour refresh threshold from D02. These are starting product configuration values, not a hard seven-day age limit: legitimate activity can renew a session. Do not invent an unsupported per-user-kind library option. A future change to recovery duration requires an explicit policy/configuration change and the same lifecycle tests.

An ordinary candidate must satisfy ALL of these at the transaction's current database time:

1. The current native User still exists and is anonymous.
2. No native Session for that user is unexpired. Check all sessions, not only a cached/current browser session. A network error, old lastSeen or old createdAt is never proof of expiry.
3. The User is at least one hour old. This protects incomplete native creation flows with no attached session; it does not expire a valid session. A completed transfer can bypass this orphan grace only after its explicit revocation/ownership checks.
4. No live transfer protection remains under the finite deadlines below.
5. Anonymous management ownership is absent. HOST, organization/project roles, authored resources or a native registered credential on an anonymous User is an invariant error: alert and investigate; do not cascade or silently convert it.

Retained participants, answers, result history, receipts and ended or abandoned party rows are NOT blockers. Existing active participants trigger the explicit expiry transition below. The party need not end before expired guest identities can be removed.

There is no additional post-session-expiry authentication grace. A deleted expired-session row does not destroy valid recovery proof: the native credential has already expired. Therefore do not introduce custom last-expiry triggers, a second expiry engine or indefinite lastSeen tracking to reconstruct that row. If a valid session or live transfer is discovered during recheck, cancel/defer the retirement candidate before doing destructive work.

Logout/revocation removes authority immediately according to D03; cleanup removes now-unneeded storage later. Successfully completed linking revokes superseded source sessions, releases/detaches remaining source bindings as explicitly agreed, then makes the source eligible at the next cleanup pass. disableDeleteAnonymousUser:true does not exempt it from this workflow.

### D12.3. Finite transfer protection

A PREPARED intent expires one hour after creation. Verification must prove that exact unexpired intent. VERIFIED, APPLYING and NEEDS_DECISION share a hard deadline 24 hours after verifiedAt. Retry, lease renewal, browser polling and asking for a decision do not extend it.

Every step rechecks state/version/deadline under D07 locks. At the deadline, serialize with any executing step and terminalize as EXPIRED when nothing was applied, or EXPIRED_PARTIAL when some target ownership changes already committed. Preserve those committed target changes; leave uncommitted source memberships unchanged. Do not roll back committed scores, silently merge participants, make an automatic KEEP_ACCOUNT choice or report COMPLETED. The authenticated target sees the explicit terminal/partial result and which progress was transferred. A still-valid source session can continue its remaining authorized participation. Once that session also expires, remaining source bindings are eligible for ordinary retirement.

An expired workflow cannot be revived by an old browser response or proof. A new attempt requires current valid source proof and a new operation, and can concern only memberships still owned by that source. A terminal operation ID is never reused. Actual database work must finish or roll back before its lease/lane is released; wall-clock deadline expiry does not cancel SQL by itself.

Retain terminal transfer evidence for 30 days for authenticated recovery/audit, then remove it through bounded maintenance. Preserve only participant/operation references needed by durable game evidence, without a restrictive source-user foreign key or a permanent copied guest identifier. Evidence of a detached source is not authority to claim it. A dependency outage may delay safe terminalization/cleanup; emit overdue-work evidence and resume on recovery rather than deleting through an unresolved transaction.

### D12.4. One repeatable retirement workflow

Implement a narrow AnonymousRetirement use case in the existing application/identity boundary. A persisted intent contains a stable operation ID, source binding, generation, requested time, state, bounded worker claim and completed step markers. It is temporary operational work, not an identity authority. Read/claim its work in short transactions; never hold PostgreSQL row locks while awaiting a game process or network call.

Under D07's lock order, recheck eligibility and record retirement intent. New browser admission/mutation/session validation must reject a committed retiring identity. Hooks and transaction predicates must prevent native refresh, session creation, registration/link verification and retirement from leaving a deleted-but-authorized user. A valid session that won the ordering protects the user; retirement cannot overwrite it. A retirement that won blocks new authority for that source. Prove this using the actual pinned native library paths, not a mocked callback. Pause a native hook after it reads eligibility but before its real insert/refresh/link commit, let retirement commit, then resume the native path; also test the inverse order. An ordinary before-hook followed by an unrelated transaction is not sufficient. The losing path must not establish usable authority, report a failed native write as successful authentication, or lose committed membership. A legitimately committed earlier response delayed in transit is handled by current server authority and browser identity-generation checks, not an impossible promise to retract bytes already sent. Do not add a session-row trigger that reverses the User-before-Session lock order.

For each bound participant, use the following server-only transition:

`ExpireAnonymousParticipant(retirementId, generation, participantId)`

- Validate the persisted intent, current anonymous source, absence of a valid session/protected transfer, current participant binding and applicable owner authority under the transaction locks.
- Remove active PLAYER membership, invalidate controller generation/binding and native seats, and release its active-party/capacity claim. Preserve KICKED when already kicked; otherwise record LEFT with the reason IDENTITY_EXPIRED for a previously active player. Never grant HOST or modify registered participants.
- Set userId=null only after authority is revoked. Preserve participantId, captured display information, committed answers, scores, ranking snapshots and historical role evidence. Do not recalculate results or undo a previously acknowledged answer.
- Persist an idempotent step/receipt and the game revision atomically, publish only after commit, and close obsolete connections. Repeating a finished step is safe.
- For inactive historical bindings, use the same authorized application transaction without unnecessarily reconstructing an ended room. For a still-active party, use the sole existing game mutation boundary even if its runtime must first be reconstructed.

Phase 02 implements that boundary on the current runtime and ships its scheduler/recovery. Phase 04 replaces its transport adapter with a server-created retirement actor in the fenced Colyseus lane and game-side polling/reconstruction. Nest records intent and may clean detached authentication data; it may not directly write active Colyseus membership. Retirement progress is independent of a browser remaining open. A disconnected player with an unexpired session is protected and must not take this transition.

Final deletion re-locks/rechecks the native User, all applicable sessions and lifecycle work, verifies that no participant/control/claim/owned resource still points to the source, and detaches/removes bounded terminal-work references. Delete only eligible anonymous native identity/session data plus temporary retirement work in an atomic schema-consistent transaction. History references already point to participants and survive. The new visitor journey receives a new identity only after an explicit join; it never reclaims a detached participant automatically.

This is an explicit maintenance exception to native authentication ownership. Keep all schema-dependent deletion in server-identity using the canonical server-persistence client and pinned generated Better Auth schema. Public game/management handlers cannot issue these deletes. Do not import private Better Auth adapters, enable a broad public admin endpoint, impersonate an administrator or call a self-service deletion endpoint using an expired cookie. Use native session APIs where appropriate and the narrow tested maintenance adapter for storage cleanup; do not implement cookie signing, password checks or a second authenticator.

### D12.5. Scheduler, bounded growth and release evidence

Use the maintained Nest scheduling integration, @nestjs/schedule, in the existing API application. Invoke a sweep at startup and every 15 minutes. Use PostgreSQL-backed work claims and the shared transaction rules to coordinate replicas; process-local cron non-overlap is insufficient. No new always-on service, message broker or proprietary scheduler is required.

Select at most 100 indexed candidates per batch, ordered by eligibility time and stable ID. Use short per-identity/step transactions, bounded lock/statement timeouts and bounded retries. Repeat batches within a configured runtime budget, record a continuation/backlog and resume automatically. Do not cap service throughput at only 100 deletions per 15 minutes. Do not scan/lock the entire user table or hold a transaction across a sleep. Use EXPLAIN with the actual generated schema to justify indexes on anonymous selection, session user/expiry, transfer status/deadline, participant binding and retirement claims.

At the declared Phase 02 lifecycle/churn fixture, healthy dependencies must process eligible work within one hour. The fixture models 99% guest participation, repeated arrival cohorts, retained historical results, abandoned active membership and transfer failures. State the arrival rate and hardware, and measure retirement throughput/backlog; do not turn the guest percentage into an invented daily traffic forecast. Test enough accelerated expiry cohorts to demonstrate that live anonymous identity/session counts track the recovery window and backlog rather than cumulative historical participation. No real time travel is allowed in a shared environment; use an isolated controlled clock or safely seeded expirations.

Phase 02 must already expose operational evidence for registered-user count, live anonymous count, eligible backlog/oldest age, expired sessions, transfer deadlines, cleanup duration/deletion rate and errors. Alert/log a clear failure when no successful sweep occurs for one hour or oldest eligible work breaches the tested target. Do not label metrics by user, participant, session or operation ID. Phase 05 automates dashboards, restore rehearsal and measured larger envelopes; it does not introduce required cleanup for the first time.

Rate-limit anonymous creation at the actual server endpoint with per-source and aggregate budgets, plus the existing self-hosted abuse controls when appropriate. Frontend explicit-play intent alone is not an abuse defense. Retain the shared-venue admission behavior: 500 legitimate players behind one IP must fit the supported Phase 04 profile. A bot must not be able to allocate unbounded identities faster than configured admission/storage budgets without observable throttling.

Model capacity using created anonymous journeys per unit time multiplied by mean retained lifetime, plus bounded transfer work and measured cleanup lag. This is a sizing model, not a measured benchmark. Continuously active sessions can live longer; retained party history grows according to its own policy. Observe PostgreSQL dead tuples, autovacuum, table/index growth and WAL under churn. Normal deletion does not promise immediate filesystem shrinkage. Do not introduce partitioning, sharding or scheduled VACUUM FULL without measured need.

After a disaster restore, an older backup cannot reveal every revocation/deletion after its recovery point. The Phase 02 restore runbook therefore invalidates restored native sessions and room seats before public traffic resumes, and invalidates restored one-time authentication capabilities, including native reset/Verification records. Before transfer polling or public traffic is enabled, terminalize ALL restored nonterminal transfers as RESTORE_INVALIDATED, or RESTORE_INVALIDATED_PARTIAL if steps already committed in the restored database. Preserve only those restored committed ownership effects and prohibit further replay of restored proof. A new transfer requires fresh valid source/target verification. Re-evaluate retirement work using current time after this authority cutover. Registered users sign in again; expired/lost anonymous credentials are not reconstructed from names or results. Preserve restored domain results subject to the explicit disaster RPO. Ordinary process restart or compatible deployment does not take this logout path. Phase 05 automates the same procedure. Backup retention is separate: deleting a live guest row does not instantly erase historical backups.
