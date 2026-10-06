# ADR 0012: Manage event themes as data-driven token themes with a preview-led Theme Studio

- Status: Accepted
- Proposed date: 2026-10-06
- Accepted date: 2026-10-11

## Context

[ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) established an internal design system on top of Mantine, with theme tokens as the primary styling contract, shared UI primitives in `presentation/shared/ui/`, and a `UiPort` and `MantineUiAdapter` boundary that keeps Mantine out of presentation code.

The frontend already ships multiple product-curated themes (`cyber-arcade`, `solar-grid`) defined as seeds in `presentation/shared/ui/foundation/`. Each seed resolves into:

- design tokens per color scheme (`createUiThemeTokens`)
- runtime CSS custom properties (`createUiThemeCssVariables`) applied to the provider wrapper and `document.documentElement`
- Mantine theme overrides per color scheme (`createMantineUiTheme`)

Theme selection originally existed only as in-memory UI state. `MantineUiAdapter` seeded `activeThemeId` from `DEFAULT_UI_THEME_ID` (`cyber-arcade`) and exposed `setActiveTheme` and `setActiveColorScheme` through `PresentationUiThemeState`, but nothing persisted the choice or scoped it to an organization, project, or party. That left no backend representation of a theme and no management surface for administrators.

The product goal in #91 is to change the theme for specific events, for example a branded look for a given party or a recurring project, rather than a single global look. The long-term intent is to let workspace administrators self-serve event branding, not only pick from a short product-curated list. Two directions were raised on the issue:

- provide opinionated, product-curated themes and let an administrator pick one
- let administrators drop CSS and assets into a folder and select a theme by folder name

The folder-of-CSS direction is constrained by how the frontend is built: component styles are compiled by Vite, presentation code may not import Mantine directly, and the only runtime-adjustable styling surface is the token layer, which is already emitted as CSS custom properties at runtime. Injecting arbitrary administrator-authored CSS and assets would bypass the design-system boundary, cannot be rebuilt on the fly, and introduces a CSS-injection and asset-hosting attack surface. The same runtime token layer, however, already proves that a theme can change without a rebuild when it is expressed as data rather than CSS.

Once theme persistence and authoring were established, a second problem became clear: a schema-first editor made the right data editable but forced organizers to think in implementation terms. Color scales, semantic tokens, spacing, and motion fields sat above small previews, so users had to imagine the event identity instead of judging it in context. The feature needed one coherent decision covering both the data model and the management experience.

## Decision Drivers

- change the active theme for a specific event without rebuilding or redeploying the app
- let workspace administrators author their own branding over time, not only choose from a fixed list
- preserve the [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) design-system boundary: tokens remain the styling contract and Mantine stays behind `UiPort`
- keep the model consistent with existing workspace ownership and settings resolution
- avoid runtime injection of arbitrary CSS or assets and the security risk it carries
- keep color scheme (light and dark) a viewer preference, distinct from event branding
- keep theming accessible (contrast, reduced motion) and localized where theme metadata is user-facing
- let a first-time organizer create a recognizable branded event without learning design-token internals
- make every meaningful edit visible immediately in a realistic player-facing preview
- support the full authoring workflow on desktop and mobile, including recovery, revision conflicts, and explicit save state

## Considered Options

### Option 1: Keep in-memory, product-only theme switching

Leave theme selection as transient client state with no persistence or scope. This is the original behavior. It cannot express a per-event theme, resets on reload, and leaves #91 unsolved.

### Option 2: Administrator-authored CSS and asset folders

Let administrators add CSS and asset folders and select one by name. This matches the folder-based idea on the issue, but conflicts with the design-system boundary and the compiled-asset pipeline: built CSS cannot be regenerated at runtime, arbitrary CSS escapes the token contract, and hosting untrusted CSS and assets is a CSS-injection and content-security risk.

### Option 3: Curated token themes with a scoped, persisted selection

Treat a theme as a curated token seed identified by a stable `themeId`. Persist the selected `themeId` at workspace scope and resolve the active theme using the [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md) precedence. The frontend keeps rendering from resolved tokens; only the selected ID crosses the transport boundary. This solves per-event selection but still requires shipping code to introduce any new look, so it does not meet the long-term self-service goal on its own.

### Option 4: Data-driven token themes with an administrator builder

Let administrators author new themes as **data**: a validated partial override applied over a curated base seed, edited through a guided builder, persisted as a structured document, and resolved through the existing token pipeline. Administrators never write CSS; they set typed token values such as colors, radii, motion, typography choices, and asset references. This meets the long-term goal while staying inside the design-system boundary, and it subsumes Option 3's scoped selection as its base layer.

