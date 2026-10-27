# ADR 0017: Evaluate a shared frontend/backend library

- Status: Proposed
- Proposed date: 2026-10-27
- Accepted date: N/A

## Context

The backend (`quiz-backend`) and frontend (`pleey-frontend`) are two independently
versioned and independently deployed npm packages under `application/`, with no
root workspace tying them together. Each one follows Clean Architecture with
strict, Biome-enforced layer boundaries (ADR 0002), and each owns its own
`domain/` and i18n stack.

Some concepts already appear on both sides. A few domain-neutral value objects
are copied verbatim — for example `domain/shared/value-objects/action-permission.ts`
and `paginated-result.ts` are byte-identical in both applications — while other
"shared" concepts have already drifted apart (`pagination-limits.ts` and
`pagination-query.ts` differ between the two apps, and each app's
`domain/shared/errors` set reflects concerns specific to that side). Translations
also live in two different runtimes: the backend stores locale JSON under
`src/i18n/{en,fr}` for API-facing text and enforces locale parity in a spec, while
the frontend composes co-located TypeScript translation modules through
`TranslationResourceComposer`.

This raises a recurring request: should the project introduce a common shared
library between frontend and backend (for example for domain primitives and
translations) to remove duplication? This ADR evaluates whether that is relevant
and recommended now, in terms of architecture, coding, and security best
practices. Related precedent already exists: ADR 0014 deliberately rejected a
shared executable rules package for authorization, and ADR 0016 kept runtime
application layers independent of presentation translations while validating
cross-application behavior with a dedicated contract test.

## Decision Drivers

- Preserve Clean Architecture boundaries and per-application ownership of domain.
- Keep the backend the single authority for authorization and validation; never
  let a shared package become a substitute for server-side enforcement.
- Avoid coupling two independently deployed services through a shared build and
  release unit unless the duplication cost clearly justifies it.
- Keep presentation copy (UI translations) out of backend runtime concerns.
- Prefer validating cross-application agreement with contract tests over sharing
  source when only a contract needs to match.

## Considered Options

### Option 1: Introduce a general-purpose shared library now

Create a third package (for example `application/shared`) exporting domain
primitives, error codes, and merged translations, and consume it from both apps.

Removes verbatim duplication, but adds a shared build/release unit across two
independently deployed services, creates a new import surface that can erode the
per-app Clean Architecture boundaries, risks pulling backend-only or
frontend-only concerns into a common module, and tempts teams to treat shared
code as authoritative for security decisions. It also forces the two divergent
i18n runtimes (backend JSON, frontend composed TS) into one shape, coupling UI
copy to backend runtime.

### Option 2: Keep per-app domain and use the existing cross-app contracts

Keep each application's `domain/` and i18n independent. Treat the GraphQL schema
and its generated types as the real cross-application wire contract (ADR 0004,
0014), keep the backend authoritative for authorization and validation, and
guard the handful of agreements that must stay in sync with targeted
cross-application contract/parity tests (as ADR 0016 does for template imports).
Accept small, intentional duplication of domain-neutral primitives.

### Option 3: Defer and revisit behind concrete triggers

Record that a shared library is not justified yet, and define the signals that
would warrant revisiting it in a dedicated ADR.

## Decision

Adopt option 2, with option 3's triggers recorded as follow-up. A general-purpose
shared library between frontend and backend is **not recommended at this time**.

Rationale:

- **Architecture.** The two applications are independently deployed and already
  isolate `domain/` per app under Biome-enforced boundaries. A shared code
  package would introduce a cross-service coupling and a new import surface that
  works against those boundaries. The existing cross-application contract is the
  GraphQL schema plus generated transport types; sharing a wire contract does not
  require either app to import the other's source (consistent with ADR 0014).
- **Coding.** Current duplication is small and mostly domain-neutral. Some copies
  are identical, but others (pagination value objects, error sets) have
  legitimately diverged by app concern, which shows a single shared module would
  force false unification. Where agreement genuinely matters, a contract or
  parity test — the pattern ADR 0016 established — keeps both sides honest
  without shared source.
- **Security.** The backend must remain the sole authority for authorization and
  validation. A shared executable rules package was already rejected for exactly
  this reason in ADR 0014: a browser cannot hold authoritative facts, and shared
  rules do not remove server-side checks. Sharing should never become an implicit
  trust boundary.
- **Translations.** Backend locale JSON serves API-facing text and parity
  checks, while frontend translations are presentation copy composed in TS.
  Merging them would pull UI copy into backend runtime, which ADR 0016 explicitly
  avoids by keeping runtime application layers independent of presentation
  translations.

Each application therefore continues to own its domain and translations. Any
cross-application agreement is expressed as a contract (GraphQL types, or a
dedicated contract/parity test), not as shared runtime source.

## Consequences

### Positive

- Clean Architecture boundaries and independent deployability are preserved.
- The backend stays the single authority for authorization and validation.
- UI translations stay out of backend runtime concerns.
- No new shared build/release unit or coupling between the two services.

### Negative

- A small amount of domain-neutral duplication remains and can drift.
- Keeping genuinely-shared contracts aligned relies on discipline plus targeted
  contract/parity tests rather than a compiler-enforced single source.

### Follow-Up

- When copied domain-neutral primitives must not diverge, cover them with a
  cross-application contract test (as ADR 0016 does for template imports) rather
  than sharing source.
- Revisit this decision in a new ADR if concrete triggers appear: substantial and
  growing identical duplication that must stay byte-for-byte aligned, a move to a
  monorepo workspace with shared tooling, or a requirement for authorization or
  validation rules that are provably identical and safe to run on both sides.
