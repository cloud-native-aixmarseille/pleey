# ADR 0028: Replace custom identity with Better Auth cookie sessions

- Status: Superseded by [ADR 0029](./0029-bound-anonymous-identity-lifetime.md)
- Proposed date: 2026-11-22
- Accepted date: 2026-11-22

## Context

Phase 2 replaces Pleey's custom account JWTs, refresh tokens, guest credentials and reset tokens. GraphQL, media and Socket.IO must authorize one database-backed identity, while registered and anonymous users retain one durable participant model.

## Decision Drivers

- One browser cookie session across account, media and realtime transport
- Native anonymous and account recovery flows
- Transactional party membership and controller authority
- Migration of existing IDs and explicit inactive-state preservation
- Complete removal of bearer and guest credential verification

## Considered Options

### Option 1: Keep and extend the custom JWT implementation

Rejected. It would retain two credential systems and cannot provide Better Auth's native anonymous plugin and account lifecycle ordering.

### Option 2: Better Auth with a Prisma PostgreSQL adapter

Accepted. Better Auth owns credentials and sessions. Pleey owns participant, transfer and party authorization records.

## Decision

Use Better Auth 1.7.27 with the Prisma 7 adapter and native anonymous, email/password and session APIs. Mount it at `/api/auth/*`, use a Secure HttpOnly host-only `Path=/` Lax cookie, and disable cookie session caching.

Better Auth owns `User`, `Session`, `Account` and `Verification`. Pleey keeps stable application IDs and introduces `PartyParticipant`, `UserParticipationClaim`, `IdentityTransfer` and controller generations. GraphQL, media and Socket.IO resolve identity only from the validated Better Auth session.

The server identity adapter is the sole transport-independent session boundary. Legacy JWT, refresh-token, guest credentials and reset-token verifiers are removed in the migration release. ADR 0029 defines the bounded lifetime of temporary anonymous identities.

## Consequences

### Positive

- Registered and anonymous users share cookie sessions and participant authorization
- Session revocation is immediately enforceable at mutation boundaries
- Native reset and anonymous linking use tested library flows
- Party membership and controller state become durable database invariants

### Negative

- Existing refresh and guest credentials require a planned cutover
- The GraphQL auth implementation and frontend token storage require replacement
- Account linking and migration need durable worker/recovery states

### Follow-Up

- Preserve the existing application folders (`application/backend`, `application/frontend`, `application/contracts`)
- Add real HTTP, database, browser and release evidence for AUTH-01 through AUTH-18
