import { describe, it, expect, vi, beforeEach } from "vitest";
import { JoinGameUseCase } from "./join-game.use-case";
import { IGameSocket } from "../../../domains/game/ports/game-socket.interface";

describe("JoinGameUseCase", () => {
  let joinGameUseCase: JoinGameUseCase;
  let mockGameSocket: IGameSocket;

  beforeEach(() => {
    mockGameSocket = {
      publish: vi.fn(),
    };

    joinGameUseCase = new JoinGameUseCase(mockGameSocket);
  });

  describe("Authenticated user join", () => {
    it("should join game successfully with userId", () => {
      joinGameUseCase.execute({
        pin: "123456",
        username: "player1",
        userId: 1,
      });

      expect(mockGameSocket.publish).toHaveBeenCalledWith({
        type: "join-game",
        pin: "123456",
        username: "player1",
        userId: 1,
        guestId: undefined,
      });
    });
  });

  describe("Guest user join", () => {
    it("should join game successfully with guestId", () => {
      joinGameUseCase.execute({
        pin: "123456",
        username: "guest_player",
        guestId: "guest-xyz",
      });

      expect(mockGameSocket.publish).toHaveBeenCalledWith({
        type: "join-game",
        pin: "123456",
        username: "guest_player",
        userId: undefined,
        guestId: "guest-xyz",
      });
    });

    it("should join game with both username and guestId, no userId", () => {
      joinGameUseCase.execute({
        pin: "ABC123",
        username: "John",
        guestId: "guest-123",
      });

      expect(mockGameSocket.publish).toHaveBeenCalledWith({
        type: "join-game",
        pin: "ABC123",
        username: "John",
        userId: undefined,
        guestId: "guest-123",
      });
    });
  });

  describe("Validation", () => {
    it("should throw error when PIN is empty", () => {
      expect(() =>
        joinGameUseCase.execute({
          pin: "",
          username: "player1",
          userId: 1,
        }),
      ).toThrow("Game PIN is required");

      expect(mockGameSocket.publish).not.toHaveBeenCalled();
    });

    it("should throw error when PIN is whitespace", () => {
      expect(() =>
        joinGameUseCase.execute({
          pin: "   ",
          username: "player1",
          userId: 1,
        }),
      ).toThrow("Game PIN is required");

      expect(mockGameSocket.publish).not.toHaveBeenCalled();
    });
  });
});
