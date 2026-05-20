---
name: "Pleey Frontend React Rules"
description: "Use when working on Pleey frontend React, Vite, routing, GraphQL UI, or Vitest files under application/frontend."
applyTo: "application/frontend/**/*.{ts,tsx,js,jsx,mjs,cjs}"
---

# Pleey frontend React rules

Use `docs/technical/architecture/frontend.md` and `docs/technical/development/frontend.md` for the full architecture. This file only captures non-obvious React and presentation-layer rules.

- Keep presentation code on presentation hooks, route factories, facades, and shared presentation UI components because frontend boundary checks forbid direct infrastructure access from screens.
- Do not import Mantine, routing, form, or infrastructure libraries directly in presentation code because those dependencies are intentionally hidden behind repository ports.
- Resolve runtime collaborators through the DI container and `useRuntimeDependency` because manual `new` calls bypass the composition root and make tests harder to wire.
- Keep visible text and accessible labels in i18n keys, and update both `en` and `fr`, because UI copy and accessibility text are shared repository invariants.
- Prefer `useEffectEvent` for effect callbacks that need current values because it avoids fake dependencies and unnecessary re-subscription churn.
- Use `startTransition` or `useDeferredValue` only for non-urgent UI work that benefits from it because unnecessary concurrency primitives add noise.
- Do not add `useMemo` or `useCallback` by default because blanket memoization usually hurts readability more than it helps performance.
- Keep data ownership close to the consuming feature and avoid duplicate requests because split queries for one screen are a common regression source.
- Do not commit `console.*` in frontend code because runtime diagnostics should go through tests, UI feedback, or telemetry.

Preferred pattern:

```tsx
const form = usePresentationForm(...);
const loginUseCase = useRuntimeDependency(...);
```

Avoid importing framework hooks or infrastructure services directly into presentation components.
