import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaunchQuizUseCase } from "./launch-quiz.use-case";
import { IGameRepository } from "../../../domains/game/ports/game.repository.interface";
import { IGameSocket } from "../../../domains/game/ports/game-socket.interface";
import type { User } from "../../../domains/auth/types";
import type { GameSession } from "../../../domains/game/types";
import { createGameSessionFixture, createUserFixture } from "../../../test/fixtures";

describe("LaunchQuizUseCase", () => {
  let launchQuizUseCase: LaunchQuizUseCase;
  let mockGameRepository: IGameRepository;
  let mockGameSocket: IGameSocket;

  const mockUser: User = createUserFixture({
    username: "admin",
    isAdmin: true,
  });

  beforeEach(() => {
    mockGameRepository = {
      createSession: vi.fn(),
      getActiveSessions: vi.fn(),
      stopSession: vi.fn(),
      resumeSession: vi.fn(),
    };

    mockGameSocket = {
      publish: vi.fn(),
    };

    launchQuizUseCase = new LaunchQuizUseCase(
      mockGameRepository,
      mockGameSocket,
    );
  });

  it("should launch quiz successfully", async () => {
    const mockSession: GameSession = createGameSessionFixture();

    vi.mocked(mockGameRepository.createSession).mockResolvedValue(mockSession);

    const result = await launchQuizUseCase.execute({
      token: "test-token",
      quizId: 1,
      user: mockUser,
      questionCount: 5,
    });

    expect(result.session).toEqual(mockSession);
    expect(mockGameRepository.createSession).toHaveBeenCalledWith(
      "test-token",
      1,
    );
    expect(mockGameSocket.publish).toHaveBeenCalledWith({
      type: "join-game",
      pin: "123456",
      username: "admin",
      userId: 1,
    });
  });

  it("should throw error when question count is zero", async () => {
    await expect(
      launchQuizUseCase.execute({
        token: "test-token",
        quizId: 1,
        user: mockUser,
        questionCount: 0,
      }),
    ).rejects.toThrow("Cannot launch quiz without questions");

    expect(mockGameRepository.createSession).not.toHaveBeenCalled();
    expect(mockGameSocket.publish).not.toHaveBeenCalled();
  });
});

