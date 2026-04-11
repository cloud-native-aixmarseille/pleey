# Milestone 4 - Player Entry And Exit

## Scope

- `join-party`
- `rejoin-party`
- `leave-party`
- Guest and authenticated player identity behavior
- Duplicate active-party protection

## Rebuild Rule

- Use backup and legacy code only to verify expected join, rejoin, leave, and identity behavior.
- Do not copy, move, adapt, or incrementally rewrite legacy player entry code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define guest identity and authenticated identity business rules.
- [ ] Define active-party ownership contract for duplicate protection.
- [ ] Implement backend `join-party` use case with guest and user support.
- [ ] Implement backend `rejoin-party` use case for reconnect and refresh flows.
- [ ] Implement backend `leave-party` use case with cleanup semantics.
- [ ] Enforce duplicate active-party protection server-side.
- [ ] Implement socket handlers for join, rejoin, and leave.
- [ ] Implement frontend join flow for guests.
- [ ] Implement frontend join flow for authenticated users.
- [ ] Implement frontend rejoin flow with restored identity semantics.
- [ ] Implement frontend leave flow with state cleanup and navigation updates.
- [ ] Rebuild the backup-inspired entry flow for pin validation, identity capture, join errors, and leave/rejoin guidance with fresh presentation code.

## Acceptance Criteria

- [ ] Guests can join and rejoin correctly.
- [ ] Authenticated users can join and rejoin with identity continuity.
- [ ] Invalid duplicate active-party joins are blocked.
- [ ] Leaving updates shared state and releases ownership when appropriate.
- [ ] Player entry screens preserve the backup-inspired join and rejoin guidance, identity capture flow, and visible error handling without copying legacy implementation.
- [ ] Player entry and exit code remains lean: no unused join helpers, no speculative identity abstractions, and no avoidable duplicate transport or state work.

## Test Targets

- [ ] Backend unit tests for join, rejoin, leave, and duplicate protection.
- [ ] Backend socket integration tests for join and leave commands.
- [ ] Backend security tests for guest versus authenticated behavior.
- [ ] Frontend route-policy and provider tests for join, rejoin, and leave.
- [ ] Frontend screen tests cover guest join, authenticated join, duplicate rejection, and leave states for the rebuilt backup-inspired entry experience.
- [ ] End-to-end join-flow regression tests.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and duplicate join or rejoin pathways replaced by the new party flows.
- [ ] Consolidate translations for guest, authenticated player, and duplicate active-party errors.
- [ ] Ensure no duplicated join-related requests or reconnect fetches were introduced.
- [ ] Refactor route-policy helpers, fixtures, and mocks to match the new player ownership model.
