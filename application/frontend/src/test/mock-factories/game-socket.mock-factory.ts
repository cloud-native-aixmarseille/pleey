import { vi } from "vitest";
import type { GameSocket } from "../../domains/game/ports/game-socket";

export const createGameSocketMock = (
  overrides: Partial<GameSocket> = {}
): GameSocket => ({
  publish: vi.fn(),
  ...overrides,
});
