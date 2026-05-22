import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStageRevealPhase } from './use-stage-reveal-phase';

describe('useStageRevealPhase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in the revealing state for a non-null stage key', () => {
    const { result } = renderHook(() => useStageRevealPhase('stage-1', 1_000));

    expect(result.current).toBe(true);
  });

  it('clears the revealing state after the reveal duration elapses', () => {
    const { result } = renderHook(() => useStageRevealPhase('stage-1', 1_000));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current).toBe(false);
  });

  it('restarts the revealing state when the stage key changes', () => {
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
  });

  it('stays in the cleared state when the stage key is null', () => {
    const { result } = renderHook(() => useStageRevealPhase(null, 1_000));

    expect(result.current).toBe(false);
  });

  it('stays cleared when the reveal duration is zero', () => {
    const { result } = renderHook(() => useStageRevealPhase('stage-1', 0));

    expect(result.current).toBe(false);
  });
});
