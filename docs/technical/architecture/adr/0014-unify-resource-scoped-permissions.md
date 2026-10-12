# ADR 0014: Unify resource-scoped permissions across backend and frontend

- Status: Proposed
- Proposed date: 2026-10-12
- Accepted date: N/A

## Context

Pleey has several working authorization patterns, but no common strategy for
deciding access, enforcing it, and explaining available actions to the frontend.
Theme management exposes this fragmentation: its application service delegates a
role decision to a database adapter, while organization membership has a domain
policy and the frontend repeats some of those rules.

This is a proposal only. It does not change permissions, APIs, or authentication.
It follows [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md), the
[resolver boundary](../../development/backend/application-patterns.md#writing-resolvers),
and the session responsibilities in
[ADR 0009](./0009-harden-identity-recovery-and-sessions.md).

### Audit of current usage

The source audit covers workspace management, themes, game authoring, party
commands and observation, account ownership, and frontend gates. The baseline is
`main` at `278053362140abee4ac45145ca944272c3605636`. Theme findings use the
committed implementation at `9d0271c8b00b548b2146f9c873118c5e5e2bc84f` in
[PR #505](https://github.com/cloud-native-aixmarseille/pleey/pull/505). Local theme
route work was also inspected; it is identified separately below and is not part
of the baseline or this PR. These are source observations, not a penetration test.

| Area | Current behavior and consequence |
| --- | --- |
| Authentication | [GraphQL guard][gql-guard] and [session authenticator][session-auth] establish identity and active sessions. The [Socket.IO adapter][io-adapter] also checks authenticated inbound packets and periodically revalidates sessions. Authentication does not decide resource access. |
| Organization membership | [Membership access service][membership-access] loads facts; [membership policy][membership-policy] enforces management privileges, owner protection, and the last-owner invariant. This is the closest existing model for reuse. |
| Organization and project administration | [Organization update][organization-update] and [project create][project-create], [update][project-update], and [delete][project-delete] repeat membership and management checks. The delete path separately validates the last-project and migration-target constraints. |
| Game authoring | [GameTypeManagementAccessGuard][game-access] resolves the project's organization and requires membership, including ordinary members. Its name must not be interpreted as an owner/manager restriction. |
| Theme management | [ThemePermissionService][theme-access] calls `ThemeRepository.findAccess`; [PrismaThemeRepository][theme-repository] decides whether the role is owner or manager in infrastructure. Members may read the library; managers and owners may save themes and upload assets. |
| Game action decisions | [GamePermissionResolver][game-permissions] returns `ActionPermission` decisions and reuses its decision builder for party creation. These decisions describe readiness and active-party conflicts; [CreatePartyUseCase][party-create] checks membership separately. They are not complete authorization decisions by themselves. |
| Party host and player actions | [Host runtime use cases][host-access] compare the authenticated user with the party's host. [Player submission][player-submit] loads a target for the party/player and applies gameplay policy. Neither relationship is an organization role. |
| Observation and public media | [Observation gateway][observation-gateway] accepts observation by party ID; [broadcaster][observation-broadcaster] and [audience resolver][observation-audience] select host or player output. [Avatars][avatars] and [theme assets][theme-assets] have public HTTP reads. A workspace-membership guard cannot be imposed on all these paths without changing their product contract. |
| Account and personal lists | [Session revocation][session-revoke] uses the authenticated user's scope; [party listing][party-list] delegates to a user-scoped port. These need ownership and query scoping, not organization roles. |
| Frontend organization management | [Screen state][organization-screen-state], [member controls][member-controls], and [organization edit][organization-edit] repeat owner/manager rules. [Project controls][organization-screen] enable creation when an organization is selected and removal when more than one project exists; [project edit][project-controls] is offered without a role check. The backend requires management privileges for all three operations. |
| Frontend game and party actions | [Game catalog adapter][game-adapter] consumes server decisions and [game card][game-card] translates their reasons. [Host controls resolver][host-controls] derives lifecycle availability locally. Role labels and host/player navigation also exist, but those are not necessarily authorization checks. |
| Frontend routes and theme work | [ProtectedRoute][protected-route] checks authentication only. The inspected local theme work adds a `canManageThemes` boolean and a route-specific loading/allowed/denied/error state. The theme navigation link still derives access from organization role rules. This is another consumer to migrate, not a second policy model to standardize. |

The audit reveals a concrete UX mismatch in project administration and policy
duplication across layers. It does not establish that every difference is a
security defect: ordinary-member game authoring, public media, and player
observation have distinct existing semantics.

## Decision Drivers

- Give each action one authoritative backend policy, reused for enforcement and
  UI decisions, while keeping feature ownership.
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

Propose option 2. The backend owns authorization. The frontend consumes
resource-scoped decisions for presentation and still handles command rejection.
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

| Action family | Authorization baseline to preserve | Additional facts or constraints |
| --- | --- | --- |
| Organization details, members, projects, game catalog, theme library reads | Current membership in that organization | Scope rows and counts to the same live organization. |
| Organization update; project create/update/delete; theme create/update/asset upload | Owner or manager in the resource's organization | Project deletion constraints, valid theme selection, asset ownership, and theme revision still apply. |
| Member add, role update, removal | Owner or manager; only an owner can assign the owner role or manage an owner | Target membership must belong to the same organization; preserve the last owner. |
| Quiz/prediction authoring and imports; party creation | Organization membership, including ordinary members | Resolve organization through the stored project/game relationship; evaluate creation readiness separately. |
| Party host commands | Authenticated user is that party's stored host | Lifecycle policy controls individual commands. Organization management alone grants no host control. |
| Player commands | Verified user/guest participation in that party | Current player eligibility, party settings, and stage/action validity. |
| Account profile, sessions, and personal lists | Authenticated account owns the requested scope | Derive the account from the session; a party list includes only that user's relevant parties. |
| Public/observer reads | Explicitly declared public or audience-specific action | Define the permitted projection. Public avatars/assets and permitted party observation do not grant workspace or host access. |

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

### 4. Expose typed decisions, not frontend policy rules

Reuse the existing [backend `ActionPermission`][backend-decision],
[GraphQL type factory][graphql-decision], and [frontend `Permissions`][frontend-decision]
shape:

```typescript
interface ActionPermission<Reason extends string> {
  readonly allowed: boolean;
  readonly reason: Reason | null;
}
```

For new or migrated decisions, `allowed: true` requires `reason: null`;
`allowed: false` has a stable, feature-owned reason code. Codes describe either
authorization denial or an action prerequisite, and their category is explicit
in the feature contract. Reuse applicable domain error enums instead of creating
parallel strings. Transport projections expose safe codes, not raw policy facts,
private diagnostics, or translated sentences.

Add permission objects to existing authorized resource and collection-context
responses. For example, an organization context can expose `permissions.update`
and `permissions.createProject`, even when its project list is empty; a project
can expose `permissions.update` and `permissions.delete`. Member rows need
target-specific update/removal decisions and an `assignableRoles` projection
computed from the same actor/target policy. A single `canManageMembers` cannot
express those distinctions. These names illustrate the proposed contract;
implementation PRs define the exact GraphQL fields and enums.

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
link. For an otherwise accessible resource, disable temporarily unavailable
actions with a localized reason through the existing design system. Network
errors offer retry without rendering protected controls as allowed. Unknown
actions, missing decisions, and malformed decision payloads fail closed; an
unrecognized denial reason remains denied with a generic localized explanation.

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
including private parties. Guest participation requires server-verified session
binding; do not treat a supplied guest ID as a permission grant. Reconnects,
kicks, expiry, and revoked sessions must update participation and audience
decisions. Authentication/session mechanics remain owned by identity and ADR
0009; this proposal does not replace them.

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
- The same policy can be tested through direct use-case calls and every transport.
- Public/guest flows and existing member privileges remain explicit and reviewable.

### Negative

- Permission projections add API fields and require frontend adapter, state, and
  i18n work. They remain snapshots and cannot prevent later command rejection.
- Fact loading, batched queries, and concurrency guarantees require deliberate
  implementation; a shared decision type alone provides none of them.
- Migrating realtime audiences and lifecycle decisions is broader than extracting
  the theme service and must be staged separately.

### Follow-Up

Implement only after this ADR is agreed, in independently reviewable slices:

1. **Characterize behavior and contracts.** Add actor/action/resource matrices for
   the audited areas, including nonmembers, deleted memberships, foreign resource
   IDs, target owners, and public/guest cases. Inventory all entry points and
   explicitly agree on observer/private-party disclosure. Record any entitlement
   changes separately from structural refactoring.
2. **Migrate organizations, projects, and themes first.** Reuse organization fact
   loading, introduce pure feature policies and matching assertion/projection
   paths, remove role decisions from the theme adapter, and expose resource
   capabilities. Add target-specific member decisions. Replace frontend role
   gates and correct project action visibility against those capabilities. Theme
   integration follows PR #505; this ADR can merge independently.
3. **Migrate game and party actions.** Preserve member-level authoring access;
   compose membership with existing game readiness decisions. Move host/player
   availability projections to the backend, make audience authorization explicit,
   and apply it to HTTP/GraphQL/socket reads and commands as applicable. Verify
   authenticated-session and guest-session behavior independently.
4. **Complete account/public coverage and retire old paths.** Confirm personal
   query/write scoping and public projections. Add fields before migrating
   consumers; if `canManageThemes` or other boolean contracts have shipped, keep
   temporary adapters backed by the same policy until their consumers move.
   Remove duplicate rules afterward. Schema removals or intentional permission
   changes need an explicit compatibility/release plan, not this documentation PR.
5. **Enforce the convention and update guidance.** Extend existing architecture
   checks where reliable to prevent role decisions in presentation/infrastructure;
   allow role serialization and display. Update backend/frontend development
   guidance with references to this ADR once accepted.

Each migrated slice must demonstrate:

- Policy tests for allowed and denied actor/resource/target combinations, and
  parity between projected decisions and command enforcement for the same facts.
- Use-case tests proving denied operations perform no protected side effects,
  including upload reads, and repository tests for tenant-scoped rows and counts.
- Transport tests for direct requests, forged actor/parent IDs, and cross-resource
  access; socket tests also cover reconnect, kick, revocation, and audience output.
- Frontend tests for direct routes, loading/error/denied states, stale asynchronous
  responses after account/workspace changes, unknown reasons, and command denial
  after an initially allowed decision.
- Database integration tests for critical concurrent transitions such as removing
  or demoting the last owner. Existing rules must not become less restrictive
  through a capability projection or more restrictive through generic role checks.

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
