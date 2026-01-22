import { vi } from 'vitest';

export type JoinGameSessionStateFixtureParams = {
  sessionId?: number;
  hostId?: number;
  hasQuestions?: boolean;
  pausedTimeLeft?: number;
  totalQuestions?: number;
  questionStartTime?: number;
  currentQuestion?: {
    timeLimit: number;
    position: number;
  };
  addPlayer?: ReturnType<typeof vi.fn>;
  getNonHostPlayers?: () => unknown[];
  findPlayerByGuestId?: ReturnType<typeof vi.fn>;
  findPlayerByUserId?: ReturnType<typeof vi.fn>;
};

type JoinGameSessionStateStub = {
  sessionId: number;
  hostId: number;
  hasQuestions: boolean;
  pausedTimeLeft?: number;
  totalQuestions: number;
  questionStartTime?: number;
  currentQuestion: {
    timeLimit: number;
    position: number;
  };
  addPlayer: ReturnType<typeof vi.fn>;
  getNonHostPlayers: () => unknown[];
  findPlayerByGuestId: ReturnType<typeof vi.fn>;
  findPlayerByUserId: ReturnType<typeof vi.fn>;
};

export const createJoinGameSessionStateFixture = (
  params: JoinGameSessionStateFixtureParams = {},
): JoinGameSessionStateStub => {
  return {
    sessionId: params.sessionId ?? 1,
    hostId: params.hostId ?? 999,
    hasQuestions: params.hasQuestions ?? true,
    pausedTimeLeft: params.pausedTimeLeft,
    totalQuestions: params.totalQuestions ?? 3,
    questionStartTime: params.questionStartTime,
    currentQuestion: params.currentQuestion ?? { timeLimit: 20, position: 0 },
    addPlayer: params.addPlayer ?? vi.fn(),
    getNonHostPlayers: params.getNonHostPlayers ?? (() => []),
    findPlayerByGuestId: params.findPlayerByGuestId ?? vi.fn().mockReturnValue(undefined),
    findPlayerByUserId: params.findPlayerByUserId ?? vi.fn().mockReturnValue(undefined),
  };
};
