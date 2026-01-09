---
sidebar_position: 6
---

# Accessibility Implementation Guide

## Overview

**Accessibility is a first-class citizen in QuizMaster.** This application is built with accessibility at its core, not as an afterthought. All features, components, and user interactions MUST follow WCAG 2.1 AA standards and best practices. Accessibility compliance is mandatory and non-negotiable for all contributions to this project.

This document describes the accessibility features implemented and the standards that must be followed.

:::info Color & Contrast Compliance
For detailed information about color contrast ratios, font accessibility, and WCAG compliance for the Cyber Arcade design system, see **[Color Contrast & Accessibility](/technical/color-contrast)**.
:::

## Implemented Accessibility Features

### 1. ESLint Accessibility Linting

We use `eslint-plugin-jsx-a11y` to automatically detect accessibility issues during development:

```bash
# Run accessibility linting
npm run lint

# Auto-fix accessibility issues where possible
npm run lint:fix
```

**Configuration:** `application/frontend/eslint.config.mjs` and `docs/eslint.config.mjs`

### 2. Automated Accessibility Testing

We use `vitest-axe` for automated accessibility testing:

```typescript
import { axe } from '../test/axe-config';

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Test Suite:** `application/frontend/src/shared/components/__tests__/accessibility.test.tsx`

### 3. Color Contrast & Visual Accessibility

✅ **All colors meet WCAG 2.1 Level AA standards**

- Primary colors: 8.2:1+ contrast ratio on dark backgrounds
- Secondary colors: 7.8:1+ contrast ratio
- Accent colors: 15.2:1+ contrast ratio (AAA)
- Body text: 18.5:1 contrast ratio (AAA)

See **[Color Contrast Documentation](/technical/color-contrast)** for complete details.

#### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  /* Removes decorative effects */
  * {
    text-shadow: none !important;
  }

  /* Increases border visibility */
  .btn,
  .card {
    border-width: 3px !important;
  }
}
```

#### Forced Colors Mode (Windows High Contrast)

```css
@media (forced-colors: active) {
  .btn,
  .card,
  input,
  button {
    forced-color-adjust: auto;
  }
}
```

### 4. Core Component Accessibility

#### Button Component

- ✅ Proper `aria-disabled` attribute when disabled
- ✅ Icons marked with `aria-hidden="true"`
- ✅ Focus visible styles
- ✅ Keyboard accessible (Enter/Space)

#### Input Component

- ✅ Associated labels using `htmlFor` and `id`
- ✅ `aria-invalid` when errors present
- ✅ `aria-describedby` linking to error messages
- ✅ Error messages marked with `role="alert"`
- ✅ Icons marked with `aria-hidden="true"`

#### Card Component

- ✅ Renders as `<button>` when `onClick` provided
- ✅ Proper semantic HTML (div when static, button when interactive)
- ✅ No click handlers on non-interactive elements

### 4. ShareButton Component

#### Keyboard Navigation (✅ IMPLEMENTED)

- **Tab Navigation**: All interactive elements (buttons, close button) are keyboard accessible
- **Enter/Space**: Activates buttons
- **Escape**: Closes the share menu
- **Focus Trap**: Focus is trapped within modal when open
- **Focus Return**: Focus returns to trigger button when modal closes

#### ARIA Labels (✅ IMPLEMENTED)

```tsx
<button aria-label="Close share dialog" onClick={closeMenu}>×</button>
<div role="dialog" aria-modal="true" aria-labelledby="share-dialog-title">
  <h3 id="share-dialog-title">Share Results</h3>
  {/* Share buttons */}
</div>
```

### 5. QuestionResultDisplay Component (✅ IMPLEMENTED)

#### Visual Indicators

- **Color + Icon**: Results use both color AND icons (🎉/😢) to indicate success/failure
- **Text Labels**: All statistics have text labels, not just visual bars
- **Contrast Ratios**:
  - Success green on dark: 14.1:1 (AAA)
  - Danger red on dark: 9.4:1 (AAA)
  - All text meets WCAG 2.1 AA standards

#### Screen Reader Support (✅ IMPLEMENTED)

```tsx
// Live region for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {isCorrect
    ? `Correct! You earned ${points} points.`
    : `Incorrect. The correct answer was ${correctAnswer}.`
  }
</div>

// Progress bar with full ARIA attributes
<div role="progressbar"
     aria-valuenow={percentage}
     aria-valuemin={0}
     aria-valuemax={100}
     aria-label={`Option ${option}: ${percentage}% of players`}>
  {/* visual bar */}
</div>
```

