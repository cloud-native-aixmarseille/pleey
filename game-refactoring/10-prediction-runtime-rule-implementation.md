# Milestone 10 - Prediction Runtime Rule Implementation

## Scope

- Wire prediction runtime behavior behind generic party entrypoints.
- Implement prediction submission, evaluation, stage transitions, and result reveal behavior.

## Rebuild Rule

- Use backup and legacy code only to verify expected prediction runtime behavior and player-facing outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy prediction runtime code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define prediction runtime contracts behind `game/types/shared` abstractions.
- [ ] Implement prediction submission and evaluation rules.
- [ ] Implement prediction stage progression rules.
- [ ] Implement prediction result reveal rules.
- [ ] Wire prediction adapter implementations into generic party use cases.
- [ ] Ensure no transport logic leaks into prediction runtime rule code.
- [ ] Implement frontend prediction live renderer integration against party state.
- [ ] Rebuild the backup-inspired prediction host and player stage and result views against the new party stream and shared runtime shell.

## Acceptance Criteria

- [ ] Prediction behavior stays behind generic party interfaces.
- [ ] No prediction-specific logic leaks into generic party orchestration except through injected abstractions.
- [ ] Shared cross-type behavior is factored deliberately.
- [ ] Prediction live screens preserve the recognizable backup stage and result experience for both host and player while using rebuilt renderer code.
- [ ] Prediction runtime implementation avoids speculative abstractions, duplicate stage computations, and unused rule helpers.

## Test Targets

- [ ] Backend unit tests for prediction runtime rules.
- [ ] Backend integration tests for prediction behavior through party use cases.
- [ ] Frontend live renderer tests for prediction runtime screens.
- [ ] Frontend screen tests cover host and player stage and result states for the rebuilt backup-inspired prediction runtime views.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and obsolete prediction runtime branches displaced by the injected prediction adapter model.
- [ ] Consolidate translations for prediction runtime states and validation errors.
- [ ] Ensure no duplicate live data requests or redundant derived state were introduced.
- [ ] Split oversized prediction runtime components if needed and keep shared versus screen-local components correctly scoped.
