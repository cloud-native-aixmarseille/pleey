# ADR 0017: Render authored game content as Markdown

- Status: Proposed
- Proposed date: 2026-10-22
- Accepted date: N/A

## Context

A quiz maintainer enters `Where **should you** store your secrets?` and expects "should you" to appear in bold, without visible asterisks. This illustrates a broader need: authored questions can contain emphasis, technical identifiers, code examples, lists, links, or structured comparisons. Formatting should express the content's meaning consistently wherever it appears.

Pleey stores question, prediction prompt, and option text as strings, then displays them in shared management and gameplay components. Those components currently interpolate plain text. Questions often sit inside headings, answer labels inside buttons, and stage-rail titles are truncated before rendering. A general Markdown renderer must account for those different contexts.

Importing a Markdown file is a separate concern from rendering a Markdown field. The current Markdown and plain-text import formats use headings, lists, and metadata to delimit game items; they flatten prompt lines. CSV reads individual physical lines. JSON can carry multiline source, but shared normalization and editor saves currently trim significant whitespace. Rich content therefore requires both presentation rules and an explicit source-preservation contract.

## Decision Drivers

- Support familiar Markdown formatting beyond the motivating bold example.
- Reuse the same content policy across quiz and prediction authoring, previews, and gameplay.
- Keep editable source portable and independent of a particular rich text editor.
- Preserve content, accessibility, answer identity, and mobile usability in each display context.
- Treat authored content as untrusted and make supported syntax discoverable.
- Follow the [frontend framework boundaries](../frontend.md#framework-abstractions) and [internal design system decision](./0003-use-an-internal-design-system-on-top-of-mantine.md).

## Considered Options

### Option 1: Add individual formatting substitutions

Implement bold first and add replacements for other constructs as needed. This produces an application-specific dialect and makes Pleey responsible for escaping, nesting, code literals, and consistent handling across screens.

### Option 2: Adopt Markdown source with shared rendering profiles

Use an established parser and a centrally defined syntax and safety policy. Render full prompt bodies, inline answer labels, and plain summaries from the same source, according to the capabilities of their containers.

### Option 3: Store a rich text document or HTML

Introduce a visual editor and structured document storage. This can support richer authoring interactions, but also introduces a document schema, migrations, and import conversion. It is unnecessary for formatting content that maintainers can already express in Markdown. A future visual editor could still use Markdown as its persistence format.

## Decision

Choose option 2. Adopt CommonMark with GitHub-flavored Markdown extensions, using `react-markdown` and `remark-gfm` behind the existing UI abstraction. Define one authored-content policy with three rendering profiles.

### Content scope and profiles

Apply this policy to maintainer-authored quiz questions, prediction prompts, and free-form answer or option labels. System-provided true/false labels retain their canonical values and localization. Game names, resource identifiers, and application translations are not Markdown fields.

| Profile | Used for | Rendering contract |
| --- | --- | --- |
| Document | Full question and prediction prompt bodies, including editor previews and results | Paragraphs, CommonMark soft/hard breaks, bold, italics, strikethrough, inline and fenced/indented code, ordered/unordered lists, blockquotes, contextual headings, thematic breaks, tables, read-only task lists, footnotes, and approved web links. |
| Inline | Free-form answer and option labels, including selectable buttons and results | Bold, italics, strikethrough, inline code, and text. Links become their readable labels; block constructs become readable text with separators, without block elements or controls inside a button. |
| Plain | Stage-rail summaries, accessible names, search/display snippets, and text interpolated into application messages | Extract readable wording from the parsed content. Preserve code text and link/image labels, and separate blocks, list items, and table cells so words do not run together. Truncate only after this projection. |

These are presentation profiles of the same syntax, not different stored formats. Profile selection is explicit in the shared component contract; screens cannot pass arbitrary parser plugins or element allowlists. The inline editor guidance explains that answer fields support inline formatting. When block source arrives through an API or import, its readable content remains available through the documented fallback rather than disappearing.

Follow the parser's escaping and nesting rules. Unmatched delimiters remain text; backslash escapes and code spans let authors show literal Markdown. Code contents are never parsed as emphasis or executed. For the original example, the document and inline profiles produce `Where should you store your secrets?` with `should you` inside `<strong>`; the plain profile produces the same wording without formatting.

### Source, validation, and imports

Keep Markdown source in the existing string fields. Do not persist generated HTML, duplicate rendered values, or add a format discriminator. No database or GraphQL schema migration is required. Existing and new authored content receives the same rendering policy; source remains unchanged unless the maintainer edits it.

Preserve newlines, indentation, and significant trailing spaces through editor saves, mutations, repositories, live state, and JSON imports. Normalize CRLF to LF at the input boundary. Replace destructive trimming of these Markdown fields with separate whitespace-only validation; recognizing canonical true/false aliases can still normalize a copy of their input.

Retain the current source-length budgets: 500 characters for a question or prompt and 240 for an option label. Markdown syntax counts toward those limits. Enforce them consistently in editor feedback, API mutations, and imports, which currently bypass the mutation DTO limits. Reject oversized input with localized feedback and never truncate it. Existing stored content remains readable; increasing these budgets is a separate product decision.

The authoring and import contracts are:

- The editor and JSON import support the complete document profile, with JSON string escaping for newlines and backslashes. JSON is the lossless import path for code blocks, tables, and other multiline content.
- CSV supports inline Markdown within its current single-record-line fields. Detect and reject unsupported multiline quoted fields with guidance to use JSON, rather than splitting one field into multiple game items.
- Markdown and plain-text import retain their documented game-item grammar. Headings, answer lists, and metadata in those files describe the import structure, not an arbitrary prompt document. Preserve inline formatting within extracted fields. Reject fenced document payloads that the grammar cannot represent and direct maintainers to JSON; do not advertise these formats as lossless document imports.
- Update import examples and authoring guidance to distinguish file structure from field formatting. Extending the text or CSV grammar to support complete documents requires an explicit follow-up design and contract tests.

Formatting must not affect scoring or option identity. Continue using option/action IDs and correctness flags. Existing import correct-answer selectors retain their source-based matching; templates should prefer positional selectors when formatted labels could make text matching unclear.

### Frontend ownership and layout

Expose the formatting components and plain-text projection through the existing `UiPort` and shared presentation wrappers. Keep parser dependencies and content transformations in `infrastructure/ui/`, composed through the existing adapter. Domain entities and backend use cases store and validate source without depending on the frontend parser.

Use the profiles consistently in maintainer editors, review cards and stage rails, host question/result screens, and player question/result screens for both quiz and prediction. Include mobile and desktop branches. Shared components choose a profile for their display role rather than inferring syntax from translation keys or game type.

Full document bodies need block-capable containers. Replace wrappers that currently put the entire question inside a heading or paragraph, and retain a screen-owned accessible heading or label for the content region. Map authored heading levels below the screen's heading hierarchy. Use existing typography and theme tokens for content elements, with visibly distinct normal and strong text; adding `<strong>` inside an already-heavy heading is insufficient.

Essential prompt content must remain fully readable. Code preserves whitespace and uses contained horizontal scrolling when needed; tables use responsive overflow without widening the whole page. Compact summaries can clamp the plain projection after parsing. Answer buttons retain valid content and derive accessible names from that same projection instead of exposing raw Markdown in `aria-label`.

### Content safety

Render React elements without `dangerouslySetInnerHTML`, raw-HTML parsing, or MDX. Raw HTML stays escaped text. Code remains inert; syntax highlighting is optional presentation work, not a prerequisite for rendering code correctly.

Document links may open absolute HTTP(S) destinations through the shared external-link component, with its external-tab protections. Renderer-generated footnote links can target their own document. Other URL schemes and authored relative destinations become non-clickable label text. Inline and plain profiles never create navigable links or other controls inside answer buttons or summary actions.

Do not load arbitrary images, embeds, audio, video, or iframes from authored source. Image syntax falls back to its alt text and source URL as non-clickable text, and the editor explains that embedded media is unsupported. Adding media requires integration with Pleey's asset authorization and loading policy. This restriction concerns fetched content, not ordinary Markdown text formatting.

Task-list state is read-only. Footnote identifiers are scoped to each rendered document so simultaneous previews and repeated questions cannot create duplicate IDs; generated accessibility labels use the application's locale. Keep the policy centralized and test custom component mappings and URL handling alongside the parser.

### Authoring experience

Keep the source textarea for questions/prompts and use compact textareas for free-form options so imported line breaks survive editing, while guidance recommends inline syntax for answer labels. Add a preview using the same profile as the corresponding gameplay surface, plus concise English and French guidance covering emphasis, code, lists, tables, links, escapes, and import-format limitations. The raw editor shows syntax; the preview shows its meaning and any documented fallback.

Maintainer-authored content is not translated. Application labels, guidance, validation errors, and generated accessibility text use i18n. A future toolbar or visual editor must preserve this source and rendering contract.

### Acceptance criteria

These are requirements for implementation, not claims of completed verification:

1. The original example renders with bold emphasis and no delimiter asterisks. Italics, strikethrough, nested emphasis, inline code, escaped syntax, and unmatched delimiters follow the documented syntax in every applicable profile.
2. A multiline question containing paragraphs, a list, a table, and code renders consistently in the editor preview, host view, player view, and results. Code containing `##`, `- [x]`, `Points:`, or `**` stays literal and preserves indentation and line breaks.
3. Editor save/reopen and JSON import preserve document source, apart from newline normalization. Inline formatting survives all supported import formats. Unsupported multiline CSV and fenced text-import payloads produce explicit errors instead of corrupted items. Source-length validation agrees across editor, API, and imports.
4. Quiz and prediction free-form options render inline formatting without changing option IDs, correct-answer selection, scoring, or canonical true/false labels. Accessible answer names and compact summaries contain readable wording rather than Markdown delimiters.
5. Raw HTML, unsafe URLs, and image/embed syntax cannot execute code, create forbidden navigation, or trigger media requests. Approved document links work; answer buttons contain no nested links or interactive Markdown controls. Repeated documents have independent footnote targets and localized accessible labels.
6. Heading structure, emphasis, long code, tables, and summaries remain usable across supported themes, mobile/desktop layouts, keyboard navigation, and assistive technology. Full prompt bodies are not clamped away.

## Consequences

### Positive

- Maintainers can express rich question content using a standard syntax, including technical examples.
- Shared profiles keep quiz and prediction displays consistent while respecting their containers.
- Source remains editable and portable without tying storage to a visual editor or HTML renderer.

### Negative

- Parser dependencies, rendering profiles, plain-text projection, and safety rules require maintenance and frontend build-size review.
- Existing strings containing Markdown syntax will gain formatting. Literal syntax may require escaping; there is no automatic rewrite of stored content.
- Block content requires layout changes and preservation of whitespace beyond replacing text interpolation.
- Full document import initially requires JSON. Aligning import length validation also rejects oversized source fields that currently bypass manual-entry limits.
- The existing source-length budgets constrain larger examples; rich syntax does not imply unlimited document size.

### Follow-Up

- After agreement, implement the profiles, source preservation, consistent validation, editor previews, and shared screen integration together.
- Add focused Vitest coverage for syntax, projection, source round trips, imports, and answer identity. Verify real browser layout and accessibility for representative rich content.
- Update the relevant frontend/backend development and authoring guides when implementation lands, and link that work to this ADR.
- Select current supported stable dependencies at implementation time, record them in the frontend manifest and lockfile, and measure the production build impact.

## Supporting Evidence

Repository inspection and documentation review on 2026-10-22 informed this proposal:

- [Question entity](../../../../application/backend/src/domain/game/types/quiz/entities/quiz-question.ts), [question input validation](../../../../application/backend/src/presentation/game/types/quiz/graphql/types/quiz-inputs.ts), [editor input mapping](../../../../application/frontend/src/presentation/game/types/shared/management/playable-content-management-model.ts), and [shared import normalization](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/playable-content-import-parser.ts): string storage, source limits, and current trimming boundaries.
- [Text import parser](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/abstract-text-import-parser.ts), [Markdown import parser](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/markdown-playable-content-import-format-parser.ts), and [CSV import parser](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/csv-playable-content-import-format-parser.ts): current file grammar and multiline limitations.
- [Prompt editor](../../../../application/frontend/src/presentation/game/types/shared/management/playable-management-prompt-editor.tsx), [stage-rail helper](../../../../application/frontend/src/presentation/game/types/shared/management/stage-rail/stage-rail-helpers.ts), and [UI port](../../../../application/frontend/src/application/shared/ports/ui.port.tsx): editing, truncation, and abstraction points.
- [Official react-markdown documentation](https://github.com/remarkjs/react-markdown#readme) and [security guidance](https://github.com/remarkjs/react-markdown#security): React-element rendering, component mappings, filtering, and custom-policy risks. [Official remark-gfm documentation](https://github.com/remarkjs/remark-gfm#readme): tables, strikethrough, autolinks, task lists, and footnotes. Reviewed directly and through Context7; these capabilities inform the proposal and do not establish that its application-specific contracts have been implemented or tested.
