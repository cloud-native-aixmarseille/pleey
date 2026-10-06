# ADR 0012: Manage themes as data-driven token themes with an administrator builder

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

The product goal in #91 is to change the theme for specific events — for example a branded look for a given party or a recurring project — rather than a single global look. This is a long-term feature: the intent is to let workspace administrators self-serve event branding, not only pick from a short product-curated list. Two directions were raised on the issue:

- provide opinionated, product-curated themes and let an administrator pick one, or
- let administrators drop CSS and assets into a folder and select a theme by folder name.

The folder-of-CSS direction is constrained by how the frontend is built: component styles are compiled by Vite, presentation code may not import Mantine directly, and the only runtime-adjustable styling surface is the token layer, which is already emitted as CSS custom properties at runtime. Injecting arbitrary administrator-authored CSS and assets would bypass the design-system boundary, cannot be rebuilt on the fly, and introduces a CSS-injection and asset-hosting attack surface. The same runtime token layer, however, already proves that a theme can change without a rebuild when it is expressed as data rather than CSS.

## Decision Drivers

- change the active theme for a specific event without rebuilding or redeploying the app
- let workspace administrators author their own branding over time, not only choose from a fixed list
- preserve the [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) design-system boundary: tokens remain the styling contract and Mantine stays behind `UiPort`
- keep the model consistent with existing workspace ownership and settings resolution
- avoid runtime injection of arbitrary CSS or assets and the security risk it carries
- keep color scheme (light/dark) a viewer preference, distinct from event branding
- keep theming accessible (contrast, reduced motion) and localized where theme metadata is user-facing

## Considered Options

### Option 1: Keep in-memory, product-only theme switching

Leave theme selection as transient client state with no persistence or scope. This is the current behavior. It cannot express a per-event theme, resets on reload, and leaves #91 unsolved.

### Option 2: Administrator-authored CSS and asset folders

Let administrators add CSS/asset folders and select one by name. This matches the folder-based idea on the issue, but conflicts with the design-system boundary and the compiled-asset pipeline: built CSS cannot be regenerated at runtime, arbitrary CSS escapes the token contract, and hosting untrusted CSS and assets is a CSS-injection and content-security risk.

### Option 3: Curated token themes with a scoped, persisted selection

Treat a theme as a curated token seed identified by a stable `themeId`. Persist the selected `themeId` at workspace scope and resolve the active theme using the [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md) precedence. The frontend keeps rendering from resolved tokens; only the selected id crosses the transport boundary. This solves per-event selection but still requires shipping code to introduce any new look, so it does not meet the long-term self-service goal on its own.

### Option 4: Data-driven token themes with an administrator builder

Let administrators author new themes as **data**: a validated partial override applied over a curated base seed, edited through a guided builder, persisted as a structured document, and resolved through the existing token pipeline. Administrators never write CSS; they set typed token values (colors, radii, motion, typography choices, asset references). This meets the long-term goal while staying inside the design-system boundary, and it subsumes Option 3's scoped selection as its base layer.

## Decision

Adopt **Option 4** as the long-term target architecture, built on the scoped-selection base layer described in Option 3 and delivered in increments. This is a direction-setting ADR for a long-term feature; each increment is implemented only after the preceding one ships.

### Target architecture

- A theme is a data document `{ baseThemeId, schemaVersion, name, overrides }` where `overrides` is a validated **partial** of the existing `UiThemeSeed` (per color scheme where applicable): color scales, semantic colors, radii, motion durations, typography family selections, and asset references.
- Resolution deep-merges `overrides` onto the referenced base seed, so every token always has a safe default and both color schemes stay fully defined. The merged seed flows through the unchanged `createUiThemeTokens` → `createUiThemeCssVariables` → Mantine pipeline. No new rendering path is introduced.
- A theme (curated id or custom document) is persisted and scoped using the [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md) precedence: per-party override, then project default, then organization default, then the built-in default (`cyber-arcade`). The resolved theme initializes `MantineUiAdapter` so a party renders with its event branding.
- Color scheme (light/dark) stays a separate viewer-local preference and is never forced by the event theme.

### Architecture principles

