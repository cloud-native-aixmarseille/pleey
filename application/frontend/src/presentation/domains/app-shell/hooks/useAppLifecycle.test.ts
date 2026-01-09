import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import type { User } from "../../../../domains/auth/types";
import { useAppLifecycle } from "./useAppLifecycle";

describe("useAppLifecycle (game redirects)", () => {
  it("does not redirect admin host from lobby to playing when gameStarted", async () => {
    const navigate = vi.fn();
    const user = { isAdmin: true } as unknown as User;

    renderHook(() =>
      useAppLifecycle({
        restoreSession: () => null,
        user,
        token: null,
        refreshProfile: vi.fn(),
        loadQuizzes: vi.fn(),
        clearSession: vi.fn(),
        notifyFromError: vi.fn(),
        navigate,
        locationPathname: "/game/ABC123/lobby",
        gameStarted: true,
        gameEnded: false,
        gamePin: "ABC123",
        currentQuestionId: 7,
      })
    );

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it("redirects admin host from lobby to playing when gameStarted transitions from false to true", async () => {
    const navigate = vi.fn();
    const user = { isAdmin: true } as unknown as User;

    const { rerender } = renderHook(
      ({ gameStarted }) =>
        useAppLifecycle({
          restoreSession: () => null,
          user,
          token: null,
          refreshProfile: vi.fn(),
          loadQuizzes: vi.fn(),
          clearSession: vi.fn(),
          notifyFromError: vi.fn(),
          navigate,
          locationPathname: "/game/ABC123/lobby",
          gameStarted,
          gameEnded: false,
          gamePin: "ABC123",
          currentQuestionId: 7,
        }),
      { initialProps: { gameStarted: false } }
    );

    rerender({ gameStarted: true });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/game/ABC123/playing/7", {
        replace: true,
      });
    });
  });

  it("redirects non-admin from lobby to playing when gameStarted", async () => {
    const navigate = vi.fn();
    const user = { isAdmin: false } as unknown as User;

    renderHook(() =>
      useAppLifecycle({
        restoreSession: () => null,
        user,
        token: null,
        refreshProfile: vi.fn(),
        loadQuizzes: vi.fn(),
        clearSession: vi.fn(),
        notifyFromError: vi.fn(),
        navigate,
        locationPathname: "/game/ABC123/lobby",
        gameStarted: true,
        gameEnded: false,
        gamePin: "ABC123",
        currentQuestionId: 7,
      })
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/game/ABC123/playing/7", {
        replace: true,
      });
    });
  });
});
