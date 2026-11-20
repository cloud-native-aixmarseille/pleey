import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { ListProjectGamesUseCase } from '../../../../application/game/management/use-cases/list-project-games-use-case';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { GameManagementResolver } from './game-management-resolver';
import { ProjectGamesInput } from './types/project-games-input';

const projectIdentifier = new ProjectIdentifier();
const HOST_USER_ID = backendTestIdentifiers.user(42);
const PROJECT_ID = backendTestIdentifiers.project(8);

describe('GameManagementResolver', () => {
  function arrangeResolver() {
    const listProjectGamesUseCase = {
      execute: vi.fn().mockResolvedValue({
        items: [
          {
            gameId: backendTestIdentifiers.game(11),
            type: 'quiz',
            title: 'Quiz A',
            description: null,
            createdAt: new Date('2026-03-12T00:00:00.000Z'),
            gameTypeId: 101,
            stageCount: 6,
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
          },
        ],
        totalCount: 1,
        overallCount: 2,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      }),
    };
    const resolver = new GameManagementResolver(
      listProjectGamesUseCase as unknown as ListProjectGamesUseCase,
      projectIdentifier,
    );

    return { resolver, listProjectGamesUseCase };
  }

  it('maps the project games result into the GraphQL transport shape', async () => {
    // Arrange
    const { resolver, listProjectGamesUseCase } = arrangeResolver();
    const input = new ProjectGamesInput();
    input.projectId = PROJECT_ID;
    input.search = 'quiz';
    input.types = ['quiz'];
    input.sortField = 'title';
    input.sortDirection = 'asc';
    input.page = 1;
    input.pageSize = 9;

    // Act
    const result = await resolver.projectGames(input, {
      req: {
        user: {
          id: HOST_USER_ID,
        },
      },
    });

    // Assert
    expect(listProjectGamesUseCase.execute).toHaveBeenCalledWith(
      {
        projectId: PROJECT_ID,
        search: 'quiz',
        types: ['quiz'],
        sortField: 'title',
        sortDirection: 'asc',
        page: 1,
        pageSize: 9,
      },
      HOST_USER_ID,
    );
    expect(result).toEqual({
      items: [
        {
          gameId: backendTestIdentifiers.game(11),
          type: 'quiz',
          title: 'Quiz A',
          description: null,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
          gameTypeId: 101,
          stageCount: 6,
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
        },
      ],
      totalCount: 1,
      overallCount: 2,
      page: 1,
      pageSize: 9,
      totalPages: 1,
    });
  });
});
