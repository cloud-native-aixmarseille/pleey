# Milestone 9 - Quiz Runtime Rule Implementation

## Scope

- Wire quiz runtime behavior behind generic party entrypoints.
- Implement quiz answer evaluation, scoring, stage transitions, and result reveal behavior.

## Rebuild Rule

- Use backup and legacy code only to verify expected quiz runtime behavior and player-facing outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy quiz runtime code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define quiz runtime contracts behind `game/types/shared` abstractions.
- [ ] Implement quiz answer evaluation rules.
- [ ] Implement quiz scoring rules.
- [ ] Implement quiz stage progression rules.
- [ ] Implement quiz result reveal rules.
- [ ] Wire quiz adapter implementations into generic party use cases.
- [ ] Ensure no transport logic leaks into quiz runtime rule code.
- [ ] Implement frontend quiz live renderer integration against party state.
- [ ] Rebuild the backup-inspired quiz host and player stage and result views against the new party stream and shared runtime shell.

## Acceptance Criteria

- [ ] Party use cases remain generic while quiz decisions are delegated to quiz adapters.
- [ ] Quiz runtime behavior matches expected business rules.
- [ ] Shared code is only extracted to `game/types/shared` when it is truly cross-type.
- [ ] Quiz live screens preserve the recognizable backup stage and result experience for both host and player while using rebuilt renderer code.
- [ ] Quiz runtime implementation avoids speculative abstractions, duplicate stage computations, and unused rule helpers.

## Test Targets

- [ ] Backend unit tests for quiz runtime rules.
- [ ] Backend integration tests for quiz behavior through party use cases.
- [ ] Frontend live renderer tests for quiz runtime screens.
- [ ] Frontend screen tests cover host and player stage and result states for the rebuilt backup-inspired quiz runtime views.
- [ ] End-to-end quiz runtime scenarios in game flow.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and obsolete quiz runtime branches displaced by the injected quiz adapter model.
- [ ] Consolidate translations for quiz runtime states and validation errors.
- [ ] Ensure no duplicate live data requests or redundant derived state were introduced.
- [ ] Split oversized quiz runtime components if needed and keep shared versus screen-local components correctly scoped.