### 6. PlayingPage Component (✅ IMPLEMENTED)

#### Timer Accessibility

```tsx
<div
  role="timer"
  aria-live="assertive"
  aria-atomic="true"
  aria-label={`Time remaining: ${timeLeft} seconds`}
>
  <span aria-hidden="true">⏱️</span>
  <span>{timeLeft}s</span>
</div>
```

#### Progress Bar

```tsx
<div
  role="progressbar"
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Time remaining: ${Math.round(progressPercent)}%`}
>
  {/* visual progress bar */}
</div>
```

### 7. JoinGamePage Component (✅ IMPLEMENTED)

#### Form Accessibility

```tsx
<label htmlFor="game-pin-input">Enter Game PIN</label>
<Input id="game-pin-input" aria-describedby="pin-length-indicator" />
<div id="pin-length-indicator">
  <span aria-live="polite">{gamePin.length}/6</span>
</div>
```

### 8. Game Lobby QR Code (✅ IMPLEMENTED)

#### QR Code Accessibility

The lobby provides a QR code alternative for joining games:

- ✅ QR code has `role="img"` and descriptive `aria-label`
- ✅ Text fallback displays PIN below QR code
- ✅ Auto-fills PIN when scanned via URL parameter
- ✅ All text meets WCAG AAA contrast (11.4:1 to 15.2:1)

```tsx
<QRCodeSVG
  value={`${window.location.origin}/join?pin=${gamePin}`}
  aria-label={t("game.qrCodeAlt", { pin: gamePin })}
  role="img"
/>
<p>{t("game.qrCodeAlt", { pin: gamePin })}</p>
```

### 9. Animation Considerations (✅ IMPLEMENTED)

#### Reduced Motion Support

Implemented in global CSS (`application/frontend/src/index.css`):

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This respects user preferences for reduced motion and is compliant with WCAG 2.1 Success Criterion 2.3.3.

### 10. Skip Links (✅ IMPLEMENTED)

Skip links allow keyboard users to quickly navigate to main content:

```css
.skip-link {
  /* Visually hidden by default */
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... */
}

.skip-link:focus {
  /* Visible when focused */
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
  /* Cyber Arcade styling */
}
```

### 11. Keyboard Navigation

All interactive elements are keyboard accessible:

- ✅ Tab navigation through all interactive elements
- ✅ Enter/Space to activate buttons
- ✅ Escape to close modals
- ✅ Arrow keys for navigation where applicable
- ✅ Focus visible indicators on all interactive elements

### 12. Screen Reader Support

#### ARIA Live Regions

Used throughout the app for dynamic content updates:

- `aria-live="polite"` for non-critical updates
- `aria-live="assertive"` for time-sensitive information (timer)
- `role="status"` for status updates
- `role="alert"` for error messages

#### ARIA Labels and Descriptions

However, the current implementation with visual podium is acceptable if we add ARIA labels.

#### ARIA Live Regions Example

```tsx
// Announce when new players appear in leaderboard
<div aria-live="polite" className="sr-only">
  {animationStage >= 2 &&
    `First place: ${leaderboard[0]?.username} with ${leaderboard[0]?.totalPoints} points`}
