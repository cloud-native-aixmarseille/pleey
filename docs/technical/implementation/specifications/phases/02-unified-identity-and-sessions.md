# Phase 2 - Replace identity and sessions completely

## PR outcome

Replace Pleey's custom account JWTs, refresh tokens and party guest credentials with one Better Auth installation. Registered and anonymous players use the same secure cookie session and the same durable party membership model. Anonymous auth users are temporary operational identities with a complete retirement lifecycle; historical participation never requires retaining them. Keep the current Socket.IO game transport and current management API operational in this PR; both must use the new identity system exclusively.

**This PR is complete and production deployable after Phase 1. It must not require Phase 3, Phase 4, a new game runtime or a later account migration to work.**

Suggested PR title: `feat(identity)!: unify account and anonymous sessions with Better Auth`.

## Required inputs and reading

Read [EXECUTION-CONTRACT](../EXECUTION-CONTRACT.md), [DOMAIN-CONTRACTS](../DOMAIN-CONTRACTS.md), [ACCEPTANCE-CATALOG](../ACCEPTANCE-CATALOG.md), this file and the Phase 1 evidence. Read the repository `AGENTS.md`, applicable scoped instructions and current identity/media/game adapters. Use the behavior inventory produced in Phase 1 as the feature checklist.

Use the final locations established in Phase 1: `apps/api`, `apps/web` and `packages/contracts`. Introduce `packages/server-identity` and create `packages/server-persistence` as the canonical owner of the Prisma schema, migration history and generated server client. Update imports, generation/migration commands, Docker artifact copies and Helm/Compose migration jobs in this PR. Do not retain a second schema/client owner under `apps/api`. Do not change the game transport or introduce Colyseus in this phase.

Write the identity ADR and update affected architecture instructions before implementation. Current GraphQL operation paths can remain until Phase 3, but all authentication and authorization behind them changes now.

## Production behavior at merge

- A visitor can join as an anonymous player without registering.
- Refresh, route navigation and an ordinary connection interruption recover the same authorized participant.
- Registered users can sign in, sign out, manage their profile and sessions, register, and reset a password through the complete self-hosted email flow.
- Existing registered identities and business ownership survive migration; their old credentials do not. Imported registered users set a new password through the native reset flow.
- One current identity has one bound membership per party. The same browser identity cannot create duplicate players through repeated joins or multiple tabs. Detached historical guest participants do not occupy the auth user table.
- A second tab observes until the user explicitly takes control. Old controller commands then fail.
- A guest can sign in/link to an account through a durable, explicit transfer workflow, including collision handling.
- Expired anonymous identities are automatically retired, including those attached to a still-running party. Scores/history survive independently and no valid session is removed by the cleanup job.
- Old JWTs, guest tokens and old reset tokens are rejected. No fallback verifier remains.

## 1. Implement one identity module

### Better Auth installation

1. Extend Phase 1's dependency matrix with exact tested Better Auth and supported Prisma adapter versions, verified against the pinned Node/Nest/Prisma runtime in this PR. Use the native password hasher and anonymous plugin. Do not add a custom auth server, second token issuer or temporary dual-hash verifier.
2. Mount the official Node/Express handler at `/api/auth/*` in Nest with the body-parser ordering required by the pinned integration. Complete any ESM/build configuration needed by that integration. Confirm raw request bodies reach the auth handler correctly.
3. Store sessions in PostgreSQL. Explicitly enable supported Prisma adapter transactions. Disable cookie session caching initially; do not use Valkey as an additional authentication authority.
4. Configure a host-only Secure HttpOnly cookie with `Path=/` and an explicit SameSite policy appropriate to the single-origin browser deployment. Use one configured external HTTPS origin for auth, management, media and current Socket.IO. Development configuration must be deliberate and must not weaken production defaults.
5. Use the native global seven-day session expiry and 24-hour refresh threshold from DOMAIN-CONTRACTS for registered and anonymous sessions. Do not invent an unsupported per-user-kind session option. Refresh through authenticated HTTP; a WebSocket connection does not itself renew the browser cookie. The web application checks/refreshes the session on initialization, foreground recovery and the configured active-session interval.
6. Validate trusted Origin on cookie-authenticated mutations and WebSocket admission. Apply CSRF defenses to application mutations as well as native auth endpoints. Do not trust a client-supplied role, user ID, organization ID or forwarded host without the configured proxy policy.

