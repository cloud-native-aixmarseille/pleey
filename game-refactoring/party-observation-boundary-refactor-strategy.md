# Party Observation Boundary Refactor Strategy

## Why This Refactor Is Needed

The current party observation implementation already has separate domain read models for host and player, but the application, infrastructure, and realtime presentation layers still recombine both roles into shared operational surfaces.

That creates three recurring problems:

- Naming is inconsistent: `PartyObservation`, `HostPartyObservation`, `PlayerPartyObservation`, `PartyObservationPublication`, `PartyObserver`, and `SocketPartyObservationService` overlap in responsibility and audience.
- The host/player domain boundary is weakened: role-specific read models are built and dispatched from shared infrastructure and presentation services.
- Transport concerns and projection concerns are mixed: socket broadcasting logic also decides which role-specific observation shape to use.

The result is that multiple components need to understand both host and player observation instead of depending on one clearly owned slice.

## Current antipatterns

### 1. One infrastructure reader builds both role projections

`PrismaPartyObservationReader` currently owns:

- host query loading
- player query loading
- host mapping
- player mapping
- publication assembly

This means the real ownership boundary is not the adapter classes, but a shared reader that knows both role models.

### 2. Player observation is not a first-class application boundary

The application layer exposes a host-only query path through `PartyObservationPort` and `GetPartyObservationUseCase`, but player observation is only available as part of `PartyObservationPublication`.

That asymmetry forces downstream services to branch on role because there is no dedicated player observation contract.

### 3. Realtime presentation owns too many responsibilities

`SocketPartyObservationService` currently:

- manages server attachment
- resolves room sockets
- resolves live player identities
- decides whether a viewer is host or player
- chooses the correct message shape
- emits transport payloads

That is too much policy for one presentation service. Audience resolution, role mapping, and broadcasting should be split.

### 4. Publish use-cases still expose a host-biased API

`PublishPartyObservationUseCase` publishes both host and player payloads but returns `HostPartyObservation`.

That return type leaks an implementation bias: the use-case is a broadcaster, not a host observation query.

## Refactoring Goals

The target design should enforce the following:

1. Host observation and player observation are first-class role-specific read models.
2. Shared code only owns truly shared or factorized cross-role concepts: identifiers, room naming, event names, reusable helpers, and cross-role orchestration DTOs when strictly necessary.
3. Infrastructure adapters are role-specific and do not hide mixed ownership behind a generic reader.
4. Presentation code chooses an audience, but it does not own the role-specific projection logic and transport lifecycle in the same class.
5. Naming makes the responsibility obvious: query/read, mapping/projection, and broadcasting/publication must not blur together.

## Naming Strategy

Use the following vocabulary consistently.

### Observation

`Observation` means a read model returned to a specific role.

- `HostPartyObservation`
- `PlayerPartyObservation`

### Reader

`Reader` means a read-side port or infrastructure adapter that loads one observation model.

- `HostPartyObservationReaderPort`
- `PlayerPartyObservationReaderPort`
- `PrismaHostPartyObservationReader`
- `PrismaPlayerPartyObservationReader`

### Broadcaster

`Broadcaster` means a side-effect port or adapter that emits observation updates.

- `PartyObservationBroadcasterPort`
- `SocketPartyObservationBroadcaster`

### Audience Resolver

`AudienceResolver` means presentation logic that determines whether a socket should receive the host or player message variant.

### Publication

`Publication` should no longer be treated as the primary read-side abstraction.

If both role observations must still be loaded together for one broadcasting flow, keep that bundle as an internal orchestration DTO only. It should not be the dominant public API for the feature.

## Target Slice Ownership

### Domain

Keep domain ownership as it is trending now:

- `domain/game/party/host/**` owns host-only observation types
- `domain/game/party/player/**` owns player-only observation types
- `domain/game/party/shared/**` owns truly shared or factorized party concepts that do not belong exclusively to host or player

No shared domain type should reintroduce a mixed host-and-player observation aggregate.

### Application

Observation queries should move out of `shared` and into the owning role slices.

Target structure:

- `application/game/party/host/ports/host-party-observation-reader.port.ts`
- `application/game/party/host/use-cases/get-host-party-observation-use-case.ts`
- `application/game/party/player/ports/player-party-observation-reader.port.ts`
- `application/game/party/player/use-cases/get-player-party-observation-use-case.ts`
- `application/game/party/shared/**` owns truly shared or factorized party concepts that do not belong exclusively to host or player

