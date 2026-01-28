import { describe, expect, it, vi } from 'vitest';
import { GameTypeRegistryErrorCode } from '../../../domains/game-catalog/errors/game-type-registry-error-code';
import type { DashboardGameTypeFacade } from '../contracts/game-type-management-facade';
import { GameTypeManagementRegistry } from './game-type-management-registry';

describe('GameTypeManagementRegistry', () => {
  describe('listGames()', () => {
    it('merges game types and sorts the newest items first', async () => {
      // Arrange
      const quizFacade = {
        descriptor: {
          key: 'quiz',
          badge: '01',
          iconKey: 'quiz',
          titleKey: 'quiz.gameType.title',
          descriptionKey: 'quiz.gameType.description',
          managementRoutePath: '/quizzes',
        },
        loadGames: vi.fn().mockResolvedValue([
          {
            id: 1,
            gameId: 11,
            type: 'quiz',
            title: 'Older quiz',
            description: null,
            createdAt: '2026-03-15T08:00:00.000Z',
            relatedGameId: 1,
            stageCount: 0,
          },
        ]),
      } as const satisfies DashboardGameTypeFacade;
      const predictionFacade = {
        descriptor: {
          key: 'prediction',
          badge: '02',
          iconKey: 'prediction',
          titleKey: 'prediction.gameType.title',
          descriptionKey: 'prediction.gameType.description',
          managementRoutePath: '/predictions',
        },
        loadGames: vi.fn().mockResolvedValue([
          {
            id: 2,
            gameId: 12,
            type: 'prediction',
            title: 'Newer prediction',
            description: null,
            createdAt: '2026-03-15T09:00:00.000Z',
            relatedGameId: 2,
            stageCount: 0,
          },
        ]),
      } as const satisfies DashboardGameTypeFacade;
      const registry = new GameTypeManagementRegistry([quizFacade, predictionFacade]);

      // Act
      const items = await registry.listGames(9);

      // Assert
      expect(items.map((item) => item.relatedGameId)).toEqual([2, 1]);
    });
  });

  describe('listTypes()', () => {
    it('lists contributed game type keys', () => {
      // Arrange
      const registry = new GameTypeManagementRegistry([
        {
          descriptor: {
            key: 'quiz',
            badge: '01',
            iconKey: 'quiz',
            titleKey: 'quiz.gameType.title',
            descriptionKey: 'quiz.gameType.description',
            managementRoutePath: '/quizzes',
          },
        } as const satisfies DashboardGameTypeFacade,
        {
          descriptor: {
            key: 'prediction',
            badge: '02',
            iconKey: 'prediction',
            titleKey: 'prediction.gameType.title',
            descriptionKey: 'prediction.gameType.description',
            managementRoutePath: '/predictions',
          },
        } as const satisfies DashboardGameTypeFacade,
      ]);

      // Act
      const keys = registry.listTypes();

      // Assert
      expect(keys).toEqual(['quiz', 'prediction']);
    });
  });

  describe('enrichGames()', () => {
    it('adds a type-owned summary to dashboard items when a facade provides one', () => {
      // Arrange
      const registry = new GameTypeManagementRegistry([
        {
          descriptor: {
            key: 'quiz',
            badge: '01',
            iconKey: 'quiz',
            titleKey: 'quiz.gameType.title',
            descriptionKey: 'quiz.gameType.description',
            managementRoutePath: '/quizzes',
          },
          buildDashboardSummary: vi.fn().mockReturnValue({
            translationKey: 'quiz.management.questionSummary',
            values: { count: '6' },
          }),
        } as const satisfies DashboardGameTypeFacade,
      ]);

      // Act
      const items = registry.enrichGames([
        {
          gameId: 11,
          type: 'quiz',
          title: 'Sprint quiz',
          description: null,
          createdAt: '2026-03-15T08:00:00.000Z',
          relatedGameId: 1,
          stageCount: 6,
        },
      ]);

      // Assert
      expect(items).toEqual([
        {
          gameId: 11,
          type: 'quiz',
          title: 'Sprint quiz',
          description: null,
          createdAt: '2026-03-15T08:00:00.000Z',
          relatedGameId: 1,
          stageCount: 6,
          summary: {
            translationKey: 'quiz.management.questionSummary',
            values: { count: '6' },
          },
        },
      ]);
    });

    it('throws when a dashboard item references an unregistered game type', () => {
      // Arrange
      const registry = new GameTypeManagementRegistry([]);

      // Act
      const enrich = () =>
        registry.enrichGames([
          {
            gameId: 11,
            type: 'quiz',
            title: 'Sprint quiz',
            description: null,
            createdAt: '2026-03-15T08:00:00.000Z',
            relatedGameId: 1,
            stageCount: 6,
          },
        ]);

      // Assert
      expect(enrich).toThrow(GameTypeRegistryErrorCode.CATALOG_FACADE_MISSING);
    });
  });

  describe('resolveManagementRoute()', () => {
    it('builds the management route from the type-specific management id', () => {
      // Arrange
      const registry = new GameTypeManagementRegistry([
        {
          descriptor: {
            key: 'prediction',
            badge: '02',
            iconKey: 'prediction',
            titleKey: 'prediction.gameType.title',
            descriptionKey: 'prediction.gameType.description',
            managementRoutePath: '/predictions',
          },
        } as const satisfies DashboardGameTypeFacade,
      ]);

      // Act
      const route = registry.resolveManagementRoute({
        type: 'prediction',
        relatedGameId: 41,
      });

      // Assert
      expect(route).toBe('/predictions/41');
    });
  });
});
