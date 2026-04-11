# Milestone 8 - Prediction Management

## Scope

- `create-prediction`
- `update-prediction`
- `delete-prediction`
- `list-prediction-prompts`
- `create-prediction-prompt`
- `update-prediction-prompt`
- `delete-prediction-prompt`

## Rebuild Rule

- Use backup and legacy code only to verify expected prediction-management behavior and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy prediction-management code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define prediction management domain models and errors.
- [ ] Define prediction repository ports and prompt repository ports.
- [ ] Implement backend use cases for prediction lifecycle management.
- [ ] Implement backend use cases for prediction prompt lifecycle management.
- [ ] Add GraphQL mappings for prediction management operations.
- [ ] Implement frontend prediction management adapters and facades.
- [ ] Wire prediction management screens to new application contracts.
- [ ] Rebuild the backup-inspired prediction management shell, context bar, prompt list, and create/edit forms and dialogs with active shared UI primitives.

## Acceptance Criteria

- [ ] Prediction management is isolated inside the prediction type scope.
- [ ] Prediction prompt lifecycle does not leak into generic management or party modules.
- [ ] UI behavior matches expected management experience.
- [ ] Prediction management preserves the recognizable backup management hierarchy, editing affordances, and loading, empty, and error states while using fresh code.
- [ ] Prediction management ships only useful editing code and avoids dead prompt helpers, duplicate data loading, and unnecessary UI or transport indirection.

## Test Targets

- [ ] Backend unit tests for prediction management use cases.
- [ ] Backend GraphQL integration tests for prediction operations.
- [ ] Frontend management facade tests for prediction editing flows.
- [ ] Frontend screen tests cover the rebuilt backup-inspired prediction management shell, list, and dialog states.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and obsolete prediction management helpers replaced by the new prediction scope.
- [ ] Consolidate translations for prediction and prediction-prompt management.
- [ ] Ensure prediction management does not trigger duplicate management requests.
- [ ] Refactor impacted prediction screens and components to respect presentation component placement rules.
