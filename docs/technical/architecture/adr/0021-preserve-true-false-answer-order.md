# ADR 0021: Preserve true/false answer order

- Status: Proposed
- Proposed date: 2026-11-04
- Accepted date: N/A

## Context

[Issue #544](https://github.com/cloud-native-aixmarseille/pleey/issues/544) requires
true/false quiz answers to stay in `True`, `False` order. The shared party stage
catalog currently randomizes all actions when `randomizeOptionOrder` is enabled.
The quiz provider reads answers by position but does not pass ordering constraints
to the shared catalog.

## Decision Drivers

- Preserve true/false answer order across all catalog lookups and navigation.
- Keep multiple-choice and prediction randomization available.
- Keep quiz question types inside the quiz provider.

## Considered Options

### Option 1: Detect true/false labels in the shared catalog

This couples ordering to answer text and can affect multiple-choice or prediction
content with the same labels.

### Option 2: Expose an action-order constraint on catalog entries

The quiz provider marks true/false entries, and the shared catalog respects that
constraint without depending on quiz types.

## Decision

Use option 2. Add optional `preserveActionOrder` metadata to catalog entries.
The quiz provider sets it from the stored question type for individual and list
lookups. When true, the shared catalog preserves the provider's position-ordered
answers, regardless of the party's `randomizeOptionOrder` setting. Other entries
remain eligible for randomization. Stage randomization stays independent.

## Consequences

### Positive

- Host and player runtime reads share the same fixed true/false answer order.
- No database migration, public API change, or additional setting is needed.

### Negative

- Providers must supply the metadata for content with a fixed action order.

### Follow-Up

- Cover provider mapping and every catalog lookup with regression tests.
- Explain the exception in the party settings help text and development guide.
