# Plan: Game Reset

Refactor the current game area by re-slicing it into two primary product scopes,
Game Management and Party, with quiz and prediction kept as pluggable game
types. Transport remains an implementation boundary, but infrastructure
ownership must follow the same `game/management`, `game/party`, and
`game/types/*` organization pattern instead of forming a separate top-level
transport slice. The plan assumes an in-repo backup folder because that is your
chosen migration strategy, but it treats that backup as a temporary safety net
and keeps strict boundaries so the rebuilt architecture can be implemented
incrementally and reviewed in small tasks.

**Steps**

1. Phase 1: Freeze the target language and architecture rules before moving
   code. Produce a short canonical glossary and enforce it in the battle plan:
   `game management` includes catalog and management flows, `party` is the live
   host-player runtime scope, `transport` owns GraphQL and Socket.IO
   contracts/adapters, and `game type` means a pluggable runtime implementation
   such as quiz or prediction.
2. Phase 1: Define the target bounded contexts and allowed dependencies.
   Recommended target model: `game/management`, `game/party`, and
   `game/types/*` across domain, application, infrastructure, and presentation.
   Keep transport concerns as scoped infrastructure adapters inside those
   ownership slices rather than as separate top-level transport modules.
   Explicitly prohibit mixing product workflows with transport concerns or
   mixing host-player orchestration with game-type rules. This step blocks all
   later file moves.
3. Phase 1: Write a complete inventory checklist of current responsibilities so
   nothing is dropped during the reset. Include backend runtime state, frontend
   runtime composition, GraphQL management flows, Socket.IO protocols, host
   authorization, player active-party tracking, realtime metadata, i18n error
   mappings, fixtures, unit tests, and end-to-end contracts.
4. Phase 2: Create the backup area inside the repository and define the
   migration operating rules. Move existing game, game-session, game-catalog,
   relevant quiz-prediction runtime integration code, and associated tests into
   a clearly named backup tree. Do not delete behavior yet; preserve imports
   only as temporary bridges when necessary. This phase depends on steps 1
   through 3.
5. Phase 2: Create the new empty target tree on backend and frontend with
   naming aligned to the glossary. Recommended backend slices:
   `domain/game/{management,party,types/{shared,quiz,prediction}}`,
   `application/game/{management,party/{host,player,shared},types/{shared,quiz,prediction}}`,
   `infrastructure/game/{management,party,types/{shared,quiz,prediction}}`, and
   `presentation/game/{management,party}`. Recommended frontend slices:
   `domains/game/{management,party,types/{shared,quiz,prediction}}`,
   `application/game/{management,party/{host,player,shared},types/{shared,quiz,prediction}}`,
   `infrastructure/game/{management,party,types/{shared,quiz,prediction}}`,
   `app/game/party`, and `presentation/game/{management,party}`. GraphQL and
   Socket.IO adapters should live inside the relevant infrastructure ownership
   slice. This phase depends on step 4.
6. Phase 2: Define the new canonical entities and use-case families before
   reimplementation. Recommended domain entities: `GameDefinition`, `GameType`,
   `Party`, `PartyPin`, `PartyState`, `PartyParticipant`, `PartyStage`,
   `PartyAction`, `PartyScore`, and transport-neutral event models.
   Recommended backend use-case families: game management CRUD and listing,
   host party lifecycle, player party participation, party observation, and
   game-type rule execution. Recommended frontend use-case families:
   management loading, player join-leave-rejoin, host controls, party route
   policy, party state projection, and game-type-specific screen mapping.
7. Phase 3: Rebuild the backend foundations first. Reimplement core `party`
   domain entities, repositories, state services, and
   authorization-context services with transport-neutral contracts. Keep host
   authorization derived from authenticated socket context, keep active player
   party tracking in Valkey, and keep live metadata sourced from realtime party
   state rather than separate GraphQL fetches. This phase depends on steps 5
   and 6.
8. Phase 3: Rebuild backend transport adapters after the domain and application
   boundaries exist. GraphQL should expose only management and lookup flows
   that belong to game management. Socket.IO should expose only live party
   commands and observation flows. Use explicit transport DTOs under
   infrastructure and keep application commands transport-neutral. This phase
   depends on step 7.
9. Phase 3: Rebuild backend game-type integrations as plugins against the new
   party contracts. Quiz and prediction should implement the same party
   lifecycle ports where possible and isolate type-specific
   stage-action-result rules behind clearly named provider classes or
   registries. This phase can proceed in parallel per game type after step 7.
10. Phase 4: Rebuild the frontend around the same vocabulary. `game
management` should own dashboard listing, selection, and launch-manage
    entry points. `party` should own join, lobby, playing, leaderboard, host
    command state, rejoin, route guards, and runtime providers. Transport
    clients should live under infrastructure only, and presentation should
    consume app-layer facades or contexts rather than socket or GraphQL
    details. This phase depends on steps 5, 6, and backend contract
    stabilization from steps 7 through 9.
11. Phase 4: Rebuild the frontend game-type integrations as pluggable
    renderers and management adapters. Keep quiz and prediction as game types,
    but separate management UIs from live party renderers so that party never
    owns game-type business rules and game-type modules never own transport
    wiring. This phase can proceed in parallel per game type after step 10.
