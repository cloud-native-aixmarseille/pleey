# Game Refactoring Milestones

This folder tracks the implementation of the game refactoring plan.

Rules:

- One milestone equals one checklist file.
- Complete milestones in order unless an explicit dependency analysis allows parallel work.
- Each milestone must satisfy its acceptance criteria and test targets before being considered done.
- Legacy code is reference-only for business behavior and UI look and feel.
- Backup and legacy code exist only to understand expected behavior, business rules, data flow, and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite backup or legacy implementation into the new target tree.
- Every milestone must rebuild the active implementation from scratch in the target architecture while respecting repository rules for naming, boundaries, performance, tests, and code quality.
- Breaking changes are explicitly authorized for this refactor.
- Avoid backward compatibility layers, compatibility shims, and legacy-preserving workarounds unless a milestone explicitly calls for a short-lived migration bridge.
- New code must be justified by an active use case in the current milestone. Do not add speculative abstractions, placeholder services, unused helpers, dead exports, or convenience layers without a verified caller.
- Each milestone must remove or avoid code that is not materially useful to the shipped behavior. If a module, branch, DTO, hook, component, helper, or mapper is not used, it should not be created or it should be deleted before the milestone is closed.
- Optimization is mandatory where it affects real behavior: avoid duplicate requests, redundant derived state, unnecessary rerenders, repeated mappings, overfetching, and needless persistence or transport work. Prefer the simplest design that satisfies the current use case and measured constraints.
- Optimize for real workload and clarity, not hypothetical future reuse. The target is lean, useful, maintainable code rather than maximal abstraction.
- After each milestone, apply the clean rules from `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md` before marking the milestone complete.
- A milestone is not done until both milestone-specific checks and the clean rules have been reviewed for the impacted scope.
- Frontend implementation must follow the referenced React guidance from Vercel React Best Practices and the Expert React Frontend Engineer agent profile.
- Because the frontend already runs on React 19.2, prefer React 19 patterns where they materially improve the design, especially `useEffectEvent`, `startTransition`, `useDeferredValue`, Suspense boundaries, strict TypeScript props and state models, accessible semantic markup, and tests alongside new behavior.
- Do not cargo-cult framework-specific features that do not fit this stack. Server Components and Actions are optional, not mandatory, in this Vite application.
- Frontend UI and interaction outcomes for each rebuilt flow must be inspired by the matching frozen backup flow, but implemented with fresh code that respects the active architecture, shared UI primitives, i18n rules, and presentation boundaries.
- UI inspiration means preserving recognizable information hierarchy, core actions, state transitions, and overall screen rhythm from the backup experience. It does not authorize copying legacy component structure, CSS, hooks, or ad hoc abstractions.
- **Visual signature parity is mandatory.** Each rebuilt user-facing screen must
  reproduce the distinctive visual moments of its backup counterpart — for
  example, the lobby's PIN character tiles, the live pulse indicator, the hero
  invite/share panel, the prominent participant metric, and the accent-glow
  highlight on the current player. These signatures are part of the product
  identity and must be re-implemented from scratch using the active design
  tokens, recipes, and shared UI components in `presentation/shared/ui/*`.
- The look-and-feel — typography scale, surface recipes, spacing rhythm, color/accent usage, badge tone, and motion cues — must be lifted from the backup's visual outcome and rebuilt with the current shared UI library. Never reach into `backup/game-refactor-m0/**` for files, styles, or copy at runtime.
- Any milestone that introduces or materially changes a user-facing game or management screen must (a) name the backup-inspired surface it is targeting, (b) enumerate the visual signatures it commits to reproduce, and (c) verify that parity through its acceptance criteria and test targets.
- Keep presentation components thin. Business orchestration, async coordination, derived runtime state, and transport interaction belong in the application or app-composition layers.
- Avoid manual memoization by default. Introduce `useMemo`, `useCallback`, or `React.memo` only when the current codebase patterns or measured rerender pressure justify them.
- Backend implementation must follow the referenced NestJS guidance from the Awesome Copilot NestJS instructions.
- Apply those NestJS rules in the context of this repository: constructor-based DI, explicit providers, thin resolvers and gateways, validated transport DTOs, centralized exception mapping, startup config validation, and tests for new behavior.
- Where the external NestJS guidance assumes TypeORM repositories, adapt the same responsibility split to Prisma-backed ports and infrastructure adapters instead of introducing TypeORM-specific architecture.
- Keep transport classes thin. Business rules, authorization decisions, orchestration, caching policy, and persistence coordination belong in application or domain services, not in resolvers, controllers, or gateways.
- Shared ownership rule for management flows: project-scoped game listing, filtering, sorting, and cross-type management entry belong to `game/management`; `workspace` and `dashboard` may consume that data for UX composition but must not own duplicate listing use cases, duplicate GraphQL queries, or pass-through aliases for the same behavior.

Required Review Gate For Every Milestone:

- No speculative or currently unused code ships in the milestone output.
- Every new abstraction has a concrete caller and removes real duplication or complexity.
- The implementation avoids unnecessary runtime work, duplicate data loading, redundant transformations, and avoidable UI rerenders.
- User-facing flows that exist in the backup are checked for backup-inspired UI parity at the level of information hierarchy, action affordances, and visible state transitions, with any intentional deviation documented in the milestone notes.
- If a simpler design can satisfy the same tested behavior, prefer the simpler design.

Terminology Migration Rule:

- The refactor explicitly migrates the active concept of `game-session` to `party`.
- That migration is not only a folder rename. It must cover domain language, application contracts, transport DTOs, realtime event naming, read models, and persistence-facing abstractions.
- Until an explicit schema migration milestone removes the old naming, any temporary persistence bridge from `GameSession` storage to `Party` contracts must be documented as a short-lived migration step, not treated as the target architecture.
- Milestones that introduce party creation, observation, entry, exit, or host runtime control must state how they consume or replace the legacy `GameSession` model.

Milestones:

- `00-backup-and-architectural-guardrails.md`
- `01-shared-management-foundation.md`
- `02-party-creation-and-management-reads.md`
- `03-shared-party-observation.md`
- `04-player-entry-and-exit.md`
- `05-host-runtime-control.md`
- `06-generic-player-action-flow.md`
- `07-quiz-management.md`
- `08-prediction-management.md`
- `09-quiz-runtime-rule-implementation.md`
- `10-prediction-runtime-rule-implementation.md`
- `11-final-convergence-and-legacy-retirement.md`
