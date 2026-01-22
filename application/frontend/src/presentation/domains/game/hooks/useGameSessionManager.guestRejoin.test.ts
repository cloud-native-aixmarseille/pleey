import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import {
  gameServiceMock,
  resetGameSessionManagerMocks,
} from "./useGameSessionManager.mocks";
import { useGameSessionManager } from "./useGameSessionManager";

describe("useGameSessionManager (guest rejoin)", () => {
  beforeEach(() => {
    resetGameSessionManagerMocks();
  });

  it("re-joins the session on refresh when guest + pin exist", async () => {
    const { result } = renderHook(() =>
      useGameSessionManager({
        token: null,
        user: null,
        guestId: "guest-123",
        guestNickname: "Neo",
        registerGuest: () => ({ id: "guest-123" }),
        quizzes: [],
        questionsByQuiz: {},
        fetchQuizQuestions: vi.fn(),
        notify: vi.fn(),
        notifyFromError: vi.fn(),
        navigate: vi.fn(),
      })
    );

    act(() => {
      result.current.setGamePin("ABC123");
    });

    await waitFor(() => {
      expect(gameServiceMock.joinGame).toHaveBeenCalledWith(
        "ABC123",
        "Neo",
        undefined,
        "guest-123"
      );
    });
  });

  it("does not spam joinGame for the same pin", async () => {
    const { result } = renderHook(() =>
      useGameSessionManager({
        token: null,
        user: null,
        guestId: "guest-123",
        guestNickname: "Neo",
        registerGuest: () => ({ id: "guest-123" }),
        quizzes: [],
        questionsByQuiz: {},
        fetchQuizQuestions: vi.fn(),
        notify: vi.fn(),
        notifyFromError: vi.fn(),
        navigate: vi.fn(),
      })
    );

    act(() => {
      result.current.setGamePin("ABC123");
    });

    await waitFor(() => {
      expect(gameServiceMock.joinGame).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setGamePin("ABC123");
    });

    await waitFor(() => {
      expect(gameServiceMock.joinGame).toHaveBeenCalledTimes(1);
    });
  });
});
