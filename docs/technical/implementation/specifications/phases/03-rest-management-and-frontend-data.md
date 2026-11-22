# Phase 03: REST management and frontend data

## Phase and production outcome

- **One PR:** `refactor(api)!: replace GraphQL and Apollo with REST and typed HTTP queries`.
- **Dependencies:** Phases 01 and 02 are merged and their production checks pass.
- **Result:** every existing management, content, media, profile and history workflow works through REST or the already-established Better Auth endpoints. The current live game transport remains the sole gameplay transport and remains fully usable.
- **Stop condition:** the repository contains no production GraphQL server/client or Apollo cache. No exposed workflow requires Phase 04.

Read [EXECUTION-CONTRACT.md](../EXECUTION-CONTRACT.md), [DOMAIN-CONTRACTS.md](../DOMAIN-CONTRACTS.md), [ACCEPTANCE-CATALOG.md](../ACCEPTANCE-CATALOG.md), and the P1 product inventory first. This file uses the canonical package names `@pleey/api`, `@pleey/web`, and `@pleey/contracts` created in P1. Commands below are requirements to implement or extend, not claims that they existed in the original repository.

### Independence proof

Build and deploy this PR with the P2 identity implementation and the existing game runtime. A registered organizer must create an organization/project, author either game type, create a party, host a complete game, view results and sign out. An anonymous player must join that party and play. Repeat after stopping all development tools. No Colyseus package, future game service, mock endpoint, alternate API flag or manually generated client is permitted as a prerequisite.

## Scope

Replace all remaining GraphQL operations, not merely the dashboard's visible happy path. Cover organizations, memberships, projects, catalog, quiz and prediction authoring/imports, stage ordering, launch readiness, party creation/listing, themes/assets, question media, profile extensions and history. Preserve permissions, localized business errors, guide behavior, empty states and responsive layouts.

Better Auth remains the owner of authentication, session queries, credential changes and revocation. Its documented client/HTTP endpoints are an intentional library boundary. Do not rebuild them as new application authentication endpoints or introduce a second session cache. The P2 XState session actor remains the browser session owner.

P2 also already supplies the complete bounded anonymous-identity lifecycle. Preserve its scheduler, retirement workflow, transfer deadlines and safe deletion behavior while replacing HTTP adapters. Temporary native Better Auth users are not registered customer accounts. This phase must not recreate a permanent guest directory, make historical participation depend on a surviving authentication row, or defer cleanup to the later operations phase.

This phase does not replace gameplay transport, alter scoring, introduce offline storage, add a generic CRUD framework, or change the party-setting precedence. Any existing HTTP action affecting an active party must invoke the current game application command path; controllers must not mutate active game rows independently. Keep this application boundary reusable by P4.

## Source paths to read

P1 moves `application/backend` to `apps/api` and `application/frontend` to `apps/web`. Use the P1 path map to locate moved equivalents of these audited sources:

- `src/presentation/organization/graphql/organization-resolver.ts` and project/game/theme resolvers under the backend presentation tree.
- `src/presentation/game/types/quiz/graphql/quiz-management-resolver.ts` and the prediction equivalent, including import and media operations.
- `src/presentation/identity/graphql/auth-resolver.ts`: identify operations already removed in P2 versus remaining application profile/history operations.
- Frontend `src/infrastructure/**/graphql/operations/*.graphql`, GraphQL repositories/adapters, generated types and client bootstrap.
- `docs/technical/architecture/adr/0011-standardize-list-query-pagination.md` and `docs/technical/development/frontend/user-guides.md`.

