import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameService } from "./game.service";
import type { GameRepository } from "./ports/game.repository";
import type { GameSocket } from "./ports/game-socket";
import { createGameSessionFixture } from "../../test/fixtures";
import { createGameRepositoryMock } from "../../test/mock-factories/game-repository.mock-factory";
import { createGameSocketMock } from "../../test/mock-factories/game-socket.mock-factory";

describe("GameService", () => {
  const mockToken = "mock-jwt-token";
  let gameRepository: GameRepository;
  let gameSocket: GameSocket;
  let gameService: GameService;

  beforeEach(() => {
    gameRepository = createGameRepositoryMock();
    gameSocket = createGameSocketMock();
    gameService = new GameService(gameRepository, gameSocket);
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a game session", async () => {
      const mockSession = createGameSessionFixture();

      vi.mocked(gameRepository.createSession).mockResolvedValueOnce(mockSession);

      const result = await gameService.createSession(mockToken, 1);

      expect(gameRepository.createSession).toHaveBeenCalledWith(mockToken, 1);
      expect(result).toEqual(mockSession);
      expect(result.pin).toBe("123456");
    });

    it("should throw translated error when API fails", async () => {
      vi.mocked(gameRepository.createSession).mockRejectedValueOnce(
        new Error("unit.test.error"),
      );

      await expect(gameService.createSession(mockToken, 1)).rejects.toThrow(
        "unit.test.error",
      );
    });
  });

  it("should throw when session creation fails", async () => {
    vi.mocked(gameRepository.createSession).mockRejectedValueOnce(
      new Error("game.errors.sessionCreateFailed"),
    );

    await expect(gameService.createSession(mockToken, 1)).rejects.toThrow(
      "game.errors.sessionCreateFailed",
    );
  });

  describe("joinGame", () => {
    it("should emit join-game event", () => {
      gameService.joinGame("123456", "testuser", 1);

      expect(gameSocket.publish).toHaveBeenCalledWith({
        type: "join-game",
        pin: "123456",
        username: "testuser",
        userId: 1,
      });
    });
  });

  describe("startGame", () => {
    it("should emit start-game event", () => {
      gameService.startGame("123456");

      expect(gameSocket.publish).toHaveBeenCalledWith({
        type: "start-game",
        pin: "123456",
      });
    });
  });

  describe("submitAnswer", () => {
    it("should emit submit-answer event with answer data", () => {
      gameService.submitAnswer("123456", 1, 42, 15);

      expect(gameSocket.publish).toHaveBeenCalledWith({
        type: "submit-answer",
        pin: "123456",
        userId: 1,
        answerId: 42,
        timeLeft: 15,
      });
    });
  });

  describe("nextQuestion", () => {
    it("should emit next-question event", () => {
      gameService.nextQuestion("123456");

      expect(gameSocket.publish).toHaveBeenCalledWith({
        type: "next-question",
        pin: "123456",
      });
    });
  });
});
