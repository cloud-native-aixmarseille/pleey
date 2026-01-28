import { Injectable } from '@nestjs/common';
import { GameScore } from '../../game/entities/game-score';
import type { GameType } from '../../game/enums/game-type.enum';
import type { ScoreCalculatorService } from '../../game/ports/services/score-calculator.service';

/**
 * Quiz Score Calculator Service
 * Handles score calculation logic for quiz game types
 */
@Injectable()
export class QuizScoreCalculatorService implements ScoreCalculatorService {
  /**
   * Calculates the score for an action
   */
  calculateScore(
    _gameType: GameType,
    basePoints: number,
    timeLeft: number,
    timeLimit: number,
    isCorrect: boolean,
  ): GameScore {
    const timeBonus = this.calculateTimeBonusInternal(timeLeft, timeLimit);
    return new GameScore(basePoints, timeBonus, isCorrect);
  }

  private calculateTimeBonusInternal(timeLeft: number, timeLimit: number): number {
    if (timeLeft <= 0 || timeLimit <= 0) return 0;
    return Math.floor((timeLeft / timeLimit) * 500);
  }
}
