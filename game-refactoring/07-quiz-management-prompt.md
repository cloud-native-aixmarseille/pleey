# KISS Quiz Editor UI Prompt & Dev Agent Instructions

Use this Markdown file as a complete prompt for redesigning a **Quiz Editor UI** into a simpler, cleaner, lower-information-density interface.

The goal is to keep the dark premium visual identity while removing unnecessary visible complexity.

---

## 1. Master Prompt

You are a senior Product Designer, UX Strategist, Design System Architect, and modern Frontend expert.

Redesign the current Quiz Editor interface using a **KISS approach**: keep it simple, focused, readable, efficient, and easy to operate.

The current UI has a strong dark futuristic/game-like identity, but it shows too much information at once. The redesigned UI should preserve the premium dark style while reducing clutter and focusing the user on the core task:

> Create questions, configure answers, save the quiz, preview it, and publish safely.

The UI should feel like a clean, modern SaaS quiz builder, not an operations dashboard.

---

## 2. Product Context

The product is a **quiz management interface** used by admins, editors, operators, moderators, and content managers.

Users need to:

- Create quizzes
- Add and edit questions
- Configure answer options
- Select correct answers
- Set time limits and points
- Preview the participant experience
- Check readiness
- Publish safely

The interface should prioritize:

- Speed
- Clarity
- Confidence
- Low cognitive load
- Maintainability
- Accessibility
- Responsive behavior

---

## 3. Core UX Goal

The main screen should focus only on question editing.

Do **not** show all secondary operational information permanently.

The main screen should answer only these questions:

1. What quiz am I editing?
2. Which question am I editing?
3. What answers are available?
4. Which answer is correct?
5. What is missing?
6. What can I do next?

---

## 4. KISS UI Rules

Follow these principles strictly:

- One primary action per area
- One visible workflow at a time
- Hide rare actions behind menus
- Hide advanced settings behind disclosure
- Move preview into a drawer or modal
- Move publishing checks into the publish flow or Review tab
- Move audit/history into the More menu
- Avoid permanent side panels for secondary information
- Avoid repeated validation messages
- Avoid metrics unless they directly help the current task
- Prefer plain language over percentages
- Prefer “3 issues before publishing” over “75% ready”
- Prefer useful empty states over explanatory cards
- Use progressive disclosure for advanced options
- Keep the UI visually distinctive but calm

---

## 5. Simplified Information Architecture

Use only three main tabs:

```text
Setup / Questions / Review
```

### Setup

Contains:

- Quiz title
- Description
- Duration
- Passing score
- Rewards or visibility if needed

### Questions

Contains:

- Question list
- Question editor
- Answer options
- Correct answer selector
- Time limit
- Points
- Advanced settings disclosure

### Review

Contains:

- Quiz preview
- Publish readiness blockers
- Final publish summary
- Publish confirmation

---

## 6. Required Layout

Create a clean **two-column desktop layout**.

Do not use a permanent third column for preview, tips, readiness, audit trail, or lifecycle information.

```text
┌──────────────────────────────────────────────────────────────┐
│ General Knowledge Quiz                    Saved just now     │
│ Back                                      Preview   Publish   │
├──────────────────────────────────────────────────────────────┤
│ Setup              Questions              Review             │
├───────────────────────┬──────────────────────────────────────┤
│ Questions             │ Edit question                        │
│ + Add question        │                                      │
│                       │ Question                             │
│ 1. Capital of France  │ [ What is the capital of France? ]   │
│    10 pts · Ready     │                                      │
│                       │ Answers                              │
│ 2. Red planet         │ [ Paris        ● Correct ]           │
│    10 pts · Ready     │ [ London       ○         ]           │
│                       │ [ Berlin       ○         ]           │
│ 3. 2 + 2 equals?      │ [ Madrid       ○         ]           │
│    5 pts · Ready      │ + Add answer                         │
│                       │                                      │
│                       │ Time limit        Points             │
│                       │ [ 30s ]            [ 10 ]            │
│                       │                                      │
│                       │ Advanced settings                    │
│                       │                                      │
│                       │               Preview   Save question│
└───────────────────────┴──────────────────────────────────────┘
```

---

## 7. Header Requirements

Use a minimal header.

Show:

- Quiz title
- Status line
- Save state
- Back button
- Preview button
- Publish button
- More actions menu

Example:

```text
General Knowledge Quiz
Saved just now

[Back] [Preview] [Publish] […]
```

Move these actions into the More menu:

- Edit details
- Duplicate quiz
- Activity log
- Archive quiz
- Delete quiz

Important:

- Delete must not be visible as a primary top-level action.
- Publish should be visible, but safely gated.
- Preview should be available, but not permanently visible as a side panel.
- Autosave should be a small header state, not a card.

---

## 8. Tab Navigation

Use only:

