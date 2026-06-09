# Frontend Keyboard Controls Specification

Status: Proposed implementation spec

## Objective

Define a single frontend pattern for keyboard controls that improves accessibility and speed without introducing per-screen `keydown` listeners, conflicting shortcuts, or presentation-layer boundary leaks.

## Problem Statement

The current frontend mostly relies on native button behavior and a few ad hoc listeners such as Escape handling in account-menu state. That is acceptable for isolated widgets, but it does not scale to game surfaces where keyboard support must be:

- consistent across host and player flows
- discoverable for assistive technology and keyboard-only users
- safe around text inputs and overlays
- aligned with presentation and DI boundaries

Without a shared strategy, each screen will attach its own listener, duplicate filtering rules, and drift on shortcut semantics.

## Goals

- Keep every interactive flow keyboard-operable with visible focus and semantic controls.
- Provide one global shortcut runtime for cross-app and route-scoped shortcuts.
- Let screens register shortcut intents instead of wiring raw DOM listeners.
- Ignore shortcuts while the user is typing in editable controls unless a shortcut explicitly opts in.
- Make shortcut labels and help copy translatable and testable.
- Preserve Clean Architecture and existing presentation abstractions.

## Non-Goals

- Replacing native widget keyboard behavior provided by semantic buttons, links, menus, tabs, or listboxes.
- Introducing a general command palette in the first slice.
- Binding destructive actions to bare single-key shortcuts.
- Implementing game-specific shortcut maps for every host and player surface in the foundation slice.

## Architectural Constraints

This implementation must respect the repository frontend rules:

- Presentation code stays inside `application/frontend/src/presentation/` and must not import framework packages directly.
- Global wiring belongs in `application/frontend/src/app/bootstrap/` provider factories.
- Visible and assistive copy must use i18n keys in both locales.
- Accessibility behavior must satisfy WCAG 2.1 AA expectations for keyboard access, focus visibility, and dismissible overlays.
- Player-facing surfaces remain mobile-first, so shortcuts must complement touch UI rather than replace it.

## Terms

- Native keyboard behavior: built-in browser behavior from semantic elements such as buttons, links, inputs, and menus.
- Widget keyboard behavior: arrow key or roving focus handling internal to a composite component.
- Shortcut runtime: the single document-level listener that resolves registered shortcut intents.
- Shortcut scope: the currently active context that owns a set of shortcuts, such as a modal, route, or global shell.

## Proposed Design

### 1. Layered keyboard model

Keyboard interactions are handled at three separate layers.

1. Native semantics first.
   Buttons, links, inputs, dialogs, and menus must already work through Tab, Shift+Tab, Enter, and Space where appropriate. The shortcut runtime does not replace these behaviors.
2. Widget-local keyboard behavior.
   Composite widgets such as answer grids, menus, tabs, or listboxes keep their own arrow-key and roving-focus logic inside the component that owns focus.
3. Shared shortcut runtime.
   Global and route-scoped shortcuts are registered centrally and resolved through one provider.

### 2. Shared provider and hooks

Add a shared keyboard module in presentation and wire it through app bootstrap.

Proposed files:

- `application/frontend/src/presentation/shared/keyboard/keyboard-shortcuts-provider.tsx`
- `application/frontend/src/presentation/shared/keyboard/use-keyboard-shortcut.ts`
- `application/frontend/src/presentation/shared/keyboard/use-shortcut-scope.ts`
- `application/frontend/src/presentation/shared/keyboard/keyboard-shortcuts-help-dialog.tsx`
- `application/frontend/src/presentation/shared/keyboard/index.ts`
- `application/frontend/src/app/bootstrap/modules/keyboard/app-keyboard-shortcuts-provider-factory.tsx`

Provider responsibilities:

- attach exactly one `document` `keydown` listener
- store active shortcut registrations
- resolve scope priority
- filter events from editable targets by default
- open and close the shortcuts help dialog
- expose registration and scope APIs through React context

