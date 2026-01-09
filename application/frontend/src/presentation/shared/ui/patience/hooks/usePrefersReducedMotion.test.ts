import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  it("reflects matchMedia initial matches", () => {
    const original = window.matchMedia;

    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);

    window.matchMedia = original;
  });

  it("updates when the media query changes", () => {
    const original = window.matchMedia;

    let matches = false;
    let listener: (() => void) | null = null;

    window.matchMedia = vi.fn().mockImplementation(() => {
      return {
        get matches() {
          return matches;
        },
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: vi.fn((_event: string, cb: () => void) => {
          listener = cb;
        }),
        removeEventListener: vi.fn(),
        // Safari fallback not used in this test
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listener?.();
    });

    expect(result.current).toBe(true);

    window.matchMedia = original;
  });
});
