import { describe, expect, it } from 'vitest';
import { LanguagePreferenceResolver, SupportedLanguage } from './init';

const STORAGE_KEY = 'pleey_language';

describe('LanguagePreferenceResolver', () => {
  function clearStoredLanguagePreference() {
    localStorage.removeItem(STORAGE_KEY);
  }

  describe('resolve()', () => {
    it('returns "en" when "en" is persisted in localStorage', () => {
      // Arrange
      const languagePreferenceResolver = new LanguagePreferenceResolver();

      clearStoredLanguagePreference();
      // Act
      localStorage.setItem(STORAGE_KEY, 'en');

      // Assert
      try {
        const result = languagePreferenceResolver.resolve();

        expect(result).toBe(SupportedLanguage.EN);
      } finally {
        clearStoredLanguagePreference();
      }
    });

    it('returns "fr" when "fr" is persisted in localStorage', () => {
      // Arrange
      const languagePreferenceResolver = new LanguagePreferenceResolver();

      clearStoredLanguagePreference();
      // Act
      localStorage.setItem(STORAGE_KEY, 'fr');

      // Assert
      try {
        const result = languagePreferenceResolver.resolve();

        expect(result).toBe(SupportedLanguage.FR);
      } finally {
        clearStoredLanguagePreference();
      }
    });

    it('ignores an invalid persisted value and falls back to browser detection', () => {
      // Arrange
      const languagePreferenceResolver = new LanguagePreferenceResolver();

      clearStoredLanguagePreference();
      // Act
      localStorage.setItem(STORAGE_KEY, 'de');

      // Assert
      try {
        const result = languagePreferenceResolver.resolve();

        expect([SupportedLanguage.EN, SupportedLanguage.FR]).toContain(result);
      } finally {
        clearStoredLanguagePreference();
      }
    });

    it('returns "en" when no preference is stored and browser language is not fr', () => {
      // Arrange
      const languagePreferenceResolver = new LanguagePreferenceResolver();

      clearStoredLanguagePreference();

      // Act
      const result = languagePreferenceResolver.resolve();

      // Assert
      expect(result).toBe(SupportedLanguage.EN);
    });
  });
});