### 3. Provider ordering

Register a new app provider order so the keyboard runtime wraps routed content but remains a shared cross-feature concern.

Proposed addition in `application/frontend/src/app/bootstrap/app-provider-factory.ts`:

```ts
KEYBOARD = 450,
```

Rationale:

- UI and translation providers must already be available for help-dialog rendering.
- Routing should already be available for route-scoped registrations.
- Feature providers such as auth, workspace, and party remain inside the keyboard runtime and can safely register shortcuts.

### 4. Shortcut registration contract

Screens and shared components register intents, not raw listeners.

Proposed TypeScript shape:

```ts
export interface KeyboardShortcutDefinition {
  readonly id: string;
  readonly combo: ShortcutCombo;
  readonly descriptionKey: string;
  readonly scope: string;
  readonly priority?: number;
  readonly disabled?: boolean;
  readonly allowRepeat?: boolean;
  readonly allowInEditable?: boolean;
  readonly preventDefault?: boolean;
  readonly stopPropagation?: boolean;
  readonly ariaKeyShortcuts?: string;
  readonly execute: (event: KeyboardEvent) => void;
}

export interface ShortcutCombo {
  readonly key: string;
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly meta?: boolean;
  readonly shift?: boolean;
}
```

Rules:

- `id` is stable and unique within a scope.
- `descriptionKey` points to i18n copy used by the help dialog.
- `scope` is a string identifier such as `global`, `party-player-lobby`, or `overlay-confirm-leave`.
- `priority` resolves conflicts inside the same active scope.
- `disabled` gates the shortcut without unregistering it.
- `allowInEditable` must remain `false` by default.
- `ariaKeyShortcuts` is optional and should only be attached when a shortcut maps directly to a visible control.

### 5. Scope resolution

The runtime resolves shortcuts using a stack of active scopes.

Priority order:

1. topmost overlay scope
2. active route or screen scope
3. global scope

Conflict rules:

- Only the highest-priority matching scope handles a combo.
- Within the same scope, the highest `priority` wins.
- If priorities tie, the most recently registered shortcut wins. This keeps nested surfaces predictable.

### 6. Event filtering and safety rules

The global listener must return early when any of the following is true:

- `event.defaultPrevented` is already true
- the event target is an `input`, `textarea`, `select`, or `contenteditable` element and the shortcut does not opt into editable targets
- IME composition is active
- the shortcut is repeat-triggered and `allowRepeat` is false

Safety requirements:

- Never bind destructive actions to a bare character key.
- Use confirmation overlays for leave, delete, end-session, or kick-player actions.
- Do not steal focus on shortcut execution unless opening a modal or moving focus into a managed composite widget.
- Escape closes only the topmost dismissible overlay or menu. It must not trigger a domain action directly.

### 7. React integration pattern

Implement registration hooks with React 19 `useEffectEvent` so handlers always use current state without unnecessary unregister-register churn.

Expected usage pattern:

```tsx
useKeyboardShortcut({
  id: "open-shortcuts-help",
  combo: { key: "?" },
  descriptionKey: "shared.keyboard.shortcutsHelp",
  scope: "global",
  execute: openShortcutsHelp,
});
```

Screen hooks such as `usePartyLobbyPlayerSession` should expose domain-safe callbacks like `leaveParty` or `submitAction`, and screen components should register shortcuts against those callbacks rather than inlining business logic inside the listener.

### 8. Discoverability and help UI

Ship a built-in shortcut help dialog in the foundation slice.

Requirements:

- opened by `?` from the global scope
- lists active shortcuts grouped by scope label
- hides disabled shortcuts
- traps focus while open and restores focus on close
- uses translated labels and descriptions
- can be opened from a visible button or menu entry for discoverability on touch devices

Suggested translation namespace:

