import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useUserIdle } from './use-user-idle';

describe('useUserIdle', () => {
  it('becomes idle after configured delay', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useUserIdle(true, 1_000));

      expect(result.current).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      expect(result.current).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets idle timer on activity events', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useUserIdle(true, 1_000));

      act(() => {
        vi.advanceTimersByTime(800);
        window.dispatchEvent(new Event('mousemove'));
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(false);

      act(() => {
        vi.advanceTimersByTime(700);
      });

      expect(result.current).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays non idle when hook is disabled', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useUserIdle(false, 1_000));

      act(() => {
        vi.advanceTimersByTime(5_000);
      });

      expect(result.current).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
