import { vi } from "vitest";
import { createContainerMock } from "./container.mock-factory";
import {
  createGameServiceMockWithDefaults,
  resetGameServiceMock,
} from "./game-service.mock-factory";
import { createUseGameSocketMock } from "./use-game-socket.mock-factory";
import { createUseTimerMock } from "./use-timer.mock-factory";

export const gameServiceMock = createGameServiceMockWithDefaults();

vi.mock("../../app/di/container", async () => {
  return {
    container: createContainerMock({
      gameService: {
        ...gameServiceMock,
      },
    }),
  };
});

vi.mock("../../presentation/domains/game/hooks/useGameSocket", () =>
  createUseGameSocketMock(),
);

vi.mock("../../presentation/shared/hooks/useTimer", () =>
  createUseTimerMock(),
);

export const resetGameSessionManagerMocks = () =>
  resetGameServiceMock(gameServiceMock);