- `shared.keyboard.helpTitle`
- `shared.keyboard.helpDescription`
- `shared.keyboard.globalGroup`
- `shared.keyboard.close`
- `shared.keyboard.shortcutsHelp`

### 9. Initial shortcut map

The first implementation slice should stay narrow and safe.

Global scope:

- `?` opens shortcut help
- `Escape` closes the topmost keyboard-managed help dialog or overlay

Player gameplay scope:

- `1` to `9` selects the corresponding visible answer option when the answer list is active and focus is not inside an editable field
- Arrow keys move focus between answer options when the answer widget owns focus
- Enter or Space activates the focused answer through the underlying button semantics

Player lobby scope:

- no speed shortcuts in the first slice beyond global help and dismiss behaviors

Host runtime scope:

- defer command shortcuts until the foundation and player gameplay slices are stable

Rationale:

- Player gameplay gains the largest accessibility and speed benefit.
- Player lobby and host runtime actions carry more risk if shortcuts are introduced before confirmation and conflict rules are battle-tested.

## Implementation Plan

### Phase 1: foundation

Deliver the shared runtime, help dialog, provider wiring, and tests.

Files expected to change:

- `application/frontend/src/app/bootstrap/app-provider-factory.ts`
- `application/frontend/src/app/composition/container-modules/` bindings for the new provider factory if needed by the existing bootstrap pattern
- new files under `application/frontend/src/presentation/shared/keyboard/`

Acceptance criteria:

- one document listener exists for the app lifetime
- scope registration and cleanup work through mount and unmount
- editable elements suppress shortcuts by default
- the help dialog can be opened and closed with keyboard only

### Phase 2: player gameplay adoption

Adopt the runtime in the player stage surface where actions are selected.

Acceptance criteria:

- numeric shortcuts trigger the same callback path as pointer selection
- no duplicate submissions occur while an action is pending
- arrow navigation stays inside the answer widget and preserves visible focus
- screen tests cover both pointer and keyboard paths

### Phase 3: overlay and menu migration

Replace ad hoc Escape listeners in shared UI where the new runtime is a better fit.

Candidates:

- account menu state
- future confirmation dialogs managed in presentation
- runtime help or control menus

Acceptance criteria:

- dismiss behavior is consistent across shared overlays
- duplicated `document.addEventListener('keydown', ...)` patterns are removed where appropriate

## Testing Strategy

### Unit tests

- registration, deregistration, and scope precedence
- combo matching including modifier keys
- editable-target suppression
- repeat suppression
- help dialog open-close lifecycle

### Screen tests

- player gameplay numeric selection and focused activation
- overlay dismissal through Escape
- no shortcut execution while typing in an input

### Accessibility assertions

- visible focus remains present after keyboard navigation
- dialog has correct role, label, and focus trap behavior
- controls with direct shortcut bindings expose `aria-keyshortcuts` only where appropriate

## Observability and Failure Modes

Expected failure modes and mitigations:

- Shortcut conflict between nested surfaces: resolved by scope priority and registration order.
- Accidental activation while typing: prevented by editable-target filtering.
- Stale closures after state changes: prevented by `useEffectEvent`-backed registration.
- Drift between shortcut help and actual behavior: prevented by deriving help content from active registrations instead of maintaining a separate static list.

## Open Questions

- Whether the first visible shortcut entry point should be a dedicated header action, an account-menu item, or both.
- Whether host runtime shortcuts should require modifier keys even for non-destructive actions.
- Whether game-specific shortcut descriptions belong in shared translations or in feature-scoped namespaces surfaced through the registry.

## Definition of Done

- Shared keyboard runtime exists and is provider-wired through app bootstrap.
- Keyboard help dialog is implemented and translated in both locales.
- Player gameplay adopts the first scoped shortcuts with unit and screen coverage.
- Existing ad hoc Escape handling is either migrated or explicitly documented as a temporary exception.
- Documentation references this spec from the frontend development index.
