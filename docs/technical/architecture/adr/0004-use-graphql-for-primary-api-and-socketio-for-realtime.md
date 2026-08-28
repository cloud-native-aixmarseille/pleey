# ADR 0004: Use GraphQL for the primary API and Socket.IO for realtime

- Status: Accepted
- Proposed date: 2026-04-11
- Accepted date: 2026-04-11

## Context

Pleey needs two different interaction styles:

- structured application data access for management, identity, catalog, and standard product flows
- low-latency bidirectional communication for live party gameplay

The current system already uses GraphQL as the primary API shape and Socket.IO for party realtime.

## Decision Drivers

- typed and evolvable application API design
- efficient frontend data access for management surfaces
- low-latency bidirectional gameplay messaging
- support for command acknowledgements and reconnect behavior
- clear separation between CRUD-style and gameplay-style interactions

## Considered Options

### Option 1: Use REST plus raw WebSocket patterns

Keep a traditional HTTP API and introduce custom realtime protocols separately.

### Option 2: Use GraphQL for primary application access and Socket.IO for realtime gameplay

Use GraphQL for the main application API and a dedicated realtime transport for gameplay sessions.

### Option 3: Force all client-server interactions through GraphQL only

Use GraphQL queries, mutations, and subscriptions as the only transport model.

## Decision

Choose option 2.

Use GraphQL as the primary application API and Socket.IO as the default realtime transport for party gameplay.

The baseline responsibilities are:

- GraphQL for management, identity-adjacent application access, and typed document-based frontend integrations
- HTTP only where a secondary transport is the better fit for specific endpoints
- Socket.IO for active party observation, commands, acknowledgements, and reconnect-sensitive realtime behavior

## Consequences

### Positive

- each interaction style uses a transport suited to its runtime needs
- frontend data fetching stays typed and structured through GraphQL
- realtime gameplay retains a dedicated low-latency path

### Negative

- the platform operates more than one transport model
- frontend and backend teams must understand both GraphQL and Socket.IO paths
- authentication and observability must cover multiple protocols

### Follow-Up

- keep transport responsibilities explicit in docs and ADRs
- record any shift toward or away from the split model through future ADRs
