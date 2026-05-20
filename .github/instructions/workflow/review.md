# Pleey Code Review Instructions

Prioritize actionable findings over summaries because review is mainly for surfacing risk.

- Focus on correctness bugs, behavioral regressions, security issues, architectural boundary violations, and missing or weak tests because those are the highest-value review outcomes.
- Check repository invariants first: Clean Architecture boundaries, i18n for user-facing text, domain error code mapping, no `console.*` in frontend code, and no backend `process.env` reads outside `application/backend/src/app/config/`.
- Call out missing transport-boundary validation, duplicated requests, and accessibility regressions when they are affected because these regressions are easy to miss in otherwise clean diffs.
- Report each finding with the file path, the concrete risk, and the smallest useful fix direction because reviewers need something actionable.
- If no findings are present, say so explicitly and mention residual testing or verification gaps so silence is not mistaken for a full validation.
