import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StoragePort } from '../../domains/shared/ports/storage.port';
import { useReactI18nextTranslationAdapter } from './react-i18next-translation.adapter';

vi.mock('react-i18next', async () => {
  const { ReactI18nextMockFactory } = await import(
    'src/test-utils/factories/react-i18next-mock-factory'
  );

  return new ReactI18nextMockFactory().createModule();
});

function createMockStorage(): StoragePort {
  return { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
}

describe('useReactI18nextTranslationAdapter', () => {
  describe('useReactI18nextTranslationAdapter()', () => {
    it('returns the i18next translation API through the translation port', () => {
      // Arrange
      const { result } = renderHook(() => useReactI18nextTranslationAdapter(createMockStorage()));

      // Act
      const value = result.current.t('home.hero.title');

      // Assert
      expect(value).toBe('home.hero.title');
    });

    it('forwards named interpolation variables', () => {
      // Arrange
      const { result } = renderHook(() => useReactI18nextTranslationAdapter(createMockStorage()));

      // Act
      const value = result.current.t('quiz.management.answerLabel', { position: '2' });

      // Assert
      expect(value).toBe('quiz.management.answerLabel (position=2)');
    });
  });
});
