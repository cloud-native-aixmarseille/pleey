# User guides

[ADR 0024](../../architecture/adr/0024-single-source-end-user-documentation-as-code.md)
defines the shared content model. The [user reference](../../../usage/index.md)
is rendered from the same i18n copy as the in-app tours.

## Author a guide

1. Add a `*.guide.ts` beside the feature's presentation module. Use `GuideManifest`
   from `presentation/shared/guide/guide-manifest.ts`: `id`, `titleKey`, `docPath`, and ordered
   `steps` containing `i18nKey`, `titleKey`, `anchor`, `route`, and `docAnchor`.
2. Keep body copy in the feature's `i18n/en.ts` and `fr.ts`; reuse existing labels
   for `titleKey`. `i18nKey` is a string leaf. Never put translated prose in a manifest.
3. Add a stable `data-tour` attribute to each target. Each target must resolve to
   exactly one visible element on the declared route, including empty states.
   Use a containing section when individual controls are conditional or repeated.
   Never target styling classes. Routes can contain resource parameters.
4. Register the manifest in `app/bootstrap/modules/guide/container.ts` and render
   `GuideLaunch` in the corresponding screen's header or action group. The shared
   question-mark icon has a localized tooltip and accessible start/replay name;
   keep it secondary to the main action. Keep player guidance in the lobby,
   before timed play. Guides are opt-in and replayable; only Finish persists completion.
5. Add route fixture parameters to `e2e/tests/usage/guides.spec.ts` when needed.
   The browser check loads the real application with isolated seeded services.
6. Generate the reference and capture its images, then run the guards.

`?guide=<id>` explicitly requests the guide after its targets render. Documentation
links use the local installation URL and explain how to substitute an instance and
resource identifiers. Popovers open the matching localized section on GitHub.

The application facade owns completion state through `StoragePort`. The driver.js
adapter owns localization, HTML escaping, focus restoration, reduced motion and
teardown. Presentation consumes a dedicated provider created by the DI composition
root. It never imports driver.js. Storage denial does not prevent a tour from running.
The popover consumes the same runtime theme variables as other overlays. Its panel
layers the surface token over an opaque canvas, and its navigation, typography,
borders and focus states follow the active theme and color scheme.

## Generate and verify

From the repository root:

```sh
npm --prefix application/web run docs:generate
./scripts/run-usage-docs.sh capture
npm --prefix application/web run lint
./scripts/run-usage-docs.sh check
```

Install the frontend, backend and end-to-end package dependencies first. The screenshot
runner uses the development images built by `docker compose -p pleey build backend frontend`.
It creates a unique Compose project with separate database, cache and media volumes,
seeds it, captures both locales, and removes its containers and volumes on exit.
It never resets the existing development stack. Disposable build and tool files live under `.cache/usage-docs/` during the run. The runner's `capture` mode writes PNGs and their provenance
manifest; `check` validates every route and target, tour copy, axe results, keyboard
exit and completion behavior against the same manifests. The dedicated CI browser
job uses this runner. The normal end-to-end suite excludes these isolated-stack checks.

`docs:generate` exists in both applications and requires the frontend tooling
dependencies. It emits localized task pages plus settings, permissions, error-code
and game-type references. Edit the source modules, then regenerate; do not edit the
emitted Markdown or capture images by hand. GitHub Markdown does not support includes,
so task pages link to generated fact tables.

`check-user-docs` runs in frontend `_lint:pre`. It checks screenshot source digests and PNG hashes, local Markdown links and
GitHub-style heading anchors, reciprocal tour links, both locales, declared UI
anchors and generated-output freshness. The browser job verifies actual route
resolution, visibility and uniqueness. External sites are not fetched during lint. The two Markdown parser dependencies are consumed by shared root scripts via the frontend package resolver, which is why they are listed in Knip's dependency exceptions.

The PR CI gate includes user-documentation checks even for documentation-only PRs.
`CODEOWNERS` requests the configured maintainer's review; repository branch protection
must enforce required reviews and the existing PR result check. New feature coverage
and semantic accuracy remain review responsibilities.