### Shared adapter contract

`server-identity` owns Better Auth configuration and exposes a small server API that returns the verified user ID, session ID, expiration, anonymous status and relevant identity version. It must not import GraphQL, Socket.IO, React or Colyseus.

Transport adapters extract the request headers and use this shared API. Current GraphQL context, current Socket.IO handlers and media routes must all migrate in this PR. Remove bearer-token parsing from these paths. Code needing current account/session information must not decode token claims in the browser.

For current-session authorization at mutation commit, use the transaction-scoped adapter in DOMAIN-CONTRACTS. Refactor the existing relevant Prisma runtime adapters so session/controller checks and the actual protected database mutation use the SAME Prisma.TransactionClient and commit boundary. Nested calls must not silently open an independent transaction. Apply current live-state changes only under that authorized command boundary; do not leave a new-session check followed by an unrelated old writer. Verify the actual Better Auth revocation operation conflicts with the chosen session-row lock. A successful `getSession` call before a long asynchronous operation does not authorize an eventual write after committed revocation.

Anonymous authentication is not management authorization. Update every `user != null` or equivalent guard that previously implied registration. Organization/project/admin permissions still require their explicit server-side roles. An anonymous user must not gain an account-only action through the new User row. Party creation/HOST authority, organization/project membership, content ownership and administration require a registered account under the existing product permissions. Keep account-directory queries and registered-account metrics explicitly filtered to registered identities; total physical auth-user rows are a separate operational metric.

### Complete account flows

Wire registration, sign-in, sign-out, profile editing, current-session display, listing/revoking other sessions and password recovery to the native library mechanisms and the existing product screens. Preserve the server-side self-hosted CAPTCHA protection documented by Phase 1 for registration/recovery; a client-only check is not sufficient. Avoid a new third-party CAPTCHA dependency.

Use the existing self-hosted SMTP configuration through a supported Better Auth email callback. Reset links use the configured public origin, have native expiry/single-use behavior and are never logged. Return a generic recovery response that does not disclose whether an email exists. Test through an SMTP sink in CI and a documented self-hosted SMTP setup. Native token storage and reset handling replace the old reset-token tables/use cases.

Do not mark an imported email verified without evidence. Do not introduce a new email-verification product requirement unless the Phase 1 inventory establishes it. Identity policy and permission checks remain separate.

## 2. Introduce durable participant identity

Create the final `PartyParticipant` identity model now and use it in the current gateway and UI. Follow DOMAIN-CONTRACTS exactly for fields, roles, states and constraints.

Required invariants:

- A stable opaque `PartyParticipant.id` identifies a participation. Its nullable `userId` is the current authentication binding, not the historical identity. Enforce unique `(partyId,userId)` for non-null bindings using the exact PostgreSQL constraint/index defined in DOMAIN-CONTRACTS; several detached historical participants with `userId = null` in one party are allowed. Repeated authorized joins while bound reuse the existing participant.
- Scores, submissions, ranking snapshots and durable command actor scopes reference `participantId`, never an anonymous auth user as their required historical parent. A guest auth-user deletion must not cascade through those records. Do not create a permanent global Actor/Guest table or retain a cross-party guest ID merely to replace the deleted User row.
- Server-owned roles are an explicit set containing HOST and/or PLAYER as authorized. HOST and owned application resources are registered-account-only. Creating a party gives HOST; it does not count as a player or permit answers until an explicit PLAYER join. Joining never grants HOST.
- A user has at most one active PLAYER party, protected by `UserParticipationClaim` and the common transaction lock order. HOST-only membership does not consume that claim.
- KICKED persists and denies rejoin. Reinstatement is outside this phase's product scope. Leaving removes PLAYER/release claim; preserve ACTIVE HOST authority if present, otherwise set LEFT. A HOST-only subject joining as PLAYER is a new player admission. Only a deliberate Rejoin action can reactivate LEFT under current admission rules. Network recovery cannot undo a leave or kick. A host cannot kick a HOST/themselves through the player-removal command.
- Current participant IDs remain stable through Phase 4. A connection/socket ID never becomes the participant ID.

