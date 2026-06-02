import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListProjectGamesUseCase } from '../../../../application/game/management/use-cases/list-project-games-use-case';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { GameManagementResolver } from './game-management-resolver';
import { ProjectGamesInput } from './types/project-games-input';

const projectIdentifier = new ProjectIdentifier();

describe('GameManagementResolver', () => {
  const listProjectGamesUseCase = { execute: vi.fn() };
  let resolver: GameManagementResolver;

  beforeEach(() => {
    listProjectGamesUseCase.execute.mockReset();

    listProjectGamesUseCase.execute.mockResolvedValue({
      items: [
        {
          gameId: 11,
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

    resolver = new GameManagementResolver(
      listProjectGamesUseCase as unknown as ListProjectGamesUseCase,
      projectIdentifier,
    );
  });

  it('maps the project games result into the GraphQL transport shape', async () => {
    const input = new ProjectGamesInput();
    input.projectId = 8;
    input.search = 'quiz';
    input.types = ['quiz'];
    input.sortField = 'title';
    input.sortDirection = 'asc';
    input.page = 1;
    input.pageSize = 9;

    const result = await resolver.projectGames(input, {
      req: {
        user: {
          id: backendTestIdentifiers.user(42),
        },
      },
    });

    expect(listProjectGamesUseCase.execute).toHaveBeenCalledWith(
      {
        projectId: 8,
        search: 'quiz',
        types: ['quiz'],
        sortField: 'title',
        sortDirection: 'asc',
        page: 1,
        pageSize: 9,
      },
      backendTestIdentifiers.user(42),
    );
    expect(result).toEqual({
      items: [
        {
          gameId: 11,
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
