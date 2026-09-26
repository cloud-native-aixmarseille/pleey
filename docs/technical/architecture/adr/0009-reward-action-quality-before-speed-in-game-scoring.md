# ADR 0009: Reward action quality before speed in game scoring

- Status: Proposed
- Proposed date: 2026-09-09
- Accepted date: N/A

## Context

Pleey's current choice-submission scoring gives more points to correct answers when they are submitted earlier. The remaining time linearly scales the stage score, so speed has a larger impact than the quality of the action itself.

That creates a gameplay incentive to rush for points instead of making the best decision, and it affects every game type that reuses the shared choice-submission scoring policy.

The live standings currently add a rank-change badge (`Up`, `Down`, `Hold`, `New`) based on previous-rank snapshots. That shorthand is easy to animate, but it reads strangely and does not accurately describe score changes.

## Decision Drivers

- good actions should be rewarded more than fast actions
- score outcomes must stay easy to understand for players and hosts
- scoreboard labels should describe actual score changes, not approximate position movement
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

## Calculation Model

The shared choice-submission policy will split a stage's points into a larger quality bucket and a smaller speed bucket.

```text
speedBonusCap = round(stagePoints * 0.20)
qualityPoints = stagePoints - speedBonusCap
speedRatio = clamp(remainingTime / totalTime, 0, 1)

score = isCorrect ? qualityPoints + round(speedBonusCap * speedRatio) : 0
```

For the current quiz and prediction game types:

- `isCorrect` is `true` for the correct answer and `false` for an incorrect answer
- `remainingTime` is the time left when the submission is accepted
- `totalTime` is the stage time limit

### Examples

| Stage points | Answer | Remaining time | Score |
| --- | --- | --- | --- |
| 1000 | correct | 100% | 1000 |
| 1000 | correct | 50% | 900 |
| 1000 | correct | 0% | 800 |
| 1000 | incorrect | any | 0 |

## Scoreboard Presentation

The scoreboard should stay score-first:

- sort players by total score
- keep the cumulative score visible on each row
- use rank as the ordering label, not as a proxy for score gain
- avoid the current `+/- place(s)` badge because it describes rank movement instead of the points earned

If we keep a movement indicator, it should show the exact stage points gained for the current result, for example `+800 pts this stage`, rather than `Up 1` / `Down 1`.

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
- the scoreboard presentation will need to be updated so its labels stay truthful and easy to read

### Follow-Up

- update the shared choice-submission scoring policy to use a quality-first formula
- define how each game type expresses action quality
- add tests for strong-but-slow actions and weak-but-fast actions
- replace the current rank-delta badge in live standings with score-based feedback or hide it
- review player-facing score explanations after the scoring change
