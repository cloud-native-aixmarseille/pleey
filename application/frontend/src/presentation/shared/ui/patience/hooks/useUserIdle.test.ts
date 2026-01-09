import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useUserIdle } from "./useUserIdle";

describe("useUserIdle", () => {
  it("returns false when disabled", () => {
    const { result } = renderHook(() => useUserIdle(false, 1000));
    expect(result.current).toBe(false);
  });

  it("becomes idle after the configured timeout", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUserIdle(true, 250));
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);

    vi.useRealTimers();
  });

  it("does not reset on activity", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUserIdle(true, 200, ["mousemove"]));

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("mousemove"));
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe(true);

    vi.useRealTimers();
  });
});
