import { GameType } from '../../../../domain/game/enums/game-type.enum';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { createGameRepositoryMock } from '../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { ListProjectDashboardGamesUseCase } from './list-project-dashboard-games-use-case';

describe('ListProjectDashboardGamesUseCase', () => {
  it('throws NOT_A_MEMBER when the project does not exist', async () => {
    const gameRepository = createGameRepositoryMock();
    const projectRepository = createProjectRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new ListProjectDashboardGamesUseCase(
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute({ projectId: 8 }, 22)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const gameRepository = createGameRepositoryMock();
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new ListProjectDashboardGamesUseCase(
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute({ projectId: 8 }, 22)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('maps the paged game records into dashboard cards', async () => {
    const gameRepository = createGameRepositoryMock({
      searchProjectGames: {
        items: [
          {
            id: 11,
            type: GameType.QUIZ,
            title: 'Quiz A',
            description: null,
            createdAt: new Date('2026-03-12T00:00:00.000Z'),
            relatedGameId: 101,
            stageCount: 6,
          },
          {
            id: 12,
            type: GameType.PREDICTION,
            title: 'Prediction B',
            description: 'Desc',
            createdAt: new Date('2026-03-13T00:00:00.000Z'),
            relatedGameId: 202,
            stageCount: 3,
          },
        ],
        totalCount: 14,
        overallCount: 18,
        page: 2,
        pageSize: 9,
      } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
    });

    const useCase = new ListProjectDashboardGamesUseCase(
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(
      {
        projectId: 8,
        search: 'quiz',
        types: ['quiz', 'prediction'],
        sortField: 'title',
        sortDirection: 'asc',
        page: 2,
        pageSize: 9,
      },
      22,
    );

    expect(gameRepository.searchProjectGames).toHaveBeenCalledWith({
      projectId: 8,
      search: 'quiz',
      types: [GameType.QUIZ, GameType.PREDICTION],
      sortField: 'title',
      sortDirection: 'asc',
      page: 2,
      pageSize: 9,
    });
    expect(result).toEqual({
      items: [
        {
          id: 101,
          gameId: 11,
          type: 'quiz',
          title: 'Quiz A',
          description: null,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
          relatedGameId: 101,
          stageCount: 6,
        },
        {
          id: 202,
          gameId: 12,
          type: 'prediction',
          title: 'Prediction B',
          description: 'Desc',
          createdAt: new Date('2026-03-13T00:00:00.000Z'),
          relatedGameId: 202,
          stageCount: 3,
        },
      ],
      totalCount: 14,
      overallCount: 18,
      page: 2,
      pageSize: 9,
      totalPages: 2,
    });
  });
});
