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

### Scoped-selection implementation

Increment 1 stores a nullable `defaultThemeId` on organizations and projects, matching their role as inherited defaults alongside `defaultPartySettings`. Workspace create/update inputs use that name and accept curated ids; `null` restores inheritance and an omitted field on update preserves the saved selection. Party creation inputs use `themeIdOverride`, alongside `settingsOverride`; `null` or omission inherits the workspace defaults. Resolved snapshots use `themeId`; the party database column is required, like `settings`. The resolver names inherited inputs `organizationDefaultThemeId` and `projectDefaultThemeId`. Existing management and party-creation permissions authorize these changes.

Party creation resolves and stores a concrete theme snapshot using the precedence above. Workspace changes affect future parties only. The migration backfills legacy parties with the built-in default to preserve their appearance; readers parse the stored id without applying inheritance or a fallback. GraphQL exposes workspace selections and accepts the party override. Party summaries omit theme and settings; realtime host/player observations carry both resolved snapshots. The shared management picker reads `availableThemes` through `UiPort`, and party screens apply the observed theme id through the existing provider without changing the viewer's color scheme. Leaving the party restores the preceding UI theme.

The migration `20261006120000_add_scoped_theme_selection` introduces nullable `theme_id` columns with constraints allowing only curated ids. The authoring migration described below converts this scoped-selection schema directly to workspace defaults and required party documents. Workspace defaults remain nullable for inheritance.

### Authoring and assets implementation

The backend uses a single `ThemeModule`, exporting theme selection and document validation to the game and organization modules. Theme persistence, asset processing, and transport providers remain internal to that module.

Theme identifiers belong to the theme domain: `theme/entities/theme-id.ts` holds the selection types and constants in both applications, and `application/workspace/themes/services/theme-identifier.ts` owns parsing. Shared code contains only the generic identifier parsing infrastructure. The backend `ThemeModule` exports the stateless parser; modules that cannot import it without a cycle register the parser locally for their repository adapters. The frontend workspace container registers it alongside the other theme dependencies.

Theme GraphQL operations call `ListThemesUseCase`, `SaveThemeUseCase`, and `UploadThemeAssetUseCase`. These use cases own authorization and orchestration through repository and image-processing ports, sharing a theme permission service. The public asset controller uses `GetThemeAssetUseCase`. Upload sources remain lazy so authorization completes before file reading or decoding.

`ThemeSelectionService.resolve` is the application entry point for resolving a theme document. It accepts organization/project defaults and an optional override, applies override/project/organization/built-in precedence directly, and resolves the selected curated or organization-owned custom document. This precedence has a single consumer and stays inside the selection service. Party creation calls only that service and never handles the intermediate identifier.

Increments 2 and 3 add an organization-owned theme library. Members may browse and select their organization's themes; owners and managers may create and edit them. Custom ids use `custom:<uuid>`, while curated ids keep their existing values. Every selection is checked against the owning organization. Updates use a revision check to prevent lost edits.

Identifiers belong to selection: workspace defaults and `themeIdOverride` select a theme before party creation. Every concrete selection resolves to a required `ThemeDocument`; curated selections resolve to their base theme with empty overrides, while custom selections resolve to their saved document. Parties store and transmit only `themeDocument`, without a separate `themeId`. Rendering uses the document's `baseThemeId` and overrides, so contradictory id/document pairs cannot occur. Observations carry this immutable document snapshot so later library edits affect future parties only. As with curated seeds, a base seed may evolve with a product release; the snapshot freezes authored overrides, not the frontend implementation of the base seed.

Schema version 1 supports partial color scales, semantic colors for both color schemes, radii, spacing, bounded motion durations, approved system-font stacks, and optional logo/background asset references. Unknown document keys are removed by normalization; unsupported versions and invalid known values are rejected. Authored colors use six-digit hexadecimal notation, lengths use bounded `px` or `rem` values, and motion uses bounded milliseconds. Contrast validation checks affected text/surface pairs, action colors, and focus indicators after resolving inherited values. Curated seeds remain in the frontend UI foundation; a tested baseline of their editable color values supports backend validation.

Each curated validation palette lives in its own `theme/services/<theme-id>-theme-palette.ts` file in both applications. `curated-theme-palettes.ts` only maps curated ids to those definitions, keeping the lookup shared by normalization and the builder while each theme can be maintained separately.

