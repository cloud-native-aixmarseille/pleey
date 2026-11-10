# ADR 0024: Share game previews through revocable links

- Status: Proposed
- Proposed date: 2026-11-10
- Accepted date: N/A

## Context

[Issue #555](https://github.com/cloud-native-aixmarseille/pleey/issues/555)
describes a collaboration need: game creators want people without Pleey accounts
to review their games. In the [clarification](https://github.com/cloud-native-aixmarseille/pleey/issues/555#issuecomment-6775678693),
the requester suggests either a read-only question listing or a solo game that
does not require operating host controls. These are candidate experiences, not
an agreed architecture or a requirement to implement both.

The decision must establish what recipients can see, how creators grant and
withdraw access, and whether reviewing content requires a gameplay session.
Account-free access does not require publishing games in a discoverable catalog.

### Repository evidence

Source inspection on 2026-11-10, at commit
`aa7d922386c5b707d19bf5bc8da9715c4f4066f1`, found:

- Quiz and prediction authoring reads require an account and current organization
  membership through [GameTypeManagementAccessGuard][management-access]. Ordinary
  members can author games; this is not an owner-only entitlement.
- [Party creation][party-create] requires an authenticated host, checks game and
  host availability, resolves settings and a theme, persists a party, and
  broadcasts its observation. A party is a live session with lifecycle effects,
  not an existing read-only preview facility.
- [Quiz media access][editor-media] checks editor permission before issuing a
  short-lived delivery URL. The [media issuer][media-issuer] only serves ready
  assets attached to live questions and games. Snapshot sharing would therefore
  also require a different media retention and authorization model.
- The [data model][schema] distinguishes authored games from parties, guests, and
  scores. There is no persisted preview-sharing grant.

These observations establish integration constraints. They are not evidence that
the proposed preview feature has been implemented or tested.

## Decision Drivers

- Let a collaborator inspect content without signing in or operating a host UI.
- Make external disclosure explicit and reversible for future reads.
- Preserve workspace permissions and prevent access to unrelated games or data.
- Support the existing quiz and prediction types, including question media.
- Keep previews independent of live parties, scores, history, and availability.
- Reuse existing application boundaries, pagination, UI components, and media
  delivery without introducing another runtime or external service.

## Considered Options

### Option 1: Share an exported document

A PDF or other static export supports account-free review and has no anonymous
application API. However, creators must resend each revision, interactive media
is less useful, and distributed copies cannot be revoked. Export is a reasonable
separate feature, but is not selected for ongoing review through one link.

### Option 2: Make existing editor or game-ID URLs public

This saves some UI work but changes the authorization contract of management
queries and couples external disclosure to editor fields and actions. A game ID
also provides no independent expiry or rotation. Reject this option; hiding edit
buttons does not establish an access boundary.

### Option 3: Share a dedicated read-only view of the current game

An opaque, revocable bearer link grants access to a restricted content projection.
Recipients see saved changes on subsequent reads. This directly supports content
review, reuses current content and media storage, and needs no party. Its main
trade-off is that future saved edits are disclosed while the link remains active.

### Option 4: Publish an immutable review snapshot

The creator deliberately publishes a revision, and all reviewers see the same
content until it is replaced. This avoids disclosing subsequent edits and is
better suited to formal approval. It adds publication/version management and
retention of replaced or deleted media. The issue does not establish a need for
revision approval or archival review, so defer this option.

### Option 5: Provide a hostless solo playthrough

A real party could automate host actions, but would need a distinct lifecycle,
participant identity, isolation from active-party restrictions and statistics,
and cleanup. A browser-only simulation avoids those writes but introduces a
second progression/scoring implementation whose fidelity must be maintained.
Either can help evaluate pacing and gameplay, but adds substantially more scope
than content review. Defer solo play until that experience is a confirmed need;
do not silently treat a read-only listing as satisfying a playtesting requirement.

## Decision

Choose **option 3: a dedicated read-only preview of the current saved game,
authorized by a revocable, unlisted link**. This is the proposed initial response
to issue #555. It supports content collaboration; it does not simulate playing.

The following product choices are proposals for review, not requirements inferred
from the issue: showing answer correctness, sharing subsequent saved changes,
allowing ordinary authors to share, and expiring links after seven days.

### Review experience and disclosed content

An authorized author creates a link from game management and sends it through
their usual communication channel. A recipient opens a standalone preview page,
without an account, guest identity, lobby, PIN, or workspace navigation.

The preview exposes only:

- Game title, description, and game type.
- Questions or prediction prompts in authored order, their type where applicable,
  answer/option text in authored order, configured time limits, and points.
- Authored correctness flags, including any configured prediction outcome, so
  collaborators can review the answer key. No result is invented for predictions
  without a configured outcome.
- Ready question media through authorized, short-lived access grants.

Use explicit preview response types rather than exposing management entities or
their nested relations. Omit organization/project details, member identities,
host/player data, party credentials, live outcomes, scores, and management
permissions. A preview grants no editing, importing, joining, or hosting rights.

The page identifies itself as a content review and offers paginated browsing and
refresh. It preserves authored order rather than applying party randomization.
An empty draft has a useful empty state; launch readiness and active parties do
not prevent review. Feedback remains outside Pleey; comments and approval
workflows are outside this decision.

### Link ownership and lifecycle

Add a game-owned preview-link record containing the game and original project
scope, issuing user, token digest, creation time, expiry, and revocation time.
Keep at most one active link per game. Authenticated authors with current game
management permission can inspect its status, create or replace it, and revoke it.
Use the reason-bearing action decisions from
[ADR 0014](./0014-unify-resource-scoped-permissions.md); the server enforces these
decisions again when executing each command.

- Sharing is off by default, including for existing games. Creating a link is an
  explicit action that explains that anyone receiving it can read the answer key,
  media, and subsequent saved edits, and can forward the link.
- Generate a cryptographically random 256-bit opaque token and store only its
  SHA-256 digest. Do not reuse account, recovery, guest, or party credentials.
  The token authorizes repeated preview reads until expiry or revocation.
- Return the complete URL only when creating or replacing the link. The author
  can copy it then or retain it in their conversation. Later management reads
  expose status and expiry only; recovering a lost URL requires replacement.
  Explain that replacement invalidates the previous link for every recipient.
- Use a fixed initial lifetime of seven days. Extension requires replacement;
  never-expiring links and per-recipient grants are outside the initial scope.
- Serialize creation/replacement per game so concurrent requests cannot leave
  multiple valid links. Revocation is idempotent. Expiry is checked during reads
  and does not depend on a cleanup job.
- Every preview and media-grant request checks the token, expiry, revocation,
  live game/project/organization, original project scope, and the issuer's current
  authoring entitlement. Resolve the game from the grant, not a caller-selected
  game ID. Scope item and asset lookups to that game.
- Game/project/organization deletion, a game move, and loss of the issuer's
  authoring entitlement invalidate the affected links. Persist revocation with
  those lifecycle changes so restoring membership or moving a game back cannot
  reactivate an old link. Another authorized author can issue a new one.

Malformed, unknown, expired, revoked, or out-of-scope links produce the same
localized "Preview unavailable" result without resource details. Rejected
access must not fall back to a logged-in user's broader permissions.

### Live content and consistency

The link reads the current saved content. It does not publish a copy, expose
unsaved browser edits, or subscribe recipients to realtime updates. Authors must
revoke sharing before saving changes they do not want reviewers to see. Show
this behavior when enabling sharing and keep active sharing visible in management.

Use the existing bounded pagination contract described in
[ADR 0011](./0011-standardize-list-query-pagination.md). Counts and rows must share
the same authorized scope and per-response database snapshot. Separate pages can
reflect different revisions under concurrent edits; the UI offers refresh and
does not claim a stable review revision. Do not use `Game.updatedAt` as a content
revision without accounting for question, option, and media changes.

### Application and transport boundaries

Keep preview grant policy and persistence under game management, with dedicated
application use cases for link management, preview reads, and media renewal.
Quiz and prediction adapters produce their explicit preview content through
existing repository ports where suitable. Shared game code must not acquire
quiz-specific rules or depend on party runtime orchestration.

Use the existing GraphQL API, following
[ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md).
Link-management mutations retain account authentication. Only dedicated preview
queries accept the preview capability; existing management queries, mutations,
and Socket.IO entrypoints retain their authorization contracts. Each resolver
delegates to an application use case.

Add a public frontend route, for example `/preview#<token>`, through the existing
route-factory mechanism. Reuse display components and the media renderer rather
than mounting the editor with disabled controls. Keep token handling in the
infrastructure routing/transport adapters and use the existing UI and translation
ports, with English/French copy and keyboard-accessible navigation.

Send the capability in POST GraphQL variables, never in a GET query string.
Keeping it in the page's URL fragment avoids sending it in the initial document
request ([MDN URI fragments](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)).
It remains a secret available to browser scripts and anyone with the full link.
Exclude tokens, signed media URLs, and preview content from logs, traces, error
reports, and analytics; do not persist them in browser storage. Use
`Referrer-Policy: no-referrer`, `noindex` for the preview page, and private,
`no-store` preview responses. Bypass the frontend's shared normalized cache for
these reads and clear in-memory content on token change or access failure.

Bound anonymous work using existing page limits, request-rate limits, and limits
on repeated GraphQL fields/batched operations. Count operations, not only HTTP
requests, as explained in the [OWASP GraphQL guidance](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html#rate-limiting).
Index exclusion and token secrecy supplement server authorization; neither
replaces it.

### Media authorization and revocation limits

This decision proposes an additional **preview-recipient** media audience beyond
the editor/host audiences in
[ADR 0018](./0018-support-media-on-quiz-questions.md#storage-and-delivery).
Acceptance must explicitly include this extension. Existing player/guest media
restrictions and private object storage remain in force.

After validating the preview grant, verify that the requested ready asset belongs
to a currently visible question of that same game, then reuse `MediaAccessIssuer`.
Apply the same checks on URL renewal. Never publish permanent object URLs or
authorize arbitrary asset IDs merely because a preview token is valid.

Revocation stops subsequent preview reads and grant issuance. Previously issued
media URLs remain usable for their remaining configured lifetime, including
after preview-link expiry. Previously received content cannot be recalled.
Retain the existing bounded media-grant lifetime and renewal behavior; do not
promise immediate withdrawal of downloaded content or open playback streams.

## Consequences

### Positive

- Collaborators can review both supported game types without an account or host.
- One link follows saved content changes and can be withdrawn centrally.
- Authoring and gameplay authorization remain separate from external review.
- Preview traffic creates no parties, guests, scores, history entries, or active
  game/host conflicts, and requires no new media storage or gameplay engine.

### Negative

- A forwarded link reveals the content and answer key; recipients are not
  identified, and individual-recipient revocation is unavailable.
- Live sharing exposes subsequent edits and cannot provide revision-specific
  approval or a consistent snapshot across multiple page requests.
- A lost link must be replaced, and replacing or revoking it affects all reviewers.
- Anonymous reads add authorization, abuse-control, and media-delivery work.
  Revocation cannot retract already delivered content or unexpired media grants.
- Pacing, answer submission, scoring, and hostless play remain unaddressed.

### Follow-Up

1. Review the proposed scope with issue #555 before implementation, especially
   live sharing, answer-key disclosure, ordinary-member sharing, and link lifetime.
   If solo play is required, decide its runtime and lifecycle in a separate ADR.
2. Implement grant persistence, atomic lifecycle changes, permission decisions,
   scoped projection queries, and the preview media audience. Existing games
   receive no active grants during migration; no content backfill is needed.
3. Add management controls and the standalone preview page, regenerate GraphQL
   types, and update the relevant development guides with implemented behavior.
4. Require focused unit/integration coverage for unauthorized creation, concurrent
   replacement, expiry, idempotent revocation, issuer removal/reinstatement,
   resource deletion/moves, scoped pagination, cross-game item/media access, and
   denial of management or party actions using a preview token.
5. Require browser coverage for anonymous quiz/prediction review, answer-key and
   media display/renewal, empty drafts, saved edits on refresh, unavailable links,
   token changes, accessibility, and English/French copy. Verify preview browsing
   leaves parties, participants, scores, and history unchanged.
6. Verify cache headers, token/content redaction, and limits on anonymous GraphQL
   operations before exposing the feature. These are implementation acceptance
   requirements, not checks completed by this documentation change.

[management-access]: ../../../../application/backend/src/application/game/types/shared/services/game-type-management-access-guard.ts
[party-create]: ../../../../application/backend/src/application/game/party/host/use-cases/create-party-use-case.ts
[editor-media]: ../../../../application/backend/src/application/game/types/quiz/use-cases/get-quiz-question-media-access-use-case.ts
[media-issuer]: ../../../../application/backend/src/infrastructure/media/prisma-media-access-issuer.ts
[schema]: ../../../../application/backend/prisma/schema.prisma