### Option 5: Keep the same data model but restyle the schema-first editor

Improve spacing, field styling, and panel layout while keeping the form-first workflow. This is cheaper than redesigning the authoring surface, but it still makes organizers translate token fields into player experience and keeps preview secondary.

### Option 6: A preview-led Theme Studio over the same data model

Keep the data-driven theme document and scoped selection model, but replace the schema-first editor with a preview-led studio. Organizers start from complete curated starters, edit a small set of approachable controls first, and judge every change in realistic player scenes. Advanced token editing remains available without becoming the default path.

## Decision

Adopt **Option 4** for the theme architecture and persistence model, delivered through **Option 6** as the management experience. Theme selection, custom theme authoring, asset handling, and the editor interaction model are one feature and one decision. The feature is delivered as a data-driven theme system with a preview-led Theme Studio, not as separate architecture and UX tracks.

### Target architecture

- A theme is a data document `{ baseThemeId, schemaVersion, name, overrides }` where `overrides` is a validated **partial** of the existing `UiThemeSeed` per color scheme where applicable: color scales, semantic colors, radii, motion durations, typography family selections, and asset references.
- Resolution deep-merges `overrides` onto the referenced base seed, so every token always has a safe default and both color schemes stay fully defined. The merged seed flows through the unchanged `createUiThemeTokens` to `createUiThemeCssVariables` to Mantine pipeline. No new rendering path is introduced.
- A theme, whether a curated ID or custom document, is persisted and scoped using the [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md) precedence: per-party override, then project default, then organization default, then the built-in default (`cyber-arcade`). The resolved theme initializes `MantineUiAdapter` so a party renders with its event branding.
- Color scheme (light and dark) stays a separate viewer-local preference and is never forced by the event theme.

### Theme Studio interaction model

- Theme management uses dedicated organization-scoped library, create, and edit routes under `/workspace/organizations/:organizationId/themes`.
- Creation opens on a complete curated starter with a visible starter switcher, not an empty document or a compulsory wizard.
- Editing loads the saved document directly from the URL, preserves arbitrary existing overrides, and keeps revision handling explicit.
- The editor is preview-led: the main working surface is a realistic player preview with scene controls for lobby, question, and results plus preview-only device and color-scheme controls.
- The inspector defaults to three approachable sections: Brand, Style, and Assets. Advanced token editing remains available but secondary.
- The authored theme applies only inside the preview surface. The studio shell keeps the application theme and user color-scheme preference so invalid drafts cannot restyle the editor itself.
- Save state is always explicit: unsaved, saving, saved, and failed states are localized and visible; invalid drafts and in-flight uploads disable save with a visible reason.
- Draft recovery, undo and redo, revision conflict handling, and leave-page protection are part of the editor contract, not optional enhancements.

### Architecture principles

- **Tokens are the only styling contract.** The builder edits token values, never CSS, HTML, or JS. [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md) holds; Mantine stays behind `UiPort`.
- **Clean Architecture boundaries** ([ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md)): the theme is a domain concept with ports; persistence is an infrastructure adapter; transport is GraphQL; the builder UI is presentation and must reach the engine only through `UiPort`.
- **Constrained schema, not free-form input.** Each value is validated against its token kind: colors must be valid CSS color syntax with functions, `url()`, and declaration-breaking characters rejected; radii and spacing are number plus allowlisted unit; motion values are bounded durations; font families come from an approved or bundled allowlist; asset references are app-hosted upload IDs or `https` URLs on an allowlist. This prevents CSS-variable injection from escaping a single declaration.
- **Security by construction**: no remote CSS, CSP preserved, assets flow through the existing upload and media path with content-type checks, and authoring and selection are authorized per workspace scope.
- **Accessibility is enforced at authoring time**: WCAG AA contrast on paired text and surface tokens, distinguishable focus-ring and semantic tokens, and bounded motion that respects reduced motion.
- **Versioned and forward-compatible**: `schemaVersion` lets stored documents migrate as the token contract evolves; unknown keys are dropped and missing keys fall back to the base seed.
- **Preview realism without editor coupling**: production player presentation components and shared UI primitives are reused inside the preview, but with inert adapters and scoped theme application so the authoring shell remains stable.
- **Recovery before cleverness**: unsaved work is recoverable through a draft-storage port keyed by user, organization, theme, schema version, and source revision; revision conflicts never silently overwrite saved work.

### Libraries and tools

