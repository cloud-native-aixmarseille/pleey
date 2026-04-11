# Milestone 0 Legacy Asset Inventory

## Snapshot Strategy

- Milestone 0 creates a frozen in-repo backup snapshot under `backup/game-refactor-m0`.
- The listed legacy source and test assets were moved out of the active tree into this backup slice on `2026-04-10`.
- New work must land in the new `game/*` target tree, not in legacy `game-session` or `game-catalog` paths and not in the backup snapshot.
- The backup snapshot is behavior reference only. It must not be copied, moved, adapted, or incrementally rewritten into active refactoring code.
- All rebuilt code for later milestones must be written from scratch in the target architecture while respecting naming, boundaries, performance rules, and repository best practices.
- Snapshot rules are duplicated in `backup/game-refactor-m0/README.md` so they stay attached to the frozen copy.

## Backend Legacy Snapshot

- Snapshot directory: `backup/game-refactor-m0/application/backend/src/domain/game`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/domain/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/domain/quiz`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/application/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/application/prediction-management`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/application/quiz-management`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/application/workspace/dashboard/use-cases/list-project-dashboard-games-use-case.ts`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/application/workspace/dashboard/use-cases/list-project-dashboard-games-use-case.spec.ts`
- These workspace/dashboard files are retained only as frozen legacy references. The active tree must not recreate dashboard-owned aliases for project game listing; the canonical owner is `application/game/management/list-project-games`.
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/presentation/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/presentation/prediction-management`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/presentation/quiz-management`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/infrastructure/game`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/infrastructure/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/infrastructure/quiz`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/app/modules/game`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/app/modules/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/backend/src/app/modules/quiz`

## Backend Fixture And Mock Inventory

- Move to backup snapshot now:
  - `application/backend/src/test-utils/fixtures/unit/game.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/game-score.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/game-stage.fixture.ts`
  - `application/backend/src/test-utils/fixtures/integration/game-session.fixture.ts`
  - `application/backend/src/test-utils/fixtures/integration/question.fixture.ts`
  - `application/backend/src/test-utils/fixtures/integration/quiz.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/game-session.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/game-session-state.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/join-game-session-state.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/join-game-dto.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/pin.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/player-score.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/player-state.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/prediction-prompt.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/question.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/quiz.fixture.ts`
  - `application/backend/src/test-utils/fixtures/unit/submit-game-action-dto.fixture.ts`
  - `application/backend/src/test-utils/mock-factories/game-session-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-session-state-service.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-session-pin-context-service.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-broadcast-service.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/end-game-use-case.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-timer-service.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-join-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-join-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-next-stage-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-next-stage-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-pause-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-pause-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/prediction-prompt-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/prediction-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/question-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/quiz-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-resume-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-resume-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-resume-session-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-resume-session-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-reveal-result-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-reveal-result-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/reveal-game-result-use-case.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/result-reveal-scheduler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/score-repository.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-start-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-start-handler-registry.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-submit-action-handler.mock-factory.ts`
  - `application/backend/src/test-utils/mock-factories/game-submit-action-handler-registry.mock-factory.ts`
- Rebuild in new target tree:
  - `application/backend/src/test-utils/game/management/**`
  - `application/backend/src/test-utils/game/party/**`
  - `application/backend/src/test-utils/game/types/shared/**`
  - `application/backend/src/test-utils/game/types/quiz/**`
  - `application/backend/src/test-utils/game/types/prediction/**`

## Frontend Legacy Snapshot

- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/domains/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/domains/game-catalog`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/domains/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/domains/quiz`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/application/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/application/game-catalog`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/game-catalog`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/game`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/quiz`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/dashboard/graphql-dashboard-game.repository.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/infrastructure/dashboard/graphql-dashboard-game.repository.test.ts`
- These dashboard transport files are frozen legacy references only. Active project game listing contracts, GraphQL operations, and adapters belong under `game/management`, even when the dashboard screen consumes them.
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/prediction-management`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/quiz-management`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/composition/container-modules/game-session-live-host.module.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/composition/container-modules/game-session-live-player.module.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/composition/container-modules/game-session-live-shared.module.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/composition/container-modules/prediction-management.module.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/app/composition/container-modules/quiz-management.module.ts`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/presentation/game-session`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/presentation/workspace/dashboard/screens/home/components`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/presentation/prediction`
- Snapshot directory: `backup/game-refactor-m0/application/frontend/src/presentation/quiz`

## Frontend Fixture And Mock Inventory

- Move to backup snapshot now:
  - `application/frontend/src/test-utils/factories/game-lobby-state-context-mock-factory.ts`
  - `application/frontend/src/test-utils/factories/game-leaderboard-context-mock-factory.ts`
  - `application/frontend/src/test-utils/factories/game-type-descriptor-fixture-factory.ts`
  - `application/frontend/src/test-utils/factories/dashboard-active-session-fixture-factory.ts`
  - `application/frontend/src/test-utils/factories/game-lobby-context-mock-factory.ts`
  - `application/frontend/src/test-utils/factories/game-type-catalog-gateway-mock-factory.ts`
  - `application/frontend/src/test-utils/factories/game-join-context-mock-factory.ts`
  - `application/frontend/src/test-utils/factories/prediction-game-repository-mock-factory.ts`
- Rebuild in new target tree:
  - `application/frontend/src/test-utils/game/management/**`
  - `application/frontend/src/test-utils/game/party/**`
  - `application/frontend/src/test-utils/game/types/shared/**`
  - `application/frontend/src/test-utils/game/types/quiz/**`
  - `application/frontend/src/test-utils/game/types/prediction/**`

## Coupled end-to-end Coverage Snapshot

- Snapshot file: `backup/game-refactor-m0/e2e/tests/features/game-flow.spec.ts`
- Snapshot file: `backup/game-refactor-m0/e2e/tests/features/quiz-management.spec.ts`

## Snapshot Status

- Snapshot populated and legacy assets relocated on `2026-04-10` for the milestone-0 backup-only slice, including the additional quiz, prediction, backend module, dashboard integration assets, and legacy frontend container modules that still wired the old runtime composition.
