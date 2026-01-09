import { describe, expect, it } from 'vitest';
import { createQuizFixture } from '../../../test-utils/fixtures';

describe('Quiz', () => {
  describe('constructor', () => {
    it('should create a quiz instance with all properties', () => {
      const now = new Date();
      const quiz = createQuizFixture({
        id: 1,
        title: 'JavaScript Basics',
        description: 'Test your JavaScript knowledge',
        createdById: 100,
        organizationId: 1,
        createdAt: now,
      });

      expect(quiz.id).toBe(1);
      expect(quiz.title).toBe('JavaScript Basics');
      expect(quiz.description).toBe('Test your JavaScript knowledge');
      expect(quiz.createdById).toBe(100);
      expect(quiz.organizationId).toBe(1);
      expect(quiz.createdAt).toBe(now);
    });

    it('should create quiz with null description', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: 'Math Quiz',
        description: null,
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.description).toBeNull();
    });
  });

  describe('hasValidTitle', () => {
    it('should return true for non-empty title', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: 'Valid Title',
        description: 'Description',
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.hasValidTitle()).toBe(true);
    });

    it('should return false for empty title', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: '',
        description: 'Description',
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.hasValidTitle()).toBe(false);
    });

    it('should return false for whitespace-only title', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: '   ',
        description: 'Description',
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.hasValidTitle()).toBe(false);
    });

    it('should return true for title with leading/trailing spaces', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: '  Valid Title  ',
        description: 'Description',
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.hasValidTitle()).toBe(true);
    });

    it('should return true for single character title', () => {
      const quiz = createQuizFixture({
        id: 1,
        title: 'A',
        description: 'Description',
        createdById: 100,
        organizationId: 1,
        createdAt: new Date(),
      });

      expect(quiz.hasValidTitle()).toBe(true);
    });
  });
});
