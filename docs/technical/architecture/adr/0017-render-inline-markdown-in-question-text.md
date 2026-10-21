# ADR 0017: Render inline markdown in question text

- Status: Accepted
- Proposed date: 2026-10-21
- Accepted date: 2026-10-21

## Context

Quiz and prediction maintainers author question text as plain strings, but they naturally write lightweight markdown emphasis such as `Where **should you** store your secrets?`. Live player and host surfaces rendered question text as raw text, so the markers stayed visible instead of producing emphasis, as reported in issue #532. This ADR is retrospective: it records the decision implemented in commit `79f6c7c` on the pull request closing that issue.

## Decision Drivers

- Let maintainers emphasize question wording without learning new tooling.
- Keep guest-facing live surfaces safe: question text is maintainer-controlled and must never inject markup or scripts.
- Avoid new runtime dependencies and keep the frontend bundle lean.
- Stay consistent with the internal design system on top of Mantine (ADR 0003): rendering goes through a shared presentation component, not ad hoc HTML.

## Considered Options

### Option 1: Full markdown renderer library (react-markdown, marked, markdown-it)

Brings complete CommonMark support at the cost of a new dependency and a larger bundle. Unwanted block layouts are not inherent to this option: `react-markdown` can restrict output to inline elements through `allowedElements`, `unwrapDisallowed`, and component mappings, so a library could render the same inline-only subset. The real tradeoff is adding and maintaining a parsing dependency (with its transitive packages, upgrade cadence, and bundle weight) for a four-delimiter inline grammar, versus keeping small in-house parsing rules that must be maintained and may diverge from CommonMark edge cases.

### Option 2: In-house inline markdown subset renderer

Parse a small inline-only subset (`**`/`__` bold, `*`/`_` italic, `~~` strikethrough, backtick code spans) in a shared presentation component and emit semantic React elements. No dependency, no `dangerouslySetInnerHTML`, and unmatched or empty delimiters degrade to literal text.

### Option 3: Keep raw text rendering

Zero implementation cost, but maintainers keep seeing literal asterisks, which is the reported problem.

## Decision

Use option 2. A shared `InlineMarkdownText` presentation component tokenizes the inline subset recursively, supports nested emphasis, keeps code span content raw, and renders `<strong>`, `<em>`, `<s>`, and `<code>` through React escaping. Unmatched or empty delimiters render as plain text. Every live question display (host stage panel, host result panel, and player stage and result surfaces on mobile and desktop) renders question text through this component.

Although a library restricted to inline output (option 1) would avoid in-house parsing rules, the dependency and bundle tradeoff outweighs that benefit here: the supported grammar is four inline delimiters with no links, images, or blocks, so the maintenance surface kept in-house is deliberately small and fully covered by colocated specs. If question formatting ever grows toward richer markdown, revisiting option 1 with restricted output is the preferred path.

## Consequences

### Positive

- Maintainer emphasis like `**should you**` renders as bold without visible markers on all live surfaces.
- Raw HTML in question text stays escaped and inert; no injection risk is introduced.
- No new dependency; the renderer is colocated with its Vitest specs.

### Negative

- The subset intentionally excludes links, images, and block markdown; maintainers needing richer formatting must open a follow-up discussion.
- Inline parsing rules are maintained in-house and may differ from full CommonMark edge cases.

### Follow-Up

- Answer option text still renders as raw text; extend `InlineMarkdownText` usage there if maintainers ask for it.
- Update the quiz and prediction import examples to showcase supported emphasis if adoption shows maintainers miss the feature.
