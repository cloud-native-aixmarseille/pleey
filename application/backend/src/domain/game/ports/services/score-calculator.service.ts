import type { GameScore } from '../../entities/game-score';
import type { GameType } from '../../enums/game-type.enum';

export const ScoreCalculatorProvider = Symbol('ScoreCalculator');

export interface ScoreCalculatorService {
  calculateScore(
    gameType: GameType,
    basePoints: number,
    timeLeft: number,
    timeLimit: number,
    isCorrect: boolean,
  ): GameScore;
}