The builder uses `FormPort`, workspace authorization, and `UiPort` for a nested light/dark preview. Preview CSS variables stay within its container. The theme picker loads a paginated organization library. User-authored names are data, while all builder labels and errors are translated.

The frontend theme feature lives in `presentation/theme/`: `components/` owns selectors, the library, authoring fields, branding surfaces, and their tests; `hooks/` owns theme-library state; `i18n/` owns the English and French catalogs under the `theme.*` key prefix. Workspace and party screens compose these feature components. `TranslationResourceComposer` registers the catalogs alongside the other locales, and theme domain error mappings use the same keys.

The shared design system retains token contracts, curated seeds, CSS-variable generation, document-to-UI conversion, and its provider in `presentation/shared/ui/`, as defined by ADR 0003. Feature styling follows the existing sibling `*.styles.ts` convention, including the branding surface. `usePartyTheme` stays with party screens because it applies and restores the observed document for the party lifecycle.

The presentation folder guard permits reusable components directly under `presentation/<feature>/components/`, alongside existing shared and screen-local component directories. Nested workspace components that belong to one screen still live under that screen; screen size limits and styling boundaries continue to apply.

Brand assets reuse GraphQL multipart uploads and database-backed media. PNG, JPEG, and WebP files are limited to 5 MiB and 16 megapixels, decoded and re-encoded with Sharp, and stored as immutable WebP images. SVG, animation, arbitrary URLs, and externally hosted assets are excluded. Asset references are validated against the theme's organization. The application serves them from a dedicated immutable media route with an explicit MIME type and `nosniff`; party participants may load branding without workspace membership. Backgrounds are decorative and content surfaces stay opaque to preserve contrast. Referenced assets are retained for party snapshots.

Sharp is the only new backend image dependency. Its current release is checked against the [maintainer's security advisories](https://github.com/lovell/sharp/security/advisories) before installation; image decoding follows its [documented input limits](https://sharp.pixelplumbing.com/api-constructor/) and [output API](https://sharp.pixelplumbing.com/api-output/).

The migration `20261007100000_add_theme_documents_and_assets` follows `20261006120000_add_scoped_theme_selection` in one transaction. It renames organization and project selections to `default_theme_id`, preserves their values and nullable inheritance, extends their constraints to custom identifiers, and creates organization-owned theme and asset records. It backfills each party with a document for its saved curated selection, using `cyber-arcade` when the legacy id is null, then requires an object document without a database default and removes `parties.theme_id`. Apply this migration before deploying the backend and frontend together because realtime observations now require a document for every party. Existing curated selections and parties retain their behavior. Custom themes are edited from organization management; the organization, project, and party pickers can browse the paginated library. Asset references and the resolved document travel with realtime observations; no library request is needed on a participant device.

### Delivery increments

1. **Scoped selection of curated themes** (the Option 3 base layer): persist workspace `defaultThemeId` selections and resolve a party `themeId`; add a management picker listing `availableThemes` from `UiPort`. Establishes persistence, scoping, and transport.
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

- keep the backend and frontend normalizers and curated validation baselines synchronized when tokens change
- introduce explicit document migrations before accepting a later schema version
- retain assets referenced by party snapshots when adding future library deletion or cleanup workflows
- run database integration coverage against the migrated test database before deployment; keep base seeds in `presentation/shared/ui/foundation/`

## References

Reviewed 2026-10-06:

- [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md): layer boundaries for the theme domain, persistence, transport, and builder UI.
- [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md): tokens are the styling contract and Mantine stays behind the design system.
- [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md): GraphQL as the transport for theme selection and documents.
- [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md): party-owned defaults precedence reused for theme resolution.
- [ADR 0011](./0011-standardize-list-query-pagination.md): shared defensive-normalizer pattern reused for validating theme documents.
- `application/frontend/src/presentation/shared/ui/foundation/ui-theme-definition.ts`, `ui-theme-contract.ts`, `ui-theme-tokens.ts`: curated seeds, the `UiThemeSeed` shape, tokens, and runtime CSS variables.
- `application/frontend/src/infrastructure/ui/mantine-ui.adapter.tsx`, `application/frontend/src/application/shared/ports/ui.port.tsx`: `initialThemeId`, theme state, and the `UiPort` boundary.
