# Milestone 5 - Host Runtime Control

## Scope

- `start-party`
- `advance-stage`
- `restart-stage`
- `rewind-stage`
- `rewind-party`
- `pause-party`
- `resume-party`
- `reveal-stage-result`
- `end-party`

## Rebuild Rule

- Use backup and legacy code only to verify expected host gameplay behavior and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy host runtime control code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define host lifecycle state transition rules.
- [ ] Implement backend host use cases for every host command.
- [ ] Enforce host-only authorization for each command.
- [ ] Publish shared party updates after each lifecycle transition.
- [ ] Implement socket gateway mappings for each host command.
- [ ] Implement frontend host command facade or provider.
- [ ] Wire host UI controls to application contracts only.
- [ ] Rebuild the backup-inspired host command bar and stage-control affordances with thin presentation components and injected command handlers.
- [ ] Validate stage navigation and reveal semantics against expected gameplay behavior.

## Acceptance Criteria

- [ ] All host lifecycle commands run only through `game/party/host`.
- [ ] Unauthorized clients cannot execute host commands.
- [ ] Shared party state stays consistent for all subscribers.
- [ ] Reveal timing and stage transitions match expected behavior.
- [ ] Host runtime controls preserve the recognizable backup command-bar flow, action availability states, and stage-control affordances while using rebuilt code.
- [ ] Host runtime control ships only necessary command orchestration and avoids dead command wrappers, duplicate broadcasts, and redundant transition work.

## Test Targets

- [ ] Backend unit tests for lifecycle policies and transitions.
- [ ] Backend socket tests for each host command.
- [ ] Backend authorization tests for host-only enforcement.
- [ ] Frontend host provider tests for command dispatch and updates.
- [ ] Frontend screen tests cover enabled, disabled, and transition states of the rebuilt backup-inspired host controls.
- [ ] End-to-end host progression regression tests.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and duplicate host control pathways displaced by the new host runtime module.
- [ ] Consolidate translations for host command errors and state labels.
- [ ] Ensure no duplicated host-state requests exist alongside the party stream.
- [ ] Split oversized host UI components if needed and keep presentation components in the correct scope.
