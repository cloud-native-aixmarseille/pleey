import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaunchQuizUseCase } from "./launch-quiz.use-case";
import { IGameRepository } from "../../../domains/game/ports/game.repository.interface";
import { IGameSocket } from "../../../domains/game/ports/game-socket.interface";
import type { User } from "../../../domains/auth/types";
import type { GameSession } from "../../../domains/game/types";

describe("LaunchQuizUseCase", () => {
  let launchQuizUseCase: LaunchQuizUseCase;
  let mockGameRepository: IGameRepository;
  let mockGameSocket: IGameSocket;

  const mockUser: User = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    isAdmin: true,
  };

  beforeEach(() => {
    mockGameRepository = {
      createSession: vi.fn(),
    };

    mockGameSocket = {
      joinGame: vi.fn(),
      startGame: vi.fn(),
      submitAnswer: vi.fn(),
      nextQuestion: vi.fn(),
    };

    launchQuizUseCase = new LaunchQuizUseCase(
      mockGameRepository,
      mockGameSocket,
    );
  });

  it("should launch quiz successfully", async () => {
    const mockSession: GameSession = {
      pin: "123456",
      quiz_id: 1,
      status: "waiting",
    };

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
    expect(mockGameSocket.joinGame).toHaveBeenCalledWith("123456", "admin", 1);
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
    expect(mockGameSocket.joinGame).not.toHaveBeenCalled();
  });
});