12. Phase 5: Replace temporary bridges gradually with reviewable task slices.
    Recommended task order: glossary and boundaries, backup move, backend
    party core, backend transport, backend quiz plugin, backend prediction
    plugin, frontend party shell, frontend management shell, frontend quiz
    live renderer, frontend prediction live renderer, frontend management
    adapters, cleanup of bridges and legacy imports. Each slice should end
    with tests and a boundary audit.
13. Phase 5: Retire the backup tree only after parity is proven. Remove compatibility shims, backup references, dead transport contracts, duplicate DTOs, and stale tests once the new architecture fully owns game management and party flows.

**Visual Use Case Tree**

Protocol legend:

- `[GQL]` GraphQL
- `[SIO]` Socket.IO

```text
game/
|- management/
|  |- create-party [GQL]
|  |- list-parties [GQL]
|  '- list-project-games [GQL]
|
|- party/
|  |- shared/
|  |  '- observe-party [SIO]
|  |
|  |- host/
|  |  |- start-party [SIO]
|  |  |- advance-stage [SIO]
|  |  |- restart-stage [SIO]
|  |  |- rewind-stage [SIO]
|  |  |- rewind-party [SIO]
|  |  |- pause-party [SIO]
|  |  |- resume-party [SIO]
|  |  |- reveal-stage-result [SIO]
|  |  '- end-party [SIO]
|  |
|  '- player/
|     |- join-party [SIO]
|     |- leave-party [SIO]
|     |- submit-action [SIO]
|     '- rejoin-party [SIO]
|
|- types/
|  |- quiz/
|  |  |- management/
|  |  |  |- create-quiz [GQL]
|  |  |  |- update-quiz [GQL]
|  |  |  |- delete-quiz [GQL]
|  |  |  |- create-quiz-question [GQL]
|  |  |  |- list-quiz-questions [GQL]
|  |  |  |- update-quiz-question [GQL]
|  |  |  '- delete-quiz-question [GQL]
|  |
|  '- prediction/
|     |- management/
|     |  |- create-prediction [GQL]
|     |  |- update-prediction [GQL]
|     |  |- delete-prediction [GQL]
|     |  |- list-prediction-prompts [GQL]
|     |  |- create-prediction-prompt [GQL]
|     |  |- update-prediction-prompt [GQL]
|     |  '- delete-prediction-prompt [GQL]
```

Support services, authorization/context helpers, repositories, handler registries, UI state facades, and raw transport events are intentionally excluded from this tree. They should be documented separately as supporting implementation structure, not as use cases.

**Scope Dispatch Rules**

- `game/management` owns dashboard, catalog, launch, and party listing flows.
- `game/management/list-parties` should return party items with `participantRole` so the caller can distinguish host-owned active parties from player-related party entries and build dashboard banners without separate read use cases in the target model.
- `game/party` owns live runtime orchestration for host, player, and shared party state.
- `game/types/*` owns quiz and prediction management flows plus internal type-specific rules, but live party entrypoints stay under `game/party`.
- GraphQL and Socket.IO remain implementation detail layers and are intentionally not shown in the use-case tree; they should live under the relevant `infrastructure/game/{management,party,types/*}` scope rather than in a separate top-level transport tree.
- Party lifecycle mutations such as resume, pause, end, stage navigation, and result reveal belong only under `game/party/host`, not under `game/management`.
- Type-specific behavior such as quiz answer evaluation or prediction outcome evaluation is an internal rule behind `game/party` entrypoints, not a separate public use-case branch.
- If a flow needs both management lookup and live runtime coordination, document the handoff explicitly but still tag the exposed entrypoint as either `[GQL]` or `[SIO]`.

**High-Risk Mixed Flows To Police**

- `leave-party`: player-owned exit flow that may bridge management persistence and party navigation.
- `rejoin-party`: application-runtime orchestration, especially across refresh or reconnect, not a domain rule and not a transport concern.
- `block-duplicate-active-party`: mixed flow because it depends on management-owned active-party data before allowing a party join.
- `reveal-stage-result`: host party command that invokes game-type domain behavior but still enters through Socket.IO.

**Refactoring Technical Specifications**

**Implementation Contract**

- Rebuild the new implementation from scratch. The legacy codebase is a behavioral and visual reference only.
- Breaking changes are explicitly authorized for this refactor.
- Reuse from legacy only what is required to preserve business behavior, authorization rules, transport contracts during migration, and the existing UI look and feel.
- Do not copy legacy architectural structure, mixed boundaries, or transport leakage into the rebuilt modules.
- Do not preserve backward compatibility by default. Avoid compatibility shims, legacy workarounds, and bridge layers unless a milestone explicitly requires a short-lived migration bridge.
- Every new module must satisfy Clean Hexagonal Architecture, strict boundary enforcement, SOLID, DRY, Clean Code, and framework best practices.
- Frontend implementation must respect the external React guidance referenced for this refactor: Vercel React Best Practices and the Expert React Frontend Engineer profile.
- Backend implementation must respect the external NestJS guidance referenced for this refactor: the Awesome Copilot NestJS instructions, adapted to this repository's Prisma-based persistence model.
- Every new use case must be delivered as a small vertical slice with tests before moving to the next one.

**Non-Negotiable Architecture Rules**

