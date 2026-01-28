import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePatienceDelay } from './use-patience-delay';

describe('usePatienceDelay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true immediately when delay is zero', () => {
    const { result } = renderHook(() => usePatienceDelay(true, 0));

    expect(result.current).toBe(true);
  });

  it('returns true after delay when active', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => usePatienceDelay(true, 1_000));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current).toBe(true);
  });

  it('resets when deactivated', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ active }) => usePatienceDelay(active, 1_000), {
      initialProps: { active: true },
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current).toBe(true);

    rerender({ active: false });

    expect(result.current).toBe(false);
  });
});
