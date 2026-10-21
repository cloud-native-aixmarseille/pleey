# ADR 0017: Render inline markdown in question text

- Status: Accepted
- Proposed date: 2026-10-21
- Accepted date: 2026-10-21

## Context

Quiz and prediction maintainers author question text as plain strings, but they naturally write lightweight markdown emphasis such as `Where **should you** store your secrets?`. Live player and host surfaces rendered question text as raw text, so the markers stayed visible instead of producing emphasis, as reported in issue #532. This ADR is retrospective: it records the decision implemented in commit `79f6c7c` on the pull request closing that issue.

Authoring UX, storage format, and live rendering are separate choices. Issue #532 only asks how stored question text renders; this ADR decides the formatting contract and its renderer. Richer authoring (visual editing) is compared as an option but deferred.

## Decision Drivers

- Let maintainers emphasize question wording without learning new tooling.
- Keep guest-facing live surfaces safe: question text is maintainer-controlled and must never inject markup or scripts.
- Avoid new runtime dependencies and keep the frontend bundle lean.
- Stay consistent with the internal design system on top of Mantine (ADR 0003): rendering goes through a shared presentation component, not ad hoc HTML.

## Formatting Contract

The contract is decided before the parser so every option has the same target behavior:

- **Storage format**: question text stays a plain markdown string, so imports, exports, the GraphQL schema, and existing content are unaffected.
- **Supported inline constructs** (scope chosen from the issue and maintainer authoring needs):
  - Bold (`**text**`, `__text__`) — the exact construct requested in issue #532, used to stress the word that matters in a question.
  - Italic (`*text*`, `_text_`) — secondary emphasis for titles, foreign words, or caveat wording.
  - Strikethrough (`~~text~~`) — classic quiz phrasing that visually cancels a tempting-but-wrong term.
  - Inline code (`` `text` ``) — technical questions referencing commands, keys, or identifiers.
  - Nested emphasis (`**bold with *italic* inside**`) — combining the constructs above.
- **Semantics**: supported constructs follow standard CommonMark inline emphasis semantics; the syntax is not intentionally different from markdown. Target behaviors:
  - `Where **should you** store your secrets?` → `should you` renders bold, without visible asterisks.
  - `Use snake_case_names in config files` → renders literally; `_` does not emphasize inside words.
  - `**bold with *italic* inside**` → bold containing italic.
  - `Where **should you store secrets?` → renders literally; unmatched delimiters are plain text.
  - `2 * 3 ** 4` and `a ** b` → render literally; delimiter runs surrounded by whitespace do not emphasize.
  - `` Use `**not-bold**` literally `` → code span content is raw, never re-parsed.
  - Raw HTML (`<b>x</b>`) renders as visible text; no markup is ever injected.
- **Excluded**: links, images, lists, headings, and all other block markdown, which would disturb compact live layouts.

## Considered Options

### Option 1: Full markdown renderer library with restricted output (react-markdown, `allowedElements`/`unwrapDisallowed`)

A ready-made React renderer configured to emit only the inline elements of the contract. Block layouts are not inherent to this option: `allowedElements`, `unwrapDisallowed`, and component mappings restrict output to the supported constructs. CommonMark parsing is battle-tested, but it adds a dependency tree (react-markdown 10 + remark/rehype packages) and about 37 KB gzipped to the live bundle, measured with esbuild (React external) in October 2026, on player-facing surfaces where load time matters.

### Option 2: Established inline parser with in-house React renderer (markdown-it `parseInline`)

Delegate syntax handling to `markdown-it.parseInline` with block rules skipped and unwanted inline rules disabled (`zero` preset plus `emphasis`, `strikethrough`, `backticks`), and map the returned inline tokens to design-system elements in our shared component. Parsing ownership moves to a maintained CommonMark implementation while element allow-listing and styling stay in-house. Costs: a new runtime dependency (markdown-it 15, about 42 KB gzipped, measured as above), a token-to-component mapping layer, and renderer edge cases that remain ours to test.

