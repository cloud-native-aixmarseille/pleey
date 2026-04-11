# Milestone 2 - Party Creation And Management Reads

## Scope

- `create-party`
- `list-parties`
- Host ownership, pin generation, `participantRole` projection
- Initial migration from legacy `game-session` management semantics to canonical `party` management contracts

## Rebuild Rule

- Use backup and legacy code only to verify expected behavior and migration intent for management and party creation flows.
- Do not copy, move, adapt, or incrementally rewrite legacy `game-session` management code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define party aggregate root and core creation invariants.
- [ ] Define party pin generation policy and uniqueness contract.
- [ ] Define party repository ports for creation and management reads.
- [ ] Define management projection model including `participantRole`.
- [ ] Define the migration contract between legacy `GameSession` persistence semantics and the new `Party` management model.
- [ ] Decide whether milestone-2 party reads are backed temporarily by existing `GameSession` storage or by a new persistence shape, and document the bridge explicitly.
- [ ] Implement backend use case for `create-party`.
- [ ] Implement backend use case for `list-parties`.
- [ ] Ensure host ownership is resolved from authenticated context, not client input.
- [ ] Implement GraphQL resolver mapping for create and list operations.
- [ ] Implement frontend management adapter for `create-party`.
- [ ] Implement frontend management adapter for `list-parties`.
- [ ] Wire management screen state from a single `list-parties` read model.
- [ ] Rebuild the backup-inspired party management list and creation surface with fresh shared-card, status, and action patterns.

## Acceptance Criteria

- [ ] Host can create a party from management.
- [ ] Management lists host-owned and player-related parties through one read model.
- [ ] `participantRole` is sufficient to derive management state.
- [ ] Host authorization is enforced server-side.
- [ ] The plan for migrating legacy `GameSession` management semantics to `Party` contracts is explicit and implemented for milestone-2 scope.
- [ ] Party creation and party listing preserve the backup-inspired management summary and status experience while using new application and presentation boundaries.
- [ ] Only code used by party creation and management reads ships, and the slice avoids speculative layers, duplicate queries, and redundant state work.

## Test Targets

- [ ] Backend unit tests for `create-party` and `list-parties`.
- [ ] Backend integration tests for party persistence and pin generation.
- [ ] Backend GraphQL tests for create and list resolvers.
- [ ] Frontend facade tests for create and list flows.
- [ ] Frontend screen tests cover create, list, loading, and empty states for the rebuilt backup-inspired party management surface.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and duplicate party read models made obsolete by `list-parties`.
- [ ] Remove duplicate `game-session` management terminology where milestone-2 party terminology has replaced it.
- [ ] Consolidate translations and add missing keys for party creation and management states.
- [ ] Ensure no duplicate management HTTP requests exist for create or list refresh flows.
- [ ] Refactor any new factories or fixtures used for party creation and listing tests.
