# Product behavior inventory

The machine-readable companion is `e2e/contracts/product-behavior.json`.

The inventory covers existing registration, password recovery, profile/session management, organization/project permissions, quiz and prediction authoring/import, theme management, private parties, host controls, question media, scoring/results, English/French UI and generated user guides.

Phase 01 makes no game-rule or authentication changes. Accepted ADR 0017 remains authoritative: quiz and prediction both score one selected option against authored `isCorrect` values; timed correct answers receive bounded 80% plus 20% speed weighting and untimed correct answers receive all stage points.
