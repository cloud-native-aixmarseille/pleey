import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import i18n from '../i18n/config';

// Initialize i18n for tests with English as default
beforeAll(async () => {
  await i18n.changeLanguage('en');
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia - only in browser environment
/* global window */
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {}
    })
  });
}