Grounded in the current stack; any new dependency is vetted against the GitHub Advisory Database before adoption, per repository practice.

- **Rendering (existing, unchanged):** the token resolver, `createUiThemeCssVariables`, Mantine `createTheme` and `MantineProvider`, and the `UiPort` and `MantineUiAdapter` boundary.
- **Color scale generation:** the existing deterministic palette generator derives the ten-shade `UiThemeColorScale` from a primary color and validates both schemes after resolution.
- **Builder form:** `@tanstack/react-form` through the existing `FormPort`, with a live preview rendering the shared UI primitives and player surfaces inside a scoped provider fed by the draft tokens.
- **Validation:** backend `class-validator` on the GraphQL input plus `zod` for the structured override document; the frontend defensively normalizes the document, mirroring the shared-normalizer approach in [ADR 0011](./0011-standardize-list-query-pagination.md).
- **Persistence:** Prisma (`@prisma/client`) stores the theme document and its scope relations, consistent with how `defaultPartySettings` is modeled on organization, project, and party.
- **Transport:** GraphQL code-first (`@nestjs/graphql`) per [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md), exposing nullable theme selection and the custom theme document.
- **Assets:** the existing upload and media pipeline holds logos and backgrounds; token asset references point at app-hosted IDs, not arbitrary remote files.
- **i18n and DI:** existing i18next resources and Inversify registrations wire the builder use cases, adapters, and translations.

### Scoped-selection implementation

Increment 1 stores a nullable `defaultThemeId` on organizations and projects, matching their role as inherited defaults alongside `defaultPartySettings`. Workspace create and update inputs use that name and accept curated IDs; `null` restores inheritance and an omitted field on update preserves the saved selection. Party creation inputs use `themeIdOverride`, alongside `settingsOverride`; `null` or omission inherits the workspace defaults. Resolved snapshots use `themeId`; the party database column is required, like `settings`. The resolver names inherited inputs `organizationDefaultThemeId` and `projectDefaultThemeId`. Existing management and party-creation permissions authorize these changes.

Party creation resolves and stores a concrete theme snapshot using the precedence above. Workspace changes affect future parties only. The migration backfills legacy parties with the built-in default to preserve their appearance; readers parse the stored ID without applying inheritance or a fallback. GraphQL exposes workspace selections and accepts the party override. Party summaries omit theme and settings; realtime host and player observations carry both resolved snapshots. The shared management picker reads `availableThemes` through `UiPort`, and party screens apply the observed theme ID through the existing provider without changing the viewer's color scheme. Leaving the party restores the preceding UI theme.

The migration `20261006120000_add_scoped_theme_selection` establishes the full theme schema in a single transaction. It adds nullable `default_theme_id` columns to organizations and projects, keeping them nullable for inheritance, with constraints that accept curated IDs and `custom:<uuid>` identifiers. The authoring and asset schema described below is created by the same migration rather than a separate one.

### Authoring and assets implementation

The backend uses a single `ThemeModule`, exporting theme selection and document validation to the game and organization modules. Theme persistence, asset processing, and transport providers remain internal to that module.

Theme identifiers belong to the theme domain: `theme/entities/theme-id.ts` holds the selection types and constants in both applications, and `application/workspace/themes/services/theme-identifier.ts` owns parsing. Shared code contains only the generic identifier parsing infrastructure. The backend `ThemeModule` exports the stateless parser; modules that cannot import it without a cycle register the parser locally for their repository adapters. The frontend workspace container registers it alongside the other theme dependencies.

Theme GraphQL operations call `ListThemesUseCase`, `SaveThemeUseCase`, `UploadThemeAssetUseCase`, `GetThemeUseCase`, and `GetThemeAccessUseCase`. These use cases apply [ADR 0014](./0014-unify-resource-scoped-permissions.md): `OrganizationMembershipAccessService` loads current membership, and the pure `ThemePermissionPolicy` returns `read`, `create`, `update`, and `uploadAsset` decisions with typed denial reasons. Theme repositories load and persist scoped data; they do not evaluate roles. The public asset controller uses `GetThemeAssetUseCase`. Upload sources remain lazy so authorization completes before file reading or decoding.

`ThemeSelectionService.resolve` is the application entry point for resolving a theme document. It accepts organization and project defaults and an optional override, applies override, project, organization, and built-in precedence directly, and resolves the selected curated or organization-owned custom document. This precedence has a single consumer and stays inside the selection service. Party creation calls only that service and never handles the intermediate identifier.

