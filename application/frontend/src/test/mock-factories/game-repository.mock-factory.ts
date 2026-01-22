import { vi } from "vitest";
import type { GameRepository } from "../../domains/game/ports/game.repository";

export const createGameRepositoryMock = (
  overrides: Partial<GameRepository> = {}
): GameRepository => ({
  createSession: vi.fn(),
  getActiveSessions: vi.fn(),
  getSessionsByQuiz: vi.fn(),
  stopSession: vi.fn(),
  resumeSession: vi.fn(),
  ...overrides,
});
