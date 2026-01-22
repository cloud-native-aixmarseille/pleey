import { vi } from "vitest";

type GameSocketState = {
  players: unknown[];
  currentQuestion: unknown | null;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  setTimeLeft: ReturnType<typeof vi.fn>;
  answerResult: unknown | null;
  showResult: boolean;
  leaderboard: unknown[];
  gameStarted: boolean;
  gameEnded: boolean;
  answerSubmitted: boolean;
  isPaused?: boolean;
  lastErrorCode?: string | null;
};

export const createGameSocketState = (
  overrides: Partial<GameSocketState> = {}
): GameSocketState => ({
  players: [],
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 0,
  timeLeft: 0,
  setTimeLeft: vi.fn(),
  answerResult: null,
  showResult: false,
  leaderboard: [],
  gameStarted: false,
  gameEnded: false,
  answerSubmitted: false,
  isPaused: false,
  lastErrorCode: null,
  ...overrides,
});

export const createUseGameSocketMock = (
  overrides: Partial<GameSocketState> = {}
) => ({
  useGameSocket: () => createGameSocketState(overrides),
});
