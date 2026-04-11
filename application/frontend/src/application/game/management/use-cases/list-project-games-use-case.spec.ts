import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import { DashboardHomeScreenFixtureFactory } from '../../../../test-utils/fixtures/dashboard-home-screen-fixture-factory';
import { GameCatalogPortMockFactory } from '../../../../test-utils/mocks/game-catalog-port-mock-factory';
import { GameTypeRegistryMockFactory } from '../../../../test-utils/mocks/game-type-registry-mock-factory';
import { ProjectIdentifier } from '../../../workspace/shared/services/identifiers/project-identifier';
import { GameIdentifier } from '../../shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../types/shared/services/game-type-identifier';
import { ListProjectGamesUseCase } from './list-project-games-use-case';

const gameIdentifier = new GameIdentifier();
const gameTypeIdentifier = new GameTypeIdentifier();
const projectIdentifier = new ProjectIdentifier();

describe('ListProjectGamesUseCase', () => {
  const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();
  const gameCatalogPortMockFactory = new GameCatalogPortMockFactory(
    dashboardHomeScreenFixtureFactory,
  );
  const gameTypeRegistryMockFactory = new GameTypeRegistryMockFactory();

  it('enriches paginated dashboard games with facade-owned summaries', async () => {
    const baseItem = {
      gameId: gameIdentifier.parse(16),
      type: GameType.Quiz,
      title: 'Sprint quiz',
      description: 'Weekly sync',
      createdAt: '2026-03-15T09:00:00.000Z',
      gameTypeId: gameTypeIdentifier.parse(6),
      stageCount: 12,
      permissions: {
        createParty: {
          allowed: true,
          reason: null,
        },
        launchReadiness: {
          allowed: true,
          reason: null,
        },
      },
    };
    const gameCatalog = gameCatalogPortMockFactory.create({
      listProjectGames: vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [baseItem],
          totalCount: 1,
          overallCount: 1,
        }),
      ),
    });
    const gameTypeRegistry = gameTypeRegistryMockFactory.create({
      enrichGames: vi.fn().mockReturnValue([
        {
          ...baseItem,
          summary: {
            translationKey: 'game.types.quiz.management.questionSummary',
            values: { count: '12' },
          },
        },
      ]),
    });
    const useCase = new ListProjectGamesUseCase(gameCatalog, gameTypeRegistry);

    // Act
    const result = await useCase.execute({
      projectId: projectIdentifier.parse(9),
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });

    // Assert
    expect(gameCatalog.listProjectGames).toHaveBeenCalledWith({
      projectId: projectIdentifier.parse(9),
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });
    expect(gameTypeRegistry.enrichGames).toHaveBeenCalledWith([baseItem]);
    expect(result.items).toEqual([
      {
        ...baseItem,
        summary: {
          translationKey: 'game.types.quiz.management.questionSummary',
          values: { count: '12' },
        },
      },
    ]);
  });
});