Organization members may browse and select their organization's themes; owners and managers may create and edit them. Custom IDs use `custom:<uuid>`, while curated IDs keep their existing values. Every selection is checked against the owning organization. Updates use a revision check to prevent lost edits.

Identifiers belong to selection: workspace defaults and `themeIdOverride` select a theme before party creation. Every concrete selection resolves to a required `ThemeDocument`; curated selections resolve to their base theme with empty overrides, while custom selections resolve to their saved document. Parties store and transmit only `themeDocument`, without a separate `themeId`. Rendering uses the document's `baseThemeId` and overrides, so contradictory ID and document pairs cannot occur. Observations carry this immutable document snapshot so later library edits affect future parties only. As with curated seeds, a base seed may evolve with a product release; the snapshot freezes authored overrides, not the frontend implementation of the base seed.

Schema version 1 supports partial color scales, semantic colors for both color schemes, radii, spacing, bounded motion durations, approved system-font stacks, and optional logo and background asset references. Unknown document keys are removed by normalization; unsupported versions and invalid known values are rejected. Authored colors use six-digit hexadecimal notation, lengths use bounded `px` or `rem` values, and motion uses bounded milliseconds. Contrast validation checks affected text and surface pairs, action colors, and focus indicators after resolving inherited values. Curated seeds remain in the frontend UI foundation; a tested baseline of their editable color values supports backend validation.

Each curated validation palette lives in its own `theme/services/<theme-id>-theme-palette.ts` file in both applications. `curated-theme-palettes.ts` only maps curated IDs to those definitions, keeping the lookup shared by normalization and the builder while each theme can be maintained separately.

Brand assets reuse GraphQL multipart uploads and database-backed media. PNG, JPEG, and WebP files are limited to 5 MiB and 16 megapixels, decoded and re-encoded with Sharp, and stored as immutable WebP images. SVG, animation, arbitrary URLs, and externally hosted assets are excluded. Asset references are validated against the theme's organization. The application serves them from a dedicated immutable media route with an explicit MIME type and `nosniff`; party participants may load branding without workspace membership. Backgrounds are decorative and content surfaces stay opaque to preserve contrast. Referenced assets are retained for party snapshots.

The migration `20261006120000_add_scoped_theme_selection` also creates the organization-owned theme and asset records and adds a required `theme_document` column to parties. It backfills each existing party with the built-in `cyber-arcade` snapshot, then requires an object document without a database default. Parties never carry a separate `theme_id` column; the resolved document is their only theme state. Apply this migration before deploying the backend and frontend together because realtime observations now require a document for every party. Existing curated selections and parties retain their behavior. Custom themes are edited from organization management; the organization, project, and party pickers can browse the paginated library. Asset references and the resolved document travel with realtime observations; no library request is needed on a participant device.

### Theme Studio implementation

The frontend theme feature lives in `presentation/theme/`: `components/` owns selectors, authoring fields, branding surfaces, and their tests; `hooks/` owns theme-loading state; `routes/` registers theme management; `screens/` owns the library, creation, and editing views; `i18n/` owns the English and French catalogs under the `theme.*` key prefix. Workspace and party screens compose the selectors. `TranslationResourceComposer` registers the catalogs alongside the other locales, and theme domain error mappings use the same keys.

The Theme Studio uses the shared panels, tabs, buttons, typography, file pickers, and catalog cards from `presentation/shared/ui/`. The editor inherits the application theme and color-scheme preference, while the draft theme scopes to the preview only. Feature styles are limited to layout, preview framing, and displaying theme data such as palettes and font samples.

The desktop composition uses a compact top bar for back navigation, editable name, save state, undo and redo, and save action, plus a shared sidebar layout for the inspector beside the preview stage. Below the shared medium breakpoint, the studio switches to single-column Edit and Preview views that preserve section selection and scroll position.

The inspector has three named sections:

- **Brand:** visual curated starters, primary color, highlight color, generated palette preview, then advanced individual shades and light and dark semantic colors
- **Style:** approved font samples, corner presets, spacing and motion presets, then advanced radius, spacing, typography, and motion tokens
- **Assets:** logo and background upload with actual thumbnails, replace and remove actions, progress, and retry

Palette generation and contrast validation are deterministic and tested against both schemes. Advanced overrides stay editable without being silently regenerated. Presets replace only their documented token group. Switching a starter explicitly offers to keep customizations or start fresh, and undo reverses either choice.

