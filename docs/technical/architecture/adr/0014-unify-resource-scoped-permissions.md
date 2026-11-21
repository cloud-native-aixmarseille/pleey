# ADR 0014: Unify resource-scoped permissions across backend and frontend

- Status: Accepted
- Proposed date: 2026-10-12
- Accepted date: 2026-10-12

## Context

Pleey has several working authorization patterns, but no common strategy for
deciding access, enforcing it, and explaining available actions to the frontend.
Theme management exposes this fragmentation: its application service delegates a
role decision to a database adapter, while organization membership has a domain
policy and the frontend repeats some of those rules.

Implementation is included in [PR #514](https://github.com/cloud-native-aixmarseille/pleey/pull/514),
based directly on `main`. PR #505 reuses that foundation for theme management,
with `ThemePermissionPolicy`, shared membership loading, and reason-bearing
read/create/update/upload decisions. It follows [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md), the
[resolver boundary](../../development/backend/application-patterns.md#writing-resolvers),
and the session responsibilities in
[ADR 0009](./0009-harden-identity-recovery-and-sessions.md).

### Audit of the pre-migration baseline

The source audit covers workspace management, themes, game authoring, party
commands and observation, account ownership, and frontend gates. The baseline is
`main` at `278053362140abee4ac45145ca944272c3605636`. Theme findings use the
committed implementation at `9d0271c8b00b548b2146f9c873118c5e5e2bc84f` in
[PR #505](https://github.com/cloud-native-aixmarseille/pleey/pull/505). Local theme
route work was also inspected; it is identified separately below and is not part
of the baseline or this PR. These are source observations, not a penetration test.

| Area                                    | Current behavior and consequence                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Authentication                          | [GraphQL guard][gql-guard] and [session authenticator][session-auth] establish identity and active sessions. The [Socket.IO adapter][io-adapter] also checks authenticated inbound packets and periodically revalidates sessions. Authentication does not decide resource access.                                                                                                                                                    |
| Organization membership                 | [Membership access service][membership-access] loads facts; [membership policy][membership-policy] enforces management privileges, owner protection, and the last-owner invariant. This is the closest existing model for reuse.                                                                                                                                                                                                     |
| Organization and project administration | [Organization update][organization-update] and [project create][project-create], [update][project-update], and [delete][project-delete] repeat membership and management checks. The delete path separately validates the last-project and migration-target constraints.                                                                                                                                                             |
| Game authoring                          | [GameTypeManagementAccessGuard][game-access] resolves the project's organization and requires membership, including ordinary members. Its name must not be interpreted as an owner/manager restriction.                                                                                                                                                                                                                              |
| Theme management                        | [ThemePermissionService][theme-access] calls `ThemeRepository.findAccess`; [PrismaThemeRepository][theme-repository] decides whether the role is owner or manager in infrastructure. Members may read the library; managers and owners may save themes and upload assets.                                                                                                                                                            |
| Game action decisions                   | [GamePermissionResolver][game-permissions] returns `ActionPermission` decisions and reuses its decision builder for party creation. These decisions describe readiness and active-party conflicts; [CreatePartyUseCase][party-create] checks membership separately. They are not complete authorization decisions by themselves.                                                                                                     |
| Party host and player actions           | [Host runtime use cases][host-access] compare the authenticated user with the party's host. [Player submission][player-submit] loads a target for the party/player and applies gameplay policy. Neither relationship is an organization role.                                                                                                                                                                                        |
| Observation and public media            | [Observation gateway][observation-gateway] accepts observation by party ID; [broadcaster][observation-broadcaster] and [audience resolver][observation-audience] select host or player output. [Avatars][avatars] and [theme assets][theme-assets] have public HTTP reads. A workspace-membership guard cannot be imposed on all these paths without changing their product contract.                                                |
| Account and personal lists              | [Session revocation][session-revoke] uses the authenticated user's scope; [party listing][party-list] delegates to a user-scoped port. These need ownership and query scoping, not organization roles.                                                                                                                                                                                                                               |
| Frontend organization management        | [Screen state][organization-screen-state], [member controls][member-controls], and [organization edit][organization-edit] repeat owner/manager rules. [Project controls][organization-screen] enable creation when an organization is selected and removal when more than one project exists; [project edit][project-controls] is offered without a role check. The backend requires management privileges for all three operations. |
| Frontend game and party actions         | [Game catalog adapter][game-adapter] consumes server decisions and [game card][game-card] translates their reasons. [Host controls resolver][host-controls] derives lifecycle availability locally. Role labels and host/player navigation also exist, but those are not necessarily authorization checks.                                                                                                                           |
| Frontend routes and theme work          | [ProtectedRoute][protected-route] checks authentication only. The inspected local theme work adds a `canManageThemes` boolean and a route-specific loading/allowed/denied/error state. The theme navigation link still derives access from organization role rules. This is another consumer to migrate, not a second policy model to standardize.                                                                                   |

The audit reveals a concrete UX mismatch in project administration and policy
duplication across layers. It does not establish that every difference is a
security defect: ordinary-member game authoring, public media, and player
observation have distinct existing semantics.

## Decision Drivers

- Give each action one authoritative backend policy, reused for enforcement and
  UI decisions, while keeping feature ownership.
- Explain disabled actions to users with a typed reason from the same decision
  that disables the action, including a recovery step when applicable.
- Make organization, resource, actor, and target scope explicit; deny access when
  required facts are absent.
- Preserve current entitlements during migration and make intentional changes
  separately reviewable.
- Cover GraphQL, HTTP, Socket.IO, guest participation, and personal account data.
- Reuse the existing permission contract, domain errors, generated GraphQL types,
  application facades, and presentation components.
- Handle stale decisions and concurrent changes without treating the UI as an
  enforcement boundary.

## Considered Options

### Option 1: Share role helpers between frontend and backend

A common `isManager` or `canManage` helper reduces repeated comparisons, but the
browser still lacks authoritative membership, target ownership, owner counts,
and runtime state. It also encourages equating organization roles with party
relationships. A shared TypeScript rules package would not remove server checks
or stale browser facts. Rejected as the authorization strategy.

### Option 2: Backend policies with resource-scoped action decisions

Keep rules in feature-owned domain policies, load facts through application
services and ports, enforce them in use cases, and expose typed decisions to the
frontend. Standardize the contract and evaluation flow rather than one global
service. Extend the patterns already used by membership and game management.

### Option 3: Adopt a generic or external policy engine now

A policy engine could become useful for tenant-defined roles, configurable
grants, or authorization shared across independently deployed services. None of
those requirements is established here. Introducing a policy language, fact
synchronization, and another operational dependency would still leave resource
loading, command enforcement, and UI integration to implement. Defer this choice
until those requirements justify a separate ADR.

## Decision

Adopt option 2. The backend owns authorization. The frontend consumes
resource-scoped decisions for presentation and still handles command rejection.
Adopt the existing `ActionPermission<Reason>` pattern as the shared action
decision contract: every exposed denial includes a typed reason that the
frontend uses to explain the disabled action. Reason support is a required part
of this decision, including for availability constraints such as party creation.
No new authorization dependency or cross-application executable rules package is
introduced by this strategy.

### 1. Separate identity, authorization, and action availability

- **Identity** answers who is acting: an authenticated account/session, a verified
  guest participant in a particular party, or an anonymous visitor where allowed.
  Obtain identity from trusted transport/session context. A supplied user ID,
  guest ID, resource ID, role, or frontend permission is not proof of identity.
- **Authorization** answers whether that actor may perform an action on a
  particular resource. Facts may include organization membership, a target
  member's role, account ownership, or the party's host/player relationship.
- **Availability** answers whether an authorized action can currently proceed:
  last owner/project, missing stages, an active-party conflict, lifecycle state,
  or an incomplete command. These remain feature invariants and validation rules.

An exposed action decision combines authorization with the prerequisites known
for that view. Evaluate authorization before returning sensitive state reasons.
An allowed decision never promises that arbitrary future input will be valid.
Form completeness and pending requests can additionally disable a UI control;
they cannot grant authorization.

### 2. Define actions and scope within each feature

Use explicit, typed actions instead of a universal `manage` boolean or a global
role hierarchy. Each action defines its required actor, resource scope, target
facts, and domain reason enum. The following is the initial migration baseline,
not a new grants database or a complete API schema:

| Action family                                                                       | Authorization baseline to preserve                                           | Additional facts or constraints                                                                                               |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Organization details, members, projects, game catalog, theme library reads          | Current membership in that organization                                      | Scope rows and counts to the same live organization.                                                                          |
| Organization update; project create/update/delete; theme create/update/asset upload | Owner or manager in the resource's organization                              | Project deletion constraints, valid theme selection, asset ownership, and theme revision still apply.                         |
| Member add, role update, removal                                                    | Owner or manager; only an owner can assign the owner role or manage an owner | Target membership must belong to the same organization; preserve the last owner.                                              |
| Quiz/prediction authoring and imports; party creation                               | Organization membership, including ordinary members                          | Resolve organization through the stored project/game relationship; evaluate creation readiness separately.                    |
| Party host commands                                                                 | Authenticated user is that party's stored host                               | Lifecycle policy controls individual commands. Organization management alone grants no host control.                          |
| Player commands                                                                     | Verified user/guest participation in that party                              | Current player eligibility, party settings, and stage/action validity.                                                        |
| Account profile, sessions, and personal lists                                       | Authenticated account owns the requested scope                               | Derive the account from the session; a party list includes only that user's relevant parties.                                 |
| Public/observer reads                                                               | Explicitly declared public or audience-specific action                       | Define the permitted projection. Public avatars/assets and permitted party observation do not grant workspace or host access. |

Assigning a theme follows the permission for updating the destination
organization/project or creating the party; permission to edit the theme itself
is a different action. Existing parties do not acquire a new organization-role
requirement through this refactor. Whether membership removal should end ongoing
host control is a separate product decision.

### 3. Keep policies pure and enforcement in use cases

Feature domain policies take explicit facts and return decisions without database,
NestJS, GraphQL, React, or storage dependencies. Existing entity predicates can
remain policy inputs. Keep organization rules under `domain/organization`, theme
rules under `domain/theme`, and party rules under their owning game domains.
Only domain-neutral decision types belong in `domain/shared`.

Expose policies as framework-independent classes injected into their application
consumers and registered in the owning composition module. Import contracts from
their defining module rather than reexporting them from an unrelated port.
Backend service modules must not export standalone runtime functions; application
lint checks enforce these service and contract boundaries.

Application access services load active memberships, resource ancestry, target
members, or participant relationships through ports, then invoke those policies.
Reuse organization fact loading across workspace features; a theme repository
must return theme data, not decide whether a membership role can manage themes.
Replace `findAccess().canManage` with that flow. Do not turn the current
`OrganizationMembershipAccessService` into a service containing every feature's
permissions. Feature modules own and compose their access services, following
ADR 0002's provider-ownership rules.

Every protected use-case entry point applies the relevant action policy before
returning protected data or performing side effects. Query projections and
command assertions invoke the same decision logic; an assertion maps a denial
to the owning feature's existing domain error where possible. Resolvers,
controllers, and gateways extract identity, validate transport input, and call
`execute()`; adding a Nest role decorator is not sufficient enforcement.

For child resources, derive organization/project/party ancestry from stored data
and verify any supplied parent ID against it. Apply authorized scope and
soft-delete predicates before pagination and counts, as required by
[ADR 0011](./0011-standardize-list-query-pagination.md). Do not fetch a broad page
and filter it afterward. Repository predicates implement the authorized query
scope; they do not choose role entitlements. Batch resource facts and membership
reads within a request so capability projections do not introduce a query per
action or row.

Enforce before feature-level upload consumption, image processing, imports,
writes, or broadcasts. Re-evaluate against current facts on commands; never accept
a previous UI decision as a grant. Protect critical read/check/write invariants
such as the last owner with a transaction, lock, conditional write, or database
constraint appropriate to the persistence model. A separate `can()` read cannot
eliminate a race. Implementation must specify ordering against concurrent role
revocation for protected writes; a revocation completed before command
authorization must take effect without waiting for token expiry.

### 4. Require ActionPermission decisions with typed reasons

Reuse the existing [backend `ActionPermission`][backend-decision],
[GraphQL type factory][graphql-decision], and [frontend `Permissions`][frontend-decision]
shape:

```typescript
type ActionPermission<Reason extends string> =
  | { readonly allowed: true; readonly reason: null }
  | { readonly allowed: false; readonly reason: Reason };
```

For new or migrated decisions, the contract requires:

- `allowed: true` has `reason: null`.
- `allowed: false` has a non-null, stable, feature-owned reason code, suitable for
  a user-facing explanation. A generic denial code is appropriate when more
  detail would disclose protected information.
- The backend selects the reason using the same policy and facts as `allowed`.
  If several conditions block an action, return one reason in a documented,
  deterministic order, checking authorization before sensitive state conditions.
- Queries, realtime projections, adapters, and facades preserve both fields.
  A control may derive its `disabled` prop from `allowed`, but its view model must
  retain the reason for the accompanying explanation. Do not replace exposed
  decisions with bare booleans during migration.

Codes describe either authorization denial or an action prerequisite, and their
category is explicit in the feature contract. Reuse applicable domain error
enums instead of creating parallel strings. Transport projections expose safe
codes, not raw policy facts, private diagnostics, or translated sentences.

The existing party-creation flow is the reference pattern. For example, this
domain decision uses the [existing create-party reason enum][game-contract]:

```typescript
const createParty: ActionPermission<CreatePartyDisabledReason> = {
  allowed: false,
  reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
};
```

The frontend translates that reason with
`dashboard.games.permissions.createParty.noStagesAvailable`, explaining that
the user must add a stage before creating a party. Preserve this behavior and
its existing conflict reasons when composing membership authorization with game
readiness. The frontend must not reconstruct the reason from roles or game state.

Add permission objects to existing authorized resource and collection-context
responses. For example, an organization context can expose `permissions.update`
and `permissions.createProject`, even when its project list is empty; a project
can expose `permissions.update` and `permissions.delete`. Member rows need
target-specific update/removal decisions and an `assignableRoles` projection
computed from the same actor/target policy. A single `canManageMembers` cannot
express those distinctions. Organization, project, and member decisions are implemented in the generated
GraphQL schema. Theme collection decisions are exposed by `listThemes.permissions`;
`themePermissions` supports direct management routes in PR #505.

Use the same application decision projection for GraphQL and realtime views.
Generate GraphQL transport types and map them through frontend infrastructure
adapters into domain/application contracts, preserving the existing boundaries.
Sharing a wire contract does not require frontend imports from backend code.
Avoid an unrestricted endpoint accepting arbitrary action/resource strings and
avoid a global permissions list in JWTs or persisted browser state.

### 5. Apply decisions consistently in frontend UX

Feature facades provide access state and action decisions to routes, navigation,
and controls. Keep `ProtectedRoute` responsible for session restoration and
sign-in; layer resource access through existing routing and UI ports. Replace
permission-related role comparisons with server decisions. Retain roles for
labels, editing authorized role choices, and navigation where they express a
view preference rather than an access grant.

Represent loading, allowed, denied, and failed access distinctly. Hide entry
points the user cannot access; show a localized access state for a denied direct
link. Whenever a visible action is disabled by an `ActionPermission`, present
its localized reason through the existing design system, whether the cause is
authorization or temporary unavailability. Use an inline explanation or an
accessible tooltip/help control, with information available to keyboard,
screen-reader, and touch users rather than only on hover. Explain how to resolve
the blocker when possible. Loading, pending requests, and form validation retain
their own feedback; they must not be presented as permission denials. Network
errors offer retry without rendering protected controls as allowed. Unknown
actions, missing decisions, and malformed decision payloads fail closed; an
unrecognized denial reason remains denied with a generic localized explanation.

Each frontend action uses one feature-owned reason enum, including an
`UNAVAILABLE` member for missing or malformed decisions. The decoder receives
that enum and returns the same reason type without adding a second reason enum.
Organization management composes separate project action, member list, and
member action hooks; each asynchronous action remains scoped to its organization.

Scope decision state to the authenticated session or guest context and resource
IDs. Clear it on logout/account change, and reset the active resource on workspace
switch. Discard responses from older contexts. Invalidate affected decisions
after membership/role changes and successful mutations, refresh on entering a
protected view and reconnecting, and consume relevant realtime updates. A
command rejected after revocation must clear or refresh stale UI access; do not
retry a mutation automatically. Begin without a persistent permission cache.

Server decisions also replace duplicated host lifecycle availability as party
views migrate. Local form/pending state can still narrow available controls, and
presentation can derive labels and stage numbers from the snapshot.

### 6. Make transport and public-access contracts explicit

Each query, mutation, HTTP handler, and socket command must be classified as
public, account-owned, workspace-scoped, or party/audience-scoped. Preserve public
health/authentication/avatar/branding behavior where intended. A UUID or party
PIN alone is not a substitute for defining what an observer may see.

Party observation needs an explicit audience decision before joining a room and
before projecting updates: host, verified player, or permitted observer. Preserve
the existing host/player separation while defining the observer contract,
including private parties. **Private parties admit only their host and verified
participants who have joined. Public parties retain anonymous observation with
the player-safe projection.** Guest participation requires server-verified session
binding; do not treat a supplied guest ID as a permission grant. Reconnects,
kicks, expiry, and revoked sessions must update participation and audience
decisions. Authentication/session mechanics remain owned by identity and ADR
0009; this decision does not replace them.

Keep unauthenticated, forbidden, not-found, and invalid-state outcomes distinct
internally using domain errors and the existing transport/i18n mappers. For a
resource the actor cannot discover, return the same public result as an absent
resource; do not disclose its membership or state through permission reasons.
For an already visible resource, expose the relevant action denial. Document
intentional error-contract changes during migration rather than silently
replacing every existing error with a generic forbidden error.

## Consequences

### Positive

- Theme and workspace permission rules leave infrastructure and UI components.
- Frontend routes and controls reflect backend decisions, including target and
  lifecycle constraints, instead of maintaining parallel role logic.
- Disabled actions explain their reason and, when applicable, how the user can
  make the action available, using the existing party-creation pattern.
- The same policy can be tested through direct use-case calls and every transport.
- Public/guest flows and existing member privileges remain explicit and reviewable.

### Negative

- Permission projections add API fields and require frontend adapter, state, and
  i18n work. They remain snapshots and cannot prevent later command rejection.
- Fact loading, batched queries, and concurrency guarantees require deliberate
  implementation; a shared decision type alone provides none of them.
- Realtime audience authorization requires coordinated frontend/backend rollout
  and authenticated recovery before a private snapshot can be sent.

### Implementation and compatibility

PR #514 implements the workspace policies, target-specific member decisions,
project constraints, game readiness decisions, host lifecycle
decisions, and party audience checks. The existing design-system button and menu
components display translated denial reasons. The theme feature and its
permission wiring remain outside this main-based PR; PR #505 must reuse the
shared membership access service and decision contract. Unknown, missing, or
inconsistent
wire decisions become `PERMISSION_UNAVAILABLE`; they cannot grant an action.

The entry-point inventory is:

| Entry points                                                                | Classification and enforcement                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization, member, project, dashboard GraphQL operations                 | Workspace-scoped use cases resolve active membership through the shared access module; commands recheck feature decisions. Member rows carry target-specific roles and reasons.                                                                      |
| Quiz/prediction GraphQL authoring and import; game catalog and create-party | Workspace membership, including ordinary members; ancestry comes from stored project/game relationships. Create-party composes this with domain readiness/conflict policy.                                                                           |
| Socket observe, snapshots, updates, runtime notices                         | Party audience is checked before room admission and every outbound projection. Account sessions are revalidated; guest personal data requires the current verified connection. Obsolete unscoped observation getters are removed.                    |
| Socket join/rejoin, submit, leave, kick, host lifecycle commands            | Join validates identity/password or signed guest recovery; submit and leave require the current player session. Kick and lifecycle use cases require the stored host; lifecycle projections and commands share the domain policy.                    |
| Profile/avatar writes, identity sessions, personal party lists              | Existing authenticated-account ownership remains authoritative. Caller-supplied account identifiers cannot choose another account's scope.                                                                                                           |
| Authentication/recovery, health, avatar reads                               | Deliberately public entry points retain their existing validation, bounded media projections, and identity protections.                                                                                                                              |
| Theme GraphQL operations and theme-asset reads (PR #505 integration)        | Theme use cases enforce theme decisions loaded through shared membership access before consuming uploads or writing. Theme collections and direct routes expose typed decisions; asset reads remain public without granting theme-management access. |

Membership removal and role changes acquire the same organization row lock,
then reload actor, target, and owner count inside the transaction. Competing
last-owner changes cannot both succeed. Other protected writes authorize against
current membership at the command checkpoint: a revocation committed before that
check is observed; a write already authorized may complete concurrently with a
later revocation. This does not claim global serialization of all tenant writes.

Workspace capability projections reuse membership and collection counts rather
than loading one fact set per action. The pre-existing game catalog active-party
lookup still makes one lookup per game; batching that lookup is a performance
follow-up, with no additional per-action queries introduced here.

Frontend access is scoped to the current account, organization, and party.
Account changes remount protected/party state. Workspace changes cancel obsolete
requests; failed mutations, focus, and reconnect refresh decisions. Socket
failures clear host grants and current-player claims until a new server snapshot.
Released observations ignore queued callbacks. Form and pending state may further
disable actions; frontend roles and lifecycle guesses never grant them.

The following compatibility changes are intentional:

- Deploy backend and frontend together. GraphQL gains permission objects and
  role projections; host socket snapshots gain typed action decisions. Older
  snapshots fail closed in the new client.
- Private-party IDs alone no longer allow observation. Undiscoverable workspace
  resources and private observations use the same public not-found result as
  absent resources. Visible resources retain actionable denial reasons.
- Guest rejoin requires a signed, party/guest/join-record-bound credential with a
  24-hour recovery lifetime. New joins return it; the existing
  `party.guest-session.v1` storage key retains it with the party ID and PIN. A canonical private-party refresh recovers the guest
  before subscribing. Legacy guest IDs alone cannot be upgraded into proof: those
  users must join again under the party's normal joining rules. Existing open
  sockets should reconnect during deployment.
- Socket.IO buffered connection recovery is disabled because replay could precede
  renewed authorization. Reconnect uses fresh observation and verified rejoin.
  Guest connection bindings remain in the existing process-local registry;
  horizontal socket scaling still requires a shared registry/adapter design.
- Starting an empty lobby is now rejected by the backend as well as shown disabled
  in the UI. Manual paused-stage commands follow the existing backend lifecycle;
  automatic result reveal waits until the party resumes.

### Validation and maintenance

Policy and use-case tests cover role/target boundaries, foreign resources,
reason precedence, last-owner/project constraints, and denial before protected
writes. The PR #505 integration also covers denied upload consumption, fresh membership
checks after a previous grant, scoped updates, fail-closed decoding, and editor
revalidation without losing unsaved content.
Transport and credential tests cover private/public
projection, forged/expired credentials, replacement/kick behavior, revoked
sessions, and no output after denial. A PostgreSQL integration test races two
owner demotions and verifies that exactly one owner remains.

Frontend tests cover reason decoding and localization, accessible disabled
controls, target-role choices, host decisions, disconnected grants, late callbacks,
and recovery before private observation. Existing architecture, resolver,
pagination, unused-export, type, and i18n guards remain required for both apps.
Future actions follow this ADR and extend the feature's policy/transport tests;
role serialization and role badges remain presentation concerns.

[gql-guard]: ../../../../application/backend/src/presentation/identity/shared/guards/gql-jwt-auth-guard.ts
[session-auth]: ../../../../application/backend/src/infrastructure/identity/services/jwt-session-authenticator.ts
[io-adapter]: ../../../../application/backend/src/app/config/configured-io-adapter.ts
[membership-access]: ../../../../application/backend/src/application/workspace/organizations/services/organization-membership-access.service.ts
[membership-policy]: ../../../../application/backend/src/domain/organization/services/organization-membership-policy.ts
[organization-update]: ../../../../application/backend/src/application/workspace/organizations/use-cases/update-organization-use-case.ts
[project-create]: ../../../../application/backend/src/application/workspace/projects/use-cases/create-project-use-case.ts
[project-update]: ../../../../application/backend/src/application/workspace/projects/use-cases/update-project-use-case.ts
[project-delete]: ../../../../application/backend/src/application/workspace/projects/use-cases/delete-project-use-case.ts
[game-access]: ../../../../application/backend/src/application/game/types/shared/services/game-type-management-access-guard.ts
[theme-access]: https://github.com/cloud-native-aixmarseille/pleey/blob/9d0271c8b00b548b2146f9c873118c5e5e2bc84f/application/backend/src/application/workspace/themes/services/theme-permission-service.ts
[theme-repository]: https://github.com/cloud-native-aixmarseille/pleey/blob/9d0271c8b00b548b2146f9c873118c5e5e2bc84f/application/backend/src/infrastructure/theme/prisma-theme-repository.ts
[game-permissions]: ../../../../application/backend/src/application/game/management/services/game-permission-resolver.ts
[game-contract]: ../../../../application/backend/src/application/game/management/ports/game-catalog.port.ts
[party-create]: ../../../../application/backend/src/application/game/party/host/use-cases/create-party-use-case.ts
[host-access]: ../../../../application/backend/src/application/game/party/host/use-cases/abstract-host-party-runtime-use-case.ts
[player-submit]: ../../../../application/backend/src/application/game/party/player/use-cases/submit-party-action-use-case.ts
[observation-gateway]: ../../../../application/backend/src/presentation/game/party/realtime/party-observer-gateway.ts
[observation-broadcaster]: ../../../../application/backend/src/presentation/game/party/realtime/services/socket-party-observation-broadcaster.ts
[observation-audience]: ../../../../application/backend/src/presentation/game/party/realtime/services/party-observation-audience-resolver.ts
[avatars]: ../../../../application/backend/src/presentation/identity/http/avatar-controller.ts
[theme-assets]: https://github.com/cloud-native-aixmarseille/pleey/blob/9d0271c8b00b548b2146f9c873118c5e5e2bc84f/application/backend/src/presentation/theme/http/theme-asset-controller.ts
[session-revoke]: ../../../../application/backend/src/application/identity/session/use-cases/revoke-other-sessions-use-case.ts
[party-list]: ../../../../application/backend/src/application/game/party/shared/use-cases/list-parties-use-case.ts
[organization-screen-state]: ../../../../application/frontend/src/presentation/workspace/organizations/screens/management/use-organization-screen-state.ts
[member-controls]: ../../../../application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-members-section.tsx
[organization-edit]: ../../../../application/frontend/src/presentation/workspace/organizations/screens/management/components/edit-organization-form.tsx
[organization-screen]: ../../../../application/frontend/src/presentation/workspace/organizations/screens/management/organization-screen.tsx
[project-controls]: ../../../../application/frontend/src/presentation/workspace/organizations/screens/management/components/organization-project-list.tsx
[game-adapter]: ../../../../application/frontend/src/infrastructure/game/management/graphql-game-catalog.adapter.ts
[game-card]: ../../../../application/frontend/src/presentation/workspace/dashboard/screens/home/components/use-game-item-card-view-model.ts
[host-controls]: ../../../../application/frontend/src/application/game/party/host/services/host-party-runtime-controls-resolver.ts
[protected-route]: ../../../../application/frontend/src/presentation/shared/routing/protected-route.tsx
[backend-decision]: ../../../../application/backend/src/domain/shared/value-objects/action-permission.ts
[graphql-decision]: ../../../../application/backend/src/presentation/shared/graphql/types/action-permission-type.ts
[frontend-decision]: ../../../../application/frontend/src/domains/shared/value-objects/action-permission.ts