Refactor current score/progress references to point to `PartyParticipant`. Replace `userId OR guestId` identity branches and remove old guest identity types. Do not leave a parallel Guest table as a live authority. Migrate old guest/history records using an explicit, access-controlled conversion map; do not merge by username, email guesses or IP address. Historical-only guests become detached participants directly, with no Better Auth User or Session created for them. Keep the conversion map only for the documented migration-validation window, then remove it; it is not a new permanent identity registry.

The membership service is a transaction-scoped application operation, not an arbitrary table repository exposed to every controller. It handles join, reattach, leave, kick and controller assignment. Protect user participation claims before the affected membership rows in the global order in DOMAIN-CONTRACTS. Repeated joins return the existing participant when authorized, without resetting progress or changing identity.

Private-party reattachment uses current authorized membership; it must not require retaining the plaintext party password. A new join still validates admission rules and the password. Late-join restrictions apply to new/reinstated players, not an already active member recovering its connection.

## 3. Update current Socket.IO admission and commands

Remove the custom guest credential and account access-token fields from handshake, join, observe, rejoin, media and gameplay DTOs. Resolve the actor from the current cookie session. Client-supplied participant IDs only identify a requested resource; the server checks ownership.

Revalidate on admission, reattachment, explicit control takeover and every mutating game action. Review Socket.IO connection-state recovery settings: no middleware-skipping or retained-auth path may restore private state using revoked or switched identity. If the current recovery facility cannot prove that boundary, use a fresh cookie-authenticated reattachment to the same participant. Do not keep obsolete credentials as a recovery escape hatch.

Add a controller generation to the participant. The first eligible connection can claim control if none exists. A subsequent tab must explicitly choose Continue here. Advance generation transactionally with a compare against the expected generation and bind it to the authenticated connection. Admission and explicit takeover do not require the caller to already own control; they do require current identity, membership and the takeover preconditions. Guard ordinary host/player mutations using the current binding and generation, including after awaits and before persistence. An old connection becoming visible does not regain control.

Other authorized tabs may observe under the current privacy policy. Logout, session revocation, kick and account switch invalidate the appropriate connection authorities. Passive sockets are checked and closed within the healthy-worker bound in DOMAIN-CONTRACTS; mutations fail closed immediately according to the transactional authorization rule. Do not promise timer execution while a process is suspended.

Keep current gameplay behavior functional. This PR does not need Colyseus's later state model, but new identity and controller guarantees cannot depend on that future migration.

## 4. Implement the anonymous-to-account transfer workflow

Set `disableDeleteAnonymousUser:true` to prevent premature deletion inside the library linking flow. This setting is not permission to retain source users indefinitely. Pleey's explicit retirement workflow below deletes the source promptly after a terminal transfer when safe, or after ordinary anonymous-session eligibility. The authentication library must not delete the source before the ownership transition and credential invalidation are durably resolved.

Implement durable `IdentityTransfer` state: PREPARED, VERIFIED, APPLYING, NEEDS_DECISION, COMPLETED, CANCELLED/FAILED, EXPIRED or EXPIRED_PARTIAL with explicit retry semantics and bounded deadlines. A guest preparing sign-in may create a source-bound intent after server authentication. Only Better Auth's verified linking context can identify the source and target users and advance the intent to VERIFIED. A browser-provided target user ID cannot do this.

The authentication operation and domain transfer are not one transaction. Persist verified intent before dispatching membership changes. Apply each change idempotently through the current party mutation boundary. Preserve participant IDs and historic records. Update user participation claims, role/control ownership and related references atomically in the documented lock order. Mark completion only after all required changes commit. A worker restart can resume VERIFIED/APPLYING intents.