- Backend and frontend must both follow explicit hexagonal boundaries: domain, application, infrastructure, and presentation or app composition.
- Domain contains business rules only. It must not depend on framework code, transport DTOs, persistence details, or UI concerns.
- Application contains use cases, orchestration, ports, policies, and authorization decisions. It may depend on domain abstractions only.
- Infrastructure implements ports for persistence, transport, realtime delivery, timers, caching, and framework adapters.
- Presentation and app composition consume application contracts only. They must not reach into infrastructure details directly.
- Transport contracts are adapters, not business models. GraphQL and Socket.IO payloads must be mapped at the edge inside the relevant infrastructure ownership slice.
- Dependency injection must be explicit at composition roots. Hidden service locators are forbidden.
- Common game-type behavior must be extracted to a dedicated `game/types/shared` abstraction scope rather than duplicated in quiz and prediction.

**Target Module Specification**

- Backend target modules:
  - `domain/game/management`
  - `domain/game/party`
  - `domain/game/types/shared`
  - `domain/game/types/quiz`
  - `domain/game/types/prediction`
  - `application/game/management`
  - `application/game/party/{host,player,shared}`
  - `application/game/types/shared`
  - `application/game/types/{quiz,prediction}`
  - `infrastructure/game/management`
  - `infrastructure/game/party`
  - `infrastructure/game/types/shared`
  - `infrastructure/game/types/{quiz,prediction}`
  - `presentation/game/{management,party}`
- Frontend target modules:
  - `domains/game/management`
  - `domains/game/party`
  - `domains/game/types/shared`
  - `domains/game/types/{quiz,prediction}`
  - `application/game/management`
  - `application/game/party/{host,player,shared}`
  - `application/game/types/shared`
  - `application/game/types/{quiz,prediction}`
  - `infrastructure/game/management`
  - `infrastructure/game/party`
  - `infrastructure/game/types/shared`
  - `infrastructure/game/types/{quiz,prediction}`
  - `app/game/party`
  - `presentation/game/{management,party}`

**Security And Authorization Specifications**

- Authorization is business behavior and must be modeled inside application policies and domain rules, not treated as a transport-only concern.
- Host authority must always be derived from authenticated server-side context. Client-supplied host identity is forbidden.
- Player behavior must support both guest and authenticated user flows with explicit identity semantics.
- Guest identity restoration and authenticated rejoin must remain distinct business cases even if they share transport entrypoints.
- Duplicate active-party protection must be enforced server-side before join or rejoin succeeds.
- Sensitive operations must fail closed with explicit domain or application errors mapped to translated user-facing messages.
- All input must be validated at transport boundaries and revalidated where business invariants matter.

**Game-Type Specifications**

- `game/types/shared` is the dedicated common abstraction scope for behavior shared by quiz and prediction.
- Shared abstractions must include game-type definition contracts, lifecycle hooks, stage progression contracts, action evaluation contracts, scoring contracts, and result reveal contracts where applicable.
- Quiz and prediction implementations must depend on common game-type abstractions through interfaces or abstract classes injected at composition time.
- Party use cases remain generic. Type-specific decisions are delegated through injected game-type policies or handlers.
- No quiz-specific or prediction-specific branching is allowed inside generic `game/party` use cases unless it is delegated behind a game-type abstraction.
- Shared code must be factored into `game/types/shared` only when it is truly cross-type business behavior. Superficial helper sharing must not create vague abstractions.

**Performance Specifications**

- Realtime party state must be incremental and event-driven. Avoid duplicate fetches when the socket stream is the source of truth.
- GraphQL queries must be narrow and management-oriented. Do not reuse GraphQL for live party polling.
- Keep payloads minimal. Large aggregate projections must be assembled server-side only when needed by a specific screen or handler.
- Cache only stable management reads and identity-linked party presence where required. Never cache authorization decisions without explicit invalidation rules.
- Avoid n+1 patterns in management queries and resolver composition.
- Prefer NestJS-aligned backend optimizations such as caching, throttling, and pagination where they fit the use case, but express them through the actual stack used here: NestJS providers, Prisma queries, and existing infrastructure adapters.
- Frontend state must minimize unnecessary rerenders and duplicated derived state. Shared party state should be normalized behind application facades.

**Framework Best Practices**

- NestJS modules are composition units, not business boundaries. Business boundaries live in the source tree and DI graph, not only in module files.
- Follow core NestJS practices consistently: constructor-based dependency injection, explicit providers, validated DTOs at transport boundaries, centralized exception handling, and startup configuration validation.
- Apollo GraphQL resolvers must stay thin and map directly to application use cases.
- Socket gateways must stay thin and delegate immediately to application services.
- Prisma-backed repositories and query services must stay behind ports or infrastructure adapters. Prisma models and query details must not leak into domain models or transport DTOs.
- Avoid circular module dependencies and manual provider instantiation. If custom construction is required, define it explicitly with NestJS custom providers at the composition root.
- Authentication guards may enforce entry requirements at the transport edge, but authorization outcomes that affect business behavior must still be modeled in application policies.
- React components must remain presentation-focused. State orchestration belongs in application or app-level providers, not deeply inside view components.
- Frontend code should use React 19.2 idioms when they improve correctness or clarity, especially `useEffectEvent` for non-reactive effect callbacks, `startTransition` for non-urgent UI updates, and `useDeferredValue` for deferred projections or search-like interactions.
- Prefer functional components, strict TypeScript contracts, semantic HTML, keyboard-accessible interactions, explicit error states, and test coverage for new UI behavior.
- Suspense boundaries, lazy loading, and code splitting should be used intentionally where they reduce runtime or bundle pressure, not as blanket decoration.
- Do not introduce Server Components or Actions unless the frontend architecture is explicitly evolved to support them. This Vite-based frontend is not required to mimic framework patterns it does not use.
- Avoid manual `useMemo`, `useCallback`, and `React.memo` by default. Add them only when existing project conventions or measured rerender pressure justify them.
- Avoid overusing framework-specific decorators, hooks, or context for business logic when plain domain or application abstractions are clearer.

