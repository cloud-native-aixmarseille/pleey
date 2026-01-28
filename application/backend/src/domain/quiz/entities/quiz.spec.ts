import { describe, expect, it } from 'vitest';
import { createQuizFixture } from '../../../test-utils/fixtures/unit/quiz.fixture';

describe('Quiz', () => {
  describe('constructor', () => {
    it('should create a quiz instance with all properties', () => {
      const now = new Date();
      const quiz = createQuizFixture({
        id: 1,
        gameId: 42,
        createdAt: now,
        questionCount: 3,
      });

      expect(quiz.id).toBe(1);
      expect(quiz.gameId).toBe(42);
      expect(quiz.createdAt).toBe(now);
      expect(quiz.questionCount).toBe(3);
    });
  });
});
