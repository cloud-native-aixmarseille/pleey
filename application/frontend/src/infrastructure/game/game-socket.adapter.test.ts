import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameSocketAdapter } from "./game-socket.adapter";
import { GAME_SOCKET_OUTBOUND_EVENT } from "./game-socket-outbound-events";
import { socket } from "../shared/socket/socket.client";

vi.mock("../shared/socket/socket.client", async () => {
  const { createSocketClientMock } = await import(
    "../../test/mock-factories/socket-client.mock-factory"
  );
  return {
    socket: createSocketClientMock(),
  };
});

describe("GameSocketAdapter", () => {
  let adapter: GameSocketAdapter;

  beforeEach(() => {
    adapter = new GameSocketAdapter();
    vi.clearAllMocks();
  });

  describe("publish(join-game)", () => {
    it("should emit join-game event", () => {
      adapter.publish({
        type: "join-game",
        pin: "123456",
        username: "player1",
        userId: 1,
      });

      expect(socket.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.JOIN_GAME, {
        pin: "123456",
        username: "player1",
        userId: 1,
      });
    });
  });

  describe("publish(start-game)", () => {
    it("should emit start-game event", () => {
      adapter.publish({ type: "start-game", pin: "123456" });

      expect(socket.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.START_GAME, {
        pin: "123456",
      });
    });
  });

  describe("publish(submit-answer)", () => {
    it("should emit submit-answer event", () => {
      adapter.publish({
        type: "submit-answer",
        pin: "123456",
        userId: 1,
        answerId: 2,
        timeLeft: 15,
      });

      expect(socket.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.SUBMIT_ANSWER, {
        pin: "123456",
        userId: 1,
        answerId: 2,
        timeLeft: 15,
      });
    });
  });

  describe("publish(next-question)", () => {
    it("should emit next-question event", () => {
      adapter.publish({ type: "next-question", pin: "123456" });

      expect(socket.emit).toHaveBeenCalledWith(GAME_SOCKET_OUTBOUND_EVENT.NEXT_QUESTION, {
        pin: "123456",
      });
    });
  });
});