- **Tokens are the only styling contract.** The builder edits token values, never CSS, HTML, or JS. [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) holds; Mantine stays behind `UiPort`.
- **Clean Architecture boundaries** ([ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md)): the theme is a domain concept with ports; persistence is an infrastructure adapter; transport is GraphQL; the builder UI is presentation and must reach the engine only through `UiPort`.
- **Constrained schema, not free-form input.** Each value is validated against its token kind: colors must be valid CSS color syntax with functions, `url()`, and declaration-breaking characters rejected; radii/spacing are number + allowlisted unit; motion values are bounded durations; font families come from an approved/bundled allowlist; asset references are app-hosted upload ids or https URLs on an allowlist. This prevents CSS-variable injection from escaping a single declaration.
- **Security by construction**: no remote CSS, CSP preserved, assets flow through the existing upload/media path with content-type checks, and authoring/selection is authorized per workspace scope.
- **Accessibility is enforced at authoring time** (aligned with the frontend accessibility instructions): WCAG AA contrast on paired text/surface tokens, distinguishable focus-ring and semantic tokens, and bounded motion that respects reduced-motion.
- **Versioned and forward-compatible**: `schemaVersion` lets stored documents migrate as the token contract evolves; unknown keys are dropped and missing keys fall back to the base seed.

### Libraries and tools

Grounded in the current stack; any new dependency is vetted against the GitHub Advisory Database before adoption, per repository practice.

- **Rendering (existing, unchanged):** the token resolver, `createUiThemeCssVariables`, Mantine `createTheme`/`MantineProvider`, and the `UiPort`/`MantineUiAdapter` boundary.
- **Color scale generation (candidate addition):** `@mantine/colors-generator` to derive the ten-shade `UiThemeColorScale` from a single brand color, with Mantine color utilities for luminance/contrast checks; lets an administrator pick one base color instead of ten.
- **Builder form:** `@tanstack/react-form` through the existing `FormPort`, with a live preview rendering the shared UI primitives inside a scoped provider fed by the draft tokens.
- **Validation:** backend `class-validator` on the GraphQL input plus `zod` (already a backend dependency) for the structured override document; the frontend defensively normalizes the document, mirroring the shared-normalizer approach in [ADR 0011](./0011-standardize-list-query-pagination.md).
- **Persistence:** Prisma (`@prisma/client`) stores the theme document and its scope relations, consistent with how `defaultPartySettings` is modeled on organization, project, and party.
- **Transport:** GraphQL code-first (`@nestjs/graphql`) per [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md), exposing a nullable theme selection and the custom-theme document.
- **Assets:** the existing upload/media pipeline (GraphQL upload + media serving) holds logos and backgrounds; token asset references point at those app-hosted ids, not arbitrary remote files.
- **i18n & DI:** existing i18next for user-facing theme metadata and Inversify to register the builder use-cases and adapters.

### Delivery increments

1. **Scoped selection of curated themes** (the Option 3 base layer): persist and resolve a `themeId` at organization, project, and party scope; add a management picker listing `availableThemes` from `UiPort`. Establishes persistence, scoping, and transport.
2. **Token-override builder**: author a validated partial override over a base seed, with live preview and enforced contrast; persist and resolve it through the same pipeline.
3. **Managed brand assets**: logos and backgrounds via the existing upload pipeline, referenced by validated token URLs.

## Consequences

### Positive

- administrators can self-serve event branding over time without shipping code
- the design-system boundary and build pipeline stay intact; only data crosses transport
- no runtime CSS or asset injection, so the CSS-injection and asset-hosting risk is avoided
- custom themes always resolve over a safe base seed and reuse the existing render path
- color scheme remains a viewer choice, independent of branding

### Negative

- the full builder is a substantial surface: a validated override schema, builder UI, persistence, transport, authorization, and migrations
- authored tokens must be continuously guarded for contrast and injection safety, which constrains how free the builder can feel
- custom themes add versioned data that must migrate as the token contract evolves

### Follow-Up

- deliver increment 1 first: add a nullable theme selection to organization, project, and party persistence and GraphQL, resolve it on party creation, and feed `MantineUiAdapter`
- specify the versioned token-override schema, its backend validation, and the frontend normalizer before building increment 2
- define the asset allowlist and upload constraints before increment 3
- add regression tests for resolution precedence, schema validation/rejection, contrast enforcement, and migration; keep base seeds in `presentation/shared/ui/foundation/`

## References

Reviewed 2026-10-06:

- [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md): layer boundaries for the theme domain, persistence, transport, and builder UI.
- [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md): tokens are the styling contract and Mantine stays behind the design system.
- [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md): GraphQL as the transport for theme selection and documents.
- [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md): party-owned defaults precedence reused for theme resolution.
- [ADR 0011](./0011-standardize-list-query-pagination.md): shared defensive-normalizer pattern reused for validating theme documents.
- `application/frontend/src/presentation/shared/ui/foundation/ui-theme-definition.ts`, `ui-theme-contract.ts`, `ui-theme-tokens.ts`: curated seeds, the `UiThemeSeed` shape, tokens, and runtime CSS variables.
- `application/frontend/src/infrastructure/ui/mantine-ui.adapter.tsx`, `application/frontend/src/application/shared/ports/ui.port.tsx`: `initialThemeId`, theme state, and the `UiPort` boundary.
