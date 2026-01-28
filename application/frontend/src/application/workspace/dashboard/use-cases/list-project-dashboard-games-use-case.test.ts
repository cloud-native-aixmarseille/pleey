import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { ListProjectDashboardGamesUseCase } from './list-project-dashboard-games-use-case';

describe('ListProjectDashboardGamesUseCase', () => {
  it('enriches paginated dashboard games with facade-owned summaries', async () => {
    // Arrange
    const dashboardGameRepository = {
      getProjectDashboardGames: vi.fn().mockResolvedValue({
        items: [
          {
            gameId: 16,
            type: 'quiz',
            title: 'Sprint quiz',
            description: 'Weekly sync',
            createdAt: '2026-03-15T09:00:00.000Z',
            relatedGameId: 6,
            stageCount: 12,
          },
        ],
        totalCount: 1,
        overallCount: 1,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      }),
    };
    const dashboardGameTypeRegistry = {
      enrichGames: vi.fn().mockReturnValue([
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
            values: { count: '12' },
          },
        },
      ]),
    };
    const useCase = new ListProjectDashboardGamesUseCase(
      dashboardGameRepository as never,
      dashboardGameTypeRegistry as never,
    );

    // Act
    const result = await useCase.execute({
      projectId: 9,
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });

    // Assert
    expect(dashboardGameRepository.getProjectDashboardGames).toHaveBeenCalledWith({
      projectId: 9,
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });
    expect(dashboardGameTypeRegistry.enrichGames).toHaveBeenCalledWith([
      {
        gameId: 16,
        type: 'quiz',
        title: 'Sprint quiz',
        description: 'Weekly sync',
        createdAt: '2026-03-15T09:00:00.000Z',
        relatedGameId: 6,
        stageCount: 12,
      },
    ]);
    expect(result.items).toEqual([
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
          values: { count: '12' },
        },
      },
    ]);
  });
});
