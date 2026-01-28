import { GameScore } from '../../../domain/game/entities/game-score';

type GameScoreFixtureParams = {
  basePoints?: number;
  timeBonus?: number;
  isCorrect?: boolean;
};

export const createGameScoreFixture = (params: GameScoreFixtureParams = {}): GameScore => {
  return new GameScore(
    params.basePoints ?? 1000,
    params.timeBonus ?? 250,
    params.isCorrect ?? true,
  );
};