**Migration Strategy Specifications**

1. Backup first.
   - Create the in-repo backup tree.
   - Move legacy game, game-session, game-catalog, and coupled tests into backup.
   - Freeze legacy code except for critical regression fixes.
   - Use legacy only as a behavioral oracle and UI reference.
2. Create empty target structure.
   - Add the new backend and frontend target trees.
   - Add base DI wiring, ports, DTO mappers, and test harnesses.
   - Add architecture checks to prevent forbidden imports.
3. Implement use case by use case.
   - Each use case must ship with domain rules, application service, transport adapter, tests, and boundary review.
   - Do not implement broad subsystems in one pass.
   - Close one vertical slice before opening the next, unless two slices are provably independent.

**Use Case Implementation Sequence**

1. `list-project-games`.
   - Build the shared management catalog read model.
   - This is the dependency root for type management entry.
2. `create-party`.
   - Establish party aggregate creation, pin generation, host ownership, and initial lifecycle state.
3. `list-parties`.
   - Build the management read model with `participantRole`, host-owned parties, and player-related active party visibility.
4. `observe-party`.
   - Establish the canonical shared realtime projection and socket subscription model.
5. `join-party`.
   - Support both guest and authenticated users.
   - Enforce duplicate active-party protection and authorization invariants.
6. `rejoin-party`.
   - Restore party presence after reconnect or refresh with correct guest or user semantics.
7. `leave-party`.
   - Handle player exit, disconnection, cleanup, and shared state updates.
8. Host lifecycle commands.
   - `start-party`
   - `advance-stage`
   - `restart-stage`
   - `rewind-stage`
   - `rewind-party`
   - `pause-party`
   - `resume-party`
   - `reveal-stage-result`
   - `end-party`
9. Player action command.
   - `submit-action` as the generic party entrypoint.
   - Delegate evaluation to game-type policies.
10. Quiz management use cases.
    - `create-quiz`
    - `update-quiz`
    - `delete-quiz`
    - `create-quiz-question`
    - `list-quiz-questions`
    - `update-quiz-question`
    - `delete-quiz-question`
11. Prediction management use cases.
    - `create-prediction`
    - `update-prediction`
    - `delete-prediction`
    - `list-prediction-prompts`
    - `create-prediction-prompt`
    - `update-prediction-prompt`
    - `delete-prediction-prompt`
12. Game-type internal rule implementations.
    - Implement quiz behavior behind generic party use cases.
    - Implement prediction behavior behind generic party use cases.
    - Factor shared cross-type code into `game/types/shared` only after duplication is proven.

**Milestone Batches**

**Milestone 0. Backup And Architectural Guardrails**

- Scope:
  - Create the backup tree.
  - Freeze legacy modules except critical bugfixes.
  - Create the new target structure for backend and frontend.
  - Add architecture enforcement checks and base DI composition.
- Acceptance criteria:
  - Legacy code is preserved in backup and no longer used as the default place for new work.
  - New source trees exist for `game/management`, `game/party`, and `game/types/shared` plus quiz and prediction scopes.
  - Import rules or boundary checks fail on forbidden cross-layer dependencies.
  - Empty composition roots can wire placeholder implementations without leaking legacy modules.
- Test targets:
  - Architecture rule tests or static checks for forbidden imports.
  - Smoke tests for backend boot and frontend build after the new structure is introduced.

**Milestone 1. Shared Management Foundation**

- Scope:
  - `list-project-games`
  - Common management catalog read model
  - Shared management repositories and DTO mappers
- Acceptance criteria:
  - A project-scoped game listing exists as the single management entry point for game selection.
  - Quiz and prediction management can depend on this listing without redefining their own project listing use cases.
  - GraphQL resolver output is transport-specific but mapped from transport-neutral application contracts.
- Test targets:
  - Backend unit tests for management query use case.
  - Backend GraphQL integration tests for the game catalog query.
  - Frontend repository adapter tests for catalog loading.
  - Frontend screen or facade tests proving the management landing view loads from the new source.

**Milestone 2. Party Creation And Management Reads**

- Scope:
  - `create-party`
  - `list-parties`
  - Host ownership, pin generation, participantRole projection
- Acceptance criteria:
  - Host can create a party from the new management surface.
  - Management can list host-owned and player-related parties through a single `list-parties` read model.
  - `participantRole` is sufficient to drive management state without adding duplicate queries.
  - Host ownership and authorization are derived server-side.
- Test targets:
  - Backend unit tests for party creation and listing use cases.
  - Backend integration tests for repositories and pin generation.
  - Backend GraphQL resolver tests for create and list operations.
  - Frontend management facade tests for create and list flows.

**Milestone 3. Shared Party Observation**

- Scope:
  - `observe-party`
  - Canonical shared realtime projection
  - Socket subscription and event mapping base
- Acceptance criteria:
  - Host and player clients can subscribe to one canonical party stream.
  - Shared party state includes enough information to drive lobby, stage, and status rendering without fallback polling.
  - No GraphQL live polling is introduced for party runtime state.
