# ADR 0025: Mix slides and questions in quizzes

- Status: Proposed
- Proposed date: 2026-11-17
- Accepted date: N/A

## Context

[Issue #335](https://github.com/cloud-native-aixmarseille/pleey/issues/335) asks to host training sessions in Pleey with slides and occasional questions. It suggests either a new game mode or a theme, depending on simplicity. An earlier issue comment says to use quizzes because the request was unclear. The issue is currently open; neither that discussion nor its `themes` label establishes an agreed content model.

The proposed user journey is a trainer authoring one ordered sequence, for example introduction slide, explanation slide, quiz question, recap slide. The trainer presents it through the existing party, and participants answer questions through the existing join flow. Host-led delivery and the initial text-only slide scope below are proposal assumptions to confirm during ADR review, not requirements established by the issue.

At the inspected revision, quiz questions own their positions and become party stages. The shared stage contract expects actions, points, and a time limit. Host progression requires a result phase before advancing. Themes change visual tokens, as established by [ADR 0012](./0012-manage-themes-as-data-driven-token-themes.md); they do not define content or session behavior. An empty-answer or zero-point question therefore cannot provide a slide merely through styling.

## Decision Drivers

- Keep teaching content and questions together in the trainer's intended order.
- Reuse quiz authoring, party ownership, joining, host controls, and realtime delivery.
- Make slides explicitly noninteractive and unscored, with server-enforced behavior.
- Preserve existing question identity, answer validation, scoring, and question-only games.
- Keep the first delivery small without turning Pleey into a presentation editor or learning management system.
- Make authoring, host display, and participant display readable, accessible, and consistent with existing themes.

## Considered Options

### Option 1: A training theme over existing questions

Style questions to resemble slides and hide answer controls. This reuses the most UI, but cannot express slide content, reject submissions by content kind, or bypass the result phase. It would put gameplay rules in presentation code and weaken question validation. Reject this as the feature model; existing themes still style slides.

### Option 2: A separate training game type

Register a training game with its own content provider and management flow. This offers a separate product identity, but must still solve mixed-stage progression and reuse or duplicate quiz question behavior. The issue identifies no different question rules, ownership, or participant lifecycle that justifies another game type.

### Option 3: An ordered sequence of typed quiz content items

Extend quizzes to contain question and slide items. Keep question-specific data and validation, and teach the shared runtime that a stage can present content without accepting actions. This requires a content migration and changes across authoring and runtime, but keeps one game and party model and makes the distinction explicit.

### Option 4: Present an external deck alongside Pleey

Keep using a separate presentation tool and switch to Pleey for questions. This requires no application change and remains a practical workaround. It does not provide one authored sequence or synchronize slide display with participants in Pleey.

## Decision

Propose option 3. Keep `Game.type = quiz` and introduce a quiz-owned sequence of question and slide items. A slide is a content kind, not a new quiz answer type, a theme, or a separate game mode. Reuse the existing party lifecycle and transport boundaries from [ADR 0004](./0004-use-graphql-for-primary-api-and-socketio-for-realtime.md).

### Content and authoring

- Introduce a common quiz item identity, quiz ownership, position, and `question` or `slide` kind. Store ordering once for the whole sequence. Retain the existing question and answer payloads behind question items; slide items have their own title and body payload. Do not add slides to `QuizQuestionType` or weaken the requirement for valid question answers.
- A question item keeps its question ID as the runtime stage ID. Slides receive stable IDs from the same item identity space. Enforce exactly one payload matching the kind and prevent references to content from another quiz.
- Persist sequence edits atomically, with unique positions within a quiz and deterministic ordering. Creation, deletion, reordering, and question import all use this sequence. Question-only lists and counts, where still needed, are projections rather than a second source of ordering.
- Extend the existing management stage rail with explicit question and slide entries. Trainers can add, edit, reorder, remove, and preview a slide in context. A slide editor has no answer, correctness, points, or timer fields. Changing an existing question into a slide is outside the initial scope; authors add the intended item kind explicitly.
- Start with a plain-text title and multiline plain-text body, requiring at least one nonblank field. Proposed starting limits are 160 characters for the title and 5,000 for the body, enforced server-side and reflected in the editor. These are bounded starting values to review against representative training material. Preserve line breaks and literal punctuation, escape content during rendering, and reject excess content instead of truncating it.
- Show the current slide text on the host display and on joined participants' devices, including guests. Use the same content renderer for editor preview and live display, with layouts appropriate to each surface. Keep full content available on small screens, use semantic headings, and provide keyboard-operable authoring and host controls through the existing design system. Application labels and errors follow the repository's i18n rules; authored text is preserved as supplied.

Rich formatting is a separate proposal in [PR #534](https://github.com/cloud-native-aixmarseille/pleey/pull/534), not an accepted dependency. This ADR does not reinterpret stored text as Markdown or select an editor/parser library. Images, audio, video, embedded websites, PDF/PowerPoint import, speaker notes, self-paced navigation, and learning progress tracking are outside the initial scope. Adding slide media later requires an explicit audience decision: [ADR 0018](./0018-support-media-on-quiz-questions.md) currently restricts question media grants to editors and hosts, whereas this proposal shares slide text with joined participants.

### Runtime and host controls

Carry an explicit stage kind through the catalog, persisted runtime context, observations, and frontend models. Use discriminated interactive and presentation variants: quiz questions and prediction prompts map to the interactive variant; slides map to the presentation variant. Shared party policies depend on this contract rather than importing quiz entities. Missing answers must never be used to infer a slide.

Keep the existing `stage` lifecycle phase for both variants. Presentation stages have no actions, scoring configuration, reading period, answering deadline, or submission/result payload. Do not fabricate question data to satisfy the old shape. The server rejects action submissions and result-reveal commands on slides, even if a client bypasses hidden controls.

| Operation | Behavior with slides |
| --- | --- |
| Start | Load the first item, whether question or slide, using existing party start prerequisites. An empty sequence cannot start. |
| Advance | A slide advances directly to the next item on a host command. Questions retain their result-before-advance rule. Consecutive slides are supported. |
| Final item | Advancing from the last slide ends the party without a synthetic result. Existing question scores remain available; a sequence containing only slides has no scored results. |
| Pause/resume | Retain the current slide and party status without creating a timer. Navigation while paused follows existing host policy; entering a question while paused keeps its timers paused. |
| Restart stage | Unavailable on a slide, which has no timed attempt to restart. Question restart behavior is unchanged. |
| Rewind | Return to the preceding item. Preserve the existing replay rule: discard question attempts and points at or after the destination position, including questions following a slide destination. Explain this effect in the host control. |
| Reconnect/late join | Rebuild the current kind, identity, position, and content from server state. Late joining still follows party settings. No local timer or local slide index determines progression. |

Slides create no answer history, correct/incorrect outcome, missed-answer entry, or score delta. Navigation progress counts all items; question statistics and scoring denominators count questions only. Clearing question attempts during rewind is a replay effect, not slide scoring. The reading-time behavior from [ADR 0019](./0019-separate-question-reading-from-answering-time.md) applies only to interactive stages, and [ADR 0017](./0017-reward-action-quality-before-speed-in-game-scoring.md) continues to govern question scores.

Reuse current host ownership checks and same-party observation authorization. Slide content is sent through the existing authorized runtime observation, not through a new public deck endpoint. Players cannot advance slides, and stale question submissions arriving after a slide transition are rejected without changing progress or scores.

### Ordering and settings

A quiz containing any slide always uses its authored sequence. The server suppresses effective `randomizeStageOrder` for that quiz, including when inherited from project or organization defaults. The launch/settings UI disables the control with a localized explanation; stored defaults are not rewritten. Question-only quizzes and prediction games retain their current behavior. Answer randomization remains independent and retains the true/false exception in [ADR 0021](./0021-preserve-true-false-answer-order.md).

Enforce the same ordering in first, next, previous, by-ID, and list catalog reads. Do not shuffle only the questions between fixed slides: that can detach a question from the preceding explanation. No training-specific settings hierarchy is introduced; continue using [party-owned settings](./0007-move-play-session-settings-to-party-owned-defaults.md).

For quizzes containing slides, reject content and sequence mutations while a referencing party is active or paused. Apply this check to all mutation paths, including question edits, removal, reordering, and insertion of the first slide, and coordinate it transactionally with party start. This deliberately avoids a live-edit or deck-versioning subsystem while preserving stable navigation and score-history positions. It does not change editing policy for question-only quizzes.

### Persistence and delivery

Add the common item storage and backfill existing questions with their current IDs, positions, ownership, and deletion state. Preserve answers, media references, stored scores, and party stage references. Move sequence ownership out of the question record; any staged migration must have a single authoritative write path rather than independently maintained positions.

Existing persisted party contexts without the new kind remain interactive when they reference existing question or prediction stages. Preserve their current timing and progress instead of resetting ongoing parties. Validate unknown or inconsistent kinds rather than guessing from empty actions. Update runtime projections, host permission calculation, and transport mappings together with the new variants.

Deliver mixed-item management and runtime support in backend and frontend before enabling slide creation. Check migration invariants and exercise existing active and ended party data before rollout. Once slides are saved, rolling back to a version that cannot represent them is unsafe; preserve the data and use a forward fix or a coordinated deployment plan. This ADR introduces no migration or runtime behavior by itself.

Existing import formats continue to create quizzes from questions, creating question items through the same ordering path. This decision adds no import into an existing mixed sequence. Importing slides or importing a presentation file requires a separately reviewed format contract and must not silently discard unsupported content.

### Implementation acceptance

These are future implementation requirements, not checks completed by this documentation change:

1. Author, save, reopen, and present a sequence containing a leading slide, consecutive slides, a question, and a trailing slide. Host and participant displays show the same current item; the question keeps its normal answer and result behavior.
2. Verify slide submission/result rejection, stale question submissions, host-only navigation, cross-party access denial, and unchanged scores while advancing through slides.
3. Cover pause/resume, rewind across both kinds, question score reset on replay, final-slide completion, a slide-only sequence, and reconnect/allowed late joining on a slide. Verify all catalog lookup paths honor authored order despite inherited randomization.
4. Verify migration preserves existing IDs, order, answers, media references, scores, and active/ended contexts. Exercise atomic reorder/import and the active-party edit guard, including races with party start, at the persistence boundary.
5. Verify preview/live text preservation, length validation, mobile readability, keyboard controls, and localized labels. Reuse existing quiz and prediction tests to protect their supported behavior; add only cases covering distinct new contracts at the cheapest reliable layer.

## Consequences

### Positive

- Trainers manage and present one ordered training sequence using existing quizzes and parties.
- Slides have explicit server-side semantics without weakening question rules or moving behavior into themes.
- Question identity and scoring survive the content-model change; existing infrastructure and UI composition remain reusable.

### Negative

- A shared runtime change is required; this is not a theme-only or frontend-only enhancement.
- Introducing common item identity/order requires a database migration and coordinated updates to management and runtime contracts.
- Mixed quizzes lose stage randomization and cannot be edited during active or paused parties.
- Text-only slides are less capable than a dedicated presentation tool. Media, formatting, and deck import remain separate decisions.

### Follow-Up

- Review the host-led journey, text-only content, participant display, and ordering/edit restrictions against a representative training session before accepting the ADR.
- After acceptance, implement issue #335 against the contracts above and link implementation work back to this record. This documentation PR does not close the feature issue.
- Update [backend development](../../development/backend/index.md), [frontend development](../../development/frontend/index.md), and affected user guidance with the delivered behavior. Record executed checks and migration evidence with the implementation.

## Supporting Evidence

Repository inspection on 2026-11-17 at [revision 437c94c5](https://github.com/cloud-native-aixmarseille/pleey/commit/437c94c5) established these implementation constraints, not product preferences:

- [Persistence schema](../../../../application/backend/prisma/schema.prisma): question-owned position, answer relations, and party/score context storage.
- [Quiz catalog provider](../../../../application/backend/src/infrastructure/game/types/quiz/quiz-party-stage-catalog-entry-resolver.ts) and [shared stage contract](../../../../application/backend/src/application/game/types/shared/ports/party-stage-catalog.port.ts): question-to-stage mapping and required interactive fields.
- [Shared catalog adapter](../../../../application/backend/src/infrastructure/game/types/prisma-party-stage-catalog.adapter.ts): party-scoped deterministic randomization across navigation paths.
- [Host lifecycle policy](../../../../application/backend/src/domain/game/party/host/services/host-party-lifecycle-policy.ts) and [runtime persistence](../../../../application/backend/src/infrastructure/game/party/prisma-host-party-runtime-control.adapter.ts): result-gated advance, timers, and position-based score resets on replay.
- [Question inputs](../../../../application/backend/src/presentation/game/types/quiz/graphql/types/quiz-inputs.ts) and [shared editor model](../../../../application/frontend/src/presentation/game/types/shared/management/playable-content-management-model.ts): existing answer, timer, and scoring assumptions in authoring.
