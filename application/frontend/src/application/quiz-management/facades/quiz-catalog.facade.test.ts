import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { QuizCatalogFacade } from './quiz-catalog.facade';

describe('QuizCatalogFacade', () => {
  describe('descriptor', () => {
    it('describes the quiz game type catalog entry', () => {
      // Arrange
      const facade = new QuizCatalogFacade({ execute: vi.fn() } as never);

      // Assert
      expect(facade.descriptor).toEqual({
        key: 'quiz',
        badge: '01',
        iconKey: 'quiz',
        titleKey: 'quiz.gameType.title',
        descriptionKey: 'quiz.gameType.description',
        managementRoutePath: '/quizzes',
      });
    });
  });

  describe('loadGames()', () => {
    it('maps quizzes into dashboard list items', async () => {
      // Arrange
      const listProjectQuizzesUseCase = {
        execute: vi.fn().mockResolvedValue([
          {
            id: 6,
            gameId: 16,
            title: 'Sprint quiz',
            description: 'Weekly sync',
            createdAt: '2026-03-15T09:00:00.000Z',
            questionCount: 12,
          },
        ]),
      };
      const facade = new QuizCatalogFacade(listProjectQuizzesUseCase as never);

      // Act
      const items = await facade.loadGames(9);

      // Assert
      expect(listProjectQuizzesUseCase.execute).toHaveBeenCalledWith({ projectId: 9 });
      expect(items).toEqual([
        {
          gameId: 16,
          type: 'quiz',
          title: 'Sprint quiz',
          description: 'Weekly sync',
          createdAt: '2026-03-15T09:00:00.000Z',
          relatedGameId: 6,
          stageCount: 12,
          summary: {
            translationKey: 'quiz.management.questionSummary',
            values: {
              count: '12',
            },
          },
        },
      ]);
    });
  });
});
