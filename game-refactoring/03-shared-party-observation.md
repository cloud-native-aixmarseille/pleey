# Milestone 3 - Shared Party Observation

## Scope

- `observe-party`
- Canonical shared realtime projection
- Socket subscription and event mapping base

## Rebuild Rule

- Use backup and legacy code only to verify expected realtime behavior, state transitions, and UI outcomes.
- Do not copy, move, adapt, or incrementally rewrite legacy observation or socket code into the new implementation.
- Rebuild this milestone from scratch inside the target architecture and enforce naming, boundaries, performance rules, and repository best practices.

## Implementation Checklist

- [ ] Define shared party state projection model.
- [ ] Define socket subscription contract for observing a party.
- [ ] Implement backend application service for shared party projection publishing.
- [ ] Implement backend socket gateway subscription handshake.
- [ ] Implement transport mappers for shared party events.
- [ ] Implement frontend socket adapter for observing party updates.
- [ ] Implement frontend shared provider or facade for party state hydration.
- [ ] Expose the projection fields needed by backup-inspired lobby, shared status, stage header, and leaderboard shells without screen-local refetches.
- [ ] Ensure lobby, stage, and status rendering can rely on the shared stream.
- [ ] Prevent GraphQL polling from being used as fallback for live party state.
- [ ] Rebuild the party lobby UI with the visual signatures lifted from the backup lobby (`backup/game-refactor-m0/.../shared/screens/lobby/`): live pulse status bar with game-type/status badges, hero invite/share panel with PIN character tiles + QR + plain join URL (host only), and player roster grid with prominent participant count and accent-glow current-player tile.
- [ ] Implement those signatures from scratch using the current shared UI primitives and design tokens (`presentation/shared/ui/*`, `ui-theme`, `ui-recipes`, `ui-typography`) — no imports from the backup tree, no direct Mantine imports in screen-local code.

## Acceptance Criteria

- [ ] Host and player clients can subscribe to one canonical party stream.
- [ ] Shared party state is sufficient for lobby, stage, and status rendering.
- [ ] Shared party state is sufficient to drive rebuilt backup-inspired shared runtime chrome without per-screen transport logic.
- [ ] No live GraphQL polling is required for party runtime state.
- [ ] The observation slice ships only necessary runtime projection code and avoids redundant subscriptions, duplicate fetches, and unused adapters.
- [ ] The party lobby visually matches the backup lobby on its signature moments: live pulse status bar, hero share panel with PIN character tiles, and roster grid with metric count and accent-glow current-player tile, all built from the active shared UI library.

## Test Targets

- [ ] Backend socket gateway tests for subscription and delivery.
- [ ] Backend application tests for shared projection generation.
- [ ] Frontend socket adapter tests for subscription lifecycle.
- [ ] Frontend provider tests for shared state updates.
- [ ] Frontend contract tests prove lobby or shared-runtime shell components can render from the canonical observation stream alone.

## Post-Milestone Clean Rules

- [ ] Review impacted backend and frontend code against `/home/emilien/Documents/dev-projects/cloud-native-aixmarseille/pleey/clean.md`.
- [ ] Remove dead code and obsolete observation pathways replaced by the shared party stream.
- [ ] Consolidate translations for party state, connection, and observation errors.
- [ ] Ensure no duplicate live data requests were introduced alongside realtime observation.
- [ ] Refactor any new shared providers or components so they respect presentation scope rules.
