# ADR 0025: Share business error translations

- Status: Accepted
- Proposed date: 2026-11-19
- Accepted date: 2026-11-19

## Context

ADR 0022 keeps translation catalogs application-local and shares only
machine-readable business codes. That boundary remains useful for screen copy,
accessibility labels, transport diagnostics and application-specific wording.

Backend and frontend now consume the same quiz and prediction error codes from
`@pleey/contracts/errors`. The backend still owns both the code-to-key mapping and
the English/French message text for these public business failures. Without a
shared source, a new shared error code can exist while one runtime lacks or
misnames its translation. Keeping two generated descriptions would also repeat
the same public error semantics in backend JSON and frontend TypeScript.

## Decision Drivers

- Public business error codes already have shared, framework-neutral ownership.
- Backend and frontend must present the same meaning for a given public error.
- Screen-specific copy, localization infrastructure and private diagnostics must
  remain application-owned.
- Both runtimes require explicit locale coverage and generated or importable
  resources without framework dependencies.

## Considered Options

### Option 1: Keep all translation text local

Preserve the existing backend and frontend catalogs independently. The runtime
owners remain simple, but shared error contracts have no authoritative localized
meaning and duplicate code-to-key mappings can drift.

### Option 2: Share every translation catalog

Move all backend and frontend messages into one package. This would conflate API
messages, UI labels, accessibility text and email copy, and would couple
framework-specific resource composition to the shared package.

### Option 3: Share only public business error translations

Share locale text and keys for errors already published by `@pleey/contracts/errors`.
Keep all screen copy, local errors, email bodies and framework composition in
their applications. Generate the backend JSON namespaces from the shared source
and merge the same resources into the frontend catalog.

## Decision

Choose option 3.

`@pleey/contracts/i18n` owns the English and French messages and translation keys for
shared public business errors. The backend generates its selected `src/i18n`
namespaces from this source; the frontend imports and merges the source resources.
No display text unrelated to an exported shared error code may enter the package.

The initial scope is quiz and prediction errors exported by
`@pleey/contracts/errors`. Other shared domains can add resources only after their
machine-readable public error code is shared and has a documented consumer in
each application.

## Consequences

### Positive

- A shared public error has one translation key and one localized meaning.
- Backend and frontend resource shape drift is checked from one source.
- UI labels, accessibility copy and email content remain feature-local.
- Locale additions require explicit shared-resource coverage before use.

### Negative

- Backend translation files for shared namespaces become generated output.
- Shared package changes can affect both API responses and frontend resource
  composition.
- Generated output and the source resource must be checked together in CI.

### Follow-Up

- Add further locales only when both applications support and validate them.
- Evaluate other domains only after their public error codes are shared.
- Update the source, generated backend files and frontend consumers in one change.
