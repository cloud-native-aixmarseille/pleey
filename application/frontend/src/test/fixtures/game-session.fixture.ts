import type { GameSession } from "../../domains/game/types";

import { withDefaults } from "./fixture-utils";

export const createGameSessionFixture = (
  overrides: Partial<GameSession> = {},
): GameSession => {
  return withDefaults(
    {
      pin: "123456",
      status: "waiting",
      currentQuestion: 0,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    overrides,
  );
};
