# ADR 0012: Distinguish single- and multi-select quiz questions

- Status: Accepted
- Proposed date: 2026-09-29
- Accepted date: 2026-09-29

## Context

The quiz editor currently labels its standard question type “Multiple choice,” although players can submit only one answer. The type can contain multiple correct options, which the live runtime currently handles inconsistently by accepting one selected action and awarding full points for any correct option. Selection behavior should be explicit in the question type so authors and players know whether one or several answers are expected.

## Decision Drivers

- Let players answer questions that have multiple correct options.
- Award partial credit based on both correct and incorrect selections.
- Make single-select and multi-select behavior explicit when authoring a quiz.
- Preserve the existing single-choice behavior for true-or-false questions and prediction stages.
- Validate submitted action sets against the active stage on the backend.

## Considered Options

### Option 1: Infer selection behavior from the number of correct options

The runtime enables multi-select whenever a question has multiple correct options. This avoids adding a question type, but leaves the authoring type ambiguous and makes interaction depend on answer configuration rather than an explicit choice.

### Option 2: Add explicit single-select and multi-select question types

Rename the current “Multiple choice” type to “Single choice” and add a “Multiple select” type. The selected type determines player interaction, independent of how many options are marked correct.

## Decision

Use explicit question types: rename “Multiple choice” to “Single choice,” retaining immediate submission of one answer, and add “Multiple select,” which lets players toggle answers and submit the selected set once. The question type—not the number of correct options—determines selection behavior. Carry selected action IDs through the existing submission flow and persisted player progress. Reject empty, duplicate, or out-of-stage selections. For multi-select scoring, subtract the number of incorrectly selected options from the number of correctly selected options, clamp the result to zero, divide by the number of correct options, and apply the existing time-based multiplier to the resulting fraction of stage points. Keep true-or-false questions and prediction stages single-select.

## Consequences

### Positive

- Authors and players can distinguish questions expecting one answer from those expecting several.
- Players can submit all answers for multi-answer questions in one action.
- Missing correct options and selecting incorrect options reduce the awarded points.
- Single-choice, true-or-false, and prediction rounds keep their current interaction.

### Negative

- Runtime contexts and persisted player progress must represent sets of selected actions.
- Older persisted single-action progress must continue to be interpreted as a one-item set.
- Existing quiz questions need a migration from the old type: questions with multiple correct options become “Multiple select”; other multiple-choice questions become “Single choice.”

### Follow-Up

- Add an explicit quiz question type to domain, persistence, imports, and management UI, with localized “Single choice” and “Multiple select” labels.
- Migrate existing multiple-choice questions according to their correct-option count.
- Add focused tests for selection validation, partial scoring, persistence compatibility, and the player submission flow.
