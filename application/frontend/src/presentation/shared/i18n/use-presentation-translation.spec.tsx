import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  PresentationTranslationProvider,
  usePresentationTranslation,
} from './use-presentation-translation';

describe('usePresentationTranslation', () => {
  describe('usePresentationTranslation()', () => {
    it('returns the translation port from context', () => {
      // Arrange
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PresentationTranslationProvider
          value={{
            currentLanguage: 'en',
            changeLanguage: () => {},
            t: (key, variables) =>
              variables
                ? `${key}:${Object.entries(variables)
                    .map(([name, value]) => `${name}=${value}`)
                    .join(',')}`
                : key,
          }}
        >
          {children}
        </PresentationTranslationProvider>
      );

      // Act
      const { result } = renderHook(() => usePresentationTranslation(), { wrapper });

      // Assert
      expect(result.current.t('home.hero.title')).toBe('home.hero.title');
    });

    it('returns the translation port interpolation behaviour from context', () => {
      // Arrange
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PresentationTranslationProvider
          value={{
            currentLanguage: 'en',
            changeLanguage: () => {},
            t: (key, variables) =>
              variables
                ? `${key}:${Object.entries(variables)
                    .map(([name, value]) => `${name}=${value}`)
                    .join(',')}`
                : key,
          }}
        >
          {children}
        </PresentationTranslationProvider>
      );

      // Act
      const { result } = renderHook(() => usePresentationTranslation(), { wrapper });

      // Assert
      expect(result.current.t('game.types.quiz.management.questionSummary', { count: '2' })).toBe(
        'game.types.quiz.management.questionSummary:count=2',
      );
    });
  });
});
