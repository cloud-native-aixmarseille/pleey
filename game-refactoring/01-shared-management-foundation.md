# Milestone 1 - Shared Management Foundation

## Scope

- `list-project-games`
- Common management catalog read model
- Shared management repositories and DTO mappers
- Canonical ownership of project game listing under `game/management`

## Rebuild Rule

- Use backup and legacy code only to verify expected behavior and UI outcomes for the management flow.
- Do not copy, move, adapt, or incrementally rewrite legacy management code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define management domain model for project-scoped game listing.
- [ ] Define application query contract for `list-project-games`.
- [ ] Create backend repository port for management catalog reads.
- [ ] Implement backend repository adapter for project-scoped game listing.
- [ ] Implement backend use case for `list-project-games`.
- [ ] Map backend use case result to GraphQL DTOs in transport layer only.
- [ ] Expose GraphQL query for `list-project-games` through a `presentation/game/management` resolver.
- [ ] Create frontend repository port for management catalog reads.
- [ ] Implement frontend GraphQL adapter for `list-project-games`.
- [ ] Implement frontend `game/management` use case for catalog loading and dashboard enrichment.
- [ ] Connect dashboard and management entry screens to the `game/management` use case without direct transport access.
- [ ] Rebuild the backup-inspired management entry shell for game selection cards, visible metadata, and primary actions with the active shared UI components.
- [ ] Ensure quiz and prediction management entry uses this shared listing instead of redefining project-scoped list use cases.
- [ ] Remove workspace/dashboard-owned aliases, pass-through use cases, and duplicate GraphQL names for project game listing.

## Acceptance Criteria

- [ ] Project-scoped game listing is the single management entry point for game selection.
- [ ] `game/management` is the only application owner of project game listing; `workspace` and `dashboard` only compose or consume it.
- [ ] GraphQL output is mapped from transport-neutral application contracts.
- [ ] Quiz and prediction management depend on shared listing, not duplicate project queries.
- [ ] Dashboard and management entry preserve the backup-inspired game-selection hierarchy and action affordances without reusing legacy screen structure.
- [ ] Only code required by the shared management listing flow ships, with no speculative abstractions or avoidable duplicate loading.

## Test Targets

- [ ] Backend unit tests for `list-project-games`.
- [ ] Backend GraphQL integration tests for the catalog query.
- [ ] Frontend adapter tests for catalog loading.
- [ ] Frontend dashboard tests prove the screen consumes `loadProjectGames` from the shared management slice rather than a dashboard-owned listing use case.
- [ ] Frontend screen tests cover loading, empty, and populated management-entry states using the rebuilt backup-inspired layout.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and duplicate listing logic displaced by the shared management foundation.
- [ ] Consolidate translations and add missing keys for management catalog flows.
- [ ] Ensure no duplicated management data requests were introduced.
- [ ] Ensure presentation components created for this milestone live in the correct screen or shared component location.
- [ ] Frontend facade or screen tests for management landing data load.
