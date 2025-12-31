import { describe, expect, it } from 'vitest';
import { Quiz } from './quiz.entity';

describe('Quiz Entity', () => {
  describe('constructor', () => {
    it('should create a quiz instance with all properties', () => {
      const now = new Date();
      const quiz = new Quiz(1, 'JavaScript Basics', 'Test your JavaScript knowledge', 100, 1, now);

      expect(quiz.id).toBe(1);
      expect(quiz.title).toBe('JavaScript Basics');
      expect(quiz.description).toBe('Test your JavaScript knowledge');
      expect(quiz.createdById).toBe(100);
      expect(quiz.organizationId).toBe(1);
      expect(quiz.createdAt).toBe(now);
    });

    it('should create quiz with null description', () => {
      const quiz = new Quiz(1, 'Math Quiz', null, 100, 1, new Date());

      expect(quiz.description).toBeNull();
    });
  });

  describe('hasValidTitle', () => {
    it('should return true for non-empty title', () => {
      const quiz = new Quiz(1, 'Valid Title', 'Description', 100, 1, new Date());

      expect(quiz.hasValidTitle()).toBe(true);
    });

    it('should return false for empty title', () => {
      const quiz = new Quiz(1, '', 'Description', 100, new Date());

      expect(quiz.hasValidTitle()).toBe(false);
    });

    it('should return false for whitespace-only title', () => {
      const quiz = new Quiz(1, '   ', 'Description', 100, 1, new Date());

      expect(quiz.hasValidTitle()).toBe(false);
    });

    it('should return true for title with leading/trailing spaces', () => {
      const quiz = new Quiz(1, '  Valid Title  ', 'Description', 100, 1, new Date());

      expect(quiz.hasValidTitle()).toBe(true);
    });

    it('should return true for single character title', () => {
      const quiz = new Quiz(1, 'A', 'Description', 100, 1, new Date());

      expect(quiz.hasValidTitle()).toBe(true);
    });
  });
});
