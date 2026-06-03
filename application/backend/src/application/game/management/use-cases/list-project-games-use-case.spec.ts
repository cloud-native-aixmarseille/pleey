import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { GameTypeParser } from '../../types/shared/services/game-type-parser';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason,
} from '../ports/game-catalog.port';
import { GamePermissionResolver } from '../services/game-permission-resolver';
import { ListProjectGamesUseCase } from './list-project-games-use-case';

const gameTypeParser = new GameTypeParser();
const projectId = backendTestIdentifiers.project(8);
const organizationId = backendTestIdentifiers.organization(3);
const hostUserId = backendTestIdentifiers.user(22);
const gameId = backendTestIdentifiers.game(11);
const gameTypeId = backendTestIdentifiers.game(101);

describe('ListProjectGamesUseCase', () => {
  it('throws NOT_A_MEMBER when the project does not exist', async () => {
    const useCase = new ListProjectGamesUseCase(
      { listProjectGames: vi.fn() } as never,
      { findById: vi.fn().mockResolvedValue(null) } as never,
      { findByOrganizationAndUser: vi.fn() } as never,
      { resolveGamePermissions: vi.fn(), assertCanCreateParty: vi.fn() } as never,
      gameTypeParser,
    );

    await expect(useCase.execute({ projectId }, hostUserId)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const useCase = new ListProjectGamesUseCase(
      { listProjectGames: vi.fn() } as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue(null) } as never,
      { resolveGamePermissions: vi.fn(), assertCanCreateParty: vi.fn() } as never,
      gameTypeParser,
    );

    await expect(useCase.execute({ projectId }, hostUserId)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('normalizes the request before delegating to the management catalog', async () => {
    const gameManagementCatalog = {
      listProjectGames: vi.fn().mockResolvedValue({
        items: [
          {
            gameId,
            type: 'quiz',
            title: 'Quiz A',
            description: null,
            createdAt: new Date('2026-03-12T00:00:00.000Z'),
            gameTypeId,
            stageCount: 6,
          },
        ],
        totalCount: 14,
        overallCount: 18,
        page: 2,
        pageSize: 9,
        totalPages: 2,
      }),
    };
    const gamePermissionResolver = {
      resolveGamePermissions: vi.fn().mockResolvedValue(
        new Map([
          [
            gameId,
            {
              createParty: {
                allowed: true,
                reason: null,
              },
              launchReadiness: {
                allowed: true,
                reason: null,
              },
            },
          ],
        ]),
      ),
      assertCanCreateParty: vi.fn(),
    };
    const useCase = new ListProjectGamesUseCase(
      gameManagementCatalog as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue({}) } as never,
      gamePermissionResolver as unknown as GamePermissionResolver,
      gameTypeParser,
    );

    const result = await useCase.execute(
      {
        projectId,
        search: 'quiz',
        types: ['QUIZ', 'prediction', 'invalid'],
        sortField: 'title',
        sortDirection: 'asc',
        page: 2,
        pageSize: 9,
      },
      hostUserId,
    );

    expect(gameManagementCatalog.listProjectGames).toHaveBeenCalledWith({
      projectId,
      search: 'quiz',
      types: ['quiz', 'prediction'],
      sortField: 'title',
      sortDirection: 'asc',
      page: 2,
      pageSize: 9,
    });
    expect(result).toEqual({
      items: [
        {
          gameId,
          type: 'quiz',
          title: 'Quiz A',
          description: null,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
          gameTypeId,
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
      totalCount: 14,
      overallCount: 18,
      page: 2,
      pageSize: 9,
      totalPages: 2,
    });
    expect(gamePermissionResolver.resolveGamePermissions).toHaveBeenCalledWith({
      items: [
        {
          gameId,
          type: 'quiz',
          title: 'Quiz A',
          description: null,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
          gameTypeId,
          stageCount: 6,
        },
      ],
      hostUserId,
    });
  });

  it('marks games as non-creatable when the host already has an active party elsewhere', async () => {
    const useCase = new ListProjectGamesUseCase(
      {
        listProjectGames: vi.fn().mockResolvedValue({
          items: [
            {
              gameId,
              type: 'quiz',
              title: 'Quiz A',
              description: null,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
              gameTypeId,
              stageCount: 6,
            },
          ],
          totalCount: 1,
          overallCount: 1,
          page: 1,
          pageSize: 9,
          totalPages: 1,
        }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue({}) } as never,
      {
        resolveGamePermissions: vi.fn().mockResolvedValue(
          new Map([
            [
              gameId,
              {
                createParty: {
                  allowed: false,
                  reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
                },
                launchReadiness: {
                  allowed: true,
                  reason: null,
                },
              },
            ],
          ]),
        ),
        assertCanCreateParty: vi.fn(),
      } as never,
      gameTypeParser,
    );

    const result = await useCase.execute({ projectId }, hostUserId);

    expect(result.items[0]?.permissions.createParty).toEqual({
      allowed: false,
      reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
    });
    expect(result.items[0]?.permissions.launchReadiness).toEqual({
      allowed: true,
      reason: null,
    });
  });

  it('marks games as non-creatable when the game already has an active party', async () => {
    const useCase = new ListProjectGamesUseCase(
      {
        listProjectGames: vi.fn().mockResolvedValue({
          items: [
            {
              gameId,
              type: 'quiz',
              title: 'Quiz A',
              description: null,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
              gameTypeId,
              stageCount: 6,
            },
          ],
          totalCount: 1,
          overallCount: 1,
          page: 1,
          pageSize: 9,
          totalPages: 1,
        }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue({}) } as never,
      {
        resolveGamePermissions: vi.fn().mockResolvedValue(
          new Map([
            [
              gameId,
              {
                createParty: {
                  allowed: false,
                  reason: CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS,
                },
                launchReadiness: {
                  allowed: true,
                  reason: null,
                },
              },
            ],
          ]),
        ),
        assertCanCreateParty: vi.fn(),
      } as never,
      gameTypeParser,
    );

    const result = await useCase.execute({ projectId }, hostUserId);

    expect(result.items[0]?.permissions.createParty).toEqual({
      allowed: false,
      reason: CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS,
    });
    expect(result.items[0]?.permissions.launchReadiness).toEqual({
      allowed: true,
      reason: null,
    });
  });

  it('marks games as non-creatable when the game has no configured stages', async () => {
    const useCase = new ListProjectGamesUseCase(
      {
        listProjectGames: vi.fn().mockResolvedValue({
          items: [
            {
              gameId,
              type: 'quiz',
              title: 'Quiz A',
              description: null,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
              gameTypeId,
              stageCount: 0,
            },
          ],
          totalCount: 1,
          overallCount: 1,
          page: 1,
          pageSize: 9,
          totalPages: 1,
        }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue({}) } as never,
      {
        resolveGamePermissions: vi.fn().mockResolvedValue(
          new Map([
            [
              gameId,
              {
                createParty: {
                  allowed: false,
                  reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
                },
                launchReadiness: {
                  allowed: false,
                  reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
                },
              },
            ],
          ]),
        ),
        assertCanCreateParty: vi.fn(),
      } as never,
      gameTypeParser,
    );

    const result = await useCase.execute({ projectId }, hostUserId);

    expect(result.items[0]?.permissions.createParty).toEqual({
      allowed: false,
      reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
    });
    expect(result.items[0]?.permissions.launchReadiness).toEqual({
      allowed: false,
      reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
    });
  });

  it('throws VALIDATION_FAILED when the resolver omits permissions for a listed game', async () => {
    const useCase = new ListProjectGamesUseCase(
      {
        listProjectGames: vi.fn().mockResolvedValue({
          items: [
            {
              gameId,
              type: 'quiz',
              title: 'Quiz A',
              description: null,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
              gameTypeId,
              stageCount: 6,
            },
          ],
          totalCount: 1,
          overallCount: 1,
          page: 1,
          pageSize: 9,
          totalPages: 1,
        }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({
          id: projectId,
          organizationId,
        }),
      } as never,
      { findByOrganizationAndUser: vi.fn().mockResolvedValue({}) } as never,
      {
        resolveGamePermissions: vi.fn().mockResolvedValue(new Map()),
        assertCanCreateParty: vi.fn(),
      } as never,
      gameTypeParser,
    );

    await expect(useCase.execute({ projectId }, hostUserId)).rejects.toThrow(
      GameErrorCode.VALIDATION_FAILED,
    );
  });
});
