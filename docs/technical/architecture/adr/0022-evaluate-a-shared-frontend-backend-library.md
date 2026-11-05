# ADR 0022: Evaluate a shared frontend/backend library

- Status: Proposed
- Proposed date: 2026-10-27
- Accepted date: N/A

## Context

Pleey has two runtime applications with separate npm manifests, lockfiles, and
container images: `application/backend` and `application/frontend`. There is no
root npm workspace. [ADR 0002][architecture] requires dependency direction and
feature ownership; it does not require duplicate domain definitions in each app.

### Release model

The [release workflow][release] supplies one production image tag to both builds,
updates both subcharts to the same release version, and publishes the
[umbrella chart][chart] containing frontend and backend. Separate Deployments
allow distinct runtime configuration, but do not establish independent release
lifecycles or compatibility between arbitrary frontend and backend versions.
[ADR 0014][permissions] explicitly required deploying both together for its
permission-contract changes.

A shared source package adds a dependency within this coordinated release model.
It does not inherently require a separately published release or combine the
applications into one runtime service. Older browser clients can still coexist
with newer servers, so shared source does not remove rollout compatibility work.

### Source audit

The audit on 2026-11-05 covered all 279 non-test TypeScript files under
`application/backend/src/domain` and `application/frontend/src/domains` at
`aa7d922386c5b707d19bf5bc8da9715c4f4066f1`. Selected consumers in application,
infrastructure, and presentation layers were also inspected to establish reuse.
The findings below inform the proposed scope; they do not establish compatibility
or measure maintenance savings.

The assessment distinguishes common definitions, shared cores requiring local
adaptation, code without a current second consumer, and backend runtime
responsibilities. A file can contain both shareable and local declarations.
"Keep local" is not a claim that its source is inherently forbidden from reuse.

Concrete findings include:

- Identical identifiers, party settings/defaults, permission result shapes, and
  pagination contracts occur across applications. Backend pagination additions
  are defaults and normalized query fields, not conflicting common semantics.
- The [backend][backend-normalizer] and [frontend][frontend-normalizer] theme
  normalizers each have 226 lines, differing only in string formatting. Curated
  palettes are identical. [ADR 0012][themes] already requires their validation
  behavior to remain synchronized.
- Option validation, question-media acceptance, organization/project name
  validation, password input constraints, and party reading-time limits have
  corresponding frontend rules. Duplication is not limited to theme code or small
  generic types.
- [GraphQL codegen][codegen] generates frontend operation types, but maps the
  `ThemeDocument` scalar to `unknown`. It does not check that document's contents.
  [Backend][backend-events] and [frontend][frontend-events] realtime definitions
  are maintained separately under [ADR 0004][transports].
- The [template-import contract test][template-test] exercises both applications
  through the dedicated command described in [ADR 0016][imports]. It does not
  cover themes or realtime. The audit found no dedicated cross-application test
  for those contracts; separate app-local tests do not prove their agreement.

## Decision Drivers

- Maintain one definition for common business meaning and deterministic behavior
  when both consumers need it.
- Preserve feature ownership, dependency direction, and useful model guarantees.
- Keep server enforcement, trusted fact loading, and protected side effects
  authoritative regardless of where reusable source lives.
- Distinguish common domain semantics from application inputs, wire formats,
  presentation state, and persistence capabilities.
- Account for real build and migration costs without assuming independent releases.
- Verify behavior and serialized compatibility rather than only source equality.

## Considered Options

### Option 1: Retain application-local copies with contract tests

Preserve current package boundaries and compare common behavior through shared
valid/invalid fixtures and producer/consumer tests. This avoids package integration
but retains duplicate implementations, depends on representative cases, and needs
an explicit CI entrypoint. It remains useful for contracts whose implementations
should differ and as interim coverage during extraction.

### Option 2: Share only the theme contract and normalizer

Address the largest obvious repeated implementation first. This is a reasonable
migration slice, but an arbitrary permanent scope: party settings, identifiers,
validation, permission vocabulary, and other common definitions already have
concrete consumers. Once packaging exists, small size alone is a weak reason to
keep a common contract duplicated.

### Option 3: Share feature-owned domain modules and explicit common contracts

Introduce a repository-local package whose modules retain the existing feature
ownership: identity, organization, project, game, theme, media, and domain-neutral
shared primitives. Extract common types, constants, and deterministic behavior;
preserve local extensions and projections where consumers have different needs.
Keep application and transport contracts in modules with their own layer
ownership rather than placing every reusable DTO in the domain.

This removes duplicate sources of common meaning without requiring a universal
entity model or merging repositories. It requires coordinated consumer changes,
error/representation adapters, package integration, and tests. A package can
follow the repository's release version without a separate publishing workflow.

### Option 4: Merge both domain trees and translation catalogs wholesale

