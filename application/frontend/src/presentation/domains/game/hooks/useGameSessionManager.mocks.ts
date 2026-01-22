import { vi } from "vitest";
import { createContainerMock } from "../../../../test/mock-factories/container.mock-factory";
import { resetGameServiceMock } from "../../../../test/mock-factories/game-service.mock-factory";
import { createUseGameSocketMock } from "../../../../test/mock-factories/use-game-socket.mock-factory";
import { createUseTimerMock } from "../../../../test/mock-factories/use-timer.mock-factory";

const { gameServiceMock } = vi.hoisted(() => ({
  gameServiceMock: {
    joinGame: vi.fn(),
    getActiveSessions: vi.fn().mockResolvedValue([]),
    getSessionsByQuiz: vi.fn().mockResolvedValue([]),
    createSession: vi.fn(),
    endGame: vi.fn(),
    submitAnswer: vi.fn(),
    nextQuestion: vi.fn(),
    startGame: vi.fn(),
    stopGame: vi.fn(),
    resumeGame: vi.fn(),
    launchQuiz: vi.fn(),
  },
}));

export { gameServiceMock };

vi.mock("./useGameSocket", () => createUseGameSocketMock());

vi.mock("../../../../presentation/shared/hooks/useTimer", () =>
  createUseTimerMock(),
);

vi.mock("../../../../app/di/container", async () => {
  return {
    container: createContainerMock({
      gameService: {
        ...gameServiceMock,
      },
    }),
  };
});

export const resetGameSessionManagerMocks = () =>
  resetGameServiceMock(gameServiceMock);
