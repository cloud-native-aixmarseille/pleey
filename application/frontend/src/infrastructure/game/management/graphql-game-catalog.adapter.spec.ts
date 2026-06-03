import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason,
} from '../../../domains/game/management/entities/dashboard-game-list-item';
import { GameIdentifierMockFactory } from '../../../test-utils/mocks/game-identifier-mock-factory';
import { GameTypeIdentifierMockFactory } from '../../../test-utils/mocks/game-type-identifier-mock-factory';
import { GraphqlClientMockFactory } from '../../../test-utils/mocks/graphql-client-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../test-utils/mocks/project-identifier-mock-factory';
import { ProjectGamesDocument } from '../../graphql/generated/graphql';
import { GraphqlGameCatalogAdapter } from './graphql-game-catalog.adapter';

const gameIdentifier = new GameIdentifierMockFactory().create();
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const gameTypeParser = new GameTypeParser();
const projectIdentifier = new ProjectIdentifierMockFactory().create();

describe('GraphqlGameCatalogAdapter', () => {
  it('maps the project dashboard games query into the shared management catalog page', async () => {
    const graphqlClientMockFactory = new GraphqlClientMockFactory();
    const { client, requestMock } = graphqlClientMockFactory.create({
      requestResult: {
        projectGames: {
          items: [
            {
              gameId: 16,
              type: 'quiz',
              title: 'Sprint quiz',
              description: 'Weekly sync',
              createdAt: '2026-03-15T09:00:00.000Z',
              gameTypeId: 6,
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
            },
          ],
          totalCount: 1,
          overallCount: 3,
          page: 2,
          pageSize: 9,
          totalPages: 1,
        },
      },
    });
    const adapter = new GraphqlGameCatalogAdapter(
      client,
      gameIdentifier,
      gameTypeIdentifier,
      gameTypeParser,
    );

    const result = await adapter.listProjectGames({
      projectId: projectIdentifier.parse(9),
      search: 'sprint',
      typeFilter: ['quiz'],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 2,
      pageSize: 9,
    });

    expect(requestMock).toHaveBeenCalledWith(
      ProjectGamesDocument,
      {
        input: {
          projectId: projectIdentifier.parse(9),
          search: 'sprint',
          types: ['quiz'],
          sortField: 'createdAt',
          sortDirection: 'desc',
          page: 2,
          pageSize: 9,
        },
      },
      undefined,
    );
    expect(result).toEqual({
      items: [
        {
          gameId: gameIdentifier.parse(16),
          type: 'quiz',
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
        },
      ],
      totalCount: 1,
      overallCount: 3,
      page: 2,
      pageSize: 9,
      totalPages: 1,
    });
  });

  it('maps the no-stages disabled reason returned by GraphQL', async () => {
    const graphqlClientMockFactory = new GraphqlClientMockFactory();
    const { client } = graphqlClientMockFactory.create({
      requestResult: {
        projectGames: {
          items: [
            {
              gameId: 16,
              type: 'quiz',
              title: 'Sprint quiz',
              description: 'Weekly sync',
              createdAt: '2026-03-15T09:00:00.000Z',
              gameTypeId: 6,
              stageCount: 0,
              permissions: {
                createParty: {
                  allowed: false,
                  reason: 'NO_STAGES_AVAILABLE',
                },
                launchReadiness: {
                  allowed: false,
                  reason: 'PARTY_STAGES_NOT_AVAILABLE',
                },
              },
            },
          ],
          totalCount: 1,
          overallCount: 1,
          page: 1,
          pageSize: 9,
          totalPages: 1,
        },
      },
    });
    const adapter = new GraphqlGameCatalogAdapter(
      client,
      gameIdentifier,
      gameTypeIdentifier,
      gameTypeParser,
    );

    const result = await adapter.listProjectGames({
      projectId: projectIdentifier.parse(9),
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });

    expect(result.items[0]?.permissions.createParty).toEqual({
      allowed: false,
      reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
    });
    expect(result.items[0]?.permissions.launchReadiness).toEqual({
      allowed: false,
      reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
    });
  });
});
