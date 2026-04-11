# Milestone 6 - Generic Player Action Flow

## Scope

- `submit-action`
- Generic action submission contracts
- Delegation from party use cases to game-type abstractions

## Rebuild Rule

- Use backup and legacy code only to verify expected player action behavior and acknowledgements.
- Do not copy, move, adapt, or incrementally rewrite legacy action handling code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define generic player action contract at party boundary.
- [ ] Define game-type abstraction for evaluating submitted actions.
- [ ] Implement backend `submit-action` use case without direct quiz or prediction branching.
- [ ] Delegate action evaluation through injected game-type adapters.
- [ ] Emit acknowledgements and shared state updates after submission.
- [ ] Implement socket mapping for `submit-action`.
- [ ] Implement frontend action dispatch flow through application contracts.
- [ ] Rebuild backup-inspired player acknowledgement, submitted, and locked-action feedback states with thin live-screen components.
- [ ] Ensure action acknowledgements update live UI state correctly.

## Acceptance Criteria

- [ ] Action entry remains generic under `game/party`.
- [ ] Quiz and prediction behavior are selected through injected abstractions.
- [ ] Action acknowledgements and state changes are visible through the party stream.
- [ ] Player action feedback preserves the backup-inspired visible acknowledgement and locked/submitted cues while remaining driven by the generic party flow.
- [ ] The action flow introduces no unused generic layers and avoids duplicate action mapping, redundant projections, or speculative plugin APIs.

## Test Targets

- [ ] Backend application tests for `submit-action` orchestration.
- [ ] Backend contract tests for swappable game-type adapters.
- [ ] Backend socket tests for action submission.
- [ ] Frontend runtime tests for dispatch and acknowledgement handling.
- [ ] Frontend screen tests cover idle, submitted, acknowledged, and rejected action states for the rebuilt backup-inspired action UX.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and type-specific action pathways replaced by the generic action entrypoint.
- [ ] Consolidate translations for action validation and acknowledgement states.
- [ ] Ensure no duplicate action-related requests or state refresh calls were introduced.
- [ ] Refactor test fixtures and adapters so generic action behavior is reusable without duplication.
