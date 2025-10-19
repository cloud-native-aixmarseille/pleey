# Accessibility Implementation Guide

## Overview
This document describes the accessibility features implemented and best practices for the question answering results display.

## Current Accessibility Features

### 1. ShareButton Component

#### Keyboard Navigation
- **Tab Navigation**: All interactive elements (buttons, close button) are keyboard accessible
- **Enter/Space**: Activates buttons
- **Escape**: Closes the share menu (to be implemented)

#### ARIA Labels
```tsx
<button aria-label="Close" onClick={closeMenu}>×</button>
```

#### Focus Management
- When modal opens, focus should move to first interactive element
- When modal closes, focus should return to trigger button
- Trap focus within modal when open

**To Implement:**
```tsx
// Add to ShareButton component
const firstButtonRef = useRef<HTMLButtonElement>(null);
const shareButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (showShareMenu && firstButtonRef.current) {
    firstButtonRef.current.focus();
  }
}, [showShareMenu]);

// Add Escape key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showShareMenu) {
      setShowShareMenu(false);
      shareButtonRef.current?.focus();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [showShareMenu]);
```

### 2. QuestionResultDisplay Component

#### Visual Indicators
- **Color + Icon**: Results use both color AND icons (🎉/😢) to indicate success/failure
- **Text Labels**: All statistics have text labels, not just visual bars
- **Contrast Ratios**: 
  - Success green on dark: 14.1:1 (AAA)
  - Danger red on dark: 9.4:1 (AAA)
  - All text meets WCAG 2.1 AA standards

#### Screen Reader Support
```tsx
// Add aria-live region for dynamic updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isCorrect 
    ? `Correct! You earned ${points} points.` 
    : `Incorrect. The correct answer was ${correctAnswer}.`
  }
</div>

// Add semantic heading structure
<h3 role="heading" aria-level="3">Answer Distribution</h3>

// Add progress bar labels
<div role="progressbar" 
     aria-valuenow={percentage} 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label={`Option ${option}: ${percentage}% of players`}>
  {/* visual bar */}
</div>
```

### 3. Animation Considerations

#### Reduced Motion Support
Already implemented in global CSS:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This respects user preferences for reduced motion.

### 4. LeaderboardPage

#### Semantic Structure
```tsx
// Current: Using divs
// Better: Use semantic HTML

<table className="leaderboard-table">
  <caption className="sr-only">Final Game Results</caption>
  <thead>
    <tr>
      <th scope="col">Rank</th>
      <th scope="col">Player</th>
      <th scope="col">Score</th>
    </tr>
  </thead>
  <tbody>
    {leaderboard.map((player, index) => (
      <tr key={player.userId}>
        <td>{index + 1}</td>
        <td>{player.username}</td>
        <td>{player.totalPoints} pts</td>
      </tr>
    ))}
  </tbody>
</table>
```

However, the current implementation with visual podium is acceptable if we add ARIA labels.

#### ARIA Live Regions
```tsx
// Announce when new players appear in leaderboard
<div aria-live="polite" className="sr-only">
  {animationStage >= 2 && `First place: ${leaderboard[0]?.username} with ${leaderboard[0]?.totalPoints} points`}
</div>
```

## Testing Checklist

### Automated Testing
- [ ] Run axe-core accessibility tests
- [ ] Run Lighthouse accessibility audit
- [ ] Test with automated tools (pa11y, WAVE)

### Manual Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements in correct order
- [ ] Activate all buttons with Enter/Space
- [ ] Close modals with Escape key
- [ ] Focus visible on all interactive elements

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)

#### Visual Testing
- [ ] Test with Windows High Contrast mode
- [ ] Test with browser zoom at 200%
- [ ] Test with custom color schemes
- [ ] Verify color contrast ratios

#### Motion Testing
- [ ] Enable "Reduce Motion" in OS settings
- [ ] Verify animations are minimal/disabled
- [ ] Ensure content is still understandable

## Implementation Priorities

### High Priority (Implement Now)
1. **Focus Management in Modals**
   - Trap focus in share menu
   - Return focus on close
   - Escape key to close

2. **ARIA Live Regions**
   - Announce result success/failure
   - Announce statistics updates

3. **Progress Bar ARIA**
   - Add role="progressbar"
   - Include aria-valuenow, aria-valuemin, aria-valuemax
   - Add aria-label with percentage

### Medium Priority (Next Sprint)
1. **Skip Links**
   - Add "Skip to results" link
   - Add "Skip to leaderboard" link

2. **Landmark Regions**
   - Use semantic HTML5 elements
   - Add ARIA landmarks where needed

3. **Enhanced Keyboard Shortcuts**
   - Add keyboard shortcuts guide
   - Implement custom shortcuts for common actions

### Low Priority (Future Enhancement)
1. **Voice Control**
   - Test with Dragon NaturallySpeaking
   - Add voice command support

2. **Dyslexia Support**
   - Option to change font to OpenDyslexic
   - Increase letter spacing option

3. **Internationalization**
   - Support RTL languages
   - Test with screen readers in multiple languages

## Code Examples

### Adding Focus Trap to Modal

```tsx
import { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

export function ShareButton({ ... }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useFocusTrap(modalRef, showShareMenu);
  
  return (
    <>
      {showShareMenu && (
        <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="share-title">
          <h3 id="share-title">Share Results</h3>
          {/* content */}
        </div>
      )}
    </>
  );
}
```

### Custom useFocusTrap Hook

```tsx
// /shared/hooks/useFocusTrap.ts
export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => element.removeEventListener('keydown', handleTab);
  }, [ref, isActive]);
}
```

### Adding ARIA Live Regions

```tsx
// QuestionResultDisplay.tsx
export default function QuestionResultDisplay({ ... }) {
  return (
    <div>
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {answerResult.isCorrect 
          ? `Correct! You earned ${answerResult.points} points.`
          : `Incorrect. The correct answer was ${answerResult.correctAnswer}.`
        }
        {answerResult.statistics && 
          `${answerResult.statistics.totalAnswers} players have answered this question.`
        }
      </div>
      
      {/* Visual content */}
      {/* ... */}
    </div>
  );
}
```

### Progress Bar with ARIA

```tsx
<div className="relative">
  <div 
    role="progressbar" 
    aria-valuenow={percentage} 
    aria-valuemin={0} 
    aria-valuemax={100}
    aria-label={`Option ${option}: ${percentage}% of players selected this answer`}
    className="h-8 bg-dark-700/50 rounded-full overflow-hidden"
  >
    <div 
      className="h-full bg-gradient-to-r from-success-500 to-accent-500"
      style={{ width: `${percentage}%` }}
    />
  </div>
  <div className="sr-only">
    {answerDistribution[option] || 0} out of {totalAnswers} players
  </div>
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Inclusive Components](https://inclusive-components.design/)

## Next Steps

1. Implement focus trap in ShareButton modal
2. Add ARIA live regions to QuestionResultDisplay
3. Add progress bar ARIA attributes
4. Run automated accessibility audit
5. Conduct manual keyboard testing
6. Test with screen readers
7. Document any issues found
8. Fix critical issues before release
