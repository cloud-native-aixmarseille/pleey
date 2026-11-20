# Implementation plan: ADR 0024 - Single-source end user documentation as code

- Issue: [#393](https://github.com/cloud-native-aixmarseille/pleey/issues/393)
- Decision: [ADR 0024](../architecture/adr/0024-single-source-end-user-documentation-as-code.md)
- Updated: 2026-11-17
- Status: Implemented locally. Hosted CI and implementation PR links remain pending publication.

This plan delivers end user documentation as code with a single content source.
The ADR holds the decision and the sync strategy; this file lists the ordered,
concrete tasks with the files they touch and the condition that marks each done.

Phases are sequenced so each later phase consumes the content model and anchors
from earlier phases. One pilot flow (the workspace dashboard home screen) proves
the whole path before the rollout phase extends it. The phases are implemented together in the current working tree; no pull request has been published.

## Conventions this plan reuses

- i18n: per-module `application/web/src/presentation/<area>/i18n/{en,fr}.ts`, merged in `application/web/src/i18n/translation-resource-composer.ts`, consumed through `usePresentationTranslation` (`application/web/src/presentation/shared/i18n/use-presentation-translation.tsx`). Keys are dotted paths such as `dashboard.home.title`.
- Clean Architecture ([ADR 0002](../architecture/adr/0002-use-clean-architecture-with-strict-boundaries.md)): `domains/` -> `application/` -> `infrastructure/` -> `presentation/`. The tour library is wrapped by an infrastructure adapter behind an application port; presentation never imports the library directly.
- Guard scripts: shared implementation in root `scripts/*.mjs` with a per-app wrapper in `application/web/scripts/*.mjs`, wired into `_lint:pre` or `_lint:post` in `application/web/package.json`.
- end-to-end: Playwright in `e2e/`, config `e2e/playwright.config.ts`, specs in `e2e/tests/features/*.spec.ts`, selecting by accessible role and name.

## P0: Foundations and decisions

- [x] Create the `docs/usage/` tree with an `index.md`, and link it from the readme documentation section (add a "Usage" subsection in `README.md`) and from the docs area. Done when `docs/usage/index.md` exists and is reachable from `README.md`.
- [x] Select the MIT-licensed tour library (shortlist: driver.js, Shepherd.js, React Joyride, Reactour; exclude AGPL Intro.js). Record the choice with React 19 compatibility, gzipped bundle size, and axe-core findings in this file. Done when one library is chosen and justified.
- [x] Decide the step anchoring mechanism. Production components do not use `data-testid` today and end-to-end selects by accessible role and name, so choose between adding explicit `data-tour` attributes and anchoring by role and name. Record the decision. Done when the convention is written here and in the frontend development guide.
- [x] Define the guide manifest TypeScript type: a step is `{ i18nKey: string; anchor: string; route: string; docAnchor: string }` and a guide is an ordered list of steps with an ID. Place the type under `application/web/src/presentation/shared/guide/guide-manifest.ts`. Done when the type and a short doc comment exist and typecheck.

## P1: Content model and tour renderer

- [x] Add the tour port and facade: `application/web/src/domains/guide/ports/guide-tour.port.ts` and `application/web/src/application/guide/facades/guide-tour.facade.ts`, exposing `startTour(guideId)` and tracking completion. Done when the facade compiles and has a unit test for step resolution against i18n keys.
- [x] Add the infrastructure adapter wrapping the chosen library: `application/web/src/infrastructure/ui/guide-tour.adapter.tsx`, following the `mantine-ui.adapter.tsx` pattern. The adapter resolves copy from i18n keys at render time and targets anchors from the manifest. Done when the adapter is registered in DI and presentation holds no direct library import (verified by `check-di-instantiation.mjs` and Biome boundary rules).
- [x] Author the pilot manifest `application/web/src/presentation/workspace/dashboard/guide/dashboard-home.guide.ts` covering the dashboard home flow (workspace selector, create game, create party, launch), referencing existing i18n keys and anchors in `screens/home`. Done when the manifest typechecks and every `i18nKey` exists.
- [x] Add the pilot tour copy keys to `application/web/src/presentation/workspace/dashboard/i18n/{en,fr}.ts` (step titles and bodies only; reuse existing labels where present). Done when `en` and `fr` have identical key sets.
- [x] Add the chosen anchors to the pilot UI elements in `application/web/src/presentation/workspace/dashboard/screens/home/**`. Done when each manifest `anchor` resolves to exactly one rendered element.
- [x] Add a tour launch control on the dashboard home screen and persist completion so it does not auto-replay. Done when a unit test covers launch and completion state.

## P2: Reference documentation for the pilot

- [x] Write `docs/usage/dashboard.md` for the pilot flow: narrative, a settings reference table placeholder (filled in P3), and screenshot placeholders. Use heading anchors that match each manifest `docAnchor`. Done when every pilot `docAnchor` resolves to a heading in this file.
- [x] Wire the reciprocal links: each tour step links to its `docs/usage/dashboard.md#<docAnchor>` via `docAnchor`, and the doc sections link back to launching the tour. Done when both directions resolve.
- [x] Add `docs/usage/dashboard.md` to `docs/usage/index.md` and the readme Usage subsection. Done when links resolve from both.

## P3: Generated facts from code

- [x] Enumerate the first facts to generate instead of hand-writing: party and game settings ranges and defaults (from the domain settings definitions under `application/api/src/domain/game/party/**`), resource-scoped permissions ([ADR 0014](../architecture/adr/0014-unify-resource-scoped-permissions.md)), error codes (the domain error enums validated by `check-domain-errors.mjs`), and game types (`application/api/src/domain/game/types/{quiz,prediction}`). Done when the source of each fact is identified here.
- [x] Add a generator `scripts/generate-usage-reference.mjs` (shared) with a frontend/backend wrapper that emits Markdown fragments into `docs/usage/generated/`. Done when running it produces the settings, permissions, error-code, and game-type fragments.
- [x] Include the generated fragments in `docs/usage/dashboard.md` (and future pages) by reference rather than copy. Done when the settings table in the pilot page is generated output, not hand-typed values.

## P4: Screenshot generation

- [x] Add a Playwright script under `e2e/` (for example `e2e/scripts/capture-usage-screenshots.mjs` plus a `e2e/tests/usage/*.capture.ts`) that logs in, navigates to each pilot manifest `route`, scrolls to each `anchor`, and writes images into `docs/usage/assets/`. Done when running it regenerates the pilot screenshots.
- [x] Reference the generated images in `docs/usage/dashboard.md`; do not commit hand-captured screenshots for covered flows. Done when the pilot page renders generated images.
- [x] Add an npm script (for example `e2e` `docs:screenshots`) and document it in the frontend development guide. Done when the script is runnable locally and in CI.

## P5: Sync enforcement in CI

- [x] Add `scripts/check-user-docs.mjs` (shared) plus `application/web/scripts/check-user-docs.mjs` wrapper, validating: every Markdown link and heading anchor in `docs/usage/**` resolves; every manifest `docAnchor` matches a heading; every manifest `i18nKey` exists in `en` and `fr`. Wire it into `_lint:pre`. Done when the guard fails on a deliberately broken anchor, key, or link.
- [x] Add a tour-anchor resolution check using Playwright that loads each guide and asserts every `anchor` resolves to one element; run it in the end-to-end job. Done when it fails on a removed anchor.
- [x] Add a generated-fragment freshness check: regenerate `docs/usage/generated/` in CI and fail on diff, matching the Helm-docs generated-output pattern in `main-ci.yml`. Done when an out-of-date fragment fails CI.
- [x] Create `.github/CODEOWNERS` with an entry for `docs/usage/`, add a pull request checklist item, and add a docs rule to the instruction files under `.github/instructions/` (and a note in `AGENTS.md`) requiring docs and tour updates alongside user-visible changes. Done when the files exist and CODEOWNERS is active.

## P6: Rollout and acceptance

- [x] Extend the manifest, tour, docs, generated facts, and screenshots from the dashboard pilot to the remaining user-facing flows (host party run, player join and play, quiz and prediction authoring, theme studio). Done when each flow has a guide and a `docs/usage/` page.
- [x] Document the system in `docs/technical/development/frontend/index.md`: manifest schema, anchor convention, generation, screenshots, and the CI guards. Done when a contributor can add a new guide from the guide.
- [ ] Confirm acceptance end-to-end: copy single-sourced via i18n, parameter facts generated from code, CI-blocking reference/key/anchor/screenshot/freshness checks active, and only net-new content and semantic prose left to review. Done when all P5 checks are green on a real change.
- [x] Update [ADR 0024](../architecture/adr/0024-single-source-end-user-documentation-as-code.md) to `Accepted` with the accepted date and link the implementation pull requests. Done when the ADR status and index entry are updated.

## Validation

- Frontend: `npm run lint` (includes the new `check-user-docs` guard) and `npm run test` for the tour facade, adapter, and launch control.
- end-to-end: Playwright tour-anchor resolution and screenshot capture against the pilot flow.
- Generation: run `generate-usage-reference.mjs` and the freshness check; confirm the pilot settings table is generated output.
- Locale parity: `en` and `fr` key sets identical for every added i18n namespace.
- Markdown: links and heading anchors resolve across `docs/usage/**`, `docs/usage/index.md`, and the readme Usage links.
- Each new CI guard is proven by an intentionally broken reference before merge.

## Implementation record (2026-11-17)

- Library: driver.js, MIT, framework-independent with no React peer dependency.
  React 19 integration runs through the existing provider-factory composition root.
  The installed ESM bundle is 15,133 bytes gzipped; CSS is 1,917 bytes gzipped.
  The browser run reports zero axe WCAG A/AA violations in all 38 localized tour steps.
  See the [ADR evidence](../architecture/adr/0024-single-source-end-user-documentation-as-code.md#implementation-choices-2026-11-17).
- Anchors: explicit `data-tour`, one visible element per step. Conditional actions
  use stable containing sections. Guides are opt-in, with persisted completion,
  replay and explicit deep links. Player guidance stays in the lobby before timed play.
- Content: seven colocateed manifests, 14 localized task pages, eight localized
  generated fact tables and 38 generated screenshots. The generator owns emitted
  Markdown; i18n owns titles and prose. Task pages link to fact tables because
  GitHub Markdown does not support includes.
- Facts: party defaults and reading-time limits come from the backend domain
  settings module; game editor defaults from `createEmptyPlayableItemEditorState`;
  input bounds from quiz/prediction GraphQL decorators; permission actions and
  reason types from domain contracts; error codes and game types from domain enums.
- Tooling: shared generator/checkers, application wrappers and frontend `_lint:pre`;
  an isolated Compose browser runner, screenshot source/PNG hashes, and an always-run
  CI documentation check. Browser validation runs on full CI; documentation-only
  changes run reference and freshness checks without booting unchanged applications.
- Architecture adjustment: the current codebase uses dedicated dependency providers,
  so guidance uses that pattern instead of the obsolete generic `useRuntimeDependency`
  example in the original plan. The facade tests persistence and resolution by ID;
  the adapter tests i18n resolution at launch, HTML escaping and missing targets.
- The CI owner is the repository's authenticated maintainer, verified to have admin
  access. CODEOWNERS and PR requirements become effective when the changes are merged.
  No remote settings were changed and no implementation PR was published.

### Local validation

- Frontend lint, TypeScript and production build passed.
- The full frontend suite ran: 231 files passed; the remaining editor suite needed
  its isolated provider fixture updated and then passed all 17 tests. Focused
  reruns passed for the new guide lifecycle, StrictMode deep links, localization,
  guard failures and affected party/theme screens.
- Backend settings resolver: 10 tests passed. Backend Biome, domain-error, DI,
  module-export and pagination guards passed. Frontend module-export, DI and
  pagination guards passed through lint.
- CI-routing policy: all 40 tests passed.
- The final isolated Playwright capture passed in 48.6 seconds, checking real routes,
  target uniqueness/visibility, both locales, axe, Finish persistence, replay,
  Escape/focus restoration and dashboard deep links. Both locales' images were generated.
- Guard failure tests cover missing keys, broken document and UI anchors, invalid
  routes, broken local links, stale generated fragments, changed rendering inputs,
  and modified screenshot bytes. The static documentation checker passes.
- Markdown lint passed for all affected documentation. The documentation checker
  also passed with the sparse repository inputs copied into the frontend CI image.
- Playwright discovery confirms the regular suite keeps its 20 tests and the
  dedicated guide configuration selects the isolated browser scenario.

### Remaining acceptance

Publish the implementation for hosted CI, attach the PR link here, and confirm the
existing PR result check and CODEOWNERS review policy in repository protection.
The implementation and local checks do not claim that an unrun hosted workflow passed.