Handle collisions explicitly:

- If the target account already owns a participant in the same party, do not merge scores or assign two participants to it.
- Present the conflict and require an explicit decision to keep the account's existing participant; this leaves the source guest history separately attributable and safely removes its active control according to DOMAIN-CONTRACTS.
- If the target already occupies a different active PLAYER party, do not silently leave it. Require the documented deliberate leave/keep decision before moving the active claim.
- Pending or cancelled transfers remain visible as such; successful authentication does not imply successful progress transfer.

Revoke superseded sessions through Better Auth after the chosen ownership transition is committed. After a successful terminal transfer, retire the source auth user automatically once no valid source session, bound participation, claim, live transfer hold or registered ownership remains. Historical participants/results are not blockers. Revoke every superseded source session through the tested native boundary first; a failed revocation leaves retirement pending and visible, never falsely completed. A source that still owns an untouched participation follows the expiry transition below. Retain historical participation under its independent product retention policy. A failure before verified proof exists must not transfer ownership or display successful linking/sign-in completion for that linking journey. Do not flush a target-account cookie or successful auth response before the verified source/target intent is durable. Use the documented awaited linking hook and public HTTP integration, and test actual error/Set-Cookie behavior. Before verification commits, the original guest session must remain usable for retry; after it commits, the persisted verified intent supports recovery. If the pinned version cannot satisfy that ordering, the release gate fails; do not ship a pretend-success or lost-source fallback. Do not infer proof from a lost old cookie or the fact that both names match.

Add a recovery action for a verified pending transfer under the authenticated target account. It resumes the same intent; it must not create a second transfer or allow arbitrary source accounts to be claimed.

### Bounded transfer lifetime

A PREPARED intent expires one hour after creation unless verified before that deadline. A VERIFIED/APPLYING/NEEDS_DECISION workflow has a hard deadline 24 hours after `verifiedAt`; retries, worker restarts and decision polling never extend it. Every step checks the deadline and status after taking the ordered transaction locks. A claimed row or unresolved dialog cannot pin a guest auth user forever.

Finalize timeout through the same serialized application boundary. Wait for or serialize with any executing transaction; a JavaScript timer cannot abandon SQL that is still running. Mark EXPIRED if no ownership step committed, or EXPIRED_PARTIAL if some committed. Keep already committed target ownership and its progress. Leave uncommitted source memberships unchanged until ordinary session expiry/retirement or another separately authorized action. Do not roll back accepted gameplay, merge scores, select KEEP_ACCOUNT automatically or report COMPLETED. Show the exact terminal outcome in the account-recovery UI.

Release transfer holds only after this terminal state is durable. Terminal proof/step metadata has a 30-day retention window, then is purged or reduced to non-identifying aggregate operational evidence. Its source-user references must not require the anonymous User row to survive; retain only the bounded immutable proof necessary for this workflow. A terminal record is never an authentication or recovery credential.

## 5. Retire expired anonymous identities in this release

### Eligibility and scheduling

Implement one maintenance entrypoint owned by `server-identity`, using the canonical persistence package and the maintained `@nestjs/schedule` integration in the existing API application. Add its exact tested version to the dependency matrix. It runs on startup and at least every 15 minutes in the production Compose and Helm profiles delivered by this PR. Coordinate concurrent API replicas through PostgreSQL claims/leases and bounded retries. No additional queue service, separate identity service or Phase 5 scheduler is a prerequisite.

Use indexed candidate selection and batches of at most 100 identities. Apply bounded per-identity transactions and a bounded per-run work budget; continue catch-up batches while budget remains and schedule further work while backlog exists. Define and measure a one-hour healthy-dependency catch-up bound for the declared release fixture, including a workload with 99% anonymous participants. Export last-success, eligible-backlog size, oldest eligible age, processed/error counts and stuck-intent status without user IDs as metric labels.

