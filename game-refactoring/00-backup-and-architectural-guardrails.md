# Milestone 0 - Backup And Architectural Guardrails

## Scope

- Create the backup tree.
- Freeze legacy modules except critical bugfixes.
- Create the new target structure for backend and frontend.
- Add architecture enforcement checks and base DI composition.
- Establish that breaking changes are authorized and backward compatibility is not a goal of the new implementation.
- Inventory and plan the migration of test fixtures, mock factories, and test utilities tied to current game naming and ownership.

## Rebuild Rule

- The backup snapshot exists only to understand expected behavior, business rules, data flow, and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite backup code into the active target tree.
- All active refactoring code must be written from scratch in the new architecture and must respect naming, boundaries, performance constraints, and repository best practices.

## Execution Note

- Milestone 0 creates a frozen backup snapshot under `backup/game-refactor-m0`.
- The legacy `game`, `game-session`, `game-catalog`, `quiz`, and `prediction` assets, plus the tightly coupled backend game modules, frontend `application/quiz-management` and `application/prediction-management` slices, and dashboard game repository files, are moved into the backup tree for this slice and no longer remain in the active source paths.
- New work must land in the new target tree, not in legacy `game-session` or `game-catalog` paths and not in the backup snapshot.

## Implementation Checklist

- [x] Create the in-repo backup directory structure for backend, frontend, and coupled tests.
- [x] Move legacy `game`, `game-session`, `game-catalog`, `quiz`, `prediction`, and tightly coupled test and dashboard assets into backup.
- [x] Inventory backend fixtures and mock factories under `application/backend/src/test-utils` that are tied to legacy game naming.
- [x] Inventory frontend fixtures, context mocks, and factories under `application/frontend/src/test-utils` that are tied to legacy game naming.
- [x] Decide which fixtures and factories move to backup immediately and which must be rebuilt in the new target tree.
- [x] Create target test utility directories for backend game modules.
- [x] Create target test utility directories for frontend game modules.
- [x] Add a clear rule in code comments or docs that new work must not land in backup.
- [x] Add a clear rule in code comments or docs that breaking changes are authorized for the refactor.
- [x] Add a clear rule in code comments or docs that backward compatibility layers, compatibility shims, and legacy workarounds must be avoided.
- [x] Create backend target directories for `domain/game/{management,party,types/{shared,quiz,prediction}}`.
- [x] Create backend target directories for `application/game/{management,party/{host,player,shared},types/{shared,quiz,prediction}}`.
- [x] Create backend target directories for `presentation/game/{management,party}`.
- [x] Create backend target directories for `infrastructure/game/{management,party,types/{shared,quiz,prediction}}`.
- [x] Create frontend target directories for `domains/game/{management,party,types/{shared,quiz,prediction}}`.
- [x] Create frontend target directories for `application/game/{management,party/{host,player,shared},types/{shared,quiz,prediction}}`.
- [x] Create frontend target directories for `presentation/game/{management,party}`.
- [x] Create frontend target directories for `app/game/party`.
- [x] Create frontend target directories for `infrastructure/transport/{graphql,socket}`.
- [x] Add base backend composition root wiring for new game modules.
- [x] Add base frontend composition wiring for new game modules.
- [x] Add static or lint architecture checks for forbidden imports across layers.
- [x] Add placeholder ports and interfaces needed to boot the new graph without legacy leakage.
- [ ] Add a milestone review gate that forbids speculative, unused, or avoidably inefficient code in the rebuilt target tree.

## Acceptance Criteria

- [x] Legacy code is preserved in backup and clearly separated from active implementation.
- [x] Breaking changes are explicitly accepted as part of the migration strategy.
- [x] The new implementation does not use backward compatibility shims as a default strategy.
- [x] Legacy `game`, `game-session`, `game-catalog`, `quiz`, `prediction`, and coupled dashboard integration paths are no longer present in the active source tree for this slice.
- [x] New source trees exist for management, party, shared type abstractions, quiz, and prediction scopes.
- [x] Legacy test fixtures and mock factories are inventoried and assigned either to backup or to a rebuild path in the new architecture.
- [x] Forbidden cross-layer imports fail through automated checks.
- [ ] Milestone rules explicitly require new code to be useful, actually used, and free of avoidable redundant work.
- [ ] Backend boots and frontend builds with the new empty structure in place.

## Test Targets

- [x] Verify the backup snapshot is populated under `backup/game-refactor-m0` and remains separated from the active source tree.
- [x] Run architecture rule checks or static boundary checks.
- [ ] Run backend boot smoke test.
- [ ] Run frontend build smoke test.
- [ ] Verify test utility paths and placeholder factories compile in the new target tree.

## Remaining Blocker

- Boundary checks now pass for the new backend and frontend game target trees.
- Backend build smoke is still blocked because active workspace/dashboard, error-handling, socket config, and project management code still imports legacy game, quiz, and prediction contracts that were moved into backup.
- Frontend typecheck and build smoke are still blocked because active dashboard and composition code still imports legacy game-session, game-catalog, quiz, prediction, quiz-management, and prediction-management contracts that were moved into backup.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code introduced or exposed by this milestone.
- [ ] Consolidate or add missing translations for impacted scope.
- [ ] Refactor impacted test fixtures, mock factories, and utilities to match the new ownership model.
- [ ] Ensure no duplicated requests or avoidable redundant loading were introduced.
- [ ] Remove placeholder or speculative modules that are not required by an active rebuilt use case.
