# ADR 0017: Support formatted game content

- Status: Proposed
- Proposed date: 2026-10-22
- Accepted date: N/A

## Context

A quiz maintainer wants to emphasize "should you" in the question "Where **should you** store your secrets?". The need is to communicate the intended meaning of the question through formatting, and for participants to see that formatting consistently. The asterisks in the supplied example express the intended emphasis; they do not establish a preferred editor or storage format.

More generally, maintainers need to author, inspect, revise, and reuse content without losing its meaning. Participants need to read that content clearly during a timed game, including on a phone or with assistive technology. The authoring experience, persistence representation, and presentation mechanism are separate design choices.

Pleey currently stores and displays question text as plain strings. Existing shared management and gameplay components offer reuse opportunities, but their heading containers, answer buttons, and compact summaries have different presentation constraints. Those constraints inform the solution rather than define the maintainer's needs.

### Capability scope to review

The emphasis example is confirmed. The following broader capabilities are proposed for review, with a purpose for each; this is not a requirement to expose a markup language's entire feature set.

| Maintainer outcome                                                      | Proposed capability                                                                           | Scope                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Draw attention to a qualification, negation, or important term          | Bold emphasis with a visible distinction from surrounding text                                | Confirmed by the example; additional styles remain a design choice.    |
| Show technical values or examples without changing their interpretation | Distinct presentation of identifiers and code, preserving significant spacing and line breaks | Proposed extension beyond emphasis.                                    |
| Make multi-part questions and comparisons easier to read                | Paragraphs, lists, and, where useful, tables                                                  | Proposed extension to validate with representative questions.          |
| Give readers useful context or a source                                 | References and links where navigation is appropriate                                          | Proposed extension requiring a deliberate gameplay interaction policy. |

The initial use case concerns quiz question bodies. Reuse for prediction prompts and free-form answer labels is a proposed extension, with field-specific acceptance criteria before inclusion. Shared components alone do not make every text field a formatting surface. Footnotes, task lists, embedded media, and other document features require their own demonstrated use cases.

## Decision Drivers

