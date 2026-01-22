import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import {
  gameServiceMock,
  resetGameSessionManagerMocks,
} from "./useGameSessionManager.mocks";
import type { User } from "../../../../domains/auth/types";
import { useGameSessionManager } from "./useGameSessionManager";

describe("useGameSessionManager (user rejoin)", () => {
  beforeEach(() => {
    resetGameSessionManagerMocks();
  });

  it("re-joins the session on refresh when user + pin exist", async () => {
    const user = { id: 42, username: "Trinity" } as unknown as User;

    const { result } = renderHook(() =>
      useGameSessionManager({
        token: "token",
        user,
        guestId: null,
        guestNickname: "",
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
      result.current.setGamePin("abc123");
    });

    await waitFor(() => {
      expect(gameServiceMock.joinGame).toHaveBeenCalledWith(
        "ABC123",
        "Trinity",
        42,
      );
    });
  });

  it("does not spam joinGame for the same pin", async () => {
    const user = { id: 42, username: "Trinity" } as unknown as User;

    const { result } = renderHook(() =>
      useGameSessionManager({
        token: "token",
        user,
        guestId: null,
        guestNickname: "",
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
