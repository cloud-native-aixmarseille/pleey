import { describe, expect, it } from 'vitest';
import { createGameScoreFixture } from '../../../test-utils/fixtures/unit';

describe('GameScore', () => {
  describe('constructor with correct answer', () => {
    it('should calculate total points with base points and time bonus for correct answer', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 10,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(250); // (10/20) * 500 = 250
      expect(score.getTotalPoints()).toBe(1250); // 1000 + 250
    });

    it('should calculate full time bonus when all time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 20,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(500); // (20/20) * 500 = 500
      expect(score.getTotalPoints()).toBe(1500);
    });

    it('should calculate zero time bonus when no time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 0,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should calculate small time bonus when little time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 1,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(25); // (1/20) * 500 = 25
      expect(score.getTotalPoints()).toBe(1025);
    });
  });

  describe('constructor with incorrect answer', () => {
    it('should return zero total points for incorrect answer', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 15,
        timeLimit: 20,
        isCorrect: false,
      });

      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(375); // Still calculated
      expect(score.getTotalPoints()).toBe(0); // But total is 0 for incorrect
    });

    it('should return zero points even with full time bonus', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 20,
        timeLimit: 20,
        isCorrect: false,
      });

      expect(score.getTotalPoints()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative time left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: -5,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should handle zero time limit', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 10,
        timeLimit: 0,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should handle negative time limit', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 10,
        timeLimit: -20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should floor time bonus to integer', () => {
      // (7/20) * 500 = 175, should be floored
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeLeft: 7,
        timeLimit: 20,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(175);
      expect(Number.isInteger(score.getTimeBonus())).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return correct values from getters', () => {
      const score = createGameScoreFixture({
        basePoints: 800,
        timeLeft: 12,
        timeLimit: 30,
        isCorrect: true,
      });

      expect(score.getBasePoints()).toBe(800);
      expect(score.getTimeBonus()).toBe(200); // (12/30) * 500 = 200
      expect(score.getTotalPoints()).toBe(1000); // 800 + 200
    });
  });
});