An ordinary anonymous user is eligible only when `isAnonymous` remains true, its `createdAt` is at least one hour old, no unexpired native Session exists and no unexpired transfer hold protects it. The one-hour creation grace covers users left behind by interrupted bootstrap. Expired transfer holds must first reach their guarded terminal outcome before participation detachment begins. A completed transfer can retire its source sooner once the explicit safe finalization conditions above hold. Any unexpired session protects the identity even when no socket is connected. Suspended tabs, a network error, a closed browser or an old `lastSeenAt` are not expiration evidence. Query all sessions under the transaction rules; never delete because the particular session seen by a stale client expired.

Native session expiry remains the recovery deadline. There is no extra 24-hour post-expiry authentication promise. Better Auth may already have removed an expired Session during a read; the absence of an unexpired session is sufficient when the other guards pass. Do not require expired session rows to remain as evidence, add per-message keepalive writes or recreate expired credentials to support cleanup. If a valid session appears or the user becomes registered before a guarded step commits, cancel/recheck retirement without deleting that session or changing the account.

### Retirement steps and authority

Persist a small `AnonymousRetirement` work record/tombstone while cleanup is pending. It identifies only the temporary auth user and idempotent participation steps, has a bounded claim/retry lifecycle, and is removed after completion; it is not an enduring replacement principal. Record the retiring state under the common locks. Every identity adapter/admission/mutation must reject a committed retiring identity, and the native integration must prevent a session create/refresh or new link proof from reviving it. A valid session that won the ordering protects the identity; retirement that won blocks new authority for that source. Recheck eligibility before every authoritative step and before final identity deletion.

For each still-bound guest participation, execute a server-created internal `ExpireAnonymousParticipant` transition through the current party application boundary. It must:

1. Lock the affected scope in DOMAIN-CONTRACTS order: capacity when a quota changes, User, Session, IdentityTransfer rows followed by AnonymousRetirement rows, each ordered by ID, then participation claims, runtime ownership where applicable, participants and durable game rows. Use current database time after locks. Claim discovery uses short transactions; never retain SQL locks across network calls or while awaiting another runtime.
2. Recheck that the binding still belongs to the same anonymous user, no native session is unexpired, no live transfer hold protects the binding, and no registered/HOST/resource ownership exists. A concurrent verified transfer or new valid session wins or loses through this shared ordering, never through a prechecked Boolean.
3. Invalidate control and connection/seat authority, release the active PLAYER claim and remove active PLAYER membership. Preserve KICKED; otherwise record LEFT with departure reason IDENTITY_EXPIRED. Set `userId = null` while retaining the stable participant ID.
4. Preserve accepted submissions, scores, result snapshots, captured historical role evidence and authorized historical attribution. Do not end the party, reveal hidden results, recalculate awards, merge identities or delete history to make an auth row eligible.
5. Commit before publishing the safe roster change or acknowledging the internal step. A disconnected/frozen old socket cannot regain authority if it later resumes. If publication fails after commit, reconcile current state before further commands.

This transition is internal maintenance authority, not a public player command and not a fabricated user session. Implement it now against the current Socket.IO application boundary; Phase 4 later moves the same contract into its fenced game lane. For ended/historical-only parties, use the corresponding transaction-scoped application path. An absent live runtime must not stall cleanup indefinitely; the current implementation must apply the guarded durable change and make its next runtime load reflect it. Preserve all existing current-runtime authority guards. Any still-resident runtime must reload/invalidate the affected membership projection, and later snapshot writes must not recreate its detached auth binding or control from stale memory.

After every binding/claim is detached and all transfer holds are terminal, delete the expired native sessions and temporary auth user through the server-identity maintenance adapter. This is the narrow, explicitly tested lifecycle exception to the normal library-owned identity writer rule. It is not the expired user's self-service delete endpoint, and must not depend on an expired cookie, an admin browser session or a private Better Auth internal API. Use the pinned schema/adapter and one guarded database transaction for final checks plus credential deletion. Auth-owned cascade rules may remove only auth-owned records; domain history must not cascade. A role/resource invariant violation fails closed and raises a visible repair alert; it is never silently cascaded away.

