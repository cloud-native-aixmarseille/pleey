import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import type { GameSession } from "../../../../domains/game/types";
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

describe("useGameSessionManager (rejoinSession)", () => {
  it("navigates to playing when session is paused", async () => {
    const navigate = vi.fn();
    const user = { id: 7, username: "Host" } as unknown as User;

    const { result } = renderHook(() =>
      useGameSessionManager({
        token: "token",
        user,
        guestId: null,
        guestNickname: "",
        registerGuest: () => ({ id: "guest-123" }),
        quizzes: [{ id: 1, title: "Quiz" } as any],
        questionsByQuiz: { 1: [{ id: 1 } as any] },
        fetchQuizQuestions: vi.fn().mockResolvedValue([{ id: 1 } as any]),
        notify: vi.fn(),
        notifyFromError: vi.fn(),
        navigate,
      })
    );

    const session = {
      pin: "ABC123",
      quizId: 1,
      status: "paused",
    } as unknown as GameSession;

    await act(async () => {
      await result.current.rejoinSession(session);
    });

    expect(navigate).toHaveBeenCalledWith("/game/ABC123/playing/current");
  });
});
