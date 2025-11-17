import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should decrement timeLeft when active and no answer', async () => {
    const setTimeLeft = vi.fn();

    renderHook(() => useTimer(10, setTimeLeft, true, false));

    await vi.advanceTimersByTimeAsync(1000);

    expect(setTimeLeft).toHaveBeenCalledWith(9);
  });

  it('should not decrement when not active', async () => {
    const setTimeLeft = vi.fn();

    renderHook(() => useTimer(10, setTimeLeft, false, false));

    await vi.advanceTimersByTimeAsync(1000);

    expect(setTimeLeft).not.toHaveBeenCalled();
  });

  it('should not decrement when answer is submitted', async () => {
    const setTimeLeft = vi.fn();

    renderHook(() => useTimer(10, setTimeLeft, true, true));

    await vi.advanceTimersByTimeAsync(1000);

    expect(setTimeLeft).not.toHaveBeenCalled();
  });

  it('should not decrement when time is 0', async () => {
    const setTimeLeft = vi.fn();

    renderHook(() => useTimer(0, setTimeLeft, true, false));

    await vi.advanceTimersByTimeAsync(1000);

    expect(setTimeLeft).not.toHaveBeenCalled();
  });
});