Prove native session create/refresh/revocation, registration/linking and cleanup races against the real library and PostgreSQL. The chosen parent/session locks must block a concurrent native session write from slipping between the final valid-session check and user deletion. Retain the work record through interruptions; a restart retries the same steps and finishes. Delete the completed retirement record atomically with final credential deletion, or use a tested bounded terminal cleanup that cannot leave its foreign key pinning the auth row. Completed work records and obsolete source identifiers are removed without waiting for a future phase.

## 6. Replace frontend token orchestration

Introduce one XState authentication actor at the application/session boundary. It coordinates CHECKING, CREATING_ANONYMOUS, AUTHENTICATED_ANONYMOUS, AUTHENTICATED_REGISTERED, REFRESHING, SIGNING_OUT and UNAVAILABLE/EXPIRED outcomes as appropriate. Reuse it in Phase 4; do not make it depend on Socket.IO.

Use the Better Auth browser client for native HTTP operations. Do not mirror session secrets into localStorage, Query/Apollo cache, XState snapshots or IndexedDB. Store only nonsecret recovery preferences if needed.

Anonymous bootstrap procedure:

1. Serialize initialization within the actor.
2. Acquire the short same-origin Web Lock specified by DOMAIN-CONTRACTS.
3. Recheck the current server session while holding the lock.
4. Create an anonymous session only after a confirmed no-session result.
5. Confirm the effective cookie session before joining any party.
6. Release the lock. Do not hold it during gameplay.

Feature-test Web Locks and implement the explicit degraded-support policy in the common contract. Network timeout, server unavailability and refresh error must not create a fresh guest. If two initial responses are delayed, only confirmed identity may own the join.

Cross-tab account change/logout increments a frontend identity generation. Destroy the old current socket, clear user-scoped HTTP data and private party UI, invalidate pending work and ignore late callbacks. New requests use the new generation. Retaining a stale view is allowed only during recovery of the same still-authorized identity.

For registered A-to-B switching, sign out/revoke the current A session through Better Auth and await confirmation before starting B's login. Do not revoke unrelated A sessions on other devices. If current-session revocation cannot be confirmed, keep the switch visibly pending and retry; client teardown alone does not revoke a frozen old socket. Guest linking uses its distinct verified-transfer ordering. Anonymous creation requires a deliberate anonymous-play intent and is disabled during logout/account switch.

Update all registration, account menu, anonymous join and profile copy in English and French. Regenerate affected guides and screenshots through repository tooling. Delete the old access/refresh token persistence, transport hub and per-party guest-session storage. A one-time removal of known obsolete storage keys is permitted; continuing to read them is not.

## 7. Migration and production rollout

Implement a versioned, repeatable dry-run/reporting import for the explicit data policy from Phase 1. Back up PostgreSQL and media, verify the backup, and enter the documented maintenance window before switching identity schemas.

Preserve existing registered user IDs, profiles, organization/project ownership and history references. Create native Better Auth credential accounts using the native hasher with an independently generated, unexposed random credential; never copy a bcrypt string into an incompatible password field. No imported user knows this generated credential. The tested native password-reset flow establishes their new password. Do not emit generated values in logs or migration reports.

Invalidate every previous account session, guest credential and reset token. Do not preserve active sessions through a dual verifier. Handle active parties according to Phase 1's explicit maintenance/reset policy, while preserving valuable content/history. Map historical-only guests directly to detached PartyParticipant/history records with stable participant IDs and `userId = null`. Do not bulk-create Better Auth anonymous users or sessions for old scores. Retain an access-controlled temporary migration map only for validation and the recorded rollback window; purge it afterward. Never silently merge duplicate rows discovered by the migration; report them and apply only the recorded deterministic resolution policy.

Switch the complete API/web release together. Confirm native login/reset, anonymous join, current gameplay, media authorization, logout and one complete anonymous-retirement run before reopening traffic. The release must have no old auth route, token DTO or secret-storage dependency remaining.

