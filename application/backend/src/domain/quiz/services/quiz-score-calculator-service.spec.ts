import { beforeEach, describe, expect, it } from 'vitest';
import { GameScore } from '../../game/entities/game-score';
import { GameType } from '../../game/enums/game-type.enum';
import { QuizScoreCalculatorService } from './quiz-score-calculator-service';

describe('QuizScoreCalculatorService', () => {
  let service: QuizScoreCalculatorService;

  beforeEach(() => {
    service = new QuizScoreCalculatorService();
  });

  describe('calculateScore', () => {
    it('should return GameScore instance', () => {
      const score = service.calculateScore(GameType.QUIZ, 1000, 15, 30, true);
      expect(score).toBeInstanceOf(GameScore);
    });

    it('should calculate correct score for correct action', () => {
      const score = service.calculateScore(GameType.QUIZ, 1000, 15, 30, true);
      expect(score.getTotalPoints()).toBe(1250); // 1000 + 250 bonus
    });

    it('should calculate zero score for incorrect action', () => {
      const score = service.calculateScore(GameType.QUIZ, 1000, 15, 30, false);
      expect(score.getTotalPoints()).toBe(0);
    });

    it('should handle edge cases', () => {
      const score = service.calculateScore(GameType.QUIZ, 500, 0, 20, true);
      expect(score.getTotalPoints()).toBe(500); // No time bonus
    });

    it('should give no points for incorrect action regardless of speed', () => {
      const quickScore = service.calculateScore(GameType.QUIZ, 1000, 29, 30, false);
      const slowScore = service.calculateScore(GameType.QUIZ, 1000, 1, 30, false);

      expect(quickScore.getTotalPoints()).toBe(0);
      expect(slowScore.getTotalPoints()).toBe(0);
    });
  });
});
