import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useGameSocket } from "./useGameSocket";
import { socket } from "../../../../infrastructure/shared/socket/socket.client";
import { GAME_SOCKET_INBOUND_EVENT } from "../../../../infrastructure/game/game-socket-events";
import type { AnswerResult } from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";

vi.mock("../../../../infrastructure/shared/socket/socket.client", () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe("useGameSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useGameSocket());

    expect(result.current.players).toEqual([]);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.questionNumber).toBe(0);
    expect(result.current.totalQuestions).toBe(0);
    expect(result.current.timeLeft).toBe(20);
    expect(result.current.answerResult).toBeNull();
    expect(result.current.showResult).toBe(false);
    expect(result.current.leaderboard).toEqual([]);
    expect(result.current.gameStarted).toBe(false);
    expect(result.current.gameEnded).toBe(false);
  });

  it("should register socket event listeners on mount", () => {
    renderHook(() => useGameSocket());

    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ERROR,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.PLAYER_JOINED,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_STARTED,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_RESUMED,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_PAUSED,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ANSWER_SUBMITTED,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ANSWER_RESULT,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.NEXT_QUESTION,
      expect.any(Function)
    );
    expect(socket.on).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_ENDED,
      expect.any(Function)
    );
  });

  it("should unregister socket event listeners on unmount", () => {
    const { unmount } = renderHook(() => useGameSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ERROR,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.PLAYER_JOINED,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_STARTED,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_RESUMED,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_PAUSED,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ANSWER_SUBMITTED,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.ANSWER_RESULT,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.NEXT_QUESTION,
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      GAME_SOCKET_INBOUND_EVENT.GAME_ENDED,
      expect.any(Function)
    );
  });

  it("should provide setTimeLeft function", () => {
    const { result } = renderHook(() => useGameSocket());

    expect(typeof result.current.setTimeLeft).toBe("function");
  });

  it("does not clear answer-result state when receiving game-resumed", () => {
    const { result } = renderHook(() => useGameSocket("ABC123"));

    const findHandler = (eventName: string) => {
      const call = (socket.on as unknown as vi.Mock).mock.calls.find(
        ([name]) => name === eventName
      );
      expect(call).toBeTruthy();
      return call?.[1] as (payload: unknown) => void;
    };

    const answerResultPayload: AnswerResult = {
      isCorrect: true,
      points: 100,
      correctAnswerIds: [1],
      statistics: {
        totalAnswers: 4,
        answerDistribution: { 1: 3, 2: 1, 3: 0, 4: 0 },
      },
    };

    const questionPayload: Question = {
      id: 1,
      quizId: 1,
      position: 0,
      questionText: "Q1",
      type: "multiple",
      answers: [
        { id: 1, text: "A", position: 0, isCorrect: true },
        { id: 2, text: "B", position: 1, isCorrect: false },
        { id: 3, text: "C", position: 2, isCorrect: false },
        { id: 4, text: "D", position: 3, isCorrect: false },
      ],
      timeLimit: 30,
      points: 100,
    };

    const handleAnswerResult = findHandler(GAME_SOCKET_INBOUND_EVENT.ANSWER_RESULT);
    const handleGamePaused = findHandler(GAME_SOCKET_INBOUND_EVENT.GAME_PAUSED);
    const handleGameResumed = findHandler(GAME_SOCKET_INBOUND_EVENT.GAME_RESUMED);

    act(() => {
      handleAnswerResult(answerResultPayload);
    });
    expect(result.current.showResult).toBe(true);
    expect(result.current.answerResult).toEqual(answerResultPayload);

    act(() => {
      handleGamePaused({ timeLeft: 0 });
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      handleGameResumed({
        question: questionPayload,
        totalQuestions: 10,
        timeLeft: 0,
      });
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.showResult).toBe(true);
    expect(result.current.answerResult).toEqual(answerResultPayload);
  });
});
