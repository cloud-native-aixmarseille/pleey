# ADR 0024: Single-source end user documentation as code

- Status: Accepted
- Proposed date: 2026-11-17
- Accepted date: 2026-11-17
- Implementation plan: [docs/technical/plans/0024](../../plans/0024-single-source-end-user-documentation-as-code.md)

## Context

[Issue 393](https://github.com/cloud-native-aixmarseille/pleey/issues/393) requests proper end user documentation, with a reference under `docs/` and an in-app product tour (the issue cites [driver.js](https://driverjs.com/) as an example tool).

Today `docs/` holds only contributor material under `docs/technical/`; there is no user-facing documentation area. All user-visible copy already lives in colocateed i18n resources (`application/frontend/src/presentation/**/i18n/` and `application/backend/src/i18n/`), with CI guards that block orphan keys and missing error-enum mappings, and the repository already generates some docs (Helm) rather than hand-writing them.

The risk in this issue is not which tour library to pick. A standalone user-docs tree and an independently authored in-app tour would each restate feature behavior, UI copy, and screen ordering. That duplicates the existing i18n strings and drifts from the product every time a feature changes. The decision we need is a documentation strategy that keeps each user-facing fact written once, lives in the repository as code, is validated in CI, and lets the product tour be one rendering surface over that content rather than a second source of truth. The tour library itself is an implementation detail chosen later.

## Decision Drivers

- Single source of truth: document each user-facing fact once, owned next to the behavior or copy it describes.
- Documentation as code: author user docs in the repository, review them with the code change, and validate them in CI.
- Reuse the existing i18n resources for all user-facing strings; never keep a parallel translated copy in Markdown or tour configuration.
- Prevent drift: a change to user-visible behavior or copy must force the matching documentation and tour update through instructions and CI guards.
- Decouple delivery surfaces (reference docs, in-app tour, contextual help) from the content source so adding a surface does not multiply content.

## Considered Options

### Option 1: External hosted documentation

Maintain user docs on an external platform (wiki, GitBook, Notion). This is not documentation as code: it is edited outside the repository, drifts from each release, duplicates i18n copy, and cannot be validated by CI alongside the change that affects it.

### Option 2: Hand-written Markdown plus an independently coded tour

Write a `docs/usage/` reference by hand and separately hardcode driver.js steps. Both are in-repo, but each tour step restates UI copy and ordering already defined in i18n and in the presentation layer, creating two or three sources for the same fact that drift independently.

### Option 3: In-app product tour only

Ship only the driver.js tour and no reference docs. It is contextual, but it offers no searchable or linkable reference, and its step text hardcodes copy that duplicates the i18n strings.

### Option 4: Documentation as code with a single content source

Author the canonical user reference under `docs/usage/` as Markdown, keep all user-facing copy in the existing i18n resources, and drive in-app guidance (tour steps, contextual help) from structured, i18n-backed content so every surface renders the same source. Validate links, anchors, and referenced i18n keys in CI, and bind documentation and tour updates to feature changes through instruction files and guards.

### Option 5: A single bundled tool for tours and docs

Adopt one product that provides both the guided tour and the knowledge base. In practice this means a commercial digital-adoption platform (for example Pendo, Userpilot, or Appcues): the open-source landscape has no single tool that renders both an in-app tour and a static docs site, because tours (driver.js, Shepherd.js, React Joyride, Reactour) and static documentation (plain Markdown or a generator such as Docusaurus) are distinct tool categories. These platforms are SaaS: their content lives in an external dashboard, cannot be reviewed in pull requests or validated in CI, and duplicates the i18n copy. This is not documentation as code and reintroduces the drift this decision aims to remove.

## Decision

Adopt option 4.

Create `docs/usage/` as the canonical end user reference, indexed from the docs root and linked from the readme documentation section. Organize it by user task and feature, not by code layout, and keep the root readme focused on end users per the existing repository rules.

Keep all user-facing strings in the existing i18n resources. Documentation and in-app help reference the same i18n content; Markdown and tour configuration must not re-translate or copy those strings. Where a fact already exists in code (party and game settings, resource-scoped permissions, error codes, game types), prefer extracting or generating the documentation from that source over hand-copying it, following the existing generated-docs precedent.

Treat the in-app product tour as a rendering surface, not a content store. Define each tour as data or configuration colocateed with its feature's presentation module, with step copy sourced from i18n keys and step targets anchored to existing UI elements. No single documentation-as-code tool renders both a guided tour and static documentation, so the strategy keeps two specialized renderers over one shared source rather than adopting a bundled platform: GitHub-rendered Markdown under `docs/usage/` for the reference, and a small MIT-licensed tour library for the in-app surface. [driver.js](https://driverjs.com/) is the example implementation from the issue; the concrete library (candidates include driver.js, Shepherd.js, React Joyride, and Reactour, excluding AGPL-licensed options such as Intro.js) is selected during implementation and does not change this content model. Adding a new surface (tooltips, onboarding checklist) reuses the same content rather than introducing a parallel copy.

Validate the documentation in CI the way translations and error-enum mappings are already validated: check Markdown links and heading anchors, and verify that i18n keys referenced by docs and tour configuration exist. Broken links, missing anchors, or missing keys block the pull request. Extend the instruction files so a change to user-visible behavior or copy requires updating the matching `docs/usage/` page and tour step in the same change.

The reference content, the i18n copy, and the tour configuration together form the single source: each fact is authored in exactly one of them, and the others reference it.

## Keeping Documentation In Sync

The risk this decision manages is drift between the product, the reference docs, and the in-app tour. Rather than synchronizing separate artifacts, the strategy eliminates most of the sync surface and fails CI on what remains mechanizable. Each class of drift is handled at a different layer.

- Copy drift is eliminated: tour steps and doc fragments render the same i18n keys, so there is a single string to change, not two or three copies to reconcile.
- Parameter drift is eliminated where facts already live in code: party and game settings ranges and defaults, resource-scoped permissions, error codes, and game types are generated or extracted into docs, so the documented value is code output rather than a hand-copied constant.
- Broken references are blocked in CI: every tour step must resolve to an existing anchor and route, and every doc-to-tour and tour-to-doc link must resolve to an existing heading anchor. Missing targets fail the pull request, like the existing translation and error-enum guards.
- Missing i18n keys are blocked in CI: every key referenced by a tour step or generated doc fragment must exist in all locales, reusing the existing orphan-key validation.
- Stale screenshots are regenerated, not asserted by hand: the existing Playwright setup captures doc images by navigating to each step's route and anchor, so images track the UI.

Two conventions make the mechanized checks reliable. Tour steps and the screenshot script target stable `data-tour` or `data-testid` anchors, not styling classes, so refactors surface as failing checks instead of silently broken tours. The machine-readable guide manifest and tour configuration are colocateed with the feature's presentation module, so a change to the feature appears in the same diff as its guidance; only the narrative Markdown lives under `docs/usage/`.

Two drift classes cannot be fully automated and rely on review: net-new content, when a new user-facing feature ships without a page or tour step, and semantic prose, when narrative describes behavior that changed. These are mitigated by the instruction guard, a pull request checklist, and `CODEOWNERS` on `docs/usage/`, not by a guarantee. The value of the automated layers is that reviewers only assess genuinely new or changed behavior, a far smaller surface than re-verifying the whole documentation set.

## Consequences

### Positive

- Each user-facing fact is written once and reviewed with the code that changes it, reducing duplication and drift.
- The product tour, reference docs, and future help surfaces share one i18n-backed content source, so new surfaces do not multiply copy.
- CI catches broken links, missing anchors, dangling i18n references, and stale screenshots before merge, matching the existing translation and error-enum guards.
- End user documentation stays versioned, localized, and releasable with the application.

### Negative

- Driving tour steps from i18n keys and stable anchors is more work up front than hardcoding strings and selectors.
- Generating or extracting documentation from settings, permissions, and error codes needs tooling that does not exist yet.
- Instruction and CI guards add friction to feature pull requests that change user-visible copy or behavior.
- Net-new content and semantic prose still depend on human review; the automated layers reduce but do not remove that responsibility.

### Follow-Up

- Define the `docs/usage/` structure and index, and link it from the docs root and readme.
- Choose the tour library (driver.js is the example) and define the i18n-backed step model colocateed with each feature.
- Add CI validation for Markdown links, anchors, referenced i18n keys, and tour anchor resolution in docs and tour configuration.
- Add a Playwright screenshot generation step for `docs/usage/` images tied to tour anchors and routes.
- Identify the first facts to generate or extract from code (settings, permissions, error codes, game types) rather than hand-write.
- Update the instruction files, the pull request checklist, and `CODEOWNERS` to require documentation and tour updates alongside user-visible changes.

## Implementation choices (2026-11-17)

The implementation uses [driver.js](https://driverjs.com/docs/configuration),
whose [MIT license](https://github.com/nilbuild/driver.js/blob/master/license)
and package metadata were checked during implementation. The selected package has
no React peer dependency; the imperative adapter is registered in Pleey's React 19
composition root. Its installed ESM bundle compresses to 15,133 bytes and its CSS
to 1,917 bytes with Node's `gzipSync`. These are package measurements, not an estimate
of the application's full bundle increase. Exact dependency versions remain in
the frontend lockfile.

Targets use explicit `data-tour` attributes. Empty and permission-dependent states
anchor a stable containing section. The renderer checks uniqueness and visibility
before starting, escapes translation text, restores focus on close and respects
reduced motion. Tours run only on explicit request, and completing one persists a
replay label. Player guidance is delivered before timed play in the lobby.

Both language versions of the task pages and reference tables are generated from
the manifests, i18n resources and current code. GitHub Markdown cannot include a
fragment, so task pages link to the generated tables. Game editor defaults are
extracted from the current creation function, and numeric input bounds from the
GraphQL input decorators; party defaults and reading-time bounds are domain data.
Resource permission tables list the actions and reason contracts, without attempting
to reproduce the authorization policies in prose.

Screenshot provenance records the rendering-source digest and the generated PNG
hashes. Static CI rejects changed inputs or hand-edited images; browser checks verify
actual targets, localized tour content, axe results and keyboard completion/exit.
The browser runner uses a disposable Compose project and seeded data. Semantic
accuracy, new-feature coverage and repository review protection still require review.

See the [implementation plan](../../plans/0024-single-source-end-user-documentation-as-code.md)
for validation evidence and any remaining acceptance work.

### Guide presentation

Following [ADR 0003](./0003-use-an-internal-design-system-on-top-of-mantine.md)
and [ADR 0012](./0012-manage-themes-as-data-driven-token-themes.md), guide launchers
use the shared icon trigger and tooltip inside existing screen headers or action
groups. A localized accessible name distinguishes starting from replaying a guide.
Guidance stays secondary to the screen's main task and keeps a 44-pixel touch target.

The imperative tour adapter uses the existing runtime CSS tokens for its panel,
typography, borders, spacing, shadows, actions and focus states. It inherits the
active event theme and viewer color scheme through the same root variables as
other overlays. Its layout fits narrow screens; the reference link remains a
separate secondary action, and progress stays visible above the step title.
