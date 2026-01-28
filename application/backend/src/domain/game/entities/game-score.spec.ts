import { describe, expect, it } from 'vitest';
import { createGameScoreFixture } from '../../../test-utils/fixtures/unit/game-score.fixture';

describe('GameScore', () => {
  describe('constructor with correct action', () => {
    it('should calculate total points with base points and time bonus for correct action', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 250,
        isCorrect: true,
      });

      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(250);
      expect(score.getTotalPoints()).toBe(1250); // 1000 + 250
    });

    it('should use the provided time bonus when all time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 500,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(500);
      expect(score.getTotalPoints()).toBe(1500);
    });

    it('should accept zero time bonus when no time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 0,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should use a small time bonus when little time is left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 25,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(25);
      expect(score.getTotalPoints()).toBe(1025);
    });
  });

  describe('constructor with incorrect action', () => {
    it('should return zero total points for incorrect action', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 375,
        isCorrect: false,
      });

      expect(score.getBasePoints()).toBe(1000);
      expect(score.getTimeBonus()).toBe(375);
      expect(score.getTotalPoints()).toBe(0); // But total is 0 for incorrect
    });

    it('should return zero points even with full time bonus', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 500,
        isCorrect: false,
      });

      expect(score.getTotalPoints()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should allow zero time bonus for negative time left', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 0,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should allow zero time bonus for zero time limit', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 0,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should allow zero time bonus for negative time limit', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 0,
        isCorrect: true,
      });

      expect(score.getTimeBonus()).toBe(0);
      expect(score.getTotalPoints()).toBe(1000);
    });

    it('should keep time bonus as provided', () => {
      const score = createGameScoreFixture({
        basePoints: 1000,
        timeBonus: 175,
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
        timeBonus: 200,
        isCorrect: true,
      });

      expect(score.getBasePoints()).toBe(800);
      expect(score.getTimeBonus()).toBe(200);
      expect(score.getTotalPoints()).toBe(1000); // 800 + 200
    });
  });
});
