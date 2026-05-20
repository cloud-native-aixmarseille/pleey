---
name: "Pleey Frontend Accessibility Rules"
description: "Use when working on Pleey frontend UI, screens, forms, navigation, or other accessibility-sensitive files under application/frontend."
applyTo: "application/frontend/**/*.{ts,tsx,js,jsx,mjs,cjs}"
---

# Pleey frontend accessibility rules

Use `docs/technical/development/index.md` and `docs/technical/development/frontend.md` for the broader frontend standards. This file only captures accessibility rules that are easy to miss during implementation.

- Treat WCAG 2.1 AA compliance as mandatory because UI accessibility is an explicit repository standard.
- Keep visible labels, helper text, and `aria-*` copy in i18n keys because accessibility text is still user-facing content.
- Prefer semantic headings, buttons, links, navigation landmarks, and form controls before ARIA fallbacks because native semantics are more robust across assistive technologies.
- Connect helper text and validation messaging with `aria-describedby`, and mark invalid controls with `aria-invalid`, because screen readers need explicit field relationships.
- Expose validation errors with accessible alert semantics when shared form patterns expect them because tests and assistive technology rely on that contract.
- Hide decorative or duplicate content with `aria-hidden` because repeated announcements add noise without adding meaning.
- Keep interactive components keyboard-operable, preserve visible focus behavior, and expose expanded or menu state when applicable because pointer-only interactions are regressions.
- In frontend tests, assert roles, accessible names, and field relationships using existing testing-library patterns and shared helpers because those checks catch regressions cheaply.

Preferred pattern:

```tsx
<input aria-describedby={describedBy} aria-invalid={invalid} />
```
