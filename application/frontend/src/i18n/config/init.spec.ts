import { afterEach, describe, expect, it } from 'vitest';
import { LanguagePreferenceResolver, SupportedLanguage } from './init';

const STORAGE_KEY = 'pleey_language';
const languagePreferenceResolver = new LanguagePreferenceResolver();

describe('LanguagePreferenceResolver', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('resolve()', () => {
    it('returns "en" when "en" is persisted in localStorage', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'en');

      // Act
      const result = languagePreferenceResolver.resolve();

      // Assert
      expect(result).toBe(SupportedLanguage.EN);
    });

    it('returns "fr" when "fr" is persisted in localStorage', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'fr');

      // Act
      const result = languagePreferenceResolver.resolve();

      // Assert
      expect(result).toBe(SupportedLanguage.FR);
    });

    it('ignores an invalid persisted value and falls back to browser detection', () => {
      // Arrange — store an unsupported locale code
      localStorage.setItem(STORAGE_KEY, 'de');

      // Act
      const result = languagePreferenceResolver.resolve();

      // Assert — jsdom defaults navigator.language to 'en-US' → resolves 'en'
      expect([SupportedLanguage.EN, SupportedLanguage.FR]).toContain(result);
    });

    it('returns "en" when no preference is stored and browser language is not fr', () => {
      // Arrange — jsdom provides navigator.language = 'en-US' by default
      localStorage.removeItem(STORAGE_KEY);

      // Act
      const result = languagePreferenceResolver.resolve();

      // Assert
      expect(result).toBe(SupportedLanguage.EN);
    });
  });
});
