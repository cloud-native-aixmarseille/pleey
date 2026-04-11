# KISS UI Redesign Prompt

## Prediction Game Management Interface

Use this prompt to generate or guide a simplified, modern, low-density UI redesign for a quiz and prediction game management interface.

---

## Master Prompt

You are a senior Product Designer, UX Strategist, Design System Architect, and modern Frontend expert.

Redesign the current prediction game management interface using a **KISS approach**: keep it simple, focused, readable, and efficient.

The current UI has a strong dark futuristic/game-like identity, but it shows too much information at once. The goal is to keep the premium dark visual style while dramatically reducing visible complexity.

The redesigned UI should feel like a clean, modern, professional SaaS builder for managing prediction games.

---

## Product Context

The product is a **quiz and prediction game management platform** used by admins, editors, operators, moderators, and marketing teams.

Users need to:

- Create prediction games
- Add prediction prompts
- Configure outcomes
- Set time limits and points
- Preview the participant experience
- Check readiness
- Publish safely

The interface should prioritize speed, clarity, confidence, and ease of use.

---

## Core UX Goal

The UI should focus on one main job:

> Create and edit prediction prompts, then preview and publish.

Do not turn the page into a full operations cockpit.

Avoid showing lifecycle explanations, audit trails, live operation cards, readiness dashboards, metrics, and dense side panels on the main screen.

The main editor should answer only these questions:

1. What game am I editing?
2. What tab am I in?
3. What prompt am I editing?
4. What is missing?
5. What can I do next?

---

## KISS UI Rules

Follow these principles strictly:

- One primary action per area
- One visible workflow at a time
- Hide rare actions behind menus
- Hide advanced settings behind disclosure
- Move preview into a drawer or modal
- Move publishing checks into the publish flow
- Move audit/history into a menu
- Avoid permanent side panels for secondary information
- Avoid repeated validation messages
- Avoid metrics unless they directly help the current task
- Prefer plain language over percentages
- Prefer “3 issues before publishing” over “17% ready”
- Prefer useful empty states over explanatory cards
- Use progressive disclosure for advanced options

---

## Information Architecture

Use only three main tabs:

```text
Setup / Prompts / Review
```

### Setup

Contains:

- Game name
- Description
- Schedule
- Rewards

### Prompts

Contains:

- Prompt list
- Prompt editor
- Outcome options
- Time limit
- Points
- Advanced settings disclosure

### Review

Contains:

- Publish readiness
- Participant preview
- Final summary
- Publish confirmation

---

## Required Layout

Create a clean two-column desktop layout.

```text
┌──────────────────────────────────────────────────────────────┐
│ Championship Finals Predictor              Saved just now    │
│ Back                                      Preview   Publish   │
├──────────────────────────────────────────────────────────────┤
│ Setup                    Prompts                    Review    │
├───────────────────────┬──────────────────────────────────────┤
│ Prompts               │ Edit prompt                         │
│ + Add prompt          │                                      │
│                       │ Prompt                               │
│ Match outcome         │ [ What will happen?              ]   │
│ 20s · 1000 pts        │                                      │
│ Ready                 │ Outcomes                             │
│                       │ [ Home team wins                 ]   │
│ Exact score           │ [ Away team wins                 ]   │
│ 30s · 1500 pts        │ + Add outcome                        │
│ Incomplete            │                                      │
│                       │ Time limit        Points             │
│ MVP prediction        │ [ 20s ]            [ 1000 ]          │
│ 20s · 800 pts         │                                      │
│ Ready                 │ Advanced settings                    │
│                       │                                      │
│                       │ 1 issue before saving                │
│                       │                                      │
│                       │               Preview   Save prompt  │
└───────────────────────┴──────────────────────────────────────┘
```

---

## Header Requirements

Use a minimal header.

Show:

- Game title: `Championship Finals Predictor`
- Status line: `Saved just now`
- Back button
- Preview button
- Publish button
- More actions menu

Example:

```text
Championship Finals Predictor
Saved just now

[Back] [Preview] [Publish] […]
```

Move these actions into the More menu:

- Edit details
- Duplicate
- Activity log
- Archive
- Delete

Delete must not be visible as a primary top-level action.

---

## Tab Navigation

Use only:

```text
Setup
Prompts
Review
```

The `Prompts` tab should be active.

The active tab should use a subtle cyan accent and underline.

Do not show many workflow states or percentages inside the tab bar.

---

## Prompt List

The prompt list should be compact and useful.

Show:

- Panel title: `Prompts`
- Button: `+ Add prompt`
- Prompt cards

Each prompt item should show only:

- Short title
- Compact metadata
- Status badge

Example prompt items:

```text
Match outcome
20s · 1000 pts
Ready
```

```text
Exact score
30s · 1500 pts
Incomplete
```

```text
MVP prediction
20s · 800 pts
Ready
```

The selected prompt should be highlighted with a subtle cyan border/glow.

Do not show analytics, reward pool, runtime, readiness, lifecycle, or audit information in the prompt list.

---

## Prompt Editor

The editor should show only essential fields by default.

### Visible Fields

- Prompt
- Outcome options
- Time limit
- Points
- Advanced settings disclosure
- Compact validation summary
- Preview action
- Save prompt action

### Prompt Field

Label:

```text
Prompt
```

Example value:

```text
What will be the final outcome of the match?
```

### Outcomes Section

Show two outcome inputs:

```text
Home team wins
Away team wins
```

Also show:

```text
+ Add outcome
```

Outcome rows may include:

- Drag handle
- Text input
- Delete icon

Keep this visually light and clean.

### Rules Row

Show two compact controls:

```text
Time limit: 20s
Points: 1000
```

### Advanced Settings

Show a collapsed disclosure row:

```text
Advanced settings
```

Move the following into advanced settings:

- Winning outcome
- Randomization
- Manual settlement
- Tie-breaking
- Internal notes
- Visibility
- Audit metadata

---

## Validation

Do not repeat the same validation message under every field.

Use a compact validation summary near the save button.

Example:

```text
1 issue before saving: Add one more outcome or keep 2 outcomes minimum.
```

Field-level errors should appear only after the user interacts with the field or tries to submit.

Publishing blockers should appear only in the Publish modal or Review tab.

---

## Preview Behavior

Do not show a permanent participant preview card.

The Preview button should open a drawer or modal.

The preview drawer should show:

- Prompt
- Outcomes
- Time limit
- Points

If the prompt is incomplete, show:

```text
Complete the prompt to preview it.
```

---

## Publish Behavior

Do not show permanent publishing, lifecycle, or readiness cards.

When the user clicks Publish:

### If the game is incomplete

Open a readiness modal.

Example:

```text
This game cannot be published yet.

Setup
- Add a schedule

Prompts
- Add at least one prompt
- Add at least two outcomes

[Go to first issue]
```

### If the game is ready

Open a confirmation modal with a short summary:

- Number of prompts
- Schedule
- Scoring
- Rewards
- Visibility

Then ask the user to confirm publishing.

---

## Visual Direction

Keep a dark, premium, slightly futuristic/game-like identity, but make it calmer and more professional.

Use:

- Dark navy / dark purple background
- Muted elevated surfaces
- Subtle borders
- Soft shadows
- Rounded cards
- Restrained cyan accents
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

---

## Suggested Design Tokens

```text
Background: #080511
Surface: #11101C
Surface elevated: #191827
Surface selected: #112A33

Border: rgba(255, 255, 255, 0.10)
Border strong: rgba(255, 255, 255, 0.16)

Primary accent: #32F5EA
Primary accent hover: #5EFDF5

Text primary: #F8F7FF
Text secondary: #B9B5C9
Text muted: #7F7A91

Success: #65D46E
Warning: #FFBE55
Danger: #FF5C7A

Radius card: 20px
Radius input: 12px
Radius button: 12px

Spacing base: 8px
Card padding: 24px
Page padding: 48px
```

