# Implementation plan: ADR 0026 - Factorize create and update forms

- Issue: [#506](https://github.com/cloud-native-aixmarseille/pleey/issues/506)
- Decision: [ADR 0026](../architecture/adr/0026-factorize-create-and-update-forms.md)
- Updated: 2026-11-20
- Status: Complete (P0-P5 complete)

This plan applies ADR 0026 to the whole application surface. It does not stop at
organization management. It inventories every create/update form flow, marks the
current compliance state, and defines the migration and validation sequence until
all applicable flows are compliant.

## Scope

In scope:

- frontend presentation create/update form flows in `application/web/src/presentation/**`;
- mode-aware factorization per resource and feature;
- tests and guardrails needed to keep the rule enforced;
- ADR tracking updates.

Out of scope:

- backend transport DTOs or resolver input contracts (not UI forms);
- create-only flows with no update counterpart;
- update-only flows with no create counterpart;
- cross-feature generic form framework.

## Application-wide inventory (exhaustive)

## A) Applicable create/update form flows

### A1) Organization management (compliant)

- shared form values:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/organization-form-values.ts`
- shared form surface:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/organization-form-dialog.tsx`
- shared state:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/use-organization-form-dialog-state.ts`
- mode-specific wrappers:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/create-organization-form.tsx`
  - `application/web/src/presentation/workspace/organizations/screens/management/components/edit-organization-form.tsx`
- removed legacy parallel hooks:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/use-create-organization-form-state.ts`
  - `application/web/src/presentation/workspace/organizations/screens/management/components/use-edit-organization-form-state.ts`

Current state: aligned with ADR 0026 (shared values + shared dialog + shared
state + thin wrappers).

### A2) Project management (already compliant)

- shared form surface:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/project-form-dialog.tsx`
- shared state by mode:
  - `application/web/src/presentation/workspace/organizations/screens/management/components/use-project-form-dialog-state.ts`
- create/update orchestration:
  - `application/web/src/presentation/workspace/organizations/screens/management/use-organization-project-actions.ts`

Current state: already aligned with ADR 0026.

### A3) Theme management (already compliant)

- shared editor form:
  - `application/web/src/presentation/theme/components/theme-builder-form.tsx`
- create screen:
  - `application/web/src/presentation/theme/screens/theme-create-screen.tsx`
- edit screen:
  - `application/web/src/presentation/theme/screens/theme-edit-screen.tsx`

Current state: create/edit screens already share one form implementation with
mode-specific orchestration around persistence/navigation.

## B) Non-applicable form flows (explicitly excluded by ADR scope)

These flows are intentionally excluded because they are not create/update pairs:

- game creation/import dialogs (create/import, no update counterpart):
  - `application/web/src/presentation/workspace/dashboard/screens/home/components/dashboard-create-game-dialog.tsx`
  - `application/web/src/presentation/workspace/dashboard/screens/home/components/dashboard-import-game-dialog.tsx`
- party creation dialog (create only):
  - `application/web/src/presentation/workspace/dashboard/screens/home/components/dashboard-create-party-dialog.tsx`
- identity flows (sign-in, register, forgot/reset password, profile update) are
  authentication/account workflows, not create/update resource pairs.

## C) Backend confirmation

Backend has no presentation-layer create/update form surfaces. No ADR 0026 form
factorization action is required under `application/api/**`.

## Target architecture pattern (for all applicable flows)

For each applicable resource:

1. One shared feature-local form values contract.
2. One shared feature-local form UI surface.
3. One shared feature-local state model with explicit mode input.
4. Thin wrappers (or screen-level orchestrators) for mode-specific command
   mapping, permission wiring, mutation execution and success/error messages.
5. No cross-feature generic form engine.

## Delivery phases (application-wide)

## P0 - Baseline and safety net

- [x] Run the current affected tests as baseline.
- [x] Freeze behavior contracts for every applicable flow (organization, project,
      theme).
- [x] Keep project/theme as non-regression references while refactoring
      organization.

Done when:

- baseline tests pass and expected behavior contracts are documented in this plan.

Baseline evidence (2026-11-20):

- command:
  - `npm run test -- src/presentation/workspace/organizations/screens/management/components/create-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/edit-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx src/presentation/theme/components/theme-builder-form.spec.tsx`
- result:
  - 4 test files passed;
  - 20 tests passed;
  - 0 failed.

Frozen behavior contracts for migration:

- organization create:
  - renders name and description fields;
  - validates required name;
  - submits mapped payload (name/description/defaultThemeId/defaultPartySettings);
  - calls `onCreated` on success;
  - shows create fallback error on failure.
- organization edit:
  - disables edit action when update permission is denied and exposes permission reason;
  - pre-fills fields from selected organization;
  - submits mapped update payload including `organizationId`;
  - calls `onUpdated` on success;
  - supports clearing saved theme to `null`.
- project create/edit:
  - remains the reference compliant create/edit shared form pattern and must stay
    behavior-equivalent.
- theme create/edit:
  - remains the reference compliant create/edit shared form pattern and must stay
    behavior-equivalent.

## P1 - Migrate organization flow to ADR 0026 pattern

- [x] Create shared organization form files:

- `application/web/src/presentation/workspace/organizations/screens/management/components/organization-form-values.ts`
- `application/web/src/presentation/workspace/organizations/screens/management/components/organization-form-dialog.tsx`
- `application/web/src/presentation/workspace/organizations/screens/management/components/use-organization-form-dialog-state.ts`

- [x] Modify wrappers to thin mode-specific orchestrators:

- `application/web/src/presentation/workspace/organizations/screens/management/components/create-organization-form.tsx`
- `application/web/src/presentation/workspace/organizations/screens/management/components/edit-organization-form.tsx`

- [x] Delete superseded parallel state hooks:

- `application/web/src/presentation/workspace/organizations/screens/management/components/use-create-organization-form-state.ts`
- `application/web/src/presentation/workspace/organizations/screens/management/components/use-edit-organization-form-state.ts`

- [x] Keep existing tests passing without behavior regressions.

Done when:

- organization create/edit fields and state lifecycle are shared once;
- mode-specific orchestration remains explicit in thin wrappers;
- existing permissions, i18n, validation, feedback behavior remain unchanged.

P1 validation evidence (2026-11-20):

- `npm run test -- src/presentation/workspace/organizations/screens/management/components/create-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/edit-organization-form.spec.tsx`
  - 2 files passed, 8 tests passed.
- `npm run test -- src/presentation/workspace/organizations/screens/management/components/create-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/edit-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx src/presentation/theme/components/theme-builder-form.spec.tsx`
  - 4 files passed, 20 tests passed.
- `npm run _lint:typecheck`
  - passed.
- `npm run _lint:biome`
  - passed.
- `npm run lint`
  - blocked by existing user-doc screenshot freshness guard:
    `Screenshot inputs changed. Run ./scripts/run-usage-docs.sh capture.`

## P2 - Cross-flow consistency pass (project + theme + organization)

- [x] Verify that organization follows the same ADR structure as project/theme:
  - shared values contract;
  - shared mode-aware state;
  - thin mode-specific orchestration.
- [x] Normalize naming conventions across the three flows (values, state hook,
      dialog/form component) without behavior changes.
- [x] Remove avoidable divergence in state API shape where it improves
      readability and maintenance.

Done when:

- all applicable create/update flows follow the same architectural pattern and
  naming conventions.

P2 outcome (2026-11-20):

- organization is now aligned with project on the ADR 0026 structure:
  - shared values contract (`organization-form-values.ts`);
  - shared state hook (`use-organization-form-dialog-state.ts`);
  - thin create/edit wrappers for orchestration only.
- naming is aligned for the new organization components:
  - `*-form-values.ts`
  - `*-form-dialog.tsx`
  - `use-*-form-dialog-state.ts`
- theme remains intentionally different in UI shell shape (`ThemeBuilderForm`)
  because create/edit are full screens rather than a modal dialog. This is a
  deliberate, non-avoidable divergence with equivalent ADR semantics.
- no additional code changes were required in P2 beyond the P1 migration because
  avoidable divergence had already been removed by the new organization shared
  structure.

## P3 - Guardrail to keep app-wide compliance

- [x] Add a lightweight static check in frontend scripts (or extend an existing
      checker) that fails when a feature introduces parallel create/edit form
      files for the same resource while both editable field sets are equivalent.
- [x] Keep this check heuristic and conservative: it should flag likely
      duplicates and require explicit local justification comments or naming when
      a split is intentional.
- [x] Wire the check into frontend lint pipeline.

Done when:

- CI/lint blocks reintroduction of obvious create/edit duplication in applicable
  resource forms.

P3 implementation (2026-11-20):

- added shared checker:
  - `scripts/check-create-edit-form-factorization.mjs`
- added frontend wrapper:
  - `application/web/scripts/check-create-edit-form-factorization.mjs`
- wired into frontend lint pre-checks:
  - `application/web/package.json` `_lint:pre`
- checker behavior:
  - detects `create-*-form.tsx` + `edit-*-form.tsx` or `update-*-form.tsx` pairs
    in the same feature directory;
  - passes when a shared companion exists (`*-form-dialog.tsx`,
    `use-*-form-dialog-state.ts`, `*-form.tsx`, or `use-*-form-state.ts`);
  - supports explicit exemptions via token
    `adr-0026-allow-separate-create-edit` in either paired file.

P3 validation evidence:

- `node ./scripts/check-create-edit-form-factorization.mjs` (from
  `application/web`)
  - passed.

## P4 - ADR closure updates

- [x] Update ADR 0026 status when rollout is merged and verified.
- [x] Set accepted date from first adoption commit implementing organization
      factorization.
- [x] Add implementation PR reference(s).
- [x] Keep this plan status synchronized with actual rollout state.

Done when:

- ADR and plan accurately reflect repository reality.

P4 implementation (2026-11-20):

- ADR updated to Accepted:
  - `docs/technical/architecture/adr/0026-factorize-create-and-update-forms.md`
- ADR index synchronized:
  - `docs/technical/architecture/adr/index.md`
- accepted date set to `2026-11-20` and implementation reference linked:
  - [PR #588](https://github.com/cloud-native-aixmarseille/pleey/pull/588)

## P5 - Post-migration duplication audit and targeted factorization

- [x] Run a focused audit after all applicable create/update forms are migrated:
  - shared dialog footer/action patterns;
  - repeated mode-label resolution (`create`/`edit` title, eyebrow, submit,
    submitting);
  - repeated field groups (name/description/theme/default party settings);
  - repeated submit lifecycle fragments (busy state, close guards, feedback
    mapping).
- [x] For each duplicate, classify it as:
  - keep local (context-specific behavior, no clear reuse gain), or
  - factorize (clear, repeated, stable behavior with at least two consumers).
- [x] Implement only feature-local or presentation-shared extractions that are
      justified by concrete duplication evidence.
- [x] Explicitly avoid a generic global form framework during this phase.
- [x] Update tests and this plan with each accepted extraction decision.

Done when:

- a documented duplicate inventory exists with keep/factorize decision for each
  candidate;
- accepted factorization items are implemented and validated;
- intentionally retained duplicates are justified in the plan.

P5 audit and implementation (2026-11-20):

Duplicate inventory and decision:

1. Mode copy-key resolution (`title/eyebrow/submit/submitting`) across
   organization and project dialogs:
   - decision: factorize;
   - implementation: shared helper
     `application/web/src/presentation/workspace/organizations/screens/management/components/create-edit-form-mode-copy.ts`
     consumed by:
     - `organization-form-dialog.tsx`
     - `project-form-dialog.tsx`
2. Field groups (`name`, `description`, `theme`, `defaultPartySettings`) between
   organization and project forms:
   - decision: keep local for now;
   - rationale: labels, placeholder keys, theme-field behavior and surrounding
     dialog contracts still differ enough that a shared field-block component
     would add indirection without reducing maintenance risk materially.
3. Submit lifecycle fragments across organization/project/theme state hooks:
   - decision: keep local for now;
   - rationale: each flow uses distinct facades, fallback error contracts,
     success signaling and side effects (theme conflict/revision path), so a
     shared hook would become a generic workflow abstraction rejected by ADR 0026.
4. Dialog footer/action pattern (`cancel` + `submit`) across dialogs:
   - decision: keep local for now;
   - rationale: permission wiring is specific to organization edit and not shared
     by project/theme; extraction would either duplicate branching in a shared
     component or hide permission semantics.

P5 validation evidence:

- `npm run test -- src/presentation/workspace/organizations/screens/management/components/create-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/edit-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx src/presentation/theme/components/theme-builder-form.spec.tsx`
  - 4 files passed, 20 tests passed.

## Acceptance criteria (application-wide)

1. Every applicable create/update flow is either:
   - compliant with ADR 0026 pattern, or
   - explicitly documented as intentionally exempt with rationale.
2. Organization flow is migrated to shared form/state implementation.
3. Project and theme flows remain compliant and behavior-equivalent.
4. No frontend architecture-boundary violation is introduced.
5. i18n keys continue to resolve for `en` and `fr`.
6. A guardrail exists in lint/CI to prevent obvious future duplication.
7. Validation commands below pass.
8. A post-migration duplication audit has been completed, and accepted
   factorization opportunities have been implemented or explicitly deferred with
   rationale.

## Whole-codebase verification snapshot (2026-11-20)

Repository-wide checks were re-run after P5 to confirm there are no remaining
applicable create/edit form pairs outside already-covered surfaces.

- frontend create/edit mode usage scan:
  - `rg "mode:\\s*'create'\\s*\\|\\s*'edit'|mode === 'create'" application/web/src --glob "*.{ts,tsx}"`
  - result: matches limited to organization and project management forms and the
    shared mode-copy helper.
- backend create/edit form scan:
  - `rg "mode:\\s*'create'\\s*\\|\\s*'edit'|create-.*form|edit-.*form|update-.*form|Create[A-Za-z]+Form|Edit[A-Za-z]+Form" application/api/src --glob "*.{ts,tsx}"`
  - result: no matches.
- frontend guardrail:
  - `node ./scripts/check-create-edit-form-factorization.mjs` (from
    `application/web`)
  - result: passed.

Conclusion: ADR 0026 has been applied across the whole codebase for all
applicable create/update form surfaces currently present.

## Extended whole-app form factorization (beyond strict create/edit)

A focused follow-up factorization was applied on dashboard game dialogs to
reduce duplicated form code in create/import flows (same fields, same game-type
selection logic, same i18n structure).

- shared game form values and helpers:
  - `application/web/src/presentation/workspace/dashboard/screens/home/components/dashboard-game-form-values.ts`
- shared game form field block:
  - `application/web/src/presentation/workspace/dashboard/screens/home/components/dashboard-game-form-fields.tsx`
- adopted by:
  - `dashboard-create-game-dialog.tsx`
  - `dashboard-import-game-dialog.tsx`
- state types aligned:
  - `use-dashboard-home-screen-state.ts`
  - `dashboard-games-section.tsx`

## Validation commands

Run from `application/web/`:

- baseline and targeted refactor checks:
  - `npm run test -- src/presentation/workspace/organizations/screens/management/components/create-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/edit-organization-form.spec.tsx src/presentation/workspace/organizations/screens/management/components/project-form-dialog.spec.tsx src/presentation/theme/components/theme-builder-form.spec.tsx`
- lint and guards:
  - `npm run lint`

Escalation if needed (only when touched by refactor):

- `npm run test -- src/presentation/workspace/organizations/screens/management/components`
- `npm run test -- src/presentation/theme/components`

## Risks and mitigations

| Risk                                                | Mitigation                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Organization migration changes runtime behavior     | Preserve existing specs as non-regression baseline and keep wrappers thin                          |
| Over-abstracting to a generic global form framework | Enforce feature-local factorization only (ADR 0026)                                                |
| Permission regressions on edit flows                | Keep permission logic at wrapper/orchestrator level; preserve tests for disabled action and reason |
| Guardrail false positives                           | Keep checker conservative and allow explicit documented exemptions                                 |
| Drift between already-compliant flows               | Add P2 consistency pass and naming alignment                                                       |

## Execution order

1. P0 baseline.
2. P1 organization migration.
3. P2 cross-flow consistency pass.
4. P3 lint guardrail.
5. P4 ADR closure updates.
6. P5 post-migration duplication audit and targeted factorization.
7. Run validation commands and attach exact results in implementation PR.

This sequence is mandatory for an incremental and verifiable app-wide rollout.
