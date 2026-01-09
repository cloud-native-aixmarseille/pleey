import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import type { User } from "../../../../domains/auth/types";
import { useGameSessionManager } from "./useGameSessionManager";

const joinGameMock = vi.fn();

vi.mock("../../../../domains/game/game.service", () => ({
  gameService: {
    joinGame: (...args: unknown[]) => joinGameMock(...args),
    getActiveSessions: vi.fn().mockResolvedValue([]),
    getSessionsByQuiz: vi.fn().mockResolvedValue([]),
    createSession: vi.fn(),
    endGame: vi.fn(),
    submitAnswer: vi.fn(),
    nextQuestion: vi.fn(),
    startGame: vi.fn(),
    stopGame: vi.fn(),
    resumeGame: vi.fn(),
  },
}));

vi.mock("./useGameSocket", () => ({
  useGameSocket: () => ({
    players: [],
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    timeLeft: 0,
    setTimeLeft: vi.fn(),
    answerResult: null,
    showResult: false,
    leaderboard: [],
    gameStarted: false,
    gameEnded: false,
    answerSubmitted: false,
    isPaused: false,
    lastErrorCode: null,
  }),
}));

vi.mock("../../../../presentation/shared/hooks/useTimer", () => ({
  useTimer: vi.fn(),
}));

describe("useGameSessionManager (user rejoin)", () => {
  beforeEach(() => {
    joinGameMock.mockClear();
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
      expect(joinGameMock).toHaveBeenCalledWith("ABC123", "Trinity", 42);
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
      expect(joinGameMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setGamePin("ABC123");
    });

    await waitFor(() => {
      expect(joinGameMock).toHaveBeenCalledTimes(1);
    });
  });
});
