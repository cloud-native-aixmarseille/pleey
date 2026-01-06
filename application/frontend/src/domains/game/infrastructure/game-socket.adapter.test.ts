import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameSocketAdapter } from "./game-socket.adapter";
import { socket } from "../../../infrastructure/socket/socket.client";

vi.mock("../../../infrastructure/socket/socket.client", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe("GameSocketAdapter", () => {
  let adapter: GameSocketAdapter;

  beforeEach(() => {
    adapter = new GameSocketAdapter();
    vi.clearAllMocks();
  });

  describe("joinGame", () => {
    it("should emit join-game event", () => {
      adapter.joinGame("123456", "player1", 1);

      expect(socket.emit).toHaveBeenCalledWith("join-game", {
        pin: "123456",
        username: "player1",
        userId: 1,
      });
    });
  });

  describe("startGame", () => {
    it("should emit start-game event", () => {
      adapter.startGame("123456");

      expect(socket.emit).toHaveBeenCalledWith("start-game", { pin: "123456" });
    });
  });

  describe("submitAnswer", () => {
    it("should emit submit-answer event", () => {
      adapter.submitAnswer("123456", 1, "A", 15);

      expect(socket.emit).toHaveBeenCalledWith("submit-answer", {
        pin: "123456",
        userId: 1,
        answer: "A",
        timeLeft: 15,
      });
    });
  });

  describe("nextQuestion", () => {
    it("should emit next-question event", () => {
      adapter.nextQuestion("123456");

      expect(socket.emit).toHaveBeenCalledWith("next-question", {
        pin: "123456",
      });
    });
  });
});
