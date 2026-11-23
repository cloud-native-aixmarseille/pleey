# ADR 0029: Bound anonymous identity lifetime

- Status: Accepted
- Proposed date: 2026-11-22
- Accepted date: 2026-11-22
- Supersedes: [ADR 0028](./0028-replace-custom-identity-with-better-auth.md)

## Context

Anonymous participation is the dominant journey. Better Auth creates temporary authentication
users and native sessions, while Pleey retains party history independently. A permanent foreign key
from history to those temporary authentication rows would create ghost-user growth.

## Decision

Keep Better Auth as the authentication authority, but treat anonymous `User` rows as temporary
operational identities.

- `PartyParticipant.userId` is nullable and history is keyed by `participantId`.
- Participants are detached before an eligible anonymous `User` is deleted.
- Transfer and retirement records never retain a foreign key to the source auth user.
- A source is eligible only after all native sessions expire and every finite transfer hold ends.
- Retirement is a persisted, resumable transaction-driven workflow and rejects late native session,
  refresh and linking writes.
- A Nest scheduler starts a bounded sweep at startup and every 15 minutes.
- Historical-only legacy guests migrate directly to detached participants without creating auth
  users.

Anonymous creation happens only after explicit play intent. Frontend bootstrap coordinates tabs with
a same-origin Web Lock and never replaces a failed existing identity with a new guest.

## Consequences

### Positive

- Historical party data no longer retains anonymous authentication rows.
- Stable participant IDs preserve scores and results after identity deletion.
- Cleanup remains safe across restarts, replicas and interrupted work.
- Transfer ownership effects remain bounded by explicit deadlines.

### Negative

- Participant read models must distinguish bound users from detached historical participants.
- Cleanup requires indexed operational work and real database concurrency evidence.
- PostgreSQL growth still follows retained party history and deletion churn.

## Follow-Up

- Keep ADR 0028 as the record that selected Better Auth.
- Implement and verify AUTH-19 through AUTH-26 in Phase 02.
