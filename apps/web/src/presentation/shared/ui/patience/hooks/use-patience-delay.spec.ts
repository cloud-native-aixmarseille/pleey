import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usePatienceDelay } from './use-patience-delay';

describe('usePatienceDelay', () => {
  it('returns true immediately when delay is zero', () => {
    // Arrange + Act
    const { result } = renderHook(() => usePatienceDelay(true, 0));

    // Assert
    expect(result.current).toBe(true);
  });

  it('returns true after delay when active', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => usePatienceDelay(true, 1_000));

      expect(result.current).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      expect(result.current).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets when deactivated', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result, rerender } = renderHook(({ active }) => usePatienceDelay(active, 1_000), {
        initialProps: { active: true },
      });

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      expect(result.current).toBe(true);

      rerender({ active: false });

      expect(result.current).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
