# ADR 0012: Support multi-select quiz questions

- Status: Accepted
- Proposed date: 2026-09-29
- Accepted date: 2026-09-29

## Context

Quiz questions can have multiple correct answers, but the live runtime accepts only one selected action and awards full points for any correct option. Players need to select a set of answers and submit that set once they are ready, while existing single-answer quiz questions and prediction stages keep their current interaction.

## Decision Drivers

- Let players answer questions that have multiple correct options.
- Award partial credit based on both correct and incorrect selections.
- Preserve current single-choice behavior for other game types and single-answer questions.
- Validate submitted action sets against the active stage on the backend.

## Considered Options

### Option 1: Enable multi-select on every quiz question

This would change the interaction for questions with only one correct answer and require an extra submit step in those rounds.

### Option 2: Enable multi-select only when a quiz question has multiple correct options

The stage advertises whether it supports multiple selections. The player can toggle options and submit the complete set; single-answer stages retain their immediate single-choice submission.

## Decision

Enable multi-select only for quiz stages containing more than one correct option. Carry selected action IDs through the existing submission flow and persisted player progress. Reject empty, duplicate, or out-of-stage selections. For multi-select scoring, subtract the number of incorrectly selected options from the number of correctly selected options, clamp the result to zero, divide by the number of correct options, and apply the existing time-based multiplier to the resulting fraction of stage points. Preserve the existing single-choice scoring formula for single-answer stages and prediction stages.

## Consequences

### Positive

- Players can submit all answers for multi-answer questions in one action.
- Missing correct options and selecting incorrect options reduce the awarded points.
- Existing one-answer and prediction rounds keep their current interaction.

### Negative

- Runtime contexts and persisted player progress must represent sets of selected actions.
- Older persisted single-action progress must continue to be interpreted as a one-item set.

### Follow-Up

- Add focused tests for selection validation, partial scoring, persistence compatibility, and the player submission flow.
