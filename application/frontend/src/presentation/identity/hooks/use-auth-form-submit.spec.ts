import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuthFormSubmit } from './use-auth-form-submit';

vi.mock('../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('useAuthFormSubmit', () => {
  it('starts with no error message', () => {
    const { result } = renderHook(() => useAuthFormSubmit());

    expect(result.current.errorMessage).toBeNull();
  });

  it('sets the Error message when handleError receives an Error instance', () => {
    const { result } = renderHook(() => useAuthFormSubmit());

    act(() => result.current.handleError(new Error('Invalid credentials')));

    expect(result.current.errorMessage).toBe('Invalid credentials');
  });

  it('sets the generic fallback when handleError receives a non-Error value', () => {
    const { result } = renderHook(() => useAuthFormSubmit());

    act(() => result.current.handleError({ reason: 'unexpected' }));

    expect(result.current.errorMessage).toBe('auth.errors.generic');
  });

  it('clears the error message when clearError is called', () => {
    const { result } = renderHook(() => useAuthFormSubmit());

    act(() => result.current.handleError(new Error('fail')));
    act(() => result.current.clearError());

    expect(result.current.errorMessage).toBeNull();
  });
});