- Test targets:
  - Backend socket gateway tests for subscription handshake and event delivery.
  - Backend application tests for shared state projection.
  - Frontend socket adapter tests for subscription lifecycle.
  - Frontend provider tests for shared state hydration and updates.

**Milestone 4. Player Entry And Exit**

- Scope:
  - `join-party`
  - `rejoin-party`
  - `leave-party`
  - Guest and authenticated player identity behavior
  - Duplicate active-party protection
- Acceptance criteria:
  - Guest players can join and restore presence correctly.
  - Authenticated users can join and rejoin with correct identity continuity.
  - Duplicate active-party protection blocks invalid joins.
  - Leaving a party updates shared state correctly and releases active-party ownership when appropriate.
- Test targets:
  - Backend unit tests for join, rejoin, leave, and duplicate active-party rules.
  - Backend socket integration tests for join and leave command flows.
  - Backend security tests for guest versus authenticated identity semantics.
  - Frontend provider and route-policy tests for join, rejoin, and leave flows.
  - End-to-end join-flow regression tests.

**Milestone 5. Host Runtime Control**

- Scope:
  - `start-party`
  - `advance-stage`
  - `restart-stage`
  - `rewind-stage`
  - `rewind-party`
  - `pause-party`
  - `resume-party`
  - `reveal-stage-result`
  - `end-party`
- Acceptance criteria:
  - All host lifecycle commands run through `game/party/host` only.
  - Unauthorized clients cannot execute host commands.
  - Shared party state reflects lifecycle transitions consistently for all subscribers.
  - Result reveal timing and stage navigation remain compatible with expected gameplay behavior.
- Test targets:
  - Backend unit tests for host lifecycle policies and state transitions.
  - Backend socket gateway tests for each host command.
  - Backend authorization tests for host-only command enforcement.
  - Frontend host provider tests for command dispatch and state updates.
  - End-to-end game-flow regression tests covering host progression.

**Milestone 6. Generic Player Action Flow**

- Scope:
  - `submit-action`
  - Generic action submission contracts
  - Delegation from party use cases to game-type abstractions
- Acceptance criteria:
  - Player action entry remains generic at `game/party` level.
  - Quiz and prediction logic are selected through injected game-type abstractions rather than direct branching in party use cases.
  - Action acknowledgements and shared state updates are observable through the party stream.
- Test targets:
  - Backend application tests for generic submit-action orchestration.
  - Backend contract tests proving game-type adapters can be swapped through DI.
  - Backend socket tests for action submission.
  - Frontend player runtime tests for action dispatch and acknowledgement handling.

**Milestone 7. Quiz Management**

- Scope:
  - `create-quiz`
  - `update-quiz`
  - `delete-quiz`
  - `create-quiz-question`
  - `list-quiz-questions`
  - `update-quiz-question`
  - `delete-quiz-question`
- Acceptance criteria:
  - Quiz management is fully isolated inside the quiz type scope.
  - Quiz question lifecycle is managed without leaking into generic game management or party modules.
  - Management UI preserves the expected legacy look and feel while using the new architecture.
- Test targets:
  - Backend unit tests for quiz management use cases.
  - Backend GraphQL integration tests for quiz management operations.
  - Frontend management facade tests for quiz editing flows.
  - End-to-end quiz-management regression tests.

**Milestone 8. Prediction Management**

- Scope:
  - `create-prediction`
  - `update-prediction`
  - `delete-prediction`
  - `list-prediction-prompts`
  - `create-prediction-prompt`
  - `update-prediction-prompt`
  - `delete-prediction-prompt`
- Acceptance criteria:
  - Prediction management is isolated inside the prediction type scope.
  - Prediction prompt lifecycle is managed without creating duplicate management patterns outside the type scope.
  - Management UI preserves the expected look and feel while using the new contracts.
- Test targets:
  - Backend unit tests for prediction management use cases.
  - Backend GraphQL integration tests for prediction management operations.
  - Frontend management facade tests for prediction editing flows.

**Milestone 9. Quiz Runtime Rule Implementation**

- Scope:
  - Wire quiz runtime behavior behind generic party entrypoints.
  - Implement quiz answer evaluation, scoring, stage transitions, and result reveal behavior.
- Acceptance criteria:
  - Party use cases remain generic while quiz-specific decisions are delegated through quiz adapters.
  - Quiz runtime behavior matches expected business rules without transport leakage.
  - Shared code reused here is factored into `game/types/shared` only when truly cross-type.
- Test targets:
  - Backend unit tests for quiz runtime rule implementations.
  - Backend integration tests for quiz runtime orchestration through party use cases.
  - Frontend live renderer tests for quiz runtime screens.
  - End-to-end game-flow scenarios covering quiz runtime.

**Milestone 10. Prediction Runtime Rule Implementation**

- Scope:
  - Wire prediction runtime behavior behind generic party entrypoints.
  - Implement prediction submission, evaluation, stage transitions, and result reveal behavior.
- Acceptance criteria:
  - Prediction runtime behavior stays behind generic party interfaces.
  - No prediction-specific logic leaks into generic party orchestration except through injected abstractions.
  - Shared cross-type behavior is factored deliberately, not opportunistically.
- Test targets:
  - Backend unit tests for prediction runtime rule implementations.
  - Backend integration tests for prediction runtime orchestration through party use cases.
  - Frontend live renderer tests for prediction runtime screens.

**Milestone 11. Final Convergence And Legacy Retirement**

