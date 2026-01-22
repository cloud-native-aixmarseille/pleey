import { vi } from "vitest";

type MockFunction = ReturnType<typeof vi.fn>;

export type GameServiceMock = {
  joinGame: MockFunction;
  getActiveSessions: MockFunction;
  getSessionsByQuiz: MockFunction;
  createSession: MockFunction;
  endGame: MockFunction;
  submitAnswer: MockFunction;
  nextQuestion: MockFunction;
  startGame: MockFunction;
  stopGame: MockFunction;
  resumeGame: MockFunction;
  launchQuiz: MockFunction;
};

export const createGameServiceMock = (
  overrides: Partial<GameServiceMock> = {}
): GameServiceMock => ({
  joinGame: vi.fn(),
  getActiveSessions: vi.fn(),
  getSessionsByQuiz: vi.fn(),
  createSession: vi.fn(),
  endGame: vi.fn(),
  submitAnswer: vi.fn(),
  nextQuestion: vi.fn(),
  startGame: vi.fn(),
  stopGame: vi.fn(),
  resumeGame: vi.fn(),
  launchQuiz: vi.fn(),
  ...overrides,
});

export const createGameServiceMockWithDefaults = (
  overrides: Partial<GameServiceMock> = {}
): GameServiceMock =>
  createGameServiceMock({
    getActiveSessions: vi.fn().mockResolvedValue([]),
    getSessionsByQuiz: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

export const resetGameServiceMock = (mock: GameServiceMock) => {
  for (const value of Object.values(mock)) {
    value.mockClear();
  }
};
