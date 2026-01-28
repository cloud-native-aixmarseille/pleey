import { vi } from 'vitest';
import type { GameActionId, GameStageType } from '../../../domain/game/entities/game-stage';
import type { PlayerScore } from '../../../domain/game/entities/player-score';

export type GameSessionStateFixtureParams = {
  sessionId?: number;
  gameTitle?: string;
  gameType?: 'quiz' | 'prediction';
  hasStages?: boolean;
  totalStages?: number;
  currentStage?: GameSessionStateStageFixture;
  startFirstStage?: ReturnType<typeof vi.fn>;
  hasMoreStages?: boolean;
  currentStageId?: number;
  advanceToNextStage?: ReturnType<typeof vi.fn>;
  restartCurrentStage?: ReturnType<typeof vi.fn>;
  rewindToPreviousStage?: ReturnType<typeof vi.fn>;
  returnToLobby?: ReturnType<typeof vi.fn>;
  resume?: ReturnType<typeof vi.fn>;
  hasPlayerActed?: ReturnType<typeof vi.fn>;
  findPlayerByIdentity?: ReturnType<typeof vi.fn>;
  getOrCreateScore?: ReturnType<typeof vi.fn>;
  recordAction?: ReturnType<typeof vi.fn>;
  haveAllNonHostPlayersActed?: ReturnType<typeof vi.fn>;
  getAllPlayers?: () => unknown[];
  getNonHostPlayers?: () => unknown[];
  scores?: PlayerScore[];
  getScoresExcludingHost?: () => PlayerScore[];
};

type GameSessionStateStageFixture = {
  id: number;
  position: number;
  text: string;
  actions: Array<{
    id: GameActionId;
    text: string;
    position: number;
    isCorrect: boolean;
  }>;
  timeLimit: number;
  points: number;
  type: GameStageType;
};

type GameSessionStateStub = {
  sessionId: number;
  gameTitle: string;
  gameType: 'quiz' | 'prediction';
  hasStages: boolean;
  totalStages: number;
  currentStage?: GameSessionStateStageFixture;
  startFirstStage: ReturnType<typeof vi.fn>;
  hasMoreStages?: boolean;
  currentStageId?: number;
  advanceToNextStage?: ReturnType<typeof vi.fn>;
  restartCurrentStage?: ReturnType<typeof vi.fn>;
  rewindToPreviousStage?: ReturnType<typeof vi.fn>;
  returnToLobby?: ReturnType<typeof vi.fn>;
  resume?: ReturnType<typeof vi.fn>;
  hasPlayerActed?: ReturnType<typeof vi.fn>;
  findPlayerByIdentity?: ReturnType<typeof vi.fn>;
  getOrCreateScore?: ReturnType<typeof vi.fn>;
  recordAction?: ReturnType<typeof vi.fn>;
  haveAllNonHostPlayersActed?: ReturnType<typeof vi.fn>;
  getAllPlayers: () => unknown[];
  getNonHostPlayers: () => unknown[];
  getScoresExcludingHost: () => PlayerScore[];
};

export const createGameSessionStateFixture = (
  params: GameSessionStateFixtureParams = {},
): GameSessionStateStub => {
  const scores = params.scores ?? [];
  const hasStages = params.hasStages ?? true;
  const currentStage =
    params.currentStage ??
    (hasStages
      ? {
          id: 1,
          position: 0,
          text: 'Question? ',
          actions: [{ id: 1 as GameActionId, text: 'Answer', position: 0, isCorrect: true }],
          timeLimit: 10,
          points: 1000,
          type: 'multiple',
        }
      : undefined);

  return {
    sessionId: params.sessionId ?? 1,
    gameTitle: params.gameTitle ?? 'Arcade Trivia',
    gameType: params.gameType ?? 'quiz',
    hasStages,
    totalStages: params.totalStages ?? (hasStages ? 1 : 0),
    currentStage,
    startFirstStage: params.startFirstStage ?? vi.fn(),
    hasMoreStages: params.hasMoreStages,
    currentStageId: params.currentStageId,
    advanceToNextStage: params.advanceToNextStage,
    restartCurrentStage: params.restartCurrentStage ?? vi.fn(),
    rewindToPreviousStage: params.rewindToPreviousStage ?? vi.fn(),
    returnToLobby: params.returnToLobby ?? vi.fn(),
    resume: params.resume,
    hasPlayerActed: params.hasPlayerActed,
    findPlayerByIdentity: params.findPlayerByIdentity,
    getOrCreateScore: params.getOrCreateScore,
    recordAction: params.recordAction,
    haveAllNonHostPlayersActed: params.haveAllNonHostPlayersActed,
    getAllPlayers: params.getAllPlayers ?? (() => []),
    getNonHostPlayers: params.getNonHostPlayers ?? (() => []),
    getScoresExcludingHost: params.getScoresExcludingHost ?? (() => scores),
  };
};