</div>
```

## Testing Checklist

### Automated Testing

- ✅ Run axe-core accessibility tests (`vitest-axe` integrated)
- ✅ Run ESLint accessibility linting (`eslint-plugin-jsx-a11y`)
- 🔄 Run Lighthouse accessibility audit (manual step)
- 🔄 Test with additional automated tools (pa11y, WAVE) (optional)

**Run automated tests:**

```bash
cd frontend
npm run lint        # ESLint accessibility checks
npm test           # Includes axe accessibility tests
```

### Manual Testing

#### Keyboard Navigation

- ✅ Tab through all interactive elements in correct order
- ✅ Activate all buttons with Enter/Space
- ✅ Close modals with Escape key
- ✅ Focus visible on all interactive elements

#### Screen Reader Testing

Recommended screen readers for testing:

- 🔄 NVDA (Windows) - Free and open-source
- 🔄 JAWS (Windows) - Industry standard
- 🔄 VoiceOver (macOS/iOS) - Built-in
- 🔄 TalkBack (Android) - Built-in

#### Visual Testing

- ✅ Reduced motion support implemented
- ✅ High contrast mode support implemented
- ✅ Forced colors mode support (Windows High Contrast)
- ✅ Color contrast ratios verified (see [Color Contrast docs](/technical/color-contrast))
- 🔄 Test with browser zoom at 200%
- 🔄 Test with color blindness simulators

#### Motion Testing

- ✅ Enable "Reduce Motion" in OS settings
- ✅ Verify animations are minimal/disabled
- ✅ Ensure content is still understandable

## Development Guidelines

### For Contributors

#### Before Submitting Code

1. **Run linter**: `npm run lint` to check for accessibility issues
2. **Fix violations**: Address all ESLint a11y errors
3. **Add tests**: Include accessibility tests for new components
4. **Manual check**: Test keyboard navigation

#### Common Accessibility Patterns

##### Form Inputs

```tsx
<Input
  label="Email" // Associated label
  type="email"
  error={errors.email} // Error with role="alert"
  aria-describedby="helper" // Optional helper text
/>
```

##### Buttons

```tsx
<Button
  variant="primary"
  disabled={isLoading} // Includes aria-disabled
  aria-label="Submit form" // Descriptive label
>
  Submit
</Button>
```

##### Icons

```tsx
// Decorative icons
<svg aria-hidden="true">...</svg>

// Meaningful icons
<svg role="img" aria-label="Success">...</svg>
```

##### Modal Dialogs

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal content...</p>
</div>
```

##### Live Regions

```tsx
// Status updates
<div role="status" aria-live="polite">
  Loading complete
</div>

// Critical updates
<div role="alert" aria-live="assertive">
  Error: Connection lost
</div>
```

## Resources and Tools

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Inclusive Components](https://inclusive-components.design/)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools
- [Pa11y](https://pa11y.org/) - Automated accessibility testing

### ESLint Plugin

- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) - Our primary linting tool

### Testing Library

- [vitest-axe](https://github.com/chaance/vitest-axe) - Automated accessibility testing for Vitest

## Compliance Status

### WCAG 2.1 Level AA Compliance

#### Perceivable

- ✅ **1.1.1 Non-text Content**: All images have alt text or aria-hidden
- ✅ **1.3.1 Info and Relationships**: Semantic HTML and ARIA labels used
- ✅ **1.4.3 Contrast**: Color contrast meets AA standards (documented in [Color Contrast guide](/technical/color-contrast))
- ✅ **1.4.10 Reflow**: Responsive design supports 320px width
- ✅ **1.4.11 Non-text Contrast**: UI components meet contrast requirements
- ✅ **1.4.12 Text Spacing**: No loss of content with increased text spacing

#### Operable

- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **2.1.2 No Keyboard Trap**: No keyboard traps in modals or forms
- ✅ **2.4.3 Focus Order**: Logical focus order maintained
- ✅ **2.4.7 Focus Visible**: Focus indicators visible
- ✅ **2.5.3 Label in Name**: Accessible names match visible labels

#### Understandable

- ✅ **3.1.1 Language of Page**: HTML lang attribute set
- ✅ **3.2.1 On Focus**: No unexpected context changes on focus
- ✅ **3.2.2 On Input**: No unexpected context changes on input
- ✅ **3.3.1 Error Identification**: Form errors clearly identified
- ✅ **3.3.2 Labels or Instructions**: All inputs have labels
- ✅ **3.3.3 Error Suggestion**: Error messages provide guidance

#### Robust

- ✅ **4.1.1 Parsing**: Valid HTML (via TypeScript/React)
- ✅ **4.1.2 Name, Role, Value**: ARIA attributes used correctly
- ✅ **4.1.3 Status Messages**: Live regions for status updates

## Summary

QuizMaster is committed to accessibility compliance. We have:

1. ✅ **Automated Testing**: ESLint + vitest-axe for continuous validation
2. ✅ **Component Library**: All shared components are accessible
3. ✅ **Keyboard Navigation**: Full keyboard support throughout the app
4. ✅ **Screen Reader Support**: ARIA labels and live regions implemented
5. ✅ **Reduced Motion**: Respects user preferences
6. ✅ **Documentation**: Comprehensive accessibility guidelines

All contributors must follow these accessibility standards. No PR will be merged if it introduces accessibility violations detected by our automated tools.