- Help maintainers express emphasis and structure without unintentionally changing the question's meaning.
- Make authoring and revision understandable to the intended maintainers; do not assume familiarity with a particular syntax.
- Preserve wording and supported formatting through save, reopen, preview, import, and gameplay.
- Keep content readable and accessible across host/player screens, mobile layouts, and supported themes.
- Protect literal technical text, existing content, answer identity, and scoring.
- Keep implementation and maintenance costs proportionate to the agreed capabilities, following the [frontend boundaries](../frontend.md#framework-abstractions) and [design system](./0003-use-an-internal-design-system-on-top-of-mantine.md).

## Considered Options

All options need shared presentation rules, safe handling of authored content, and readable summaries. Those are common responsibilities rather than benefits unique to a representation.

### Option 1: Source editor with preview, backed by Markdown

Maintainers edit lightweight markup and inspect the rendered result. Markdown would be the persisted representation, parsed by a maintained library behind the UI abstraction.

This fits the current string fields and text-oriented authoring/import paths, and keeps content inspectable outside the application. It requires maintainers to learn syntax and escaping, makes some formatting less discoverable, and can create a gap between source and preview. Existing string storage reduces integration work but does not establish that source editing is usable or that no migration is needed.

### Option 2: Visual formatting controls, backed by Markdown

Maintainers apply supported formatting through controls and edit a visual document. The editor serializes that document to Markdown for persistence and interchange.

This can make formatting discoverable while retaining a text representation. It adds editor integration and requires verified round trips between the editor's document model and the supported Markdown subset. Unsupported constructs and pasted content need explicit handling. A visual editor does not inherently require different database storage.

### Option 3: Visual formatting controls, backed by a structured document

Maintainers edit a constrained document composed of text, formatting marks, and supported blocks. Persist a versioned structured representation and derive rendered views and plain text from it.

This makes supported capabilities explicit and can offer more reliable editing as content features grow. It requires a document contract, validation, import adapters, and a transition plan for existing strings. Its costs can be justified if visual authoring or richer document behavior is central to the product. Structured content does not require storing or trusting arbitrary HTML.

## Decision

Propose option 1 as the initial implementation, subject to validating the authoring experience before acceptance. Markdown is the proposed technical solution, chosen for its fit with the current string-based model and the opportunity to introduce formatting incrementally. It is not a product requirement or a permanent constraint on future editors.

The key assumption is that the intended maintainers can comfortably author and revise the agreed content using a source editor and preview. The example alone does not validate that assumption. Review representative authoring tasks alongside option 2 before accepting this ADR. Prefer option 2 if visual controls materially improve those tasks while preserving the agreed content; reconsider option 3 if a Markdown round trip cannot represent that content reliably.

### Shared content capability

Regardless of the selected editor, use one shared capability to render supported content and derive plain text. Keep third-party editor/parser details behind the existing UI abstraction and shared presentation wrappers. Domain behavior and scoring remain independent of the renderer. `react-markdown` is a candidate adapter for option 1; library selection and any syntax extensions must follow the agreed capabilities, rather than determine them.

Distinguish full content bodies, compact labels, and plain-text summaries by their display role. Full questions must remain readable without hiding essential content. Compact labels must fit their controls; answer buttons cannot contain nested navigation or editing controls. Summaries and accessible names must retain understandable wording without authoring artifacts. Truncation operates on a derived view, never on the persisted content.

Use the design system to preserve heading hierarchy, visible emphasis, appropriate code layout, and mobile readability. Treat authored content as untrusted: formatting cannot execute code or enable unapproved navigation or media loading. The agreed content policy governs these behaviors for every representation.

### Constraints to resolve in implementation design

- **Existing content:** strings can contain literal punctuation, code, or text that resembles markup. Define how intentional formatting is distinguished from existing plain text and how any conversion is authorized. Do not assume that interpreting every stored string as Markdown preserves meaning or avoids a migration.
- **Preservation:** current editor saves and import normalization trim text. The selected representation must preserve significant whitespace and formatting through editing and delivery, including imported content. Verify editor round trips instead of assuming that a particular widget preserves source.
- **Imports:** the current Markdown/plain-text file grammars use headings and lists as item structure, and CSV processes physical lines. They cannot automatically carry arbitrary formatted documents. Compare adapting those formats with offering a structured import path, then document supported content and explicit failures. JSON-only document import is a possible implementation trade-off, not a maintainer need.
- **Validation:** current manual-entry budgets are 500 characters for questions/prompts and 240 for options; imports do not consistently enforce them. Evaluate representative content and distinguish author-visible limits from encoded-payload limits. Apply the agreed rules consistently and explain limits in the editor without silently truncating content.
- **Game behavior:** formatting must preserve option IDs, correctness flags, and canonical true/false labels. Import answer matching and scoring must not depend on a renderer's visual output.

These constraints must be resolved before implementation begins. This proposal does not select an entire GFM feature set, an import redesign, or a blanket interpretation change for existing records.

### Acceptance criteria

These describe observable outcomes and apply whichever editor and representation are accepted:

1. A maintainer can apply bold emphasis only to "should you" in the example, inspect the result, save it, and revise it. Participants see that bold emphasis without visible editing markers; the wording remains unchanged.
2. Representative examples for each agreed capability remain understandable in the editor preview, host view, player view, and results. Technical text retains meaningful spacing and literal characters.
3. Saving, reopening, and importing supported content preserve its wording and formatting. Unsupported input produces understandable feedback instead of silent loss or reinterpretation. Existing literal content retains its intended meaning.
4. Formatting does not change answer identity, correct-answer selection, or scoring. Each additional field or game type has an explicit acceptance example before the capability is enabled there.
5. Content remains usable on mobile, with keyboard navigation and assistive technology. Emphasis is perceptible, full questions remain available, and summaries and accessible names convey readable wording.
6. Authored content cannot execute scripts, create inappropriate interactions inside controls, or load unapproved external content. Validation and preview explain the supported capabilities and limits in the application's language.

## Consequences

### Positive

- The design supports meaningful formatting beyond a single bold example, with scope tied to concrete authoring needs.
- Shared rendering and summaries keep presentation consistent while allowing authoring tools to evolve.
- The proposed Markdown approach offers an incremental path within the current model if its usability assumption holds.

### Negative

- Source editing has a learning and discoverability cost; the proposed choice may change after authoring evaluation.
- Representation, import, and existing-content policies require deliberate validation even when the database can hold strings.
- Richer content adds layout, accessibility, and maintenance work that grows with the accepted capability set.

### Follow-Up

- Agree the capability set and affected fields using representative maintainer questions, including examples broader than emphasis.
- Compare source-plus-preview and visual authoring for creating, revising, pasting, and reopening those examples. Record the evidence and confirm or revise the proposed option before acceptance.
- Resolve existing-content interpretation, imports, validation budgets, and lossless editing; record the resulting contracts in this ADR before implementation.
- Select current supported libraries after the required capabilities are agreed, then implement focused behavior tests and browser accessibility/layout checks. Update user and development guidance with the delivered behavior.

## Supporting Evidence

Repository inspection and documentation review on 2026-10-22 establish current implementation constraints, not maintainer preferences:

- [Question entity](../../../../application/backend/src/domain/game/types/quiz/entities/quiz-question.ts) and [input validation](../../../../application/backend/src/presentation/game/types/quiz/graphql/types/quiz-inputs.ts): current string fields and source-length limits.
- [Prompt editor](../../../../application/frontend/src/presentation/game/types/shared/management/playable-management-prompt-editor.tsx), [editor input mapping](../../../../application/frontend/src/presentation/game/types/shared/management/playable-content-management-model.ts), and [stage-rail helper](../../../../application/frontend/src/presentation/game/types/shared/management/stage-rail/stage-rail-helpers.ts): existing authoring, trimming, and truncation behavior.
- [Shared import normalization](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/playable-content-import-parser.ts), [text import parser](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/abstract-text-import-parser.ts), and [CSV import parser](../../../../application/backend/src/application/game/types/shared/services/playable-content-import/csv-playable-content-import-format-parser.ts): preservation and file-grammar constraints.
- [Official react-markdown documentation](https://github.com/remarkjs/react-markdown#readme) and [security guidance](https://github.com/remarkjs/react-markdown#security), previously checked directly and through Context7: feasibility of a React adapter for option 1. This does not establish that Markdown is the best authoring experience or that the proposed application policy has been tested.
