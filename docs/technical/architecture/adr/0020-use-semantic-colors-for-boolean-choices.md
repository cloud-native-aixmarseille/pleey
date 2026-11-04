# ADR 0020: Use semantic colors for boolean choices

- Status: Proposed
- Proposed date: 2026-11-04
- Accepted date: N/A

## Context

[Issue #539](https://github.com/cloud-native-aixmarseille/pleey/issues/539)
requires green for True and red for False. Live answer colors currently depend
on the event theme, and runtime actions carry text without their boolean meaning.

## Decision Drivers

- Consistent colors in the editor, host/player stages, and results
- Independence from translated labels, answer order, and correctness
- Preserve themed colors for multiple-choice questions and predictions

## Considered Options

### Option 1: Infer boolean answers from their labels or the number of choices

This confuses ordinary two-option questions with boolean questions and depends
on the language of saved text.

### Option 2: Carry an optional boolean value on each action

Derive the value from the true/false question type and canonical answer position,
and retain it through stage and result projections.

## Decision

Choose option 2. Boolean choices use a shared green/red palette in the existing
design system. Their colors identify True/False, independently of which answer
is correct. Other choices keep the theme-derived palette. Editor controls and
result labels continue to communicate correctness explicitly.

The optional `booleanValue` field is absent for non-boolean choices. It carries
no correctness information and requires no persistence or GraphQL schema change.

## Consequences

### Positive

- Translations and event themes cannot swap the meaning of the colors.
- The same identity survives selection and result display.
- Existing labels and accessible selection state supplement color.

### Negative

- The realtime action contract gains one optional field.
- Boolean choice colors intentionally do not follow the event brand palette.

### Follow-Up

- Validate catalog mapping, runtime projection, socket decoding, editor selection,
  and rendered answer colors, including False as the correct answer.
