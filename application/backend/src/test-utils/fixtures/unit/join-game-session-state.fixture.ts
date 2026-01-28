import { vi } from 'vitest';

export type JoinGameSessionStateFixtureParams = {
  sessionId?: number;
  hostId?: number;
  gameTitle?: string;
  gameType?: 'quiz' | 'prediction';
  hasStages?: boolean;
  pausedTimeLeft?: number;
  totalStages?: number;
  stageStartTime?: number;
  currentStage?: {
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
  gameTitle: string;
  gameType: 'quiz' | 'prediction';
  hasStages: boolean;
  pausedTimeLeft?: number;
  totalStages: number;
  stageStartTime?: number;
  currentStage: {
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
    gameTitle: params.gameTitle ?? 'Arcade Trivia',
    gameType: params.gameType ?? 'quiz',
    hasStages: params.hasStages ?? true,
    pausedTimeLeft: params.pausedTimeLeft,
    totalStages: params.totalStages ?? 3,
    stageStartTime: params.stageStartTime,
    currentStage: params.currentStage ?? { timeLimit: 20, position: 0 },
    addPlayer: params.addPlayer ?? vi.fn(),
    getNonHostPlayers: params.getNonHostPlayers ?? (() => []),
    findPlayerByGuestId: params.findPlayerByGuestId ?? vi.fn().mockReturnValue(undefined),
    findPlayerByUserId: params.findPlayerByUserId ?? vi.fn().mockReturnValue(undefined),
  };
};