- Scope:
  - Remove compatibility bridges.
  - Remove stale legacy imports and duplicate protocols.
  - Finalize i18n, security, performance, and boundary audits.
- Acceptance criteria:
  - Active code no longer depends on backup modules.
  - All supported management and party behaviors run through the new architecture only.
  - Boundary checks, authorization checks, and regression suites are green.
- Test targets:
  - Full backend unit and integration suite.
  - Full frontend unit and integration suite.
  - Full end-to-end regression suite for game flow and management flows.

**Per-Use-Case Delivery Checklist**

- Define the business invariant and success criteria.
- Define or update domain models and domain errors.
- Add or update application port interfaces.
- Implement the application use case with explicit dependencies.
- Implement infrastructure adapters for persistence or transport.
- Add GraphQL resolver or Socket.IO gateway mapping only if the use case is externally exposed.
- Add unit tests for domain and application behavior.
- Add integration tests for transport and repository wiring where relevant.
- Validate authorization for host, guest player, and authenticated player where relevant.
- Validate i18n and error mapping before the slice is considered complete.

**Battle Checklist**

**Phase 1. Naming And Boundaries**

- [ ] Freeze `game` as the root domain for management, party, and game types.
- [ ] Freeze the canonical glossary: `game management`, `party`, `transport`, `game type`.
- [ ] State explicitly that game catalog belongs to game management.
- [ ] State explicitly that `party` replaces new `session` naming in rebuilt code.
- [ ] Confirm that quiz and prediction remain pluggable game types.
- [ ] Define allowed dependencies between backend layers.
- [ ] Define allowed dependencies between frontend layers.
- [ ] Document forbidden mixes: product workflow plus transport, host or player orchestration plus game-type rules.
- [ ] Define the canonical backend target tree under `game/*`.
- [ ] Define the canonical frontend target tree under `game/*`.
- [ ] Add a review gate for naming consistency before any code move.

**Phase 1. Current-State Inventory**

- [ ] Inventory backend `domain/game` responsibilities.
- [ ] Inventory backend quiz runtime responsibilities.
- [ ] Inventory backend prediction runtime responsibilities.
- [ ] Inventory backend host management use cases.
- [ ] Inventory backend live host party use cases.
- [ ] Inventory backend live player party use cases.
- [ ] Inventory backend shared pin or authorization context services.
- [ ] Inventory backend GraphQL management contracts.
- [ ] Inventory backend Socket.IO live contracts and event names.
- [ ] Inventory backend repositories and state stores, including Valkey usage.
- [ ] Inventory frontend game-session domain responsibilities.
- [ ] Inventory frontend game-catalog responsibilities now absorbed by game management.
- [ ] Inventory frontend player live runtime providers and hooks.
- [ ] Inventory frontend host live runtime providers and hooks.
- [ ] Inventory frontend GraphQL operations and repository adapters.
- [ ] Inventory frontend socket runtime adapters.
- [ ] Inventory frontend route guards, route builders, and rejoin logic.
- [ ] Inventory frontend game-type registries and adapters.
- [ ] Inventory backend test fixtures and mock factories tied to current naming.
- [ ] Inventory frontend test factories and context mocks tied to current naming.
- [ ] Inventory end-to-end contracts that must survive the migration.

**Phase 1. Behavior Parity Checklist**

- [ ] Create party.
- [ ] List parties for management.
- [ ] Preserve legacy host-party lookup by pin until the replacement read model is proven.
- [ ] Expose current player active party through `list-parties`.
- [ ] Leave current party.
- [ ] Join party as guest.
- [ ] Join party as authenticated player.
- [ ] Reject duplicate authenticated active party.
- [ ] Observe realtime lobby metadata.
- [ ] Observe lobby roster updates.
- [ ] Start party as host.
- [ ] Advance stage.
- [ ] Restart current stage.
- [ ] Rewind to previous stage.
- [ ] Rewind party.
- [ ] Pause party timeline.
- [ ] Resume party timeline.
- [ ] Reveal result.
- [ ] Submit player action.
- [ ] Observe action acknowledgement and result updates.
- [ ] Observe leaderboard updates.
- [ ] End party.
- [ ] Rejoin after refresh or reconnect.
- [ ] Open game-type management screens from dashboard.

**Phase 2. Backup And Workspace Preparation**

- [ ] Create a Git safety checkpoint before moving code.
- [ ] Create the in-repo backup folder structure.
- [ ] Move backend legacy game, game-session, and related transport code into backup.
- [ ] Move frontend legacy game-session and game-catalog code into backup.
- [ ] Move legacy tests and fixtures into backup only when their new owner is tracked.
- [ ] Keep only minimal compatibility bridges required for the incremental rebuild.
- [ ] Add a rule that no new feature work lands in the backup tree.

**Phase 2. New Target Tree Setup**

