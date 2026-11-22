# Dispatch prompt for one implementation phase

Copy the prompt below and replace PHASE_NUMBER with exactly one of 01 through 06. Give the agent the entire specification package or place it under `docs/technical/implementation/specifications/` in the repository. Do not provide only the phase filename without the common contracts.

```text
Implement Pleey phase PHASE_NUMBER from the attached implementation specification package.

Work on the repository cloud-native-aixmarseille/pleey from the current main branch. First confirm the preceding phase is merged. Read AGENTS.md, applicable scoped instructions, README.md, EXECUTION-CONTRACT.md, DOMAIN-CONTRACTS.md, the selected phase file, ACCEPTANCE-CATALOG.md and its relevant primary sources before changing code.

Implement the complete selected phase in one PR. All its exposed UI, server behavior, authorization, migrations, infrastructure, tests and documentation must work together in the deployed production build. A later phase is not an allowed dependency or completion promise. Do not implement the next phase.

From Phase 02, enforce DOMAIN-CONTRACTS D12 in the same PR: anonymous authentication users are temporary, participant history is independent, historical-only imports create no auth users, and cleanup/transfer expiry must already operate without a later phase. No permanent Actor/Guest registry may merely relocate the backlog.

Follow the fixed product and architecture decisions. An unreplaced component remains its sole implementation until its replacement phase. Delete the replaced implementation, dependencies, routes, configuration and obsolete tests inside this PR. No legacy token fallback, parallel V1/V2 runtime, dual writes, dormant replacement or follow-up cleanup prerequisite.

Start required ADRs before their implementation using the repository's template and next available numbers. Preserve unrelated work and valuable data. Use the specified offline conversion and rehearsal policy; never use production data reset as an implementation shortcut.

Execute the specified blocking verification against the appropriate real dependencies. Exercise the production images and the previous-release upgrade path. Do not replace a transaction, cookie, proxy, device or recovery assertion with a mock and claim it passed. Record exact observed results and distinguish any unexecuted gate. A missing or failing mandatory gate means the PR is not ready to merge; do not skip it, mark allow-failure or move it to the next phase.

Produce one PR with: the complete change; requirement/test-ID coverage; data migration and deletion inventory; exact dependency/image versions; executed verification evidence; production rollout and smoke checks; safe rollback/roll-forward boundaries; and a short explanation of why this version can remain deployed indefinitely without the next phase.

Keep code and documentation in English, follow repository i18n for user-visible text, and use existing Biome/Vitest/Conventional Commit conventions. Do not add a new framework or service outside the selected architecture unless a concrete unsupported requirement makes the current spec impossible; document the evidence instead of silently changing the design.

Do not merge the PR or deploy to a live environment unless that action is authorized in the active session. Complete all locally and CI-verifiable implementation work and review artifacts before presenting a deployment decision.
```

## Reviewer prompt

```text
Review the current phase PR against its phase spec and common contracts.

Focus on observable production completeness, current security/authorization, idempotency and race behavior, migrations, removal of the old implementation, actual verification evidence, and rollout/rollback safety.

Find every place where this PR relies on a later phase, silently changes a product rule, trusts client-supplied authority, hides a required feature, treats an unexecuted test as passed, or makes rollback/data-loss claims that its artifacts do not prove.

Check anonymous lifetime as well as authentication: no history FK, abandoned membership, transfer intent, migration map or idle polling may retain every old guest forever; no cleanup may remove an unexpired native session. Inspect the required lifecycle evidence from Phase 02 onward.

Check cross-boundary changes: all consumers of the replaced identity/HTTP/game contract, every relevant image/chart/workflow, both browser identity changes and raw old-connection behavior, and the persistence transaction used by the actual write.

Report only actionable findings, with severity, concrete affected path/behavior and the violated requirement/test ID. Do not request a different architecture merely as a preference. Do not mark the PR ready if any mandatory phase gate remains unresolved.
```
