---
name: "Pleey Unit Test Rules"
description: "Use when working on Pleey unit or integration Vitest files under application/backend or application/frontend."
applyTo: "application/**/*.{spec,test}.{ts,tsx,js,jsx,mts,cts}"
---

# Pleey unit test rules

Use `docs/technical/development/backend.md`, `docs/technical/development/frontend.md`, and `docs/technical/development/index.md` for the broader testing model. This file only captures high-signal test rules shared across the applications.

- Use Vitest, not Jest, because the repository test runner, setup files, and helpers are built around Vitest.
- Keep tests deterministic and structured as arrange, act, then assert because that keeps failures easy to debug.
- Colocate unit tests with source code unless the repository already uses a dedicated integration location because nearby tests are easier to maintain.
- For backend error assertions, prefer a single `await expect(...).rejects.toThrow(ERROR_CODE)` because running the same logic twice can hide stateful defects.
- Mock exact frontend import paths for auth, organization, and game contexts because route and provider tests depend on path identity.
- Use the existing frontend provider wrappers for screen tests because presentation components rely on UI and DI context.
- Avoid real network, realtime, or database dependencies in unit tests unless the goal is explicitly to exercise an integration boundary because those dependencies make tests slower and flakier.

Preferred assertion:

```ts
await expect(useCase.execute(command)).rejects.toThrow(ERROR_CODE);
```
