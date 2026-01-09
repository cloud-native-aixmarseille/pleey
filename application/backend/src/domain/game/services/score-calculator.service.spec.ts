import { beforeEach, describe, expect, it } from 'vitest';
import { GameScore } from '../entities/game-score';
import { ScoreCalculatorService } from './score-calculator.service';

describe('ScoreCalculatorService', () => {
  let service: ScoreCalculatorService;

  beforeEach(() => {
    service = new ScoreCalculatorService();
  });

  describe('calculateScore', () => {
    it('should return GameScore instance', () => {
      const score = service.calculateScore(1000, 15, 30, true);
      expect(score).toBeInstanceOf(GameScore);
    });

    it('should calculate correct score for correct answer', () => {
      const score = service.calculateScore(1000, 15, 30, true);
      expect(score.getTotalPoints()).toBe(1250); // 1000 + 250 bonus
    });

    it('should calculate zero score for incorrect answer', () => {
      const score = service.calculateScore(1000, 15, 30, false);
      expect(score.getTotalPoints()).toBe(0);
    });

    it('should handle edge cases', () => {
      const score = service.calculateScore(500, 0, 20, true);
      expect(score.getTotalPoints()).toBe(500); // No time bonus
    });
  });

  describe('calculateTimeBonus', () => {
    it('should calculate time bonus correctly', () => {
      expect(service.calculateTimeBonus(10, 20)).toBe(250);
      expect(service.calculateTimeBonus(20, 20)).toBe(500);
      expect(service.calculateTimeBonus(5, 20)).toBe(125);
    });

    it('should return zero for no time left', () => {
      expect(service.calculateTimeBonus(0, 20)).toBe(0);
    });

    it('should return zero for negative time left', () => {
      expect(service.calculateTimeBonus(-5, 20)).toBe(0);
    });

    it('should return zero for zero time limit', () => {
      expect(service.calculateTimeBonus(10, 0)).toBe(0);
    });

    it('should return zero for negative time limit', () => {
      expect(service.calculateTimeBonus(10, -20)).toBe(0);
    });

    it('should floor fractional bonuses', () => {
      expect(service.calculateTimeBonus(7, 20)).toBe(175);
      expect(Number.isInteger(service.calculateTimeBonus(7, 20))).toBe(true);
    });

    it('should calculate maximum bonus when full time is left', () => {
      expect(service.calculateTimeBonus(30, 30)).toBe(500);
    });
  });

  describe('wasQuickAnswer', () => {
    it('should return true when answer time is less than half time limit', () => {
      expect(service.wasQuickAnswer(10, 30)).toBe(true);
      expect(service.wasQuickAnswer(5, 20)).toBe(true);
      expect(service.wasQuickAnswer(1, 10)).toBe(true);
    });

    it('should return false when answer time is more than half time limit', () => {
      expect(service.wasQuickAnswer(20, 30)).toBe(false);
      expect(service.wasQuickAnswer(15, 20)).toBe(false);
      expect(service.wasQuickAnswer(25, 30)).toBe(false);
    });

    it('should return false when answer time equals half time limit', () => {
      expect(service.wasQuickAnswer(15, 30)).toBe(false);
      expect(service.wasQuickAnswer(10, 20)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(service.wasQuickAnswer(0, 30)).toBe(true); // Instant answer
      expect(service.wasQuickAnswer(1, 3)).toBe(true); // Very quick (1 < 1.5)
    });

    it('should work with decimal time limits', () => {
      expect(service.wasQuickAnswer(5, 15)).toBe(true); // 5 < 7.5
      expect(service.wasQuickAnswer(8, 15)).toBe(false); // 8 > 7.5
    });
  });

  describe('integration scenarios', () => {
    it('should calculate full score for quick correct answer', () => {
      const timeLeft = 25;
      const timeLimit = 30;
      const score = service.calculateScore(1000, timeLeft, timeLimit, true);

      expect(service.wasQuickAnswer(timeLimit - timeLeft, timeLimit)).toBe(true);
      expect(score.getTotalPoints()).toBeGreaterThan(1000);
    });

    it('should calculate score with less bonus for slow correct answer', () => {
      const timeLeft = 5;
      const timeLimit = 30;
      const score = service.calculateScore(1000, timeLeft, timeLimit, true);

      expect(service.wasQuickAnswer(timeLimit - timeLeft, timeLimit)).toBe(false);
      expect(score.getTotalPoints()).toBeGreaterThan(1000);
      expect(score.getTotalPoints()).toBeLessThan(1500);
    });

    it('should give no points for incorrect answer regardless of speed', () => {
      const quickScore = service.calculateScore(1000, 29, 30, false);
      const slowScore = service.calculateScore(1000, 1, 30, false);

      expect(quickScore.getTotalPoints()).toBe(0);
      expect(slowScore.getTotalPoints()).toBe(0);
    });
  });
});
