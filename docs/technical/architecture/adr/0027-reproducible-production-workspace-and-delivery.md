# ADR 0027: Reproducible production workspace and delivery

- Status: Accepted
- Proposed date: 2026-11-20
- Accepted date: 2026-11-20

## Context

Pleey currently builds and validates separate npm applications with package-local lockfiles and development-oriented Compose defaults. Production delivery does not expose one workspace-level contract for locked installation, deterministic verification, immutable release promotion, migration rehearsal or backup restore.

Phase 01 must preserve the current GraphQL, Socket.IO and custom identity product while making source layout and deployment mechanically reproducible.

## Decision Drivers

- One reproducible workspace from clean checkout
- Production OCI artifacts and immutable release identity
- Real migration, upgrade and restore rehearsal
- Preserved existing authentication and game semantics
- No dependency on later identity, HTTP or realtime replacement phases

## Considered Options

### Option 1: Keep separate npm packages

Preserve the current layout and add scripts around it. This would retain inconsistent locks and make cross-package build, guard and release contracts harder to enforce.

### Option 2: Adopt a pnpm workspace

Move the existing API, web and shared contract packages to application/backend, application/frontend and application/contracts. Use one lockfile and root commands, while keeping GraphQL and Socket.IO unchanged.

## Decision

Adopt Option 2 for Phase 01. Add an explicit production Compose profile and Helm delivery path around the existing API and web roles. Introduce release manifests and compatibility bootstrap without changing active product contracts.

## Consequences

### Positive

- Clean-checkout installation and verification become deterministic.
- API, web and shared package builds have one dependency graph.
- Production promotion uses complete candidate digests rather than mutable selections.
- Existing migrations and data remain compatible with prior images.

### Negative

- All build, CI, Docker and documentation paths require coordinated mechanical updates.
- A workspace migration temporarily adds tooling and artifact orchestration.

### Follow-Up

- Implement and validate the pnpm workspace in this PR.
- Preserve this release's GraphQL, Socket.IO and custom identity contracts.
