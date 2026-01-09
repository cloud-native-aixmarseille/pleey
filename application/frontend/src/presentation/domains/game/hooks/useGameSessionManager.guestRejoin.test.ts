import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useGameSessionManager } from "./useGameSessionManager";

const joinGameMock = vi.fn();

vi.mock("../../../../domains/game/game.service", () => ({
  gameService: {
    joinGame: (...args: unknown[]) => joinGameMock(...args),
    getActiveSessions: vi.fn().mockResolvedValue([]),
    getSessionsByQuiz: vi.fn().mockResolvedValue([]),
    endGame: vi.fn(),
    submitAnswer: vi.fn(),
    nextQuestion: vi.fn(),
    startGame: vi.fn(),
    launchQuiz: vi.fn(),
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
  }),
}));

vi.mock("../../../../presentation/shared/hooks/useTimer", () => ({
  useTimer: vi.fn(),
}));

describe("useGameSessionManager (guest rejoin)", () => {
  beforeEach(() => {
    joinGameMock.mockClear();
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
      expect(joinGameMock).toHaveBeenCalledWith(
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
