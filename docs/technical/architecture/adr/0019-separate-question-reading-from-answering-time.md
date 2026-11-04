# ADR 0019: Separate question reading from answering time

- Status: Proposed
- Proposed date: 2026-11-04
- Accepted date: N/A

## Context

[Issue 540](https://github.com/cloud-native-aixmarseille/pleey/issues/540) requests a question-only reading period that does not consume answering time or the speed bonus. The existing frontend reveal animation runs after the server has already started the answering timer. Its duration differs between desktop and mobile.

## Decision Drivers

- give every question a configurable reading period without reducing answering time
- keep quiz and prediction, desktop and mobile, on the same server timing contract
- preserve pause/resume, restart, rewind, reconnect, and untimed stages
- reuse party-owned settings and existing runtime persistence

## Considered Options

1. Extend frontend animation delays. This cannot enforce submission timing or keep scoring consistent.
2. Store a server-defined answering start timestamp and remaining reading duration in the existing stage lifecycle. Clients render against that timestamp; the server rejects early submissions.
3. Add a scheduled runtime phase transition and broadcast. This adds timer ownership and recovery work for a transition that can be derived from timestamps.

## Decision

Use option 2. Add `questionReadingTimeSeconds` to party settings, as an integer from 0 to 30 with a default of 3 seconds. It applies to every stage in that launched game and follows existing party override, project default, organization default, and system default precedence. Zero disables the reading period. The 3-second default is a product starting point, not a measured optimum.

The server records the optional lifecycle `reading` value (`endsAtEpochMs` and `remainingDurationMs`) and sets the timed stage deadline to the reading deadline plus the question's answering duration. Untimed stages also wait for the configured reading period, but have no answering deadline. All submissions before that start are rejected, including incorrect and zero-point answers. The scoring formula from [ADR 0017](./0017-reward-action-quality-before-speed-in-game-scoring.md) is unchanged.

Host and player surfaces show the question alone during reading, then mount every answer together without a staggered entrance. The answering countdown stays at its full duration during reading. Reduced-motion settings do not change reading time. A localized reading indicator explains the wait without adding another numeric countdown.

Pausing freezes reading and answering durations separately; resuming rebases both timestamps. Starting, advancing, restarting, or rewinding a stage grants its configured reading period, including when navigating while paused. Reconnects use the persisted timestamps instead of restarting a client animation. Existing persisted settings receive the default; existing runtime snapshots without reading fields retain their running deadline and no additional reading period.

## Consequences

- No background scheduler or database schema change is needed: settings and lifecycle are already JSON values.
- Timing is shared and server-enforced. As with the existing answering countdown, visible timing depends on client clock accuracy and delivery/render latency; this does not introduce per-device render acknowledgements.
- Reading duration is configured per party through the existing launch/default settings rather than adding a second settings model to reusable game content.
- Answers are available in the stage payload but hidden in the normal UI until answering starts. Server-side submission validation remains authoritative.

## Validation

Cover settings validation and persistence, early submissions and full scoring at answering start, timed and untimed stages, pause/resume in both intervals, restart/rewind, hidden answers and keyboard shortcuts, reconnect behavior, and locale parity. Record executed checks with the implementation result.