Before reopening any restored database to public traffic, invalidate every restored native session, room seat and one-time reset/Verification capability, and clear any session caches. Before transfer workers run, terminalize every restored nonterminal IdentityTransfer as RESTORE_INVALIDATED or RESTORE_INVALIDATED_PARTIAL; preserve only ownership steps already committed in the restored database and prohibit replay of old proof. A snapshot cannot know a cancellation, revoked session or consumed reset link after its recovery point, so an unexpired restored deadline is insufficient. New transfer work requires fresh verified proof. Reconcile retirement against current time and restored bindings without deleting historical results. Test that old cookies/reset links cannot authenticate; registered users sign in again and guests receive the explicit expired-session/new-join journey. Ordinary process restart or a compatible deployment does not use this disaster-only procedure. The runbook also specifies equivalent credential invalidation if restoring the preceding auth implementation.

Rollback after database transformation is a coordinated restoration of matching application images, database and applicable media state. Do not suggest that restoring an older container against the new identity schema is safe. Once new writes are accepted, use the documented restore/forward-fix decision and report any recovery-point consequences.

## Acceptance evidence

All IDs below are mandatory for this PR. Implement real HTTP/cookie/browser and database tests where indicated; do not replace the boundary with mocked successful session responses.

| ID | Scenario and required result |
| --- | --- |
| AUTH-01 | Fresh browser joins anonymously without registration; confirmed User/session and one durable participant exist. |
| AUTH-02 | Two first tabs and a delayed/lost sign-in response converge before join; no participant is created for an unconfirmed transient identity. |
| AUTH-03 | Repeated/concurrent joins produce one membership through SQL uniqueness and preserve progress. |
| AUTH-04 | Registered and anonymous cookies work consistently across current GraphQL, media and Socket.IO. Old access/refresh/guest tokens are rejected everywhere. |
| AUTH-05 | An anonymous user cannot use registered/account-only or unauthorized organization/project/admin actions. |
| AUTH-06 | A second tab observes; explicit takeover succeeds without prior controller ownership; concurrent expected-generation takeovers yield one winner; late old-tab mutations fail, including a paused handler resumed after takeover. |
| AUTH-07 | One active PLAYER party is enforced under racing joins. HOST-only membership does not consume the claim. |
| AUTH-08 | KICKED cannot rejoin; LEFT needs deliberate Rejoin; a network reconnect never reverses either state. HOST+PLAYER leave preserves HOST, releases PLAYER claim and makes later PLAYER admission obey late-join policy; host/self kick is denied. |
| AUTH-09 | Logout, revoke-other-sessions and password reset revoke the appropriate connected authority; test mutation/revocation ordering with real transactions. |
| AUTH-10 | Account A to B switch confirms current A-session revocation before B login, clears private state/caches and ignores delayed A callbacks. A frozen old raw socket cannot mutate after switching; unrelated A sessions remain valid. |
| AUTH-11 | Private-party reload restores authorized membership without a stored plaintext password or guest token. |
| AUTH-12 | Verified guest link preserves participant/progress. Interrupt before verification, after VERIFIED before transfer, and after domain commit before UI completion; each has a safe explicit result/retry without false completion. Unverified/forged proof cannot transfer. |
| AUTH-13 | Same-party and different-active-party account-link collisions require the explicit decision; no score merge or dual controller occurs. |
| AUTH-14 | Native reset email, expiry, single use, generic lookup response and post-reset login work through the SMTP sink; imported accounts cannot use old passwords. |
| AUTH-15 | Profile, session listing/revocation, registration protection and existing account behavior inventory pass in English/French. |
| AUTH-16 | Native/mobile browser reload and foreground recovery keep identity; simulated network failures never create a replacement guest. |
| AUTH-17 | Migration dry run, backup restore and coordinated rollback run on representative users, guests, owners and history. Restored sessions/seats/reset capabilities cannot regain authority; restored nonterminal transfers are invalidated without replay or rollback of already restored committed steps. Recovery-point limits are explicit and historical results survive. |
| AUTH-18 | Repository/package scan and browser storage inspection show no live old JWT/guest credential implementation or secret persistence. |
| AUTH-19 | A guest's expired auth User/Session records are deleted while participant IDs, accepted scores, submissions and result history survive. Multiple detached participants in the same party coexist; no global permanent Actor/Guest registry or identity FK retains the deleted user. |
| AUTH-20 | Any unexpired native session blocks retirement. Test native refresh/create/revocation and guest-to-account conversion against final cleanup under forced real-DB interleavings; no valid or registered identity is removed and no session insert slips past final deletion. Pause a real native before-hook after its read but before the actual write; let retirement win, resume the write, and prove no usable authority or false native-write success. Exercise the inverse ordering too; a separate hook check is not transaction evidence. |
| AUTH-21 | An expired guest in a still-running party is retired through ExpireAnonymousParticipant: LEFT/IDENTITY_EXPIRED or preserved KICKED, claim/control released, binding null, scores unchanged, party still live. A frozen old socket cannot resume or mutate. |
| AUTH-22 | PREPARED expires after 1h and verified/decision/applying work after 24h without deadline extension. Timeout races with a step safely, preserves committed target effects, leaves uncommitted source effects unchanged and returns EXPIRED/EXPIRED_PARTIAL. Terminal 30d proof retention never pins an auth user forever. |
| AUTH-23 | Successful linking automatically retires the source when native revocation and all guarded detach/finalization steps finish. Crash/retry before and after any step converges without lost history, duplicate transfer or deletion of a protected source. |
| AUTH-24 | Startup and 15min scheduling work with multiple API replicas, batches <= 100, bounded transactions and resumable work. A declared 99%-anonymous fixture catches up within 1h with healthy dependencies; backlog/oldest-age/error alerts expose failure. No Phase 5 dependency exists. |
| AUTH-25 | Migration of historical-only guests creates detached participants and zero new auth users/sessions. Registered-only HOST/resource guards reject guests; account lists/counts exclude temporary auth users. Temporary migration maps and completed retirement work are purged on schedule. |
| AUTH-26 | After guest expiry, a fresh explicit join creates a new identity and cannot claim an old detached participant by ID, name, join code or former URL. The same kicked identity stays denied; a new independent cookie identity follows ordinary admission and cannot be recognized as the same human by this design. Raw private history/media/receipt access remains authorized, and removal of an auth link is never described as guaranteed anonymization of retained names/history. |

