# Milestone 7 - Quiz Management

## Scope

- `create-quiz`
- `update-quiz`
- `delete-quiz`
- `create-quiz-question`
- `list-quiz-questions`
- `update-quiz-question`
- `delete-quiz-question`

## Rebuild Rule

- Use backup and legacy code only to verify expected quiz-management behavior and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy quiz-management code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define quiz management domain models and errors.
- [ ] Define quiz repository ports and question repository ports.
- [ ] Implement backend use cases for quiz lifecycle management.
- [ ] Implement backend use cases for quiz question lifecycle management.
- [ ] Add GraphQL mappings for quiz management operations.
- [ ] Implement frontend quiz management adapters and facades.
- [ ] Wire quiz management screens to new application contracts.
- [ ] Rebuild the backup-inspired quiz management shell, context bar, question list, and create/edit forms and dialogs with active shared UI primitives.

## Acceptance Criteria

- [ ] Quiz management is isolated inside the quiz type scope.
- [ ] Quiz question lifecycle does not leak into generic management or party modules.
- [ ] UI behavior matches expected management experience.
- [ ] Quiz management preserves the recognizable backup management hierarchy, editing affordances, and loading, empty, and error states while using fresh code.
- [ ] Quiz management ships only useful editing code and avoids dead form helpers, duplicate data loading, and unnecessary UI or transport indirection.

## Test Targets

- [ ] Backend unit tests for quiz management use cases.
- [ ] Backend GraphQL integration tests for quiz operations.
- [ ] Frontend management facade tests for quiz editing flows.
- [ ] Frontend screen tests cover the rebuilt backup-inspired quiz management shell, list, and dialog states.
- [ ] End-to-end quiz-management regression tests.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and obsolete quiz management helpers replaced by the new quiz scope.
- [ ] Consolidate translations for quiz and quiz-question management.
- [ ] Ensure quiz management does not trigger duplicate management requests.
- [ ] Refactor impacted quiz screens and components to respect presentation component placement rules.
