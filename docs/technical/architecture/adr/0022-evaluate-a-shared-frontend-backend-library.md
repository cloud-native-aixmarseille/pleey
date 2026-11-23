# ADR 0022: Evaluate a shared frontend/backend library

- Status: Accepted
- Proposed date: 2026-10-27
- Accepted date: 2026-11-18
- Implementation plan: [docs/technical/plans/0022](../../plans/0022-evaluate-a-shared-frontend-backend-library.md)
- Implementation: [PR #537](https://github.com/cloud-native-aixmarseille/pleey/pull/537)

## Context

Pleey has two runtime applications with separate npm manifests, lockfiles, and
container images: `application/api` and `application/web`. There is no
root npm workspace. [ADR 0002][architecture] requires dependency direction and
feature ownership; it does not require duplicate domain definitions in each app.

The repository needs one maintained definition for meaning and deterministic
behavior that is demonstrably shared, while continuing to isolate framework
code, trusted server capabilities, persistence, presentation, and transport
contracts. It must not merge all backend and frontend domain models, because the
same concept can have different representations and guarantees in different
contexts.

### Release model

The [release workflow][release] supplies one production image tag to both builds,
updates both subcharts to the same release version, and publishes the
[umbrella chart][chart]. Separate Deployments allow distinct runtime
configuration, but do not establish independent release lifecycles or
compatibility between arbitrary frontend and backend versions.
[ADR 0014][permissions] explicitly requires deploying both applications together
for changes to the permission contract.

A shared source package does not inherently publish a separate package or combine
the applications into one runtime service. It adds source-level coupling inside
the existing coordinated release model. Older browser clients can coexist with
newer servers, so a shared package does not remove rollout compatibility work.
Application behavior and serialized contracts must remain usable across supported
version pairs.

### Source audit

The audit on 2026-11-05 covered all 279 non-test TypeScript files under
`application/api/src/domain` and `application/web/src/domains` at
`aa7d922386c5b707d19bf5bc8da9715c4f4066f1`. Selected consumers in application,
infrastructure, and presentation layers were inspected to establish reuse.
The findings informed the accepted scope; they do not establish compatibility or
measure maintenance savings.

The assessment distinguishes:

- common definitions that currently have equivalent semantics;
- shared cores that require explicit local adaptation;
- code with no established second consumer;
- backend runtime responsibilities that must remain authoritative;
- framework-specific or transport-specific code that must not enter a shared package.

A file can contain declarations in more than one category. A `keep local`
classification is not a claim that its source is inherently forbidden from reuse;
it means that no current extraction provides a supported cross-application
benefit.

Concrete findings include:

- Identical identifiers, party settings and defaults, permission result shapes,
  and pagination contracts occur across applications.
- Backend pagination additions are normalized query fields and defaults, not
  conflicting common pagination semantics.
- The [backend][backend-normalizer] and [frontend][frontend-normalizer] theme
  normalizers each have 226 lines and differ only in string formatting. Curated
  palettes are identical. [ADR 0012][themes] already requires their validation
  behavior to remain synchronized.
- Option validation, question-media acceptance, organization/project name
  validation, password input constraints, and party reading-time limits have
  corresponding frontend rules. Duplication is not limited to theme code or
  small generic types.
- [GraphQL codegen][codegen] generates frontend operation types, but maps the
  `ThemeDocument` scalar to `unknown`. It does not validate document contents.
- [Backend][backend-events] and [frontend][frontend-events] realtime definitions
  are maintained separately under [ADR 0004][transports].
- The [template-import contract test][template-test] exercises both applications
  through the dedicated command described in [ADR 0016][imports]. It does not
  cover themes or realtime.
- No dedicated cross-application test currently proves agreement for themes,
  realtime payloads, or every duplicated validation policy.

## Decision Drivers

- Maintain one definition for common business meaning and deterministic behavior
  when both consumers need it.
- Preserve feature ownership and the dependency directions required by
  [ADR 0002][architecture].
- Keep server enforcement, trusted fact loading, and protected side effects
  authoritative regardless of where reusable source lives.
- Distinguish common domain semantics from application inputs, wire formats,
  presentation state, persistence capabilities, and framework APIs.
- Account for build, migration, test, compatibility, and maintenance costs
  instead of assuming that source duplication is solved by extraction.
- Verify behavior and serialized compatibility, not source equality alone.
- Limit shared packages to contracts with an identified cross-application benefit,
  so the library does not become a dumping ground for otherwise local code.

## Considered Options

### Option 1: Retain application-local copies with contract tests

Preserve the current package boundaries and compare common behavior through
shared valid/invalid fixtures and producer/consumer tests. This avoids package
integration but retains duplicate implementations. Contract tests depend on
representative cases and require an explicit CI entrypoint.

This remains useful for contracts whose implementations should differ and as
interim coverage during extraction.

### Option 2: Share only the theme contract and normalizer

Address the largest obvious repeated implementation first. This is a reasonable
migration slice, but an arbitrary permanent scope: party settings, identifiers,
validation, permission vocabulary, and other common definitions already have
concrete consumers.

Once packaging exists, package size alone is a weak reason to keep a common
contract duplicated.

### Option 3: Share feature-owned domain modules and explicit common contracts

Introduce a repository-local package whose modules retain existing feature
ownership: identity, organization, project, game, theme, media, and domain-neutral
primitives. Extract common types, constants, and deterministic behavior while
preserving local extensions and projections.

Keep application inputs, public response contracts, and transport DTOs in modules
owned by their application or layer. A shared package can follow the repository
release version without requiring separate publication or independent release
lifecycles.

This removes duplicate sources of common meaning without requiring a universal
entity model or merging repositories. It requires coordinated imports, model and
error adapters, package integration, and cross-application tests.

### Option 4: Merge both domain trees and translation catalogs wholesale

Moving every similarly named entity, port, error, and translation into one common
model would overlook distinct capabilities and representations. It would force
unnecessary dependencies or weaken guarantees through optional fields and broad
unions.

Shared code does not require shared translation catalogs or one universal
frontend/backend model.

## Decision

Choose **option 3**.

Add one repository-local, framework-neutral package that organizes shared
declarations and pure policies by existing feature ownership. Introduce additional
package boundaries only when concrete consumer, build, or ownership needs
justify them. Do not publish the package separately unless a package publication
need is introduced and recorded in a later ADR.

Themes are an initial migration candidate, not the maximum scope. The package
must not become a universal type repository: each extracted contract needs a
documented second consumer or an explicitly recorded, coherent migration scope
before implementation.

### Package shape

The package is the private repository package `@pleey/contracts` under
`application/contracts`. It must:

- expose feature subpaths or narrow entry points instead of requiring one catch-all
  barrel import;
- keep source TypeScript-only, with erasable syntax supported directly by the
  repository's Node runtime and no package-specific build output;
- compile or type-check without NestJS, React, Prisma, Socket.IO, Apollo, browser,
  or Node-only APIs;
- use the repository's supported Node/TypeScript baseline;
- be private and versioned with the repository unless a publication need is
  approved separately;
- retain stable subpath ownership so moving a file does not silently move a
  domain boundary.

Suggested feature entry points are:

- `shared/primitives`;
- `identifier`;
- `identity`;
- `organization`;
- `project`;
- `game`;
- `theme`;
- `media`;
- `party`.

A feature entry point may be split later only by a file-movement need. It must
not create application-to-application dependencies or circular feature imports.

The implementation must integrate:

- root or application lockfiles, without leaving the package partially uninstalled;
- TypeScript resolution in NodeNext and Vite/Bundler builds;
- backend and frontend test discovery;
- production Docker build contexts and dependency installation;
- development hot reload and generated GraphQL types;
- Biome, Knip, module-export, pagination, resolver and naming guards;
- CI routing and source-change detection.

Backend and frontend Docker builds must explicitly copy or install the package.
It is not sufficient to add a directory: `Dockerfile` source copies, package
manifests, lockfiles, build stages and `.dockerignore` rules must agree.
Application-only Docker cache behavior must remain deterministic.

### Shared scope by domain

The table identifies common meaning, including declarations currently embedded
inside otherwise application-specific files. An entry authorizes a focused
extraction after acceptance, not an unchanged move of its entire directory.

| Domain / area                 | Common scope                                                                                                                                                                                                  | Adaptation to preserve                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared primitives             | `ActionPermission`, `Permissions`, `PaginatedResult`, `PaginationQuery`, common pagination maximums, identifier failures and error descriptors.                                                               | Keep backend normalized-query fields and defaults separate where only backend consumers need them. Reconcile error behavior before sharing constructors.                                    |
| Identity                      | `UserId`, `GuestId`, `CaptchaAction`, opaque token vocabulary, common public profile/session/history fields and password input validation.                                                                    | Separate public response contracts from internal credential state. Preserve timestamp/avatar mappings and exact UTF-8 password limits. Hashing and verification remain server capabilities. |
| Organization                  | `OrganizationId`, `OrganizationMemberId`, `OrganizationRole`, common organization/member data, party/theme defaults, nonblank-name validation, permission actions and reasons.                                | Preserve actor-specific permissions and assignable roles, mutation semantics and serialized dates. Trusted membership loading and last-owner protection remain server responsibilities.     |
| Project                       | `ProjectId`, common descriptive/default fields, nonblank-name validation, create/update data and permission actions/reasons.                                                                                  | Keep public access projections, optional/null input semantics, migration workflows and persistence ports explicit.                                                                          |
| Game management               | `GameId`, `GameTypeId`, `GameType`, common catalog metadata, sort/filter vocabulary, pagination and permission/error contracts.                                                                               | Preserve required dashboard state, summary translation data, backend defaults and transport enum mapping.                                                                                   |
| Quiz and prediction           | `QuizQuestionId`, `PredictionPromptId`, question kinds, selectable options/inputs, metadata and content/timing/points fields, option normalization/validation, media acceptance rules and public error codes. | Keep type-specific entities and generic editor projections distinct where useful. Authoring correctness data must not become an unrevealed player payload.                                  |
| Party settings and identity   | `PartyId`, `PartyPin`, `PartyActionId`, stage identity, roles/statuses, user/guest identity unions, settings/defaults, settings precedence and reading-time validation.                                       | Align stage brands and identity discriminator names deliberately. Declared identity data is not verified participation. Backend still resolves trusted defaults.                            |
| Party interaction and runtime | Host actions/reasons, lifecycle phases, timing/submission vocabulary, notices, public host/player profiles, summary fields, command inputs and public receipts/snapshots.                                     | Separate internal incomplete state from validated client projections and audience-specific output. Retain client unavailable state and translated failures as local extensions.             |
| Theme                         | IDs/defaults/patterns, versioned document/override definitions, token keys, curated validation palettes, normalization/contrast rules, common asset metadata/limits and permission/error vocabulary.          | Keep rendering, persistence and local error mappings separate. Backend envelope/size, authorization and asset checks continue to run.                                                       |
| Media                         | `MediaId`, public delivery-grant fields (`id`, `mimeType`, `uri`, `expiresAt`) and safe metadata.                                                                                                             | Client renewal context extends the grant. Stored assets, raw bytes and signed delivery access are different contracts.                                                                      |
| Errors across features        | Stable machine-readable business and permission-denial codes.                                                                                                                                                 | Keep private diagnostics, local translations, transport failures and wire enum conversion distinct from common vocabulary.                                                                  |

Concrete reusable behavior includes [selectable-option validation][option-policy],
[question-media acceptance][media-policy], and [party settings
resolution][settings]. The [frontend upload policy][frontend-media-policy] repeats
the media acceptance rules.

Organization and project name rules match frontend form validation, but the audit
found no production caller of the backend entity predicates. Extraction must wire
their server enforcement deliberately. It must not introduce a frontend-only
rule and then claim it is authoritative.

[Password validation][password-policy] combines a pure input rule with hashing.
Extract only the input rule and preserve the frontend's matching UTF-8 boundary
behavior. Hashing, verification, session state and secrets remain server-only.

### Shared cores and distinct representations

Differences in representation are migration work, not a prohibition on sharing.
Keep the following guarantees explicit instead of weakening both consumers:

| Current difference                                                                                                             | Required treatment                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend `Date` versus frontend string timestamps; internal avatar `Media` versus public URI; permission-enriched client views. | Share common fields and define internal/public projections with explicit mapping. Do not make required fields optional solely to obtain one type. |
| Quiz/prediction entities use type-specific IDs, names and counts; the editor uses generic content fields.                      | Share value objects and input semantics while preserving each model's naming and requiredness through adapters.                                   |
| Backend party context permits missing stage/result data; frontend validated states require it.                                 | Share lifecycle and leaf contracts while retaining separate incomplete and complete projections.                                                  |
| Internal observations include private facts, all player submissions or unrevealed answers.                                     | Share public audience-specific contracts and retain trusted audience filtering. Sharing a source type does not authorize transmitting all fields. |
| Frontend permission reasons include `PERMISSION_UNAVAILABLE`; some wire enum values differ from domain values.                 | Share business reasons/action shapes, extend client state locally and keep transport conversions.                                                 |
| Backend `DomainError.message` is the machine code; frontend uses `definition.message`.                                         | Agree on the common descriptor and preserve message/context behavior and error identity through adapters or an explicit migration.                |
| Common command inputs and result data are nested in different ports.                                                           | Extract common data into appropriately owned contract modules while retaining each port's capabilities and optional/null semantics.               |

The error difference is observable in the [backend][backend-error] and
[frontend][frontend-error] constructors. The [backend runtime context][backend-context]
and [frontend runtime context][frontend-context] likewise encode different
completeness guarantees. Source similarity is not proof of interchangeability.

### Pure policies and server authority

`OrganizationMembershipPolicy`, `ProjectPermissionPolicy`,
`ThemePermissionPolicy`, `GamePermissionPolicy`, `HostPartyLifecyclePolicy`, and
`PartyObservationPolicy` are eligible for source reuse after isolating
application-specific entity and error dependencies and making time explicit where
needed. Their feature ownership remains local to its domain module.

Only framework-neutral and domain-neutral contracts belong in shared primitives.
Feature policies must not import application ports or composition modules.

Current frontend behavior consumes server-produced permissions under ADR 0014.
There is no established need to run every policy in the browser. Moving policy
source does not require changing that strategy.

The server must continue to:

- load trusted facts and persisted state;
- protect concurrency and atomic invariants;
- reevaluate commands and protected reads;
- enforce authorization before writes or broadcasts;
- filter observations for the current audience;
- issue media grants and authenticate actors.

A browser decision or shared source implementation never grants access.

### Responsibilities that remain local

These choices follow current capabilities and consumers. Portable source with no
second consumer may be extracted later without treating an entire domain as
excluded. A portable interface does not transfer its implementation's authority.

| Responsibility                                                                                                     | Reason to keep it local                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential state, token signing/verification, password hashing, recovery queues/mail, session rotation/revocation. | Operate on trusted persisted state, hashes, secrets or atomic security operations. Browser authentication/public response contracts are different representations.           |
| Global player-session registry.                                                                                    | Mutable server state establishes participation across clients. A browser-local instance cannot establish that global invariant.                                              |
| Media processing/storage/publishing and signed-grant issuance.                                                     | Backend capabilities manage bytes, storage lifecycle and access authority. Client delivery/renewal contracts do not require these capabilities.                              |
| Full backend `Media` entity.                                                                                       | Imports Node `Buffer` and carries raw bytes/server metadata. Extract identifiers/public descriptors rather than coupling client views to that entity.                        |
| Runtime projection, default-workspace creation and avatar-generation services.                                     | Current orchestration depends on frameworks, server state, persistence or Node APIs. Extract pure calculations separately and retain input loading and side effects locally. |
| Repository interfaces and DI tokens.                                                                               | Backend persistence/counting/locking and frontend remote operations/uploads have different capabilities. Reuse data contracts without merging ports.                         |
| Frontend storage, subscriptions, recovery state and control-state ports.                                           | Own browser persistence, callbacks, cleanup, reconnection or presentation state; no equivalent backend consumer is established.                                              |
| Form services and game-type UI catalogs.                                                                           | Assemble forms, feedback, badges, icons, routes and client commands. Underlying validation and vocabulary can share independently.                                           |
| Backend exception constructors, import-parser errors and export barrels.                                           | Most currently have no browser constructor/parser consumer. Share useful public codes and rules without importing internal exception or diagnostic context.                  |
| Transport internals and GraphQL operation types.                                                                   | GraphQL codegen remains the source of generated frontend operations. Socket.IO definitions and envelopes remain application-owned under ADR 0004.                            |

For example, the current [runtime projector][projector] imports NestJS and an
application-stage catalog. It cannot move unchanged into a framework-independent
domain package. This does not prevent extracting its pure calculations.

### Package and contract boundaries

- Shared modules import neither application's source nor NestJS, React,
  persistence, transport frameworks or browser/Node-specific services.
- Consumers depend on shared modules; composition roots register runtime classes
  locally.
- Application inputs, public response contracts and transport DTOs remain in
  application-owned layers.
- GraphQL codegen remains the source of generated operation types. The shared
  package must not maintain a competing hand-written wire schema.
- Shared party vocabulary does not cover every Socket.IO event or envelope.
  Realtime payloads must use producer/consumer compatibility tests.
- Translation catalogs and framework adapters remain local, except the public
  business error messages explicitly shared under
  [ADR 0025][translation-sharing]. Shared business error codes map to their
  canonical translation keys and locales.
- Shared functions must be deterministic unless they receive an explicit clock,
  locale or source of randomness. Random IDs, wall clocks and environment access
  stay outside pure policies.
- Public exports are deliberate API surface. Internal adapters, test-only exports
  and implementation helpers must not become shared entry points.

## Migration and compatibility

Migrating one contract is complete only when both consumers and their CI checks
consume the shared source. Replacing a local copy without adding another consumer
is not, by itself, evidence of a successful extraction.

1. Establish package build and installation for each application.
2. Add cross-application fixtures and boundary tests for the selected contract.
3. Extract a small coherent slice, such as theme normalization or party settings,
   and adapt both consumers.
4. Remove the duplicated implementation only after tests and build checks pass.
5. Repeat for identifiers/permissions/pagination and pure input policies.
6. Reassess scope and package boundaries before extracting a larger domain.

### Compatibility rules

- Changing serialized names, enum values, optional/null fields, timestamp formats,
  list defaults or audience filtering is a contract change.
- Additive fields are not automatically backward compatible; consumers and persisted
  clients must be checked for strict parsers and generated types.
- Timestamp, enum and error adapters must preserve existing wire values until the
  coordinated release removes the need.
- Shared model changes must support the currently deployed frontend and backend
  combination where version skew is possible.
- A package-only change must not imply that a browser is authoritative. Server
  enforcement remains mandatory.

### Verification strategy

Test shared behavior plus each application's boundary checks:

- Unit-test pure shared policies with valid/invalid boundaries and deterministic
  clocks.
- Retain application-local tests for hashing, trusted context loading,
  persistence, audience filtering and framework integration.
- Test theme normalization, rejection and serialization in both app boundaries.
- Test party settings precedence, reading-time limits and default resolution.
- Test password input boundaries, UTF-8 behavior and server enforcement separately.
- Verify organization/project name rules through actual server mutation paths
  before removing local enforcement.
- Use producer/consumer fixtures for GraphQL and Socket.IO payload compatibility
  where contracts are involved.
- Run module-export, pagination, resolver, naming and dependency guard scripts
  for both applications.
- Add one package build and Docker build check per application. A source test alone
  is not enough to prove packaging.
- Run existing app unit/lint checks and the smallest relevant integration suite
  after each migration slice.

The acceptance test must demonstrate:

1. both applications compile and bundle with the package;
2. both Docker build paths install and preserve the package;
3. shared behavior produces the same public result for shared valid/invalid fixtures;
4. app-specific authority and filtering remain enforced only at app boundaries;
5. deployed and generated wire contracts remain unchanged or are intentionally
   migrated and validated;
6. package API changes are visible in generated reports or diffs, not only in TypeScript.

## Consequences

### Positive

- Common domain meaning and reusable behavior can have one maintained definition,
  with feature ownership preserved.
- Local projections and capabilities retain their guarantees instead of being
  weakened to fit a universal model.
- Server authority and translation ownership remain independent of source reuse.
- A private repository package avoids a separate public package lifecycle.
- First-class build and test integration makes extraction measurable.

### Negative

- Package integration changes npm manifests, lockfiles, TypeScript resolution,
  Docker contexts and CI cache inputs.
- Coordinated model and error adapters add implementation work.
- Shared changes require checking both consumers.
- Package equality alone cannot guarantee deployed-client compatibility.
- Application-specific code remains, so extraction does not remove every duplicate.
- A package becomes a source of shared maintenance and can create coupling if
  boundaries are too broad.

### Risks

| Risk                                                         | Mitigation                                                                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| The package becomes a universal entity model.                | Require feature entry points, explicit projections and a non-goal review for every extracted item.               |
| A browser policy is mistaken for authorization.              | Preserve server enforcement tests and server-produced permission state under ADR 0014.                           |
| Private or unrevealed state is shared.                       | Share public audience-specific projections and prohibit internal entity exports.                                 |
| A framework or persistence API enters the package.           | Restrict imports through lint and package checks; package test compilation must use browser-neutral constraints. |
| Build or Docker paths omit the package.                      | Require package installation and build smoke checks in both application CI jobs.                                 |
| Extraction changes wire compatibility.                       | Add fixture and version-skew tests for timestamps, enums, optional/null fields and errors.                       |
| Migration removes duplication without a maintenance benefit. | Extract only when both consumers use the contract or an intentionally staged pair of consumers is complete.      |
| Package code and translation copy drift.                     | Share display text only for public business errors under ADR 0025; keep screen and transport copy local.         |

### Implementation

The implementation started with
`d3d777fb3cf77696fd35658844e28595428b029b` on 2026-11-18. It established the
private `@pleey/contracts` package, integrated both applications and their container
builds, then extracted and verified the accepted scope through [PR #537][implementation-pr].
Implementation review completed on 2026-11-19; the PR remains open only for
merge.

- The package layout and module exports are integrated with the backend,
  frontend and Docker build configurations.
- Build, lint, module-export, pagination and test discovery are enforced in CI.
- Do not add a separate publishing workflow without a concrete publication need.
- Migrate future candidates in cohesive slices with both consumers and tests.
  Themes, party settings, identifiers, permission/pagination contracts,
  duplicated input rules, identity/workspace contracts, game content and public
  media/error contracts are implemented candidates.
- Preserve error, optional/null, timestamp, identity-branding and audience
  semantics during each slice.
- Re-run normalization/rejection, serialization and app-local enforcement cases
  as each contract moves.
- Preserve ADR 0012 theme synchronization and ADR 0014 authorization requirements.
- Update this accepted scope only if a later audit or implementation establishes
  a materially different consumer set; dated findings do not replace verification.
- Link implementation pull requests and package changes back to this ADR.

Final implementation verification is recorded in the
[implementation plan][implementation-plan]. Documentation and contributor
workflow updates remain tracked as P8 and do not change the accepted decision.

[architecture]: ./0002-use-clean-architecture-with-strict-boundaries.md
[release]: ../../../../.github/workflows/release.yml
[chart]: ../../../../charts/application/Chart.yaml
[permissions]: ./0014-unify-resource-scoped-permissions.md
[themes]: ./0012-manage-themes-as-data-driven-token-themes.md
[transports]: ./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md
[imports]: ./0016-accept-localized-true-false-import-values.md
[codegen]: ../../../../application/web/codegen.ts
[backend-normalizer]: ../../../../application/api/src/domain/theme/services/theme-document-normalizer.ts
[frontend-normalizer]: ../../../../application/web/src/domains/theme/services/theme-document-normalizer.ts
[backend-events]: ../../../../application/api/src/presentation/game/party/realtime/party-socket-events.ts
[frontend-events]: ../../../../application/web/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts
[template-test]: ../../../../scripts/quiz-import-templates.spec.ts
[option-policy]: ../../../../application/api/src/domain/game/types/shared/services/selectable-option-policy.ts
[media-policy]: ../../../../application/api/src/domain/game/types/quiz/services/quiz-question-media-policy.ts
[frontend-media-policy]: ../../../../application/web/src/presentation/game/types/shared/management/playable-media-upload-policy.ts
[settings]: ../../../../application/api/src/domain/game/party/shared/services/party-settings-resolver.ts
[password-policy]: ../../../../application/api/src/domain/identity/services/password-service.ts
[backend-error]: ../../../../application/api/src/domain/shared/errors/domain-error.ts
[implementation-plan]: ../../plans/0022-evaluate-a-shared-frontend-backend-library.md
[implementation-pr]: https://github.com/cloud-native-aixmarseille/pleey/pull/537
[frontend-error]: ../../../../application/web/src/domains/shared/errors/domain-error.ts
[translation-sharing]: ./0025-share-business-error-translations.md
[backend-context]: ../../../../application/api/src/domain/game/party/shared/entities/party-runtime-context.ts
[frontend-context]: ../../../../application/web/src/domains/game/party/shared/entities/party-runtime-context.ts
[projector]: ../../../../application/api/src/domain/game/party/shared/services/party-runtime-context-projection.service.ts
