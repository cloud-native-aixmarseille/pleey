# Milestone 11 - Final Convergence And Legacy Retirement

## Scope

- Remove compatibility bridges.
- Remove stale legacy imports and duplicate protocols.
- Finalize migration from legacy `GameSession` naming and persistence semantics to `Party` terminology.
- Finalize i18n, security, performance, and boundary audits.

## Rebuild Rule

- Use backup and legacy code only to verify final behavior parity, migration completeness, and retirement scope.
- Do not copy, move, adapt, or incrementally rewrite legacy modules back into the active tree during convergence.
- Complete this milestone inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices while retiring temporary bridges.

## Implementation Checklist

- [ ] Remove active dependencies on backup modules.
- [ ] Remove temporary compatibility bridges one slice at a time.
- [ ] Remove duplicate DTOs and duplicate protocols.
- [ ] Remove stale legacy imports and registries.
- [ ] Remove any remaining workspace/dashboard-owned game listing contracts, transport names, or DI bindings that duplicate `game/management` ownership.
- [ ] Remove remaining active `game-session` naming from application, transport, and frontend runtime contracts once party flows are complete.
- [ ] Decide and execute the final persistence/schema migration away from legacy `GameSession` naming, or document the intentional residual schema naming if it must remain.
- [ ] Finalize i18n and error mappings for all rebuilt flows.
- [ ] Run final security review for host authorization and player identity behavior.
- [ ] Run final performance review for management reads and realtime party flow.
- [ ] Run a final backup-inspired UI parity audit across management, join, host-control, and live game flows, documenting any intentional deviation.
- [ ] Run final boundary audit for backend and frontend layers.

## Acceptance Criteria

- [ ] Active code no longer depends on backup modules.
- [ ] All supported management and party behaviors run only through the new architecture.
- [ ] Project game listing, filtering, and management entry are owned only by `game/management`, with no duplicate workspace/dashboard aliases left in active code.
- [ ] Active contracts no longer expose `game-session` terminology where `party` is the canonical concept.
- [ ] All supported user-facing game and management flows match the intended backup-inspired information hierarchy, control model, and visible state transitions, or the remaining deviations are explicitly documented.
- [ ] Boundary checks, authorization checks, and regression suites are green.
- [ ] Final active code contains no dead legacy bridges, unused abstractions, or avoidable duplicate runtime work.

## Test Targets

- [ ] Full backend unit and integration suite.
- [ ] Full frontend unit and integration suite.
- [ ] Full end-to-end regression suite for game flow and management flows.
- [ ] Final manual or visual parity checklist for backup-inspired frontend flows.

## Post-Milestone Clean Rules

- [ ] Review final backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove remaining dead code, stale exports, and obsolete compatibility leftovers.
- [ ] Consolidate translations and remove unused keys.
- [ ] Ensure presentation components are located in the correct shared or screen-local scope.
- [ ] Ensure no duplicated requests remain for the supported game flows.
