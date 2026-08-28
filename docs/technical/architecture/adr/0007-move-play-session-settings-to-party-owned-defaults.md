# ADR 0007: Move play session settings to party-owned defaults

- Status: Proposed
- Proposed date: 2026-09-02
- Accepted date: N/A

## Context

Pleey stores the effective settings for each created party on the party itself, and backend runtime resolution already works from concrete organization and project defaults before falling back to built-in system defaults.

The recent preset design adds extra entities, mutations, forms, and resolution branches for named reusable templates at organization and project scope. That model introduces additional persistence, GraphQL, and UI complexity for a settings surface that currently contains only three shared boolean toggles:

- `allowOptionChangeAfterVoting`
- `randomizeStageOrder`
- `randomizeOptionOrder`

At the same time, parties already keep their own settings snapshot, so the product does not need presets to preserve stable runtime behavior. The remaining product need is simpler: allow organizations and projects to define default party settings, let party creation inherit those defaults, and let a party keep its own resolved snapshot.

## Decision Drivers

- party launch must stay fast and understandable for hosts
- party runtime must keep a stable snapshot decoupled from later edits
- workspace management should avoid unnecessary concepts and CRUD surfaces
- the settings model should stay proportional to the small current feature set
- backend and frontend maintenance cost should stay low

## Considered Options

### Option 1: Keep organization and project presets

Retain named reusable presets plus preset-selection flows.

This offers more flexibility, but it adds concepts, tables, GraphQL mutations, and UI administration that are disproportionate to the current product need.

### Option 2: Use only concrete defaults on organization and project

Store one `defaultPartySettings` object on the organization and one on the project, then resolve the created party snapshot from those concrete defaults and optional per-party overrides.

This keeps the runtime behavior intact while removing a large amount of management and transport complexity.

## Decision

Adopt option 2.

Pleey will not model reusable party-settings presets. Instead:

- `Organization` owns an optional `defaultPartySettings` value
- `Project` owns an optional `defaultPartySettings` value
- `Party` owns the effective settings snapshot for the launched session
- party creation resolves settings by precedence: explicit per-party override, then project default, then organization default, then built-in system default

Projects will no longer store a `defaultPartySettingsPresetId`, and neither organizations nor projects will expose preset collections or preset-management APIs.

## Consequences

### Positive

- the host flow stays simple because users choose or edit settings directly
- parties still keep stable, auditable settings snapshots
- organization and project management lose a full layer of preset CRUD and selection logic
- the persistence and GraphQL model become smaller and easier to maintain

### Negative

- administrators cannot save multiple named settings templates per organization or project
- switching between several recurring configurations requires editing defaults or applying per-party overrides manually

### Follow-Up

- remove preset entities, relations, and foreign keys from Prisma
- remove preset-specific GraphQL types, queries, and mutations
- simplify backend and frontend domain models, repositories, and management flows to use only `defaultPartySettings`
- keep party creation and runtime reading from the party-owned settings snapshot
