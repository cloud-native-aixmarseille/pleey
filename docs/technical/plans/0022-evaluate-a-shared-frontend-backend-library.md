# Implementation plan: ADR 0022 - Evaluate a shared frontend/backend library

- Issue: add when created
- Decision: [ADR 0022](../architecture/adr/0022-evaluate-a-shared-frontend-backend-library.md)
- Updated: 2026-11-19
- Status: Complete (P1-P9 implemented, reviewed and CI-validated)
- Implementation: [PR #537](https://github.com/cloud-native-aixmarseille/pleey/pull/537)

This plan implements ADR 0022 through incremental slices that preserve current
runtime authority and wire contracts while removing duplicated domain semantics.
It is exhaustive by scope (all candidate domains listed in ADR 0022), but phased
for safety and reversibility.

## Goals

- Build one private shared package for framework-neutral, deterministic domain
  contracts and policies with at least two real consumers.
- Remove duplicated backend/frontend domain semantics without merging all models.
- Preserve backend authority for trusted state, authorization, side effects, and
  security-sensitive operations.
- Preserve GraphQL and Socket.IO contract compatibility unless a migration is
  explicitly planned, tested, and documented.
- Keep translation catalogs local; share machine-readable codes only.

## Non-goals

- No shared package publication workflow in this phase.
- No move of credential internals, token signing/verification, password hashing,
  media bytes/storage internals, or persistence ports into shared code.
- No universal entity model that collapses frontend/backend projections.
- No merge of transport DTO trees into one hand-maintained schema.

## Eligibility rules for extraction

A declaration or policy is extracted only when all criteria hold:

1. Two consumers are identified (backend + frontend, or equivalent cross-layer need).
2. It is framework-neutral (no NestJS, React, Prisma, Socket.IO, Apollo, browser
   APIs, or Node-only runtime dependencies).
3. Its public contract is explicit (field names, enums, optional/null semantics,
   timestamp format, error vocabulary).
4. Server authority remains enforced at application boundaries.
5. Tests can prove equivalent behavior across consumers.

## Package target shape

Create one repository-local private package under `packages/` (name finalized
during implementation), with explicit feature entry points:

- `shared/primitives`
- `identity`
- `organization`
- `project`
- `game`
- `party`
- `theme`
- `media`
- `errors`

Constraints:

- No catch-all "export everything" entry point.
- No imports from application source trees.
- No framework/runtime side effects.
- Public API is explicit and versioned by repository changes.

## Phase plan

## P0 - Delivery governance and baseline

- [ ] Create/confirm tracking issue linked to ADR 0022.
- [ ] Define package naming and directory conventions.
- [ ] Freeze initial compatibility matrix for contracts that must not drift.
- [ ] Record baseline duplication inventory by domain and file.

Done when:

- tracking issue exists,
- compatibility matrix is documented in this plan,
- baseline inventory is attached to the issue.

## P1 - Shared package foundation

- [x] Scaffold the private package with TypeScript config and explicit exports.
- [x] Wire backend and frontend dependency installation for local and CI environments.
- [x] Wire module resolution for NodeNext (backend) and Bundler (frontend).
- [x] Add package checks to lint/typecheck/test flows.
- [x] Update Docker build contexts for both applications to include shared sources.

Primary touchpoints:

- [apps/api/package.json](../../../apps/api/package.json)
- [apps/web/package.json](../../../apps/web/package.json)
- [apps/api/tsconfig.json](../../../apps/api/tsconfig.json)
- [apps/web/tsconfig.json](../../../apps/web/tsconfig.json)
- [apps/api/Dockerfile](../../../apps/api/Dockerfile)
- [apps/web/Dockerfile](../../../apps/web/Dockerfile)
- [.github/workflows/](../../../.github/workflows)

Done when:

- both apps build and test with the empty shared package,
- both Docker images build with shared package sources available.

## P2 - Cross-application contract fixtures and verification harness

- [x] Add shared fixtures for valid/invalid domain inputs and serialized outputs.
- [x] Add producer/consumer compatibility checks for affected GraphQL/Socket payloads.
- [x] Add package API surface checks (no accidental export leaks).
- [x] Add linter rules or guard checks to block framework imports in shared package.

Done when:

- the harness fails on deliberate contract drift,
- package API and import boundary checks are enforced in CI.

## P3 - Wave A extraction (low risk, high duplication)

### P3.1 Theme

- [x] Extract shared theme IDs/defaults/patterns, token keys, curated palettes,
      normalization/contrast rules, common metadata limits.
- [x] Keep local rendering, persistence, authorization, and local error mapping.

### P3.2 Shared primitives

- [x] Extract permission and pagination vocabulary (`ActionPermission`,
      `Permissions`, `PaginatedResult`, `PaginationQuery`, shared max values).
- [x] Keep backend-only normalized query defaults local when not shared.

### P3.3 Validation policies

- [x] Extract pure policies (selectable options, media acceptance, party settings
      precedence/reading-time, password input validation only).
- [x] Keep hashing, secret handling, and persistence-backed validation local.

### P3.4 Party/game public contracts

- [x] Extract common lifecycle/timing/receipt/snapshot contracts used by both apps.
- [x] Keep incomplete runtime state, audience filtering, and transport specifics local.

Done when:

- duplicated implementations for Wave A are removed,
- behavior is equivalent against shared fixtures,
- app-local authority checks still pass.

## P4 - Wave B extraction (domain core + adapters)

### P4.1 Identity

- [x] Extract shared IDs, captcha action, public token vocabulary, and password
      input contract.
- [x] Preserve local auth state, signing, verification, recovery, and rotation logic.

### P4.2 Organization

- [x] Extract IDs, roles, defaults, nonblank name validation, permission actions/reasons.
- [x] Preserve membership loading, last-owner protection, and persistence invariants.

### P4.3 Project

- [x] Extract IDs, common create/update contracts, nonblank name validation,
      permission actions/reasons.
- [x] Preserve access projections, migration workflows, and repository semantics.

### P4.4 Game management

- [x] Extract game IDs/types, shared metadata, sort/filter vocabulary, and common
      pagination/permission/error contracts.
- [x] Preserve dashboard-specific projections, backend defaults, and wire mappings.

Done when:

- shared core contracts are consumed by both applications,
- adapters preserve each app's required representation guarantees.

## P5 - Wave C extraction (game content and media boundaries)

### P5.1 Quiz and prediction common core

- [x] Extract shared IDs, question kinds, option/input semantics, content/timing/points
      fields, and common public error vocabulary.
- [x] Preserve unrevealed authoring/player-private payload boundaries.

### P5.2 Media public contract

- [x] Extract shared `MediaId` and public delivery-grant contract
      (`id`, `mimeType`, `uri`, `expiresAt`) and safe metadata.
- [x] Preserve bytes/storage/signing/grant-issuance authority in backend.

### P5.3 Error vocabulary

- [x] Extract stable machine-readable business and permission-denial codes.
- [x] Preserve local diagnostics, translation strings, and transport/client errors.

Done when:

- shared/public contracts are reused,
- backend-only capabilities remain local and tested.

## P6 - Duplication cleanup and hardening

- [x] Remove superseded duplicate code paths from backend/frontend domains.
- [x] Keep local adapters explicit and documented.
- [x] Confirm no remaining accidental cross-app dependencies.
- [x] Tighten package export map to only used APIs.

Retained adapters after cleanup:

- backend organization/project permission value objects retain domain error enums
  as their reason types; shared permission types describe the public wire
  vocabulary;
- backend entities retain constructors and authority-bearing behavior while
  importing shared identifiers and deterministic values;
- GraphQL-generated enums remain generated transport artifacts and are decoded
  into shared/domain vocabulary at repository boundaries.

Done when:

- duplicate implementations targeted by P3-P5 are removed or intentionally retained
  with justification,
- guard checks prevent regression.

## P7 - CI and Docker hardening

- [x] Ensure shared package checks run on relevant CI routes.
- [x] Verify CI routing still classifies documentation-only and application changes correctly.
- [x] Verify Docker layer inputs include the shared package deterministically.
- [x] Validate fresh and warm build behavior after package introduction.

The full CI route includes package source and shared-check script changes. The
CI-routing suite verifies that shared package changes stay on full CI and that
both application Dockerfiles, lockfiles, production stages, CI stages, build
context and development mounts retain deterministic shared-package wiring.

Done when:

- CI catches stale or missing shared package wiring,
- both CI and production image workflows remain green.

## P8 - Documentation and developer workflow updates

- [x] Update backend/frontend technical development docs where shared package rules
      change contributor workflows.
- [x] Document extraction rules, adapter expectations, and validation requirements.
- [x] Keep this plan current with implemented slices and links to implementation PRs.

Done when:

- docs reflect current supported workflow without migration-era ambiguity,
- plan status can be used as implementation source of truth.

## P9 - ADR finalization

- [x] Re-evaluate ADR 0022 status after accepted target slices are implemented.
- [x] If accepted, update accepted date to the earliest adoption commit and update ADR index.
- [x] Link implementation PRs and final verification evidence.

ADR 0022 was accepted on 2026-11-18, the date of the first adoption commit
`d3d777fb3cf77696fd35658844e28595428b029b`. The implementation PR is
[PR #537](https://github.com/cloud-native-aixmarseille/pleey/pull/537).
Implementation review completed on 2026-11-19. The PR remains open only for
merge after its required checks.

Final verification before finalization:

- backend `lint:ci`: passed;
- frontend `lint:ci`: passed;
- backend tests: 1218 passed, 72 skipped;
- frontend tests: 1207 passed;
- cold and warm backend/frontend Docker builds: passed;
- shared package, CI routing, Docker wiring and generated documentation guards:
  passed;
- PR CI run [44477741474](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/44477741474):
  passed, including Helm candidate validation and image promotion.

## Post-implementation sharing audit

The follow-up audit on 2026-11-19 compared the backend and frontend domain trees
after P1-P9 and found additional high-confidence candidates:

- party IDs, roles, status, runtime phase and party settings;
- pagination bounds;
- identity and project identifier brands;
- theme IDs, default, pattern and curated palette data;
- complete theme document/override contracts and theme asset upload policy;
- playable option bounds and editor/server validation limits;
- party player, join-receipt, action-state and host permission vocabulary;
- shared player identity and party runtime leaf contracts;
- shared public identity/game error codes;
- public business-error translation keys and locale text under ADR 0025.
- identifier parser behavior and parser error vocabulary;
- theme error vocabulary, asset identity/shape and permission vocabulary.

These candidates are consumed through `@pleey/contracts` and their superseded local
declarations are guarded against restoration.

The remaining exact duplicates are deliberately local adapters or tests:

- `ThemeDocumentNormalizer` remains local because invalid-result behavior maps to
  each application's own error type around the shared normalizer core;
- `InvalidIdentifierValueError` remains local because each application owns its
  runtime `DomainError` base class;
- identifier parsers keep local error-adapter objects while the parsing
  implementation is shared;
- mirrored normalizer specs remain in each application because they verify the
  local error adaptation and domain projection.

No other exact backend/frontend domain duplicates remain after the follow-up.
The 4-option frontend limit now follows the
backend policy instead of exposing 8 editor slots. Future extraction proposals
must still pass the ADR 0022 eligibility rules and must not move local
projections solely to remove structurally similar code.

Done when:

- ADR status/index match repository rules and implementation reality.

## Domain-by-domain extraction matrix

| Domain              | Shared candidates                                                                                                | Must remain local                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Shared primitives   | Permission and pagination vocabulary, common identifier/error descriptors                                        | Backend-only normalized query defaults and non-shared convenience fields      |
| Identity            | IDs, captcha action, public token vocabulary, password input rules                                               | Hashing, signing, verification, recovery queues, session rotation/revocation  |
| Organization        | IDs/roles/defaults, name validation, permission actions/reasons                                                  | Trusted membership loading, last-owner invariants, persistence workflows      |
| Project             | IDs, common create/update contracts, name validation, permission vocabulary                                      | Access projections, migration semantics, persistence capabilities             |
| Game management     | IDs/types, shared metadata, sort/filter vocab, common contracts                                                  | Dashboard-specific projections, backend-only defaults, transport enum mapping |
| Quiz and prediction | IDs, kinds, options/inputs semantics, common content/timing/points contracts                                     | Authoring-private and unrevealed player payload boundaries                    |
| Party               | IDs, stages/roles/statuses, settings defaults/precedence, lifecycle/timing vocabulary, public receipts/snapshots | Incomplete runtime state, trusted context resolution, audience filtering      |
| Theme               | IDs/defaults/patterns, token keys, curated palettes, normalization/contrast rules                                | Rendering logic, persistence, authorization, local error mapping              |
| Media               | Public grant contract and safe metadata                                                                          | Raw bytes, storage lifecycle, signed grant issuance and access checks         |
| Errors              | Stable machine-readable business/permission codes                                                                | Local diagnostics, translated copy, transport/client integration failures     |

## Validation gates

Run the smallest relevant checks per slice, then required repository checks.

Per application:

- [x] Backend lint/test: `npm run lint` and `npm run test` in [apps/api/](../../../apps/api)
- [x] Frontend lint/test: `npm run lint` and `npm run test` in [apps/web/](../../../apps/web)

Cross-application:

- [x] Shared fixtures pass for valid/invalid policy cases.
- [x] Serialized contracts (GraphQL/Socket where touched) remain compatible.
- [x] Package export map check passes.
- [x] Boundary guards (`check-module-exports`, pagination checks, resolver checks,
      naming checks, domain error checks) pass for both apps.

Container validation:

- [x] Backend Docker build includes and compiles with shared package.
- [x] Frontend Docker build includes and bundles with shared package.

Acceptance gate:

- [x] Both apps compile/test in CI with shared package.
- [x] No required authority moved out of backend boundaries.
- [x] Wire contract changes are either absent or explicitly versioned and tested.

## PR slicing strategy

1. PR01 - Package foundation and CI/Docker wiring (P1, partial P2).
2. PR02 - Contract fixtures and boundary guards (complete P2).
3. PR03 - Theme extraction (P3.1).
4. PR04 - Shared primitives extraction (P3.2).
5. PR05 - Validation policy extraction (P3.3).
6. PR06 - Party/game public contracts extraction (P3.4).
7. PR07 - Identity extraction (P4.1).
8. PR08 - Organization extraction (P4.2).
9. PR09 - Project extraction (P4.3).
10. PR10 - Game management extraction (P4.4).
11. PR11 - Quiz/prediction extraction (P5.1).
12. PR12 - Media public contract extraction (P5.2).
13. PR13 - Error vocabulary extraction (P5.3).
14. PR14 - Cleanup and hardening (P6-P7).
15. PR15 - Docs + ADR status finalization (P8-P9).

Each PR must remain independently mergeable and include only one coherent slice.

## Risks and controls

| Risk                                               | Control                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| Shared package becomes a catch-all dump            | Enforce eligibility rules and explicit feature entry points               |
| Authorization assumptions drift to frontend/shared | Keep server authority tests and boundary checks mandatory                 |
| Wire contract drift during extraction              | Require producer/consumer fixture checks before duplicate removal         |
| Framework imports leak into shared package         | Add and enforce import-boundary guards for shared sources                 |
| Docker/CI misses shared package changes            | Update build contexts and CI route checks; verify with cold and warm runs |
| Adapter complexity grows beyond benefit            | Stop extraction for that subdomain and retain local implementation        |

## Stop conditions and re-scope triggers

Pause extraction and re-scope if one of the following happens:

- shared adapters become more complex than retained duplication;
- repeated wire compatibility breaks occur in one domain;
- extraction introduces framework coupling in shared package;
- CI/Docker overhead outweighs measurable maintenance benefit.

If paused, document the decision in this plan and update ADR 0022 follow-up scope.
