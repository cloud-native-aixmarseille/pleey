# ADR 0009: Reward action quality before speed in game scoring

- Status: Proposed
- Proposed date: 2026-09-09
- Accepted date: N/A

## Context

Pleey's current choice-submission scoring gives more points to correct answers when they are submitted earlier. The remaining time linearly scales the stage score, so speed has a larger impact than the quality of the action itself.

That creates a gameplay incentive to rush for points instead of making the best decision, and it affects every game type that reuses the shared choice-submission scoring policy.

## Decision Drivers

- good actions should be rewarded more than fast actions
- score outcomes must stay easy to understand for players and hosts
- the scoring model must remain deterministic in realtime play
- the solution should work across current and future choice-based game types
- speed should still matter, but only as a secondary factor

## Considered Options

### Option 1: Keep the current time-first scoring

Continue scaling stage points primarily by remaining time.

This preserves the current behavior, but it keeps the wrong incentive: speed matters more than the quality of the action.

### Option 2: Use quality-first scoring with a bounded speed bonus

Give most of the score to the action's quality, then add a smaller capped bonus for speed.

This keeps urgency relevant without letting it dominate the result, and it leaves room for richer quality signals in future game types.

### Option 3: Remove speed from scoring entirely

Score only the action quality and ignore submission timing.

This makes the rules simple, but it removes an important part of the live-game experience and makes close decisions feel less dynamic.

## Decision

Choose option 2.

Pleey will move to a quality-first scoring model for choice-based game play. Action quality will determine the majority of the score, and speed will only contribute a smaller bounded bonus. Speed will remain useful as a secondary differentiator, but it will not outweigh a better action.

## Consequences

### Positive

- good actions become more valuable than simply being fast
- players are less pressured to rush bad choices
- score outcomes better match the intent of the game
- the scoring model can evolve with future game-specific quality signals

### Negative

- the scoring policy and related tests will need to change
- leaderboards will shift compared with the current timing-heavy system
- the exact quality/speed balance will need product review after implementation

### Follow-Up

- update the shared choice-submission scoring policy to use a quality-first formula
- define how each game type expresses action quality
- add tests for strong-but-slow actions and weak-but-fast actions
- review player-facing score explanations after the scoring change
