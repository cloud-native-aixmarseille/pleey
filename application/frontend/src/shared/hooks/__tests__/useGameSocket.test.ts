import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGameSocket } from "../useGameSocket";
import { socket } from "../../socket/socket.client";

// Mock the socket client
vi.mock("../../socket/socket.client", () => ({
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
      "player-joined",
      expect.any(Function),
    );
    expect(socket.on).toHaveBeenCalledWith(
      "game-started",
      expect.any(Function),
    );
    expect(socket.on).toHaveBeenCalledWith(
      "answer-result",
      expect.any(Function),
    );
    expect(socket.on).toHaveBeenCalledWith(
      "next-question",
      expect.any(Function),
    );
    expect(socket.on).toHaveBeenCalledWith("game-ended", expect.any(Function));
  });

  it("should unregister socket event listeners on unmount", () => {
    const { unmount } = renderHook(() => useGameSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith("player-joined");
    expect(socket.off).toHaveBeenCalledWith("game-started");
    expect(socket.off).toHaveBeenCalledWith("answer-result");
    expect(socket.off).toHaveBeenCalledWith("next-question");
    expect(socket.off).toHaveBeenCalledWith("game-ended");
  });

  it("should provide setTimeLeft function", () => {
    const { result } = renderHook(() => useGameSocket());

    expect(typeof result.current.setTimeLeft).toBe("function");
  });
});
