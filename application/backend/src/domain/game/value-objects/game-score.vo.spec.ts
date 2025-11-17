import { describe, it, expect } from 'vitest';
import { GameScore } from './game-score.vo';

describe('GameScore Value Object', () => {
  describe('constructor with correct answer', () => {
    it('should calculate total points with base points and time bonus for correct answer', () => {
      const score = new GameScore(1000, 10, 20, true);
      
      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(250); // (10/20) * 500 = 250
      expect(score.getTotalPoints()).toBe(1250); // 1000 + 250
    });

    it('should calculate full time bonus when all time is left', () => {
      const score = new GameScore(1000, 20, 20, true);
      
      expect(score.getTimeBonus()).toBe(500); // (20/20) * 500 = 500
      expect(score.getTotalPoints()).toBe(1500);
    });

    it('should calculate zero time bonus when no time is left', () => {
      const score = new GameScore(1000, 0, 20, true);
      
      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should calculate small time bonus when little time is left', () => {
      const score = new GameScore(1000, 1, 20, true);
      
      expect(score.getTimeBonus()).toBe(25); // (1/20) * 500 = 25
      expect(score.getTotalPoints()).toBe(1025);
    });
  });

  describe('constructor with incorrect answer', () => {
    it('should return zero total points for incorrect answer', () => {
      const score = new GameScore(1000, 15, 20, false);
      
      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(375); // Still calculated
      expect(score.getTotalPoints()).toBe(0); // But total is 0 for incorrect
    });

    it('should return zero points even with full time bonus', () => {
      const score = new GameScore(1000, 20, 20, false);
      
      expect(score.getTotalPoints()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative time left', () => {
      const score = new GameScore(1000, -5, 20, true);
      
      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should handle zero time limit', () => {
      const score = new GameScore(1000, 10, 0, true);
      
      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should handle negative time limit', () => {
      const score = new GameScore(1000, 10, -20, true);
      
      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should floor time bonus to integer', () => {
      // (7/20) * 500 = 175, should be floored
      const score = new GameScore(1000, 7, 20, true);
      
      expect(score.getTimeBonus()).toBe(175);
      expect(Number.isInteger(score.getTimeBonus())).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return correct values from getters', () => {
      const score = new GameScore(800, 12, 30, true);
      
      expect(score.getBasePoints()).toBe(800);
      expect(score.getTimeBonus()).toBe(200); // (12/30) * 500 = 200
      expect(score.getTotalPoints()).toBe(1000); // 800 + 200
    });
  });
});
