import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { usePatienceDelay } from "./usePatienceDelay";

describe("usePatienceDelay", () => {
  it("returns true immediately when delayMs <= 0", () => {
    const { result } = renderHook(() => usePatienceDelay(true, 0));
    expect(result.current).toBe(true);
  });

  it("returns false until the delay elapses", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => usePatienceDelay(true, 500));
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);

    vi.useRealTimers();
  });

  it("resets when becoming inactive", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ active, delayMs }) => usePatienceDelay(active, delayMs),
      { initialProps: { active: true, delayMs: 10 } }
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current).toBe(true);

    act(() => {
      rerender({ active: false, delayMs: 10 });
    });
    expect(result.current).toBe(false);

    vi.useRealTimers();
  });
});