```text
Setup
Questions
Review
```

The `Questions` tab should be active.

The active tab should use a subtle purple or cyan accent and underline.

Do not show many workflow states, progress bars, percentages, or readiness counts inside the tab bar.

---

## 9. Question List

The question list should be compact and useful.

Show:

- Panel title: `Questions`
- Question count, if useful
- Button: `+ Add question`
- Question cards/items

Each question item should show only:

- Question number
- Short question text
- Compact metadata
- Status indicator

Example:

```text
1
What is the capital of France?
Multiple choice · 10 pts
Ready
```

```text
2
Which planet is known as the red planet?
Multiple choice · 10 pts
Incomplete
```

```text
3
2 + 2 equals?
Multiple choice · 5 pts
Ready
```

The selected question should be highlighted with a subtle accent border or background.

Secondary actions should be hidden until needed:

- Duplicate
- Delete
- Move
- Convert type if supported

These can live inside a small item menu or appear on hover.

Do not show:

- Analytics
- Readiness cards
- Preview
- Tips
- Lifecycle cards
- Audit information
- Dense badges
- Large metadata blocks

---

## 10. Question Editor

The editor should show only essential fields by default.

### Visible Fields

- Question text
- Answer options
- Correct answer selector
- Time limit
- Points
- Advanced settings disclosure
- Compact validation summary
- Preview action
- Save question action

### Question Field

Label:

```text
Question
```

Example value:

```text
What is the capital of France?
```

### Answer Options

Show simple answer rows:

```text
Paris       ● Correct
London      ○
Berlin      ○
Madrid      ○
```

Each answer row may include:

- Correct answer radio selector
- Text input
- Correct badge when selected
- Drag handle, if reordering is supported
- Delete icon, if more than two answers exist

Show:

```text
+ Add answer
```

Keep answer rows visually light and easy to scan.

### Rules Row

Show two compact controls:

```text
Time limit: 30 sec
Points: 10 pts
```

### Advanced Settings

Show a collapsed disclosure row:

```text
Advanced settings
```

Move the following into advanced settings:

- Question type
- Explanation
- Media
- Difficulty
- Randomize answers
- Required answer
- Internal notes
- Tags
- Visibility
- Audit metadata

---

## 11. Validation

Avoid noisy validation.

Do not repeat the same message under every field or answer.

Use a compact validation summary near the save button.

Examples:

```text
2 issues before saving:
- Add a question
- Select the correct answer
```

```text
1 issue before saving: Add at least two answer options.
```

Field-level errors should appear only after:

- Field interaction
- Blur
- Failed save
- Failed publish

Publishing blockers should appear only in the Publish modal or Review tab.

### Validation Rules

- Question text is required
- At least two answer options are required
- Exactly one correct answer is required for single-answer multiple choice
- Points must be greater than or equal to 0
- Time limit must be greater than 0 if enabled
- Empty answers are invalid
- Duplicate answer labels should trigger a warning if they create ambiguity

---

## 12. Preview Behavior

Do not show a permanent preview card.

The Preview button should open a drawer or modal.

The preview should show:

- Question text
- Answer options
- Time limit
- Points
- Participant-facing layout

If the question is incomplete, show:

```text
Complete the question to preview it.
```

The preview should hide the correct answer unless an admin/debug option is enabled.

---

## 13. Publish Behavior

Do not show permanent publishing, lifecycle, readiness, or checklist cards on the main screen.

When the user clicks Publish:

### If the quiz is incomplete

Open a readiness modal.

Example:

```text
This quiz cannot be published yet.

Setup
- Add quiz duration

Questions
- Add at least one question
- Select a correct answer for question 2

[Go to first issue]
```

### If the quiz is ready

Open a confirmation modal with a short summary:

```text
Ready to publish

12 questions
10 minutes
Passing score: 70%

[Publish quiz]
```

---

## 14. Visual Direction

Keep a dark, premium, slightly futuristic/game-like identity, but make it calmer and more professional.

Use:

- Dark navy / dark purple background
- Muted elevated surfaces
- Subtle borders
- Soft shadows
- Rounded cards
- Restrained purple or cyan accents
- Clean modern typography
- Good contrast
- Generous spacing

Avoid:

- Too many neon effects
- Decorative fonts for body text
- Excessive letter spacing
- Too many badges
- Too many panels
- Dense side cards
- Long explanatory text
- Metrics shown without purpose
- Permanent preview/readiness/tips columns

---

## 15. Suggested Design Tokens

