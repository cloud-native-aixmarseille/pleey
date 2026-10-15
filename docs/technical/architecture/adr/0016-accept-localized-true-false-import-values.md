# ADR 0016: Accept localized true/false import values

- Status: Proposed
- Proposed date: 2026-10-15
- Accepted date: N/A

## Context

Quiz templates translate true/false answer labels, but the shared importer only recognizes English labels. A French Markdown, JSON, or plain text template therefore fails to import. CSV also needs to recognize translated correct-answer values and infer the question type from translated options.

## Decision Drivers

- Import every language supported by the templates, independently of the current UI language.
- Preserve answer correctness when options are reordered or languages are mixed.
- Keep canonical stored true/false options and existing CSV answer aliases.

## Considered Options

### Option 1: Export English labels in every template

Avoids the mismatch but prevents authors from using translated labels.

### Option 2: Normalize supported translations in the shared importer

Accept localized input labels and normalize them before existing quiz and prediction validation.

## Decision

Use option 2. A shared injected parser recognizes English and French true/false labels, covering all currently supported template languages. Both general import normalization and CSV interpretation use it. Input recognition trims whitespace and ignores case; mixed-language pairs are allowed. Recognized labels normalize to the existing `True`/`False` option order, preserving correctness. Explicit multiple-choice questions keep their original labels.

Keep accepted input aliases independent of request language and UI translation infrastructure. Adding a template language requires extending the accepted aliases and verifying its generated templates against the importer. These aliases describe the file contract, not display copy.

A cross-application contract test under `scripts/`, run with the dedicated backend `test:import-templates` command, exercises the real frontend templates for every locale and format through the backend quiz mapper. It requires a full checkout; the regular backend tests retain their existing app-isolated execution in CI.

## Consequences

### Positive

- Translated templates and manually authored files can be imported.
- All four import formats share true/false interpretation.
- Runtime application layers remain independent of presentation translations.

### Negative

- New template translations must also be registered as accepted input aliases.
- Running the template contract test requires both applications' dependencies.

### Follow-Up

- When adding a template language, register its labels and run the template contract test.