The preview uses realistic localized sample data and production player presentation components with inert adapters. It includes long names, a multi-line question, answer states, and a focus and error inspection view. Sample answers can be selected without sending game commands. Device framing and light and dark controls affect the preview only and never mutate the draft document.

If a field becomes invalid, the preview keeps the last valid draft and explains the issue inline instead of collapsing into a generic error state. A visible text status reports contrast issues and links them to the responsible control. Passing checks means the defined token pairs passed validation, not that the whole experience is automatically certified.

Undo and redo cover committed field changes, preset selection, and asset replacement, with continuous color dragging debounced into single history steps. Save states include unsaved changes, saving, saved, and save failed. Save conflicts preserve the draft and offer explicit reload or save-as-new paths. Navigation with unsaved changes allows continuing editing or discarding, and draft recovery complements the native leave-page guard.

Draft storage is implemented through an application port and infrastructure adapter, not in domain code. Drafts are keyed by authenticated user, organization, theme, schema version, and source revision; they retain theme values and managed asset references only; they are cleared after successful save or explicit discard and expire over time.

Each management route consumes its backend action decision before rendering its view. `themePermissions` supports direct links, while `listThemes.permissions` preserves decisions on empty and paginated library responses. Members retain library selection access; owners and managers can create, edit, and upload. Missing membership yields the same not-found response as an absent organization. Navigation uses those decisions, and disabled save/upload actions expose localized reasons through existing design-system controls. Focus, reconnect, and rejected writes refresh decisions with controls disabled until a fresh response; admitted editors preserve unsaved content during refresh. Every command rechecks membership before file consumption or writes, following ADR 0014's revocation checkpoint semantics. First successful creation replaces the URL with the edit route of the newly saved theme. Saving updates the organization library but does not assign the theme to a project, change the user's scheme preference, or mutate existing party snapshots.

### Delivery and rollout

1. **Scoped selection of curated themes** established persisted workspace defaults, party overrides, and the transport contract.
2. **Token-override authoring** introduced validated partial overrides over curated seeds, resolved through the same token pipeline.
3. **Managed brand assets** extended themes with uploaded logos and backgrounds bound to the existing media path.
4. **Theme Studio** replaced the schema-first editor with the preview-led authoring surface while preserving the same theme document, upload flow, authorization, and revision boundaries.

## Consequences

### Positive

- administrators can self-serve event branding over time without shipping code
- the design-system boundary and build pipeline stay intact; only data crosses transport
- no runtime CSS or asset injection, so the CSS-injection and asset-hosting risk is avoided
- custom themes always resolve over a safe base seed and reuse the existing render path
- color scheme remains a viewer choice, independent of branding
- organizers can make branding decisions in the same context in which players experience them
- the editor supports experimentation with explicit save state, preview-only invalid-draft isolation, and recoverable local work

### Negative

- the full builder is a substantial surface: a validated override schema, builder UI, persistence, transport, authorization, migrations, and preview orchestration
- authored tokens must be continuously guarded for contrast and injection safety, which constrains how free the builder can feel
- custom themes add versioned data that must migrate as the token contract evolves
- realistic previews, draft recovery, and undo history add state-management and validation complexity to the presentation layer

### Follow-Up

- keep the backend and frontend normalizers and curated validation baselines synchronized when tokens change
- introduce explicit document migrations before accepting a later schema version
- retain assets referenced by party snapshots when adding future library deletion or cleanup workflows
- run database integration coverage against the migrated test database before deployment; keep base seeds in `presentation/shared/ui/foundation/`
- continue profiling preview rendering and asset decoding on representative mobile hardware because automated checks do not establish responsiveness on their own

## References

Reviewed 2026-10-11:

- [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md): layer boundaries for the theme domain, persistence, transport, and builder UI.
- [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md): tokens are the styling contract and Mantine stays behind the design system.
- [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md): GraphQL as the transport for theme selection and documents.
- [ADR 0007](./0007-move-play-session-settings-to-party-owned-defaults.md): party-owned defaults precedence reused for theme resolution.
- [ADR 0011](./0011-standardize-list-query-pagination.md): shared defensive-normalizer pattern reused for validating theme documents.
- `application/frontend/src/presentation/shared/ui/foundation/ui-theme-definition.ts`, `ui-theme-contract.ts`, `ui-theme-tokens.ts`: curated seeds, the `UiThemeSeed` shape, tokens, and runtime CSS variables.
- `application/frontend/src/infrastructure/ui/mantine-ui.adapter.tsx`, `application/frontend/src/application/shared/ports/ui.port.tsx`: `initialThemeId`, theme state, and the `UiPort` boundary.