- [ ] Create backend `domain/game/management`.
- [ ] Create backend `domain/game/party`.
- [ ] Create backend `domain/game/types/quiz`.
- [ ] Create backend `domain/game/types/prediction`.
- [ ] Create backend `application/game/management`.
- [ ] Create backend `application/game/party/host`.
- [ ] Create backend `application/game/party/player`.
- [ ] Create backend `application/game/party/shared`.
- [ ] Create backend `application/game/types/quiz`.
- [ ] Create backend `application/game/types/prediction`.
- [ ] Create backend `infrastructure/game/management`.
- [ ] Create backend `infrastructure/game/party`.
- [ ] Create backend `infrastructure/game/types/shared`.
- [ ] Create backend `infrastructure/game/types/quiz`.
- [ ] Create backend `infrastructure/game/types/prediction`.
- [ ] Create backend `presentation/game/management`.
- [ ] Create backend `presentation/game/party`.
- [ ] Create frontend `domains/game/management`.
- [ ] Create frontend `domains/game/party`.
- [ ] Create frontend `domains/game/types/quiz`.
- [ ] Create frontend `domains/game/types/prediction`.
- [ ] Create frontend `application/game/management`.
- [ ] Create frontend `application/game/party/host`.
- [ ] Create frontend `application/game/party/player`.
- [ ] Create frontend `application/game/party/shared`.
- [ ] Create frontend `application/game/types/quiz`.
- [ ] Create frontend `application/game/types/prediction`.
- [ ] Create frontend `infrastructure/game/management`.
- [ ] Create frontend `infrastructure/game/party`.
- [ ] Create frontend `infrastructure/game/types/shared`.
- [ ] Create frontend `infrastructure/game/types/quiz`.
- [ ] Create frontend `infrastructure/game/types/prediction`.
- [ ] Create frontend `app/game/party`.
- [ ] Create frontend `presentation/game/management`.
- [ ] Create frontend `presentation/game/party`.

**Phase 3. Backend Party Core**

- [ ] Define canonical backend entities: `GameDefinition`, `GameType`, `Party`, `PartyPin`, `PartyState`, `PartyParticipant`, `PartyStage`, `PartyAction`, `PartyScore`.
- [ ] Define backend domain error codes and enums for party state.
- [ ] Define backend repository ports for party persistence and party state.
- [ ] Define backend ports for party broadcast, timer, scoring, and reveal policies.
- [ ] Rebuild shared party context loading around pin-based lookup.
- [ ] Rebuild host authorization context separately from generic pin lookup.
- [ ] Preserve authenticated host authorization from socket context only.
- [ ] Preserve authenticated player active-session ownership in Valkey.
- [ ] Keep live metadata owned by realtime party state.
- [ ] Add backend unit tests for all new party entities and services.

**Phase 3. Backend Game Management**

- [ ] Rebuild game management domain entities and repositories.
- [ ] Rebuild game management use cases for create and list flows.
- [ ] Merge game catalog concerns into game management naming and ownership.
- [ ] Ensure GraphQL-facing application commands remain transport-neutral.
- [ ] Add backend tests for game management use cases.

**Phase 3. Backend Transport**

- [ ] Rebuild GraphQL adapters under `infrastructure/game/management` only.
- [ ] Rebuild Socket.IO adapters under `infrastructure/game/party` only.
- [ ] Define explicit GraphQL DTOs in transport or infrastructure scope.
- [ ] Define explicit socket payload DTOs in transport or infrastructure scope.
- [ ] Centralize socket event naming and payload mapping.
- [ ] Ensure no application or domain layer imports transport DTOs.
- [ ] Add backend transport tests for GraphQL resolver behavior.
- [ ] Add backend transport tests for host and player socket gateways.

**Phase 3. Backend Game Types**

- [ ] Extract shared game-type plugin contract for party lifecycle hooks.
- [ ] Rebuild quiz as a game-type plugin against the new party contracts.
- [ ] Rebuild prediction as a game-type plugin against the new party contracts.
- [ ] Isolate quiz-specific stage, action, and result rules.
- [ ] Isolate prediction-specific stage, action, and result rules.
- [ ] Add backend tests per game-type plugin.

**Phase 4. Frontend Party**

- [ ] Rebuild frontend `domains/game/party` entities and domain services.
- [ ] Rebuild frontend player join, leave, and rejoin application flows.
- [ ] Rebuild frontend host control application flows.
- [ ] Rebuild frontend shared party route policy and state projection flows.
- [ ] Rebuild app-level party providers and composition under `app/game/party`.
- [ ] Rebuild party presentation screens for join, lobby, stage, and leaderboard.
- [ ] Keep presentation dependent on application contracts, not transport adapters.
- [ ] Add frontend tests for party domain services, application flows, and providers.

**Phase 4. Frontend Game Management**

- [ ] Rebuild frontend game management domain and application ownership.
- [ ] Merge game catalog behavior into game management modules.
- [ ] Rebuild dashboard list, launch, manage, and active-party entry points.
- [ ] Rebuild management GraphQL repository adapter in `infrastructure/game/management`.
- [ ] Add frontend tests for game management facades and flows.

**Phase 4. Frontend Transport**

- [ ] Rebuild frontend GraphQL adapters under `infrastructure/game/management`.
- [ ] Rebuild frontend socket connection and runtime adapters under `infrastructure/game/party`.
- [ ] Ensure auth token propagation is preserved for live host authorization.
- [ ] Ensure live metadata is sourced from party realtime flow, not extra GraphQL queries.
- [ ] Add frontend tests for GraphQL and socket adapters.

**Phase 4. Frontend Game Types**

- [ ] Rebuild quiz live renderer integration against the new party contracts.
- [ ] Rebuild prediction live renderer integration against the new party contracts.
- [ ] Rebuild quiz management adapter integration under game management.
- [ ] Rebuild prediction management adapter integration under game management.
- [ ] Keep game-type modules free of transport wiring ownership.
- [ ] Add frontend tests per game-type integration.

