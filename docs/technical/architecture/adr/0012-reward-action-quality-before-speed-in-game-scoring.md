# ADR 0012: Reward correct answers before speed in game scoring

- Status: Proposed
- Proposed date: 2026-09-09
- Accepted date: N/A

## Context

The current [choice-submission scoring policy](../../../../application/backend/src/application/game/types/shared/services/choice-submission-party-action-policy.ts) awards zero points for a wrong answer. For a correct answer on a timed stage with positive points, it awards `max(1, ceil(stagePoints * remainingTime / totalTime))`, with remaining time capped at the stage duration. For example, a correct answer on a 1000-point stage earns 1000 points with 100% of the time remaining, 500 with 50%, and 10 with 1%. Correctness already determines whether points are earned; speed determines almost the entire amount earned for a correct answer.

Our hypothesis is that this large difference encourages players to rush instead of taking time to find a correct answer. The calculation above is observable in the code; this ADR provides no measurements of its effect on player behavior. That hypothesis needs playtesting.

Reviewers reported seeing `-2 places` after answering correctly. The current [standings component](../../../../application/frontend/src/presentation/game/party/shared/screens/components/party-standings-list.tsx) compares positions derived from current and previous scores. Losing places after a correct answer can be valid when other players earn more points and overtake that player. The report alone does not establish a calculation error: we need to verify the compared snapshots and distinguish points earned from places gained or lost.

## Decision Drivers

- award most stage points for a correct answer, with a smaller bonus for speed
- make correct and wrong answers explicit for the existing quiz and prediction game types
- distinguish the number of points earned on a stage from changes in leaderboard position
- retain the rank-change indicator with verifiable calculations
- keep scoring and ranking deterministic for the same inputs

## Considered Options

### Option 1: Keep the current scoring

Continue scaling the points for a correct answer by remaining time, with a minimum of one point on a stage with positive points. Wrong answers earn zero.

This keeps the full spread of scores based on speed, including very small rewards for correct answers submitted near the deadline.

### Option 2: Award base points for a correct answer plus a bounded speed bonus

Split stage points into an approximately 80% base for a correct answer and a 20% maximum speed bonus, rounded to whole points. Wrong answers earn zero.

This guarantees a substantial reward for each correct answer while keeping speed relevant among players who answer correctly.

### Option 3: Remove speed from scoring entirely

Award all stage points for a correct answer and zero for a wrong answer, regardless of submission timing within the allowed window.

This makes the rule simpler, but players with the same correct answers receive the same score, so speed no longer distinguishes them.

## Decision

Choose option 2 for the existing quiz and prediction game types, and retain the rank-change indicator alongside explicit points earned on the stage.

A correct answer receives the base points plus a bounded speed bonus. A wrong answer receives zero points, regardless of speed. This proposal uses binary correctness; partial credit and additional game types require their own correctness rules before adopting this formula.

### Correct and Wrong Answers

The current submission contract accepts one `actionId`. Its selected option's `isCorrect` flag determines whether the answer is correct for both quiz and prediction stages.

The [selectable-option rules](../../../../application/backend/src/domain/game/types/shared/services/selectable-option-policy.ts) allow multiple-choice content to have several options marked correct. Players still submit one option: selecting any marked-correct option is a correct answer and receives the same base points. Selecting an unmarked option is a wrong answer. For example, if A and C are marked correct, choosing A or C is correct, while choosing B is wrong. True/false content has exactly one correct option.

Selecting a set of options in one submission is outside the current contract. This ADR does not introduce that behavior or partial credit for selecting some of a set of correct options.

## Calculation Model

For an accepted answer on a timed stage with positive integer `stagePoints`:

```text
speedBonusCap = round(stagePoints * 0.20)
correctAnswerPoints = stagePoints - speedBonusCap
speedRatio = clamp(remainingTime / totalTime, 0, 1)

score = isCorrect ? correctAnswerPoints + round(speedBonusCap * speedRatio) : 0
```

- `isCorrect` is the selected option's correctness, as defined above.
- `remainingTime` is the time left when the server evaluates the submission; `totalTime` is the stage time limit in the same unit.
- `round` rounds to the nearest integer, with halves rounded up; `clamp` bounds a value to the given interval.
- Stage availability and the deadline are checked before awarding points. An expired stage rejects submissions; the formula's lower bound does not authorize late answers.
- Untimed stages award all stage points for a correct answer and zero for a wrong answer. Non-positive stage points award zero, as in the current policy.
- The rule awards points and never deducts them. No accepted answer means no points earned for that stage.

