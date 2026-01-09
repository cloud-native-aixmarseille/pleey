import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useGameSocket } from "./useGameSocket";
import { socket } from "../../../../infrastructure/socket/socket.client";
import { GAME_SOCKET_INBOUND_EVENT } from "../../../../domains/game/infrastructure/game-socket-events";
import type { AnswerResult } from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";

vi.mock("../../../../infrastructure/socket/socket.client", () => ({
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
      correctAnswer: "A",
      statistics: {
        totalAnswers: 4,
        answerDistribution: { A: 3, B: 1, C: 0, D: 0 },
      },
    };

    const questionPayload: Question = {
      id: 1,
      quiz_id: 1,
      question_text: "Q1",
      type: "multiple",
      correct_answer: "A",
      option_a: "A",
      option_b: "B",
      option_c: "C",
      option_d: "D",
      time_limit: 30,
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
        questionNumber: 1,
        totalQuestions: 10,
        timeLeft: 0,
      });
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.showResult).toBe(true);
    expect(result.current.answerResult).toEqual(answerResultPayload);
  });
});
