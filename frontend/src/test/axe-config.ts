import { configureAxe } from 'vitest-axe';

/**
 * Configure axe-core for accessibility testing
 * 
 * This configuration ensures that our components meet WCAG 2.1 AA standards
 * See: https://www.deque.com/axe/core-documentation/api-documentation/
 */
export const axe = configureAxe({
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'valid-lang': { enabled: true },
    'html-has-lang': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
  },
});

export default axe;