### Option 3: In-house inline markdown subset renderer

Parse the contract's inline subset (`**`/`__` bold, `*`/`_` italic, `~~` strikethrough, backtick code spans) in a shared presentation component and emit semantic React elements. No dependency, no `dangerouslySetInnerHTML`, and unmatched or empty delimiters degrade to literal text. The measured footprint is about 0.6 KB gzipped (compiled component, React external). The parsing rules, including CommonMark flanking and intra-word underscore behavior, are ours to maintain and are pinned by colocated specs covering the contract examples above.

### Option 4: WYSIWYG question authoring (Lexical with markdown import/export)

Replace the plain textarea with a small-toolbar visual editor limited to the supported inline formatting, keeping storage as markdown strings through Lexical's markdown import/export so no editor-specific JSON document is persisted. This improves authoring UX (no delimiters to learn, visible result while editing) and the editor can be lazy-loaded on management screens only. Costs: the largest integration and bundle footprint of all options (a minimal Lexical rich-text kit measures about 137 KB gzipped before tree-shaken trims, and still requires toolbar, keyboard, and mobile-usability work), plus round-trip risks when importing and reopening content if editor output and live rendering ever diverge. This option still needs the formatting contract and a rendering decision; it changes authoring, not storage or display.

### Option 5: Keep raw text rendering

Zero implementation cost, but maintainers keep seeing literal asterisks, which is the reported problem.

## Decision

Use option 3. A shared `InlineMarkdownText` presentation component tokenizes the contract subset recursively with CommonMark flanking rules, supports nested emphasis, keeps code span content raw, and renders `<strong>`, `<em>`, `<s>`, and `<code>` through React escaping. Unmatched or empty delimiters render as plain text. Every live question display (host stage panel, host result panel, and player stage and result surfaces on mobile and desktop) renders question text through this component.

The measured tradeoff favors owning the parser for this contract: options 1 and 2 add roughly 37-42 KB gzipped (60-70x the in-house footprint) to player-facing live surfaces in exchange for full CommonMark parsing that the contract mostly excludes, while option 4 is an authoring investment orthogonal to rendering and far larger still. The residual maintenance risk is bounded to the contract's four constructs and is pinned by specs covering every contract example, including nesting, literal delimiters, and underscores inside words.

Bundle measurements were taken with esbuild in October 2026 (markdown-it 15.0.3, react-markdown 10.1.0, Lexical 0.52 authoring kit; React external in all cases). They are point-in-time estimates to validate at the next dependency review rather than permanent constants; if question formatting ever grows toward richer markdown, revisiting option 1 or 2 is the preferred path, and option 4 can be layered on later without changing storage or rendering.

## Consequences

### Positive

- Maintainer emphasis like `**should you**` renders as bold without visible markers on all live surfaces.
- Raw HTML in question text stays escaped and inert; no injection risk is introduced.
- No new dependency; the renderer adds about 0.6 KB gzipped and is colocated with its Vitest specs.
- The formatting contract is explicit, so future options (library renderer, WYSIWYG authoring) have a shared target behavior to satisfy.

### Negative

- The subset intentionally excludes links, images, and block markdown; maintainers needing richer formatting must open a follow-up discussion.
- Inline parsing rules are maintained in-house and may differ from full CommonMark edge cases beyond the contract examples.
- Question authoring remains a plain textarea; maintainers must know the delimiters.

### Follow-Up

- Answer option text still renders as raw text; extend `InlineMarkdownText` usage there if maintainers ask for it.
- Update the quiz and prediction import examples to showcase supported emphasis if adoption shows maintainers miss the feature.
- Re-evaluate the WYSIWYG authoring option (option 4) if delimiter-based authoring proves confusing, and re-measure bundle deltas when dependencies are next reviewed.
