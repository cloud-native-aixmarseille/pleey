# ADR 0003: Use an internal design system on top of Mantine

- Status: Accepted
- Proposed date: 2026-01-28
- Accepted date: 2026-01-28

## Context

Pleey needs a coherent visual language across dashboard, party, gameplay, forms, overlays, navigation, and future product surfaces.

The frontend already contains:

- a shared UI library under `presentation/shared/ui/`
- theme tokens and CSS variable generation
- multiple named themes such as `cyber-arcade` and `solar-grid`
- a `UiPort` abstraction and a Mantine-based adapter
- a rule that presentation code must not import Mantine directly

The real design-system choice is therefore larger than selecting a component library.

## Decision Drivers

- consistent UI behavior and visual language across the app
- ability to theme the product without rewriting screens
- isolation of third-party UI framework details from presentation code
- accessibility and reusable interaction patterns
- controlled long-term evolution of the frontend UI layer

## Considered Options

### Option 1: Use Mantine directly throughout presentation code

Let screens and components import Mantine primitives directly and style locally.

### Option 2: Build and maintain an internal design system backed by Mantine

Expose shared UI primitives, tokens, theme recipes, and a framework adapter while keeping Mantine behind an abstraction boundary.

### Option 3: Build a fully custom UI stack without a component framework

Own every component and interaction primitive directly.

## Decision

Choose option 2.

Use an internal design system as the frontend UI foundation, with Mantine as the underlying component engine rather than the public presentation API.

The baseline design-system decision includes:

- theme tokens as the primary styling contract
- shared UI primitives in `presentation/shared/ui/`
- multiple supported themes through centralized theme definitions
- `UiPort` plus `MantineUiAdapter` for framework isolation
- no direct Mantine imports in presentation code

## Consequences

### Positive

- the product keeps a distinctive and reusable visual language
- theme changes remain centralized instead of screen-local
- the UI framework can be swapped or constrained more easily in the future
- presentation code becomes more consistent and easier to review

### Negative

- building wrapper components adds maintenance cost
- some framework capabilities take longer to expose through the internal layer
- contributors must learn the internal UI primitives instead of using Mantine directly

### Follow-Up

- keep new UI work inside the shared design-system boundaries
- record major visual-system or UI-platform changes through ADRs