**Phase 5. Cleanup And Retirement**

- [ ] Remove temporary compatibility bridges one slice at a time.
- [ ] Remove duplicate DTOs and duplicate protocols.
- [ ] Remove stale `session` naming from newly rebuilt modules.
- [ ] Remove dead imports and legacy registries.
- [ ] Remove backup-tree references from active code.
- [ ] Delete backup code only after parity is proven.
- [ ] Run full backend, frontend, and end-to-end regression before final removal.

**Review Gate For Every Slice**

- [ ] Tree structure matches target ownership.
- [ ] Naming follows glossary.
- [ ] Dependency boundaries are respected.
- [ ] No transport leakage into domain or application contracts.
- [ ] No host authorization via client-supplied identifier.
- [ ] No live metadata regression toward GraphQL fetches.
- [ ] i18n and error mappings are complete.
- [ ] Unit tests are updated or added.
- [ ] Relevant integration or end-to-end coverage is updated.

**Relevant files**

- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/domain/game` — Current shared game and session entities, enums, services, and handler ports that need to be re-sliced into `game/management`, `game/party`, and `game/types/*` boundaries.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/domain/quiz` — Current quiz runtime handlers to preserve as game-type plugin behavior.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/domain/prediction` — Current prediction runtime handlers to preserve as game-type plugin behavior.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/application/game-session` — Current host, player, shared, and management use-case slices to inventory and remap into the new taxonomy.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/infrastructure/game` — Current repositories, registries, timers, and supporting services with mixed responsibilities that should be redistributed.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/presentation/game-session` — Current GraphQL and realtime presentation entrypoints that should be redrawn around management versus party.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/app/modules/game/game-module.ts` — Current DI composition root that will need a staged rewrite to the new module graph.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/domains/game-session` — Current live runtime domain and route policy services that map mostly to the future `domains/game/party` scope.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/domains/game-catalog` — Current catalog slice that, per decision, becomes part of `domains/game/management`.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/application/game-session` — Current frontend player, host, shared, and management application slices to be remapped.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/application/game-catalog` — Current game-type registry and management contracts that should merge under `application/game/management` while preserving plugin boundaries.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/infrastructure/game-session` — Current live runtime adapters for socket and repositories.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/infrastructure/game/graphql/operations` — Current legacy-named management GraphQL operations that should move under a transport slice aligned with game management.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/app/game-session/live` — Current app composition shell and providers that should be rebuilt under `app/game/party`.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/presentation/game-session` — Current live screens, contexts, and shared components that should be rehomed under `presentation/game/party`.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/e2e/tests/features/game-flow.spec.ts` — Current join-route contract that should remain green or be intentionally replaced during the migration.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/e2e/tests/features/quiz-management.spec.ts` — Current management flow contract for quiz that must be represented in the migration checklist.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/backend/src/test-utils` — Backend fixtures and mock factories tightly coupled to current naming that must be migrated deliberately.
- `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/application/frontend/src/test-utils` — Frontend factories and context mocks that must follow the new ownership model.

**Verification**

1. Before any code move, validate the inventory against current runtime coverage: backend game-session specs, frontend game-session specs, and the end-to-end game-flow and quiz-management scenarios.
2. After each migration slice, run the smallest relevant automated scope first, then full regression when the slice closes: backend unit tests, frontend unit tests, and then end-to-end smoke or targeted game or party scenarios.
3. Add architecture checks to the checklist: no domain to infrastructure imports, no transport DTOs in application contracts, no host authorization from client-supplied identifiers, no GraphQL metadata fetch reintroduced for live player party state.
4. Keep a parity checklist for each behavior before deleting legacy code: create party, list parties for management, preserve host-party lookup by pin until replacement is proven, join party as guest, join party as authenticated player, block duplicate active party, host controls, realtime lobby metadata, stage progression, result reveal, leaderboard, leave or rejoin, and manage game-type screens.
5. Require explicit review checkpoints after each tiny task: tree structure check, naming audit, dependency audit, i18n/error coverage, unit tests, and affected end-to-end coverage.

**Decisions**

- Included scope: backend and frontend architecture for game management, live party runtime, transport boundaries, and quiz/prediction game-type integration.
- Included scope: battle-plan-first approach with a checklist that can be split into small reviewable tasks.
- Chosen terminology: `game` is the root domain for management, party, and types.
- Chosen terminology: `game management` includes game catalog concerns.
- Chosen terminology: `party` is the canonical term for the live host/player runtime scope under `game/party`.
- Chosen modeling: quiz and prediction remain `game types` under `game/types`, not independent top-level products.
- Chosen migration strategy: move current code into an in-repo backup folder before rebuilding. This is workable, but the checklist should still add a branch or tag as an extra safety checkpoint because the backup folder will otherwise carry long-lived legacy code in the main tree.
- Excluded for now: unrelated auth, workspace, organization, deployment, and non-game feature refactors except where they are direct dependencies of management or party flows.

**Further Considerations**

1. Recommended target protocol rule: GraphQL should remain management-oriented and Socket.IO should remain party-oriented. Keep this strict unless you explicitly want a broader transport redesign.
2. Recommended target naming rule: reserve `session` only for legacy references during migration, converge new live-runtime code on `party`, and keep rebuilt subdomains consistently under the `game/*` root.
3. Recommended execution rule: rebuild backend party contracts before frontend party adapters so the transport and naming model is fixed once, not re-negotiated in both layers independently.