---

## Image Generation Prompt

Use the following if generating a rendered UI mockup image:

```text
Create a high-fidelity rendered product UI mockup for a simplified KISS-style desktop web app screen.

Design a modern premium dark interface for a Prediction Game management app, focused on the Prompts tab. Keep a subtle game-like futuristic feel with restrained neon cyan accents, but prioritize clarity, whitespace, readability, and clean hierarchy.

Show a single desktop screen mockup with this simplified structure:

- Minimal top header with product page title: Championship Finals Predictor
- Small status line: Saved just now
- Right-side header actions: Back, Preview, Publish, and a More menu
- Simple tab bar below header with only 3 tabs: Setup, Prompts, Review
- Prompts is active
- Two-column main layout only

Left column:
- Compact prompt list panel
- Title: Prompts
- Small + Add prompt button
- 2 or 3 simple prompt items
- Selected prompt highlighted
- Each item shows only a short prompt title, compact metadata, and status badge

Prompt items:
- Match outcome — 20s · 1000 pts — Ready
- Exact score — 30s · 1500 pts — Incomplete
- MVP prediction — 20s · 800 pts — Ready

Right column:
- Clean prompt editor card
- Title: Edit prompt
- Prompt field with: What will be the final outcome of the match?
- Outcomes section with two input rows:
  - Home team wins
  - Away team wins
- Subtle + Add outcome control
- Compact row:
  - Time limit = 20s
  - Points = 1000
- Collapsed disclosure row labeled Advanced settings
- Compact validation summary near the bottom:
  1 issue before saving: Add one more outcome or keep 2 outcomes minimum.
- Secondary button: Preview
- Primary button: Save prompt

Important KISS rules:
- No permanent right inspector panel
- No stacked side cards for lifecycle, autosave, readiness, live operations, participant preview, or audit trail
- No cluttered metrics dashboard
- No dense text blocks
- No decorative gaming font for body copy
- Fewer borders, fewer badges, and generous spacing
- One clear primary action per area

Visual direction:
- Dark background with elegant surfaces
- Muted purple/dark charcoal surfaces
- Cyan accent used sparingly for active tab, focus, and primary action
- Rounded cards
- Subtle borders
- Soft shadows
- Crisp, legible modern UI typography
- Looks like a polished real SaaS UI mockup
- Full UI design, straight-on, no device frame, no people, no extraneous decoration
```

---

## Dev Agent Instructions

Refactor the Prediction Game Builder UI using a KISS approach.

### Goal

Reduce visible information density and make the page focused, calm, and easy to use.

Do not show every operational concept on the main screen. The main screen should focus on creating and editing prompts.

---

### 1. Layout

Replace the current 3-column cockpit layout with a simpler 2-column layout.

Desktop:

- Full-width header
- Simple tab navigation
- Left column: prompt list
- Main column: prompt editor

Remove the permanent right inspector panel.

Tablet:

- Prompt list can collapse into a drawer
- Editor remains the main focus

Mobile:

- Single-column layout
- Prompt list appears above the editor or inside a selector

---

### 2. Header

Use a minimal header:

- Game title
- Status: Ready / Scheduled / Live / Closed
- Save state: Saving / Saved / Save failed
- Back button
- Preview button
- Publish button
- More actions menu

Move these actions into the More menu:

- Edit details
- Duplicate
- Activity log
- Archive
- Delete

Delete must not be visible as a primary action.

---

### 3. Navigation

Replace the complex workflow with only three tabs:

- Setup
- Prompts
- Review

Setup includes:

- Game name
- Description
- Schedule
- Rewards

Prompts includes:

- Prompt list
- Prompt editor

Review includes:

- Publish readiness
- Participant preview
- Final summary

---

### 4. Prompt List

Keep the prompt list minimal.

Empty state:

```text
No prompts yet
Add your first prediction prompt.
```

CTA:

```text
Add prompt
```

When prompts exist, each item should show only:

- Prompt short title
- Status: Ready / Incomplete
- Optional metadata: points and time limit

Do not show analytics, reward pool, runtime, readiness, lifecycle, or audit information in the prompt list.

---

### 5. Prompt Editor

Show only essential fields by default:

- Prompt
- Outcome options
- Time limit
- Points
- Create / Save button

Start with two outcome inputs.

Provide:

- Add outcome
- Remove outcome
- Reorder outcomes only when there are more than two

Move the following fields into an Advanced settings disclosure:

- Winning outcome
- Randomization
- Manual settlement
- Tie-breaking
- Internal notes
- Visibility
- Audit metadata

---

### 6. Preview

Remove the permanent participant preview card.

The Preview button should open a drawer or modal.

The preview drawer should show:

- Prompt
- Outcomes
- Time limit
- Points

If the prompt is incomplete, show:

```text
Complete the prompt to preview it.
```

---

### 7. Publishing

Remove permanent publishing, lifecycle, and readiness cards.

When the user clicks Publish:

- If the game is incomplete, open a readiness modal
- Show only blocking issues
- Group issues by tab: Setup, Prompts, Review
- Provide direct links to fix each issue

If the game is ready:

- Open confirmation modal
- Show a short publish summary
- Confirm publish

---

### 8. Readiness

Do not show readiness percentage on the main page.

Instead show human-readable status:

- Ready to publish
- 3 issues before publishing
- Published
- Live
- Closed

Use readiness percentage only internally or in the Review tab if needed.

---

### 9. Autosave

Replace the autosave card with a small header state:

- Saving…
- Saved just now
- Save failed — retry

Do not show autosave explanations on the main screen.

---

### 10. Audit Trail

Remove audit trail from the main screen.

Access it from:

```text
More → Activity log
```

The activity log can open in a drawer.

---

### 11. Visual Simplification

Keep the dark game-like identity, but reduce noise.

Rules:

- Fewer cards
- Fewer borders
- Fewer badges
- Less neon
- Less letter spacing
- Larger readable labels
- More whitespace
- Clearer button hierarchy
- One primary button per area

Use neon accents only for:

- Primary action
- Active tab
- Focus ring
- Ready status

---

### 12. Validation

Do not repeat the same validation message under every field.

Show:

- Field errors only after field interaction
- One compact validation summary near the save button
- Publish blockers only in the publish modal or Review tab

---

### 13. Components

Create or keep only these core components:

- PageHeader
- SimpleTabs
- PromptList
- PromptListItem
- PromptEditor
- OutcomeInputList
- AdvancedSettingsDisclosure
- PreviewDrawer
- PublishModal
- ActivityLogDrawer
- MoreActionsMenu
- EmptyState
- InlineValidationSummary

Remove or hide from the main screen:

- LifecycleCard
- AutosaveCard
- PublishingCard
- LiveOperationsCard
- PermanentReadinessPanel
- PermanentParticipantPreviewCard
- PermanentAuditTrailCard
- MetricStatCards

---

### 14. Code Quality

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

- PredictionGame
- PredictionPrompt
- OutcomeOption
- GameStatus
- ValidationIssue
- PublishBlocker
- AuditEvent

Create pure functions:

- validatePredictionGame(game)
- validatePredictionPrompt(prompt)
- canPublish(game)
- getPublishBlockers(game)

These functions should be unit tested.

---

### 15. Accessibility

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

### 16. Acceptance Criteria

The UI is successful when:

- The main screen feels focused and calm
- A first-time operator immediately understands what to do
- Only one primary action is visible in the editor
- Advanced or rare information is hidden until requested
- Publishing checks happen inside the publish flow
- Preview is available but not permanently visible
- Audit trail is available but not permanently visible
- The page works well on mobile and desktop
- The UI remains visually distinctive without overwhelming the user
- Validation logic is testable and not duplicated
- The interface is keyboard accessible
