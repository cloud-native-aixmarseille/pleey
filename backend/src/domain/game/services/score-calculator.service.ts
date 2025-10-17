import { Injectable } from '@nestjs/common';
import { GameScore } from '../value-objects/game-score.vo';

/**
 * Score Calculator Service
 * Handles score calculation logic
 */
@Injectable()
export class ScoreCalculatorService {
  /**
   * Calculates the score for an answer
   */
  calculateScore(
    basePoints: number,
    timeLeft: number,
    timeLimit: number,
    isCorrect: boolean,
  ): GameScore {
    return new GameScore(basePoints, timeLeft, timeLimit, isCorrect);
  }

  /**
   * Calculates time bonus based on answer speed
   */
  calculateTimeBonus(timeLeft: number, timeLimit: number): number {
    if (timeLeft <= 0 || timeLimit <= 0) return 0;
    return Math.floor((timeLeft / timeLimit) * 500);
  }

  /**
   * Determines if answer was given quickly
   */
  wasQuickAnswer(answerTime: number, timeLimit: number): boolean {
    return answerTime < timeLimit / 2;
  }
}