```text
Background: #080A14
Surface: #111322
Surface elevated: #181A2A
Surface selected: #211A3A

Border: rgba(255, 255, 255, 0.10)
Border strong: rgba(255, 255, 255, 0.16)

Primary accent: #7C4DFF
Primary accent hover: #946CFF
Secondary accent: #32F5EA

Text primary: #F8F7FF
Text secondary: #B9B5C9
Text muted: #7F7A91

Success: #4ADE80
Warning: #FFBE55
Danger: #FF5C7A

Radius card: 20px
Radius input: 12px
Radius button: 12px

Spacing base: 8px
Card padding: 24px
Page padding: 32px to 48px

Button height desktop: 44px
Button height touch: 44px minimum
```

---

## 16. Image Generation Prompt

Use this prompt to generate a high-fidelity rendered UI mockup image.

```text
Create a high-fidelity rendered product UI mockup for a simplified KISS-style desktop web app screen.

Design a modern premium dark interface for a Quiz Editor management app, focused on the Questions tab. Keep a subtle game-like futuristic feel with restrained purple and cyan accents, but prioritize clarity, whitespace, readability, and clean hierarchy.

Show a single desktop screen mockup with this simplified structure:

- Minimal top header with quiz title: General Knowledge Quiz
- Small status line: Saved just now
- Header actions: Back, Preview, Publish, and a More menu
- Simple tab bar below header with only 3 tabs: Setup, Questions, Review
- Questions tab is active
- Two-column main layout only

Left column:
- Compact question list panel
- Title: Questions
- Small question count badge
- + Add question button
- 5 or 6 compact question items
- Selected question highlighted
- Each item shows only:
  - question number
  - short question text
  - metadata: Multiple choice · points
  - small Ready or Incomplete status indicator

Example question items:
- What is the capital of France? — Multiple choice · 10 pts — Ready
- Which planet is known as the red planet? — Multiple choice · 10 pts — Ready
- 2 + 2 equals? — Multiple choice · 5 pts — Ready
- Who wrote Romeo and Juliet? — Multiple choice · 10 pts — Ready
- The chemical symbol for water? — Multiple choice · 5 pts — Incomplete
- Which is the largest ocean? — Multiple choice · 10 pts — Ready

Right column:
- Clean question editor card
- Title: Edit question
- Question field with: What is the capital of France?
- Answer options section with four input rows:
  - Paris marked as Correct
  - London
  - Berlin
  - Madrid
- Subtle + Add answer control
- Compact row:
  - Time limit = 30 sec
  - Points = 10 pts
- Collapsed disclosure row labeled Advanced settings
- Compact save state near bottom: All changes saved
- Secondary button: Preview
- Primary button: Save question

Important KISS rules:
- No permanent right preview panel
- No permanent quiz readiness panel
- No tips card
- No lifecycle card
- No audit trail card
- No metrics dashboard
- No dense text blocks
- No decorative gaming font for body copy
- Fewer borders, fewer badges, and generous spacing
- One clear primary action per area

Visual direction:
- Dark background with elegant surfaces
- Muted dark navy and purple surfaces
- Purple accent used for active tab, selected question, and primary button
- Cyan accent may be used lightly for focus or saved state
- Rounded cards
- Subtle borders
- Soft shadows
- Crisp, legible modern UI typography
- Looks like a polished real SaaS UI mockup
- Full UI design, straight-on, no device frame, no people, no extraneous decoration
```

---

## 17. Dev Agent Instructions

Refactor the Quiz Editor UI using a KISS approach.

### Goal

Reduce visible information density and make the quiz editor focused, calm, fast, and easy to use.

The main screen should focus only on editing questions. Preview, readiness, audit trail, tips, and publishing checks should not be permanently visible.

---

### 17.1 Layout

Replace the current dense editor layout with a simple two-column layout.

Desktop:

- Full-width header
- Simple tab navigation
- Left column: question list
- Right/main column: question editor

Remove the permanent right-side preview/readiness/tips panel.

Tablet:

- Question list can collapse into a drawer
- Editor remains the main focus

Mobile:

- Single-column layout
- Question list appears above the editor or inside a selector

---

### 17.2 Header

Use a minimal header:

- Quiz title
- Status: Ready / Live / Closed
- Save state: Saving / Saved / Save failed
- Back button
- Preview button
- Publish button
- More actions menu

Example:

```text
General Knowledge Quiz
Saved just now

[Back] [Preview] [Publish] […]
```

Move these actions into the More menu:

- Edit details
- Duplicate quiz
- Activity log
- Archive quiz
- Delete quiz

Delete must not be visible as a primary action.

---

### 17.3 Navigation

Use only three tabs:

- Setup
- Questions
- Review

Setup includes:

- Quiz title
- Description
- Duration
- Passing score
- Rewards or visibility if needed

Questions includes:

- Question list
- Question editor

Review includes:

- Preview
- Readiness blockers
- Publish summary

---

### 17.4 Question List

Keep the question list minimal.

Header:

- Title: Questions
- Add question button
- Optional question count

Each question item should show only:

- Question number
- Short question text
- Metadata: question type, points
- Status: Ready / Incomplete