Shared application code may still own orchestration that explicitly combines both role observations for a realtime push, and it may also host factorized cross-role services or helpers. That shared code should depend on role-specific ports instead of a shared catch-all reader.

### Infrastructure

Replace the shared `PrismaPartyObservationReader` with explicit role-owned readers:

- `PrismaHostPartyObservationReader`
- `PrismaPlayerPartyObservationReader`

If one transactional coordinator is still needed to fetch both snapshots atomically, keep it private to infrastructure and name it for coordination rather than for generic observation ownership.

For example:

- `PrismaPartyObservationSnapshotCoordinator`

That coordinator should not become the main application-facing port.

### Presentation

Split the current realtime observation flow into smaller, explicit responsibilities:

- `PartyObservationAudienceResolver`
- `HostPartyObservationMessageMapper`
- `PlayerPartyObservationMessageMapper`
- `SocketPartyObservationBroadcaster`

The gateway should remain thin:

- validate input
- delegate join/observe/leave orchestration
- attach the client to the room
- ask the broadcaster to emit the correct payload

It should not accumulate role selection, message mapping, and publication loading policy.

## Proposed Execution Plan

### Phase 1. Normalize naming without changing behavior

Rename the existing contracts to match their real responsibility.

Recommended changes:

- `PartyObservationPort` -> `HostPartyObservationReaderPort`
- `GetPartyObservationUseCase` -> `GetHostPartyObservationUseCase`
- `PartyObserverPort` -> `PartyObservationBroadcasterPort`
- `SocketPartyObservationService` -> `SocketPartyObservationBroadcaster`

This phase keeps runtime behavior stable while making the next boundary split easier to understand.

### Phase 2. Promote player observation to a first-class application slice

Introduce:

- `PlayerPartyObservationReaderPort`
- `GetPlayerPartyObservationUseCase`

At the end of this phase, both host and player observation should be queryable independently from role-owned application boundaries.

### Phase 3. Split infrastructure by role

Move host observation loading and mapping into a host-owned Prisma reader.

Move player observation loading and mapping into a player-owned Prisma reader.

Delete the shared `PrismaPartyObservationReader` once all callers depend on the role-specific readers.

### Phase 4. Refactor realtime presentation around audience-specific mapping

Extract:

- audience resolution
- host message mapping
- player message mapping
- socket broadcasting

At the end of this phase, no single presentation service should need to both build host/player payloads and manage socket fan-out.

### Phase 5. Remove `PartyObservationPublication` from the primary public API

Once the broadcaster depends on explicit host/player readers, reduce `PartyObservationPublication` to an internal orchestration shape or delete it entirely if it is no longer needed.

The preferred end state is:

- query use-cases return one role-specific observation
- broadcaster/orchestrator composes both role observations only for realtime delivery

## Concrete Target State

After the refactor, the main flow should read like this:

1. The gateway receives an observe or party-update event.
2. The gateway delegates to a broadcaster-oriented application service.
3. That service loads host and player observations through separate role-specific readers.
4. Presentation resolves the socket audience.
5. A host mapper builds the host payload when the viewer is the host.
6. A player mapper builds the player payload otherwise.
7. The broadcaster emits the payload.

At no point should one generic observation reader or one mixed mapper own the whole flow.

## Guardrails For The Refactor

The refactor should preserve these rules:

- Do not move transport-only fields into domain observation types.
- Do not reintroduce a shared observation aggregate in the domain layer.
- Shared slices may host factorized cross-role building blocks, but they must not become a dumping ground for mixed role ownership.
- Do not let application or domain code import infrastructure helpers.
- Do not keep thin pass-through adapters if a shared reader still owns the real behavior.
- Do not return `HostPartyObservation` from broadcaster-oriented use-cases.

## Validation Strategy

### Application tests

- add dedicated host observation use-case tests
- add dedicated player observation use-case tests
- keep broadcaster tests focused on orchestration only

### Infrastructure tests

- add focused tests for host Prisma reader mapping
- add focused tests for player Prisma reader mapping
- remove tests that only prove pass-through wrappers around a shared reader

### Presentation tests

- keep gateway tests focused on websocket contract and room lifecycle
- add mapper tests for host payload shape
- add mapper tests for player payload shape
- add broadcaster tests for audience-aware emission

## Expected Outcome

This refactor is successful when:

- host and player observation are clearly separated in application, infrastructure, and presentation
- naming reflects role ownership and technical responsibility consistently
- shared code is reduced to truly shared concepts only
- no service needs to understand both host and player observation unless its job is explicit orchestration
- realtime observation becomes easier to evolve without leaking role-specific concerns across the stack