### Examples

For a 1000-point timed stage, `speedBonusCap = 200` and `correctAnswerPoints = 800`:

| Stage points | Answer  | Remaining time | Base points | Speed bonus | Score    |
| ------------ | ------- | -------------- | ----------- | ----------- | -------- |
| 1000         | correct | 100%           | 800         | 200         | 1000     |
| 1000         | correct | 50%            | 800         | 100         | 900      |
| 1000         | correct | 1%             | 800         | 2           | 802      |
| 1000         | wrong   | 50%            | 0           | 0           | 0        |
| 1000         | either  | 0% (expired)   | N/A         | N/A         | rejected |

At 50% remaining, a correct answer earns `800 + round(200 * 0.5) = 900` points. As remaining time approaches zero before the deadline, its score approaches the 800-point base. A correct answer submitted immediately can earn at most 200 points more than a correct answer submitted just before the deadline on this stage.

## Scoreboard Presentation

Each row shows the player's rank and cumulative score, the points earned on the completed stage (for example, `+900 pts this stage`), and a separate rank-change indicator (for example, `-2 places`). All labels use translations, including plural forms.

The calculations compare the standings immediately before the stage with the finalized standings after all its accepted answers have been scored:

```text
pointsEarned = currentTotalScore - previousTotalScore
placesGained = previousRank - currentRank
```

- Points earned are non-negative under this scoring model. A wrong or missing answer earns `0 pts`; a negative rank change does not mean points were deducted.
- Keep `+N places`, `-N places`, and an unchanged-position label. A positive `placesGained` means moving toward first place; a negative value means moving away from first place.
- Rank is the displayed row position after sorting by descending cumulative score. Use the same tie order for both snapshots: username, followed by stable player identity when usernames match. Equal scores therefore have a deterministic display order.
- Preserve each snapshot's complete ranking and match players by stable identity. Rebuilding previous ranks using only the current roster can change history when players join or leave.
- Compare snapshots from the same party and consecutive stage boundaries. Keep the previous snapshot fixed during the results display; animation frames, rerenders, and reconnects must not replace it with current scores.
- If the previous snapshot is unavailable, omit deltas rather than inventing a zero baseline. If a complete previous snapshot exists but has no entry for a newly joined player, show `New` and omit a numeric rank delta. Show stage points for that player only when the stage award or an actual starting score is available.

### Correct Answer with a Loss of Places

All three players answer a 1000-point stage correctly:

| Player | Previous score | Stage points earned | Current score | Previous rank | Current rank | Places gained |
| ------ | -------------- | ------------------- | ------------- | ------------- | ------------ | ------------- |
| A      | 1200           | 900                 | 2100          | 1             | 3            | -2            |
| B      | 1150           | 1000                | 2150          | 2             | 1            | +1            |
| C      | 1125           | 1000                | 2125          | 3             | 2            | +1            |

A earns 900 points for a correct answer, but B and C earn enough to overtake A. Displaying both `+900 pts this stage` and `-2 places` accurately explains the result. A rank change that disagrees with the two ranked snapshots is a calculation defect to fix.

## Consequences

### Positive

- every accepted correct answer on a stage with positive points earns a substantial base reward
- speed still distinguishes correct answers within a bounded range
- stage points and rank changes explain different aspects of the same result

### Negative

- scores for correct answers are closer together, reducing the advantage of faster correct answers and potentially increasing ties after rounding
- the 80/20 split is a proposed product choice; no playtest evidence is provided here to establish that it is the best balance
- showing points and rank changes together adds information to each row and requires care to keep mobile standings readable

### Follow-Up

- update the shared scoring policy and test correct and wrong answers, the timer boundary, untimed stages, rounding, and multiple-choice content with several correct options
- preserve complete stage-boundary snapshots and verify rank deltas for overtakes, ties, duplicate usernames, joins, departures, and reconnects
- add the worked `+900 pts` / `-2 places` case as regression coverage for the standings
- update scoreboard labels and player-facing scoring explanations in both supported languages
- playtest the 80/20 balance and the readability of points and rank-change labels