Do not show analytics, readiness, preview, tips, lifecycle, or audit information in the question list.

Show secondary actions only on hover or in a compact item menu:

- Duplicate
- Delete
- Move
- Convert type if supported

---

### 17.5 Question Editor

Show only essential fields by default:

- Question text
- Answer options
- Correct answer selector
- Time limit
- Points
- Advanced settings disclosure
- Save question button

For multiple-choice questions:

- Start with four answer options if that is the product default
- Allow adding answers
- Allow removing answers, but never below two
- Allow selecting exactly one correct answer
- Allow reordering answers only when there are more than two

Move these fields into Advanced settings:

- Question type
- Explanation
- Media
- Difficulty
- Randomize answers
- Required answer
- Internal notes
- Tags

---

### 17.6 Preview

Remove the permanent preview card.

The Preview button should open a drawer or modal.

The preview should show:

- Question text
- Answer options
- Time limit
- Points

If the question is incomplete, show:

```text
Complete the question to preview it.
```

---

### 17.7 Publishing

Remove permanent readiness cards from the main screen.

When the user clicks Publish:

- If the quiz is incomplete, open a readiness modal
- Show only blocking issues
- Group issues by tab: Setup, Questions, Review
- Provide direct links to fix each issue

If the quiz is ready:

- Open a confirmation modal
- Show a short publish summary
- Confirm publish

---

### 17.8 Autosave

Replace autosave cards with a small header state:

- Saving…
- Saved just now
- Save failed — retry

Do not show autosave explanations on the main screen.

---

### 17.9 Visual Simplification

Keep the dark premium game-like identity, but reduce visual noise.

Rules:

- Fewer panels
- Fewer borders
- Fewer badges
- Less neon
- Less letter spacing
- Larger readable labels
- More whitespace
- One primary button per area
- Clear active tab state
- Clear selected question state

Use accent color only for:

- Primary action
- Active tab
- Focus ring
- Selected question
- Ready status

---

### 17.10 Validation

Do not repeat the same validation message under every answer.

Show:

- Field errors only after interaction
- One compact validation summary near the save button
- Publish blockers only in the publish modal or Review tab

Validation rules:

- Question text is required
- At least two answers are required
- One correct answer is required
- Points must be greater than or equal to 0
- Time limit must be greater than 0 if enabled

---

### 17.11 Components

Create or keep only these core components:

- QuizEditorPage
- PageHeader
- SimpleTabs
- QuestionList
- QuestionListItem
- QuestionEditor
- AnswerOptionList
- AnswerOptionInput
- CorrectAnswerSelector
- AdvancedSettingsDisclosure
- PreviewDrawer
- PublishModal
- ActivityLogDrawer
- MoreActionsMenu
- EmptyState
- InlineValidationSummary

Remove or hide from the main screen:

- PermanentPreviewCard
- PermanentReadinessPanel
- TipsCard
- LifecycleCard
- AutosaveCard
- PublishingCard
- AuditTrailCard
- MetricStatCards

---

### 17.12 Code Quality

Follow clean architecture principles:

- Keep domain validation separate from UI components
- Keep API calls in services or repositories
- Keep components small and focused
- Prefer composition over large conditional components
- Use type-safe models
- Avoid duplicated validation rules
- Avoid duplicated status mapping
- Avoid magic strings
- Keep components testable

Recommended domain concepts:

- Quiz
- QuizQuestion
- AnswerOption
- QuestionType
- QuizStatus
- ValidationIssue
- PublishBlocker
- AuditEvent

Create pure functions:

- validateQuiz(quiz)
- validateQuizQuestion(question)
- canPublishQuiz(quiz)
- getQuizPublishBlockers(quiz)

These functions must be unit tested.

---

### 17.13 Accessibility

Implement:

- Semantic headings
- Proper label/input associations
- Keyboard navigation
- Visible focus states
- Accessible menu interactions
- Accessible dialogs
- Error messages linked to fields
- Sufficient color contrast
- Reduced motion support
- No information communicated by color alone

---

### 17.14 Acceptance Criteria

The redesign is complete when:

- The main screen feels focused and calm
- The permanent right-side information stack is removed
- The user can edit questions without distraction
- Preview is available but not permanently visible
- Publish readiness is handled in the publish flow or Review tab
- Advanced fields are hidden by default
- Delete is moved into the More menu
- The UI works on desktop, tablet, and mobile
- Validation is compact and not repeated
- The interface remains dark, modern, and distinctive
- Components are reusable and testable
- The interface is keyboard accessible
- Domain validation is separated from presentation logic

---

## 18. Final Experience Target

The KISS version should feel less like:

```text
A quiz operations dashboard with too much visible information.
```

And more like:

```text
A clean quiz question builder with preview and publishing available when needed.
```