Moving every similarly named entity, port, error, and translation into one common
model overlooks distinct capabilities and representations. It would force
unnecessary dependencies or weaken guarantees through optional fields and broad
unions. Shared code does not require shared translation catalogs or one universal
frontend/backend model.

## Decision

Recommend option 3. All seven domains are eligible for sharing their common
semantics. Themes are an initial migration candidate, not the maximum scope.
Start with one repository-local package organized into feature modules; introduce
additional package boundaries only when a concrete consumer/build need justifies
them. This ADR remains proposed and introduces no runtime or build changes.

### Shared scope by domain

The table identifies common meaning, including declarations currently embedded
inside otherwise application-specific files. An entry authorizes a focused
extraction after acceptance, not an unchanged move of its entire directory.

| Domain / area                 | Common scope                                                                                                                                                                                                  | Adaptation to preserve                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared primitives             | `ActionPermission`, `Permissions`, `PaginatedResult`, `PaginationQuery`, common pagination maximums, identifier failures and error descriptors.                                                               | Keep backend normalized-query fields/defaults separate where only backend consumers need them. Reconcile error behavior before sharing constructors.                                        |
| Identity                      | `UserId`, `GuestId`, `CaptchaAction`, opaque token vocabulary, common public profile/session/history fields, and password input validation.                                                                   | Separate public response contracts from internal credential state. Preserve timestamp/avatar mappings and exact UTF-8 password limits; hashing and verification remain server capabilities. |
| Organization                  | `OrganizationId`, `OrganizationMemberId`, `OrganizationRole`, common organization/member data, party/theme defaults, nonblank-name validation, permission actions and reasons.                                | Preserve actor-specific permissions/assignable roles, mutation semantics and serialized dates. Trusted membership loading and last-owner protection remain server responsibilities.         |
| Project                       | `ProjectId`, common descriptive/default fields, nonblank-name validation, create/update data, and permission actions/reasons.                                                                                 | Keep public access projections, optional/null input semantics, migration workflows and persistence ports explicit.                                                                          |
| Game management               | `GameId`, `GameTypeId`, `GameType`, common catalog metadata, sort/filter vocabulary, pagination and permission/error contracts.                                                                               | Preserve required dashboard state, summary translation data, backend defaults and transport enum mapping.                                                                                   |
| Quiz and prediction           | `QuizQuestionId`, `PredictionPromptId`, question kinds, selectable options/inputs, metadata and content/timing/points fields, option normalization/validation, media acceptance rules and public error codes. | Keep type-specific entities and generic editor projections distinct where useful. Authoring correctness data must not become an unrevealed player payload.                                  |
| Party settings and identity   | `PartyId`, `PartyPin`, `PartyActionId`, stage identity, roles/statuses, user/guest identity unions, settings/defaults, settings precedence and reading-time validation.                                       | Align stage brands and identity discriminator names deliberately. Declared identity data is not verified participation; backend still resolves trusted defaults.                            |
| Party interaction and runtime | Host actions/reasons, lifecycle phases, timing/submission vocabulary, notices, public host/player profiles, summary fields, command inputs and public receipts/snapshots.                                     | Separate internal incomplete state from validated client projections and audience-specific output. Retain translated failures and client unavailable state as local extensions.             |
| Theme                         | IDs/defaults/patterns, versioned document/override definitions, token keys, curated validation palettes, normalization/contrast rules, common asset metadata/limits and permission/error vocabulary.          | Keep rendering, persistence and local error mappings separate. Backend envelope/size, authorization and asset checks continue to run.                                                       |
| Media                         | `MediaId`, public delivery-grant fields (`id`, `mimeType`, `uri`, `expiresAt`) and safe metadata.                                                                                                             | Client renewal context extends the grant. Stored assets, raw bytes and signed delivery access represent different contracts.                                                                |
| Errors across features        | Stable machine-readable business and permission-denial codes.                                                                                                                                                 | Keep private diagnostics, local translations, client transport failures and wire enum conversion distinct from common vocabulary.                                                           |

Concrete reusable behavior includes [selectable-option validation][option-policy],
[question-media acceptance][media-policy], and [party settings resolution][settings].
The [frontend upload policy][frontend-media-policy] repeats the media acceptance
rules. Organization and project name rules also match frontend form validation, but the audit found no
production caller of the backend entity predicates; extraction must wire their
enforcement deliberately. [Password validation][password-policy] combines a pure
input rule with hashing in the current class; extract only the input rule and
preserve the frontend's matching UTF-8 boundary behavior.

### Shared cores and distinct representations

Differences in representation are migration work, not a prohibition on sharing.
Keep the following guarantees explicit instead of weakening both consumers:

