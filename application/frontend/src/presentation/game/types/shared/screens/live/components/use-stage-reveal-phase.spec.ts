import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useStageRevealPhase } from './use-stage-reveal-phase';

describe('useStageRevealPhase', () => {
  it('starts in the revealing state for a non-null stage key', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useStageRevealPhase('stage-1', 1_000));

      expect(result.current).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears the revealing state after the reveal duration elapses', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useStageRevealPhase('stage-1', 1_000));

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      expect(result.current).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('restarts the revealing state when the stage key changes', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { rerender, result } = renderHook(
        ({ stageKey }: { stageKey: string }) => useStageRevealPhase(stageKey, 1_000),
        { initialProps: { stageKey: 'stage-1' } },
      );

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      expect(result.current).toBe(false);

      rerender({ stageKey: 'stage-2' });

      expect(result.current).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays in the cleared state when the stage key is null', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useStageRevealPhase(null, 1_000));

      expect(result.current).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays cleared when the reveal duration is zero', () => {
    // Arrange + Act
    vi.useFakeTimers();

    // Assert
    try {
      const { result } = renderHook(() => useStageRevealPhase('stage-1', 0));

      expect(result.current).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
