import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decrement timeLeft when active and no answer', () => {
    const setTimeLeft = vi.fn();
    
    renderHook(() => useTimer(10, setTimeLeft, true, false));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setTimeLeft).toHaveBeenCalledWith(9);
  });

  it('should not decrement when not active', () => {
    const setTimeLeft = vi.fn();
    
    renderHook(() => useTimer(10, setTimeLeft, false, false));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setTimeLeft).not.toHaveBeenCalled();
  });

  it('should not decrement when answer is submitted', () => {
    const setTimeLeft = vi.fn();
    
    renderHook(() => useTimer(10, setTimeLeft, true, true));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setTimeLeft).not.toHaveBeenCalled();
  });

  it('should not decrement when time is 0', () => {
    const setTimeLeft = vi.fn();
    
    renderHook(() => useTimer(0, setTimeLeft, true, false));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setTimeLeft).not.toHaveBeenCalled();
  });
});