| Current difference                                                                                                             | Required treatment                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend `Date` versus frontend string timestamps; internal avatar `Media` versus public URI; permission-enriched client views. | Share common fields and define internal/public projections with explicit mapping. Do not make required fields optional solely to obtain one type.  |
| Quiz/prediction entities use type-specific IDs, names and counts; the editor uses generic content fields.                      | Share value objects and input semantics, preserving each model's naming and requiredness through adapters.                                         |
| Backend party context permits missing stage/result data; frontend validated states require it.                                 | Share lifecycle and leaf contracts while retaining separate incomplete and complete projections.                                                   |
| Internal observations include private facts, all players' submissions or unrevealed answers.                                   | Share public audience-specific contracts; retain trusted audience filtering. Sharing a source type does not authorize transmitting all its fields. |
| Frontend permission reasons include `PERMISSION_UNAVAILABLE`; some wire enum values differ from domain values.                 | Share business reasons/action shapes, extend client state locally, and keep transport conversions.                                                 |
| Backend `DomainError.message` is the machine code; frontend uses `definition.message`.                                         | Agree the common descriptor and preserve message/context behavior and error identity through adapters or an explicit migration.                    |
| Common command inputs and result data are nested in different ports.                                                           | Extract the common data into appropriately owned contract modules while retaining each port's capabilities and optional/null semantics.            |

The error difference is observable in the [backend][backend-error] and
[frontend][frontend-error] constructors. The [backend runtime context][backend-context]
and [frontend runtime context][frontend-context] likewise encode different
completeness guarantees; source similarity is not proof of interchangeability.

### Pure policies and server authority

`OrganizationMembershipPolicy`, `ProjectPermissionPolicy`, `ThemePermissionPolicy`,
`GamePermissionPolicy`, `HostPartyLifecyclePolicy`, and `PartyObservationPolicy`
are eligible for source reuse after isolating application-specific entity/error
dependencies and making time explicit where needed. Preserve their feature
ownership; only domain-neutral contracts belong in the shared primitives module.

Current frontend behavior consumes server-produced permissions under ADR 0014.
There is no established need to run every policy in the browser. Moving a policy's
source does not require changing that strategy. The server must continue loading
trusted facts, protecting concurrent invariants, reevaluating commands, and
performing enforcement before protected reads, writes, or broadcasts. A prior
browser decision never grants access.

### Responsibilities that remain local

These choices follow current capabilities and consumers. Portable source with no
second consumer may be extracted later without treating an entire domain as
excluded. A portable interface does not transfer its implementation's authority.

| Responsibility                                                                                                     | Reason to keep it local                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential state, token signing/verification, password hashing, recovery queues/mail, session rotation/revocation. | Operate on trusted persisted state, hashes, secrets or atomic security operations. Browser authentication requests/public responses are different contracts.                                 |
| Global player-session registry.                                                                                    | Its mutable server state establishes participation across all clients. A browser-local instance cannot establish that global invariant.                                                      |
| Media processing/storage/publishing and signed-grant issuance.                                                     | Backend capabilities manage bytes, storage lifecycle and access authority. Client delivery/renewal contracts do not require those capabilities.                                              |
| Full backend `Media` entity.                                                                                       | Imports Node `Buffer` and carries raw bytes/server metadata. Extract identifiers/public descriptors rather than making client views depend on that entity.                                   |
| Runtime projection, default-workspace creation and avatar-generation services.                                     | Current orchestration depends on frameworks, server state, persistence or Node APIs. Extract useful pure calculations separately; retain input loading, side effects and audience filtering. |
| Repository interfaces and DI tokens.                                                                               | Backend persistence/counting/locking and frontend remote operations/uploads have different capabilities. Reuse their data contracts without merging their ports.                             |
| Frontend storage, subscriptions, recovery state and control-state ports.                                           | Own browser persistence, callbacks, cleanup, reconnection or presentation state; no equivalent backend consumer is established.                                                              |
| Form services and game-type UI catalogs.                                                                           | Assemble forms, feedback, badges, icons, routes and client commands. Underlying validation and vocabulary can share independently.                                                           |
| Provider/bootstrap errors, invalid-response errors and client transport failures.                                  | Describe client integration failures, even when their current files live under `domains/`. They are not common business invariants.                                                          |
| Backend exception constructors, import-parser errors and export barrels.                                           | Most currently have no browser constructor/parser consumer. Share useful public codes and rules without importing every internal exception or diagnostic context.                            |
| Single-consumer helpers/data, including theme palette generation, curated document seeds and permission decoding.  | Technically portable, but current use alone does not justify cross-application extraction. Shared validators are possible when their public contract and second consumer are explicit.       |

For example, the current [runtime projector][projector] imports NestJS and an
application-stage catalog; it cannot move unchanged into a framework-independent
domain module. This does not prevent extracting its pure calculations.

### Package and contract boundaries

- Shared domain modules import neither application's source nor NestJS, React,
  persistence, transport frameworks or browser/Node-specific services. Consumers
  depend on those modules; composition roots register runtime classes locally.