Run the relevant suites through the root commands established by Phase 1: `pnpm verify`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:release`, `pnpm test:upgrade`, `pnpm test:restore` and `pnpm deploy:render`. Include the exact commit, configured deployment, completed acceptance IDs and limitations in the PR evidence. Do not mark a failed gate allow-failure.

## Definition of done and exclusions

Merge only when the complete current product runs on the sole new identity system and the production migration/reset path has been rehearsed. No TODO may say account linking, current socket authorization, guest uniqueness, anonymous retirement, transfer timeout, password reset or logout safety will arrive in a later phase. The deployment can run indefinitely with bounded anonymous operational identity retention and independent product-history retention.

Do not implement Colyseus, REST-wide replacement, a PWA, cross-device anonymous transfer, a new email-verification policy or a generalized identity platform here.

## Primary integration references

- [Better Auth anonymous users](https://better-auth.com/docs/plugins/anonymous)
- [Better Auth sessions](https://better-auth.com/docs/concepts/session-management)
- [Better Auth Express integration](https://better-auth.com/docs/integrations/express)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Inspected Better Auth security release](https://github.com/better-auth/better-auth/releases/tag/v1.7.27)
- [Current Pleey authentication and game baseline](https://github.com/cloud-native-aixmarseille/pleey/tree/89eba30755f53aced04b596bc1531854a15bc1d5/application)

The implementation must verify these APIs against its pinned dependency matrix. Source links explain the integration; this specification and DOMAIN-CONTRACTS define Pleey's required behavior.
