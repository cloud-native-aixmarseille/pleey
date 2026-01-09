import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useGuestSession } from "./useGuestSession";
import {
  GUEST_ID_KEY,
  GUEST_NICKNAME_KEY,
} from "../../../../domains/shared/constants/storageKeys";

describe("useGuestSession", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("persists guest identity to localStorage and restores after remount", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456789);

    const { result, unmount } = renderHook(() => useGuestSession());

    act(() => {
      result.current.registerGuest("Neo");
    });

    expect(result.current.guestNickname).toBe("Neo");
    expect(result.current.guestId).toMatch(/^guest-/);

    expect(localStorage.getItem(GUEST_NICKNAME_KEY)).toBe("Neo");
    expect(localStorage.getItem(GUEST_ID_KEY)).toBe(result.current.guestId);

    unmount();

    const { result: next } = renderHook(() => useGuestSession());

    expect(next.current.guestNickname).toBe("Neo");
    expect(next.current.guestId).toBe(localStorage.getItem(GUEST_ID_KEY));
  });

  it("migrates legacy sessionStorage guest identity into localStorage", () => {
    sessionStorage.setItem(GUEST_NICKNAME_KEY, "Trinity");
    sessionStorage.setItem(GUEST_ID_KEY, "guest-legacy");

    const { result } = renderHook(() => useGuestSession());

    expect(result.current.guestNickname).toBe("Trinity");
    expect(result.current.guestId).toBe("guest-legacy");

    expect(localStorage.getItem(GUEST_NICKNAME_KEY)).toBe("Trinity");
    expect(localStorage.getItem(GUEST_ID_KEY)).toBe("guest-legacy");
  });

  it("clears guest identity from storage", () => {
    localStorage.setItem(GUEST_NICKNAME_KEY, "Morpheus");
    localStorage.setItem(GUEST_ID_KEY, "guest-xyz");

    const { result } = renderHook(() => useGuestSession());

    act(() => {
      result.current.clearGuest();
    });

    expect(result.current.guestNickname).toBe("");
    expect(result.current.guestId).toBeNull();
    expect(localStorage.getItem(GUEST_NICKNAME_KEY)).toBeNull();
    expect(localStorage.getItem(GUEST_ID_KEY)).toBeNull();
  });
});
