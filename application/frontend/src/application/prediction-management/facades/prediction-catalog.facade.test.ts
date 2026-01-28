import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PredictionCatalogFacade } from './prediction-catalog.facade';

describe('PredictionCatalogFacade', () => {
  describe('descriptor', () => {
    it('describes the prediction game type catalog entry', () => {
      // Arrange
      const facade = new PredictionCatalogFacade({ execute: vi.fn() } as never);

      // Assert
      expect(facade.descriptor).toEqual({
        key: 'prediction',
        badge: '02',
        iconKey: 'prediction',
        titleKey: 'prediction.gameType.title',
        descriptionKey: 'prediction.gameType.description',
        managementRoutePath: '/predictions',
      });
    });
  });

  describe('loadGames()', () => {
    it('maps prediction games into dashboard list items', async () => {
      // Arrange
      const listProjectPredictionGamesUseCase = {
        execute: vi.fn().mockResolvedValue([
          {
            id: 4,
            predictionId: 41,
            projectId: 7,
            title: 'Final score',
            description: null,
            promptCount: 0,
            createdAt: '2026-03-15T10:00:00.000Z',
          },
        ]),
      };
      const facade = new PredictionCatalogFacade(listProjectPredictionGamesUseCase as never);

      // Act
      const items = await facade.loadGames(7);

      // Assert
      expect(listProjectPredictionGamesUseCase.execute).toHaveBeenCalledWith({ projectId: 7 });
      expect(items).toEqual([
        {
          gameId: 4,
          type: 'prediction',
          title: 'Final score',
          description: null,
          createdAt: '2026-03-15T10:00:00.000Z',
          relatedGameId: 41,
          stageCount: 0,
          summary: {
            translationKey: 'prediction.management.promptSummary',
            values: {
              count: '0',
            },
          },
        },
      ]);
    });
  });
});