The pinned [pagination decision](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/docs/technical/architecture/adr/0011-standardize-list-query-pagination.md), [quiz resolver](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/game/types/quiz/graphql/quiz-management-resolver.ts), and [identity resolver](https://github.com/cloud-native-aixmarseille/pleey/blob/89eba30755f53aced04b596bc1531854a15bc1d5/application/backend/src/presentation/identity/graphql/auth-resolver.ts) provide baseline evidence. Read actual P2 HEAD before editing; the pinned sources do not override completed earlier phases.

## Contracts

### HTTP surface

Use Nest controllers and application use cases. The following paths are relative to `/api`; Better Auth keeps `/api/auth`. Record every old operation and its replacement method/path/operationId/consumer/test in `docs/technical/contracts/http-operation-map.json`. Every inventory row must have a replacement or an explicit explanation that P2 already moved it into Better Auth.

| Resource | Required route families and behavior |
| --- | --- |
| Organizations | `/organizations`, `/organizations/{organizationId}`, nested `/members` and `/dashboard`; create, read, update, member add/remove/role changes and scoped summaries |
| Projects | `/organizations/{organizationId}/projects`, `/projects/{projectId}`; list/create/update/delete with inherited settings and permission results |
| Catalog | `/projects/{projectId}/games`; filtered, sorted, paginated quiz/prediction catalog and readiness/permission information |
| Quiz | `/quizzes`, `/quizzes/{quizId}`, nested `/questions` and `/imports`; complete creation/edit/delete/import and ordering behavior |
| Prediction | `/predictions`, `/predictions/{predictionId}`, nested `/prompts` and `/imports`; equivalent complete authoring behavior |
| Parties | `/parties`, `/parties/{partyId}` and explicit action routes only where existing HTTP behavior needs them; creation/list/read use current application semantics |
| Themes | `/organizations/{organizationId}/themes`, `/themes/{themeId}`, nested `/assets`; library, editing, saving, permissions and asset upload |
| Media | `/media/{mediaId}` and explicit authorized upload/access endpoints; retain current ownership, content-type and size restrictions |
| Personal data | `/me/profile`, `/me/game-history` for application-owned fields/history; native Better Auth operations remain in its client |

Use GET for reads, POST for creation/commands, PATCH for partial edits, DELETE for deletions. Stage position changes must update the complete affected ordering transactionally. Document every operation's request, response, authorization, errors and upload format. Do not expose internal Prisma records or authorize by trusting tenant IDs in the body.

Keep P2's Better Auth handler mounting and body-parser ordering intact. The application profile endpoint owns only application-specific fields; it must not become a second writer for fields already owned by Better Auth.

Use the common error contract and stable domain error codes. Return appropriate HTTP statuses, including validation, authentication, permission, missing resource, conflict, rate limit and unavailable outcomes. Normalize expected errors for the UI; never return a raw stack, database detail, session credential or validation payload containing a password. Apply P2 origin/CSRF policy to cookie-authenticated mutations.

### Runtime schemas and generated types

Use Zod for wire validation where it is already selected in the shared contracts. Reuse schemas for supported form validation and HTTP parsing without importing server-only code into the browser. JSON representations use strings/numbers, not JavaScript Date, Map or database model instances.

Use official Nest validation/OpenAPI integration supported by the pinned version. Current Nest documentation describes Standard Schema validation and native OpenAPI conversion for compatible Zod schemas; prove that capability with an actual request and generated schema before depending on it. Do not introduce another API framework or a large wrapper layer. See [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction) and [Zod JSON Schema](https://zod.dev/json-schema).

Generate `packages/contracts/openapi/management.openapi.json`, then `packages/contracts/src/http/generated.ts` using `openapi-typescript`. Use `openapi-fetch` for the browser HTTP client. These tools provide generated TypeScript types and a typed fetch wrapper; type generation is not runtime validation. Server input validation and safe output serialization remain mandatory. See [generator documentation](https://openapi-ts.dev/introduction) and [client documentation](https://openapi-ts.dev/openapi-fetch/).

Add `pnpm --filter @pleey/api openapi:generate`, `pnpm --filter @pleey/contracts http:generate`, and root `pnpm contracts:check`. Generation must be deterministic, executable locally without production secrets and included in CI freshness checks. Export generation must not migrate/seed a database or start a listener as a side effect. Pin compatible public package versions in the lockfile.

Export actual `/api/...` paths in OpenAPI and use the browser origin as the fetch base URL, so `/api` is not prefixed twice. Send same-origin cookies and the P2 mutation-protection headers. Generation tests must compare a real deployed route with its generated client request.

### Pagination and consistency

Preserve ADR 0011: page is a one-based integer 1-10000, pageSize is 1-100, defaults are 1 and 9. Reject invalid transport values rather than silently normalizing them. Responses contain `items`, `totalCount`, `overallCount`, `page`, `pageSize`, `totalPages`; totalPages is at least one. A valid page beyond the end returns empty items and accurate metadata.

Authorization and live-record scope apply before both counts; optional filters distinguish totalCount from overallCount. Order by the selected field with a unique final tie-breaker. Read counts and rows within one short RepeatableRead transaction. Never load all database rows then slice them. Editor adapters that require the full ordered stage sequence explicitly traverse bounded pages and fail visibly if traversal cannot finish; do not silently display a partial editor.

### Accounts, participants and history

Apply the registered-only account predicate before pagination, search and both counts on every account directory, organization-member picker and account-management summary. Do not fetch every native Better Auth User and then hide anonymous rows in React. Registered accounts, live anonymous identities and party participations are distinct metrics and resource concepts. A participant list may include guests; an account list may not count those guests as registered accounts. Anonymous identities cannot become HOSTs, organization members or durable resource owners through a generic management endpoint.

History reads use the stable `PartyParticipant.id`, captured display/ranking inputs and durable gameplay records. `PartyParticipant.userId` is a nullable current authentication binding; a missing binding must not drop a participant from an organizer's authorized result, export or aggregate through an inner join. Prefer the participant snapshot for historical display, not an authentication user's current name. Preserve scores, answer attribution and ranking snapshots after P2 safely deletes the temporary guest identity. A party-local identifier or nickname is not proof of ownership and must never enable a new guest to claim a detached participant. There is no permanent global Actor table that retains every former guest.

Personal history still requires current authorization. An organizer's permission to read party results does not give an expired guest or another account permission to read that participant's private details. HTTP consumers handle expired, retired and unavailable session outcomes through the existing identity actor: return the appropriate stable error, clear inaccessible private data and show the translated recovery limit. Never create a new anonymous identity as an error handler or offer nickname/IP-based recovery. Review serializers and generated schemas so internal authentication IDs, session details and transfer proof are not exposed as historical fields merely because they exist in storage.

### Frontend ownership

Create one TanStack Query client for application HTTP data. Scope query keys by the relevant identity generation, organization/project, resource and filters. On identity change, cancel requests, clear user data and ignore stale responses; aborting a request alone is insufficient to stop a response already settling. Pass the Query-provided AbortSignal to the fetch client. [Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) documents that integration.

Use deliberate invalidation after mutations. Disable automatic mutation retries. A timeout can mean an unknown outcome: refetch authoritative resource/list state and show a clear retry/reconciliation choice, never silently send a second create. Preserve existing server idempotency if present. Do not promise exactly-once management effects from an in-memory loading flag.

Do not store live room players/scores in Query, persist its private cache in browser storage, or have HTTP errors create replacement anonymous users. Forms own drafts; Query owns fetched records; the P2 actor owns session authority.

## Ordered implementation checklist

1. Complete the operation map from backend, frontend, tests, generated docs, uploads and scripts. Review tenant rules and anonymous versus registered access for each row.
2. Implement shared schemas, error mapping, pagination and OpenAPI export. Prove one vertical list and one mutation through the real cookie integration and generated client.
3. Port resource families through use cases, including imports, theme assets and media. Preserve streaming/backpressure and limits for files; do not buffer arbitrary uploads to simplify the port.
4. Replace every frontend HTTP repository/adapter and Apollo consumer. Wire cache invalidation, cancellation, permissions, pending/error/empty states and identity-generation cleanup.
5. Run a full quiz and prediction journey with the existing live transport. Verify HTTP party commands enter the same current application path as transport commands.
6. Regenerate guides, translations, references and screenshots from their source manifests. Correct misleading prediction instructions: both types use authored correctness under the shared domain contract.
7. Remove GraphQL/Apollo and replace transport-specific architecture/pagination guards with equivalent HTTP checks. Preserve guards that still protect unrelated module boundaries.
8. Generate release artifacts, execute upgrade/release tests, and attach the completed operation map plus verification evidence to the PR.

## Data and migration requirements

This is primarily a transport/client replacement. Do not reset the database, rename all tables or reimport accounts. Preserve the P2 identity mapping, IDs, organization roles, themes, content, media references and history. If a concrete index or constraint is needed, provide an ordinary forward migration with an exercised down-version compatibility assessment. Reject unplanned destructive migration steps.

Include already-retired anonymous participants and expired native identities in the populated P2 fixture. A migration cannot recreate auth users for detached historical rows, make `PartyParticipant.userId` mandatory again, or restore cascading auth-to-history deletion. Preserve bounded transfer/lifecycle state and the cleanup schedule throughout the release.

This phase owns the deliberate normalization of authored answer duration to `null` for untimed stages. The baseline stores non-null integer limits and current runtime interprets non-positive limits as untimed; do not assume the target representation already exists. Supply the forward nullable-field migration, report conversion of supported old untimed values, and update BOTH quiz/prediction editors/importers and the currently deployed Socket.IO domain/adapters in this PR. Normalize negative authored points to their effective zero value with a report, preserving scored historical results. Test a complete untimed game on this current runtime before merge; Phase 04 is not its implementation dependency.

Preserve the common domain defaults and invariants. Do not convert the new nullable untimed contract back into ambiguous zero values, reorder true/false options, invent a host-resolved prediction flow or weaken party-setting precedence while moving DTOs.

## Deployment requirements

Deploy matching web/API artifacts as one release. Update proxy routes, request-size/time limits, CSRF/origin rules, health probes and OpenAPI artifact publishing. Keep the existing live-game routes and identities functional. Add no service worker.

Return personalized HTTP responses with an explicit private/no-store policy. Make OpenAPI documentation available as a build artifact; any interactive production documentation follows the deployment's authentication policy. A schema export must contain no sample secrets or private content.

Outdated frontend code must receive the common incompatible-build outcome and a reload instruction; do not retain a GraphQL adapter to make it work. Preserve old hashed static assets for the declared release window so an already loaded page can display that outcome.

## Acceptance tests

Each ID is a permanent evidence key. Include real PostgreSQL and HTTP integration where the assertion concerns authorization, transactions or transport. Browser fixtures use isolated data.

| ID | Given / when | Required assertion |
| --- | --- | --- |
| HTTP-001 | Generate OpenAPI and client twice from clean source | Identical outputs; all operation-map rows resolve to one implemented operation and consumer |
| HTTP-002 | Send malformed types, unknown fields and boundary values | Consistent validation errors; no mutation; runtime validation matches the documented accepted input |
| HTTP-003 | Two tenants and anonymous/registered users exercise every resource family | Cross-tenant reads, counts, uploads and mutations fail; permitted operations work |
| HTTP-004 | Request default, maximum, invalid and beyond-end pages | Exact ADR 0011 envelope/bounds/empty-state behavior |
| HTTP-005 | Insert/update while counts and rows are read | One response uses a consistent snapshot and deterministic tie ordering |
| HTTP-006 | Editor loads more than one page and reorders stages | Complete ordered sequence is editable; interrupted/exhausted traversal is visible, never partial success |
| HTTP-007 | Create/edit/import/delete quiz and prediction content | Current formats, localized true/false values, defaults and authored correctness remain correct |
| HTTP-008 | Upload authorized valid/oversized/invalid/foreign media | Valid media renders; invalid or unauthorized data is rejected without orphaned accessible objects |
| HTTP-009 | Edit themes and membership roles | Permissions, assets, previews and dependent caches update correctly |
| HTTP-010 | Start a long request as account A, then switch to B | A's late response cannot populate B's cache or rendered UI |
| HTTP-011 | Lose a mutation response | No automatic second mutation; user sees reconciliation and authoritative state |
| HTTP-012 | Create a party and complete timed and untimed examples of both game types | Existing live transport handles canonical null duration; no future game process, numeric sentinel shim or GraphQL request is needed |
| HTTP-013 | Perform HTTP action affecting an active party | Existing game application authorization/order is used; no alternate direct database write |
| HTTP-014 | Exercise guides, permissions and errors in English/French on narrow/wide layouts | Correct text, visible targets, keyboard/focus behavior and regenerated documentation |
| HTTP-015 | Build production bundles and inspect dependencies/network traffic | No GraphQL/Apollo runtime, operation or request remains; no server secret enters browser output |
| HTTP-016 | Upgrade a populated P2 deployment to P3, including historical numeric untimed values | IDs/data/session authority and scored history preserved; content normalization reported; matching frontend/current game works; stale frontend fails explicitly |
| HTTP-017 | Populate many temporary guests and detached historical participants, then exercise account lists/counts, organizer results/exports and expired personal-history requests | Account pagination/search/counts include registered accounts only; permitted history preserves every retained participant and score without a surviving auth row; private history remains inaccessible to expired or unrelated identities; no new guest is created and no participant can be reclaimed by ID, nickname or IP |

Run `pnpm verify`, `pnpm contracts:check`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:release`, `pnpm test:upgrade`, and `pnpm deploy:render` using P1's isolated runners. Report real-device tests separately; do not label browser emulation as an iPhone/Android device check.

## Production rollout and rollback

Rehearse from a populated P2 backup. Before routing traffic, verify migration compatibility, new route map, cookie behavior, generated artifact freshness and full product smoke tests. Deploy matched web/API images, then check login, one authorized management read/mutation, media and a complete party.

Stop rollout on authentication failures, missing operation coverage, cross-tenant disclosure, failed game control or inconsistent data. For an application-only change with a verified unchanged schema, rollback requires the complete P2 web/API release and route configuration together. Do not restore the database merely to reverse a transport change. If a forward migration makes P2 incompatible, use the documented coordinated restore or roll-forward procedure; image-only rollback is forbidden. Existing post-release writes must be accounted for before any restore.

## Deletion and definition of done

Delete production GraphQL modules/resolvers/schemas, upload adapters used only by GraphQL, Apollo clients/providers/cache configuration, `.graphql` operations, generated operation types, unused dependencies, build/codegen tasks and obsolete proxy routes. Preserve historical ADRs with superseded status and useful behavior tests rewritten against the new boundary.

The PR is done only when all HTTP tests pass, every P1 parity row still works, the operation map has no pending row, production images contain no replacement stub or legacy fallback, and P3 runs indefinitely without P4. Include executed command results, deployed artifact digests from the isolated release test, migration/rollback evidence and remaining measured operational limits in the PR description.
