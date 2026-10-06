# ADR 0012: Manage themes as curated token themes with scoped selection

- Status: Proposed
- Proposed date: 2026-10-06
- Accepted date: N/A

## Context

[ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) established an internal design system on top of Mantine, with theme tokens as the primary styling contract, shared UI primitives in `presentation/shared/ui/`, and a `UiPort`/`MantineUiAdapter` boundary that keeps Mantine out of presentation code.

The frontend already ships multiple product-curated themes (`cyber-arcade`, `solar-grid`) defined as seeds in `presentation/shared/ui/foundation/`. Each seed resolves into:

- design tokens per color scheme (`createUiThemeTokens`)
- runtime CSS custom properties (`createUiThemeCssVariables`) applied to the provider wrapper and `document.documentElement`
- Mantine theme overrides per color scheme (`createMantineUiTheme`)

Theme selection today is in-memory only. `MantineUiAdapter` seeds `activeThemeId` from `DEFAULT_UI_THEME_ID` (`cyber-arcade`) and exposes `setActiveTheme`/`setActiveColorScheme` through `PresentationUiThemeState`, but nothing persists the choice or scopes it to an organization, project, or party. There is no backend representation of a theme and no management surface.

The product goal in #91 is to change the theme for specific events — for example a branded look for a given party or a recurring project — rather than a single global look. Two directions were raised on the issue:

- provide opinionated, product-curated themes and let an administrator pick one, or
- let administrators drop CSS and assets into a folder and select a theme by folder name.

The second direction is constrained by how the frontend is built: component styles are compiled by Vite, presentation code may not import Mantine directly, and the only runtime-adjustable styling surface is the token layer, which is already emitted as CSS custom properties at runtime. Injecting arbitrary administrator-authored CSS and assets would bypass the design-system boundary, cannot be rebuilt on the fly, and introduces a CSS-injection and asset-hosting attack surface.

## Decision Drivers

- change the active theme for a specific event without rebuilding or redeploying the app
- preserve the [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) design-system boundary: tokens remain the styling contract and Mantine stays behind `UiPort`
- keep the selection model proportional to the current feature set and consistent with existing workspace ownership
- avoid runtime injection of arbitrary CSS or assets and the security risk it carries
- keep color scheme (light/dark) a viewer preference, distinct from event branding
- keep theming accessible (contrast, reduced motion) and localized where theme metadata is user-facing

## Considered Options

### Option 1: Keep in-memory, product-only theme switching

Leave theme selection as transient client state with no persistence or scope. This is the current behavior. It cannot express a per-event theme, resets on reload, and leaves #91 unsolved.

### Option 2: Administrator-authored CSS and asset folders

Let administrators add CSS/asset folders and select one by name. This matches the folder-based idea on the issue, but conflicts with the design-system boundary and the compiled-asset pipeline: built CSS cannot be regenerated at runtime, arbitrary CSS escapes the token contract, and hosting untrusted CSS and assets is a CSS-injection and content-security risk.

### Option 3: Curated token themes with a scoped, persisted selection

Treat a theme as a curated token seed identified by a stable `themeId`. Persist the selected `themeId` at workspace scope and resolve the active theme the same way settings already resolve under [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md): explicit per-party choice, then project default, then organization default, then the built-in default (`cyber-arcade`). The frontend keeps rendering from resolved tokens and runtime CSS variables; only the selected id crosses the transport boundary.

### Option 4: Full administrator theme builder

Build an interface for administrators to define new themes by editing token values (colors, radii, motion, typography, asset URLs) stored as data, producing a constrained custom theme resolved through the same token pipeline. This is powerful but a larger surface; it is deferred until curated selection ships and demand is proven. It does not require arbitrary CSS because tokens already drive runtime CSS variables.

## Decision

Adopt Option 3 now and keep Option 4 as the sanctioned extension path.

- A theme is a curated token seed exposed through the existing `uiThemes` registry and addressed by a stable `UiThemeId`.
- The selectable theme set is the product-curated list; administrators choose among these ids, they do not upload CSS or assets.
- A selected `themeId` is persisted and resolved at workspace scope using the [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md) precedence: per-party override, then project default, then organization default, then the built-in default. The resolved id initializes `MantineUiAdapter` (`initialThemeId`) so a party renders with its event theme.
- Color scheme (light/dark) stays a separate viewer-local preference and is not forced by the event theme.
- Rendering stays on the token to CSS-variable to Mantine pipeline. No administrator-authored CSS or assets are injected at runtime.
- Any future customization is expressed as data-driven token overrides resolved through the same pipeline (Option 4), never as arbitrary CSS.

## Consequences

### Positive

- an event can carry its own curated look, persisted and resolved like other party-owned defaults
- the design-system boundary and build pipeline stay intact; only a small id crosses transport
- no runtime CSS or asset injection, so the CSS-injection and asset-hosting risk is avoided
- color scheme remains a viewer choice, independent of branding

### Negative

- administrators are limited to curated themes until a token-override builder exists
- expressing a brand-new look still requires adding a curated seed in code and shipping it
- persisting and resolving a `themeId` adds schema, GraphQL, and management surface at organization, project, and party scope

### Follow-Up

- add a nullable theme selection to organization, project, and party persistence and GraphQL, mirroring `defaultPartySettings`
- resolve the effective `themeId` on party creation and feed it to the frontend provider via `initialThemeId`
- add a theme picker to workspace and party management, listing `availableThemes` from the UI port and keeping metadata localized
- keep new theme seeds inside `presentation/shared/ui/foundation/` with per-color-scheme tokens and accessible contrast
- if customization is pursued, specify a token-override schema and its validation in a superseding ADR before implementation

## References

Reviewed 2026-10-06:

- [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md): tokens are the styling contract and Mantine stays behind the design system.
- [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md): party-owned defaults precedence reused for theme resolution.
- `application/frontend/src/presentation/shared/ui/foundation/ui-theme-definition.ts`, `ui-theme-contract.ts`, `ui-theme-tokens.ts`: curated seeds, tokens, and runtime CSS variables.
- `application/frontend/src/infrastructure/ui/mantine-ui.adapter.tsx`, `application/frontend/src/application/shared/ports/ui.port.tsx`: `initialThemeId`, theme state, and the `UiPort` boundary.
