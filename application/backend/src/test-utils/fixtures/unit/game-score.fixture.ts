import { GameScore } from '../../../domain/game/entities/game-score';

type GameScoreFixtureParams = {
  basePoints?: number;
  timeLeft?: number;
  timeLimit?: number;
  isCorrect?: boolean;
};

export const createGameScoreFixture = (params: GameScoreFixtureParams = {}): GameScore => {
  return new GameScore(
    params.basePoints ?? 1000,
    params.timeLeft ?? 10,
    params.timeLimit ?? 20,
    params.isCorrect ?? true,
  );
};
