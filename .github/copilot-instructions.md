# Copilot Instructions - Pleey

Read the workspace technical docs before generating or editing code because they define the architecture and conventions enforced in CI:

- `docs/technical/architecture/index.md`
- `docs/technical/architecture/backend.md`
- `docs/technical/architecture/frontend.md`
- `docs/technical/development/index.md`
- `docs/technical/development/backend.md`
- `docs/technical/development/frontend.md`

Apply these workspace-wide rules on every task:

- Preserve Clean Architecture boundaries because Biome and repository checks fail boundary leaks.
- Follow existing local patterns instead of inventing parallel abstractions because duplicated conventions make generated code drift from the repository.
- Use Vitest and arrange-act-assert for tests because the repository tooling, helpers, and examples assume that stack.
- Route all user-facing text through i18n and update both locales when behavior changes because untranslated UI text is a repository invariant.
- Throw or propagate domain error codes from domain and application layers, then translate them only at transport or UI boundaries so framework details stay out of core logic.
- Never commit `console.*` in frontend code because frontend runtime diagnostics belong in tests, UI feedback, or telemetry.
- Never read `process.env` in backend runtime code outside `application/backend/src/app/config/` because runtime configuration must enter the app through DI.

Use the scoped instruction files in `.github/instructions/` for framework, accessibility, testing, and workflow-specific rules so the always-on file stays short.