- Keep application inputs/public response contracts and transport DTOs in their
  appropriate layers. Preserve [GraphQL codegen][codegen] as the source of
  generated operation types; do not maintain a competing hand-written wire schema.
- Shared party vocabulary does not cover every Socket.IO event/envelope. Compare
  shared transport definitions or generation with producer/consumer tests when
  integrating realtime consumers, retaining [ADR 0004][transports] boundaries.
- Keep translation catalogs and framework adapters local. Shared business error
  codes can map to existing translation keys without merging display copy.
- Integrate dependency installation, exports/module formats, TypeScript, container
  builds and guard/test discovery. Both [backend][backend-dockerfile] and
  [frontend][frontend-dockerfile] builds currently install their own application
  subtree. Do not assume placing shared source in a directory makes it consumable.
- Test shared behavior plus each application's boundary checks. For themes retain
  [server validation][theme-validator]; for input rules retain server enforcement;
  for wire contracts verify actual serialization, invalid input and version skew.

## Consequences

### Positive

- Common domain meaning and reusable behavior can have one maintained definition
  across all seven domains, with feature ownership preserved.
- Local projections and capabilities retain their guarantees instead of being
  weakened to fit a universal model.
- Server authority and translation ownership remain independent of source reuse.

### Negative

- Extraction requires package/build integration, coordinated imports, explicit
  model/error adapters, and tests before maintenance benefits are realized.
- Shared changes require checking both consumers; package equality alone cannot
  guarantee compatibility with already deployed clients.
- Application-specific code remains, and unimplemented extractions/contract tests
  continue to carry duplication or coverage gaps.

### Follow-Up

- After acceptance, choose the package layout/module exports against both build
  configurations and integrate its build, lint, module-export, pagination and test
  coverage into CI. Do not add a separate publishing workflow without a need.
- Migrate in cohesive slices with both consumers and tests. Themes, party settings,
  identifiers/permission/pagination contracts, and duplicated input rules are
  established candidates; do not make theme extraction a permanent scope limit.
- Preserve documented error, optional/null, timestamp, branding and audience
  semantics during each slice. Run normalization/rejection and producer/consumer
  cases as appropriate, retaining app-specific enforcement tests.
- Preserve ADR 0012's synchronization and ADR 0014's authorization requirements.
  This decision broadens source reuse; it does not adopt browser authorization or
  relocate every existing entity and port into a shared model.
- Update this proposed scope if new consumers or semantics change the assessment;
  the dated findings above do not replace verification during implementation.

[architecture]: ./0002-use-clean-architecture-with-strict-boundaries.md
[release]: ../../../../.github/workflows/release.yml
[chart]: ../../../../charts/application/Chart.yaml
[permissions]: ./0014-unify-resource-scoped-permissions.md
[themes]: ./0012-manage-themes-as-data-driven-token-themes.md
[transports]: ./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md
[imports]: ./0016-accept-localized-true-false-import-values.md
[codegen]: ../../../../application/frontend/codegen.ts
[backend-normalizer]: ../../../../application/backend/src/domain/theme/services/theme-document-normalizer.ts
[frontend-normalizer]: ../../../../application/frontend/src/domains/theme/services/theme-document-normalizer.ts
[backend-events]: ../../../../application/backend/src/presentation/game/party/realtime/party-socket-events.ts
[frontend-events]: ../../../../application/frontend/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts
[template-test]: ../../../../scripts/quiz-import-templates.spec.ts
[option-policy]: ../../../../application/backend/src/domain/game/types/shared/services/selectable-option-policy.ts
[media-policy]: ../../../../application/backend/src/domain/game/types/quiz/services/quiz-question-media-policy.ts
[frontend-media-policy]: ../../../../application/frontend/src/presentation/game/types/shared/management/playable-media-upload-policy.ts
[settings]: ../../../../application/backend/src/domain/game/party/shared/services/party-settings-resolver.ts
[password-policy]: ../../../../application/backend/src/domain/identity/services/password-service.ts
[backend-error]: ../../../../application/backend/src/domain/shared/errors/domain-error.ts
[frontend-error]: ../../../../application/frontend/src/domains/shared/errors/domain-error.ts
[backend-context]: ../../../../application/backend/src/domain/game/party/shared/entities/party-runtime-context.ts
[frontend-context]: ../../../../application/frontend/src/domains/game/party/shared/entities/party-runtime-context.ts
[projector]: ../../../../application/backend/src/domain/game/party/shared/services/party-runtime-context-projection.service.ts
[backend-dockerfile]: ../../../../application/backend/Dockerfile
[frontend-dockerfile]: ../../../../application/frontend/Dockerfile
[theme-validator]: ../../../../application/backend/src/application/workspace/themes/services/theme-document-validator.ts
