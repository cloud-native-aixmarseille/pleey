import { describe, expect, it } from 'vitest';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { PlayableManagementPageFixtureFactory } from '../../../../test-utils/fixtures/playable-management-page-fixture-factory';
import { GraphqlClientMockFactory } from '../../../../test-utils/mocks/graphql-client-mock-factory';
import { PredictionManagementDocument, PredictionManagementItemsDocument } from '../../../graphql/generated/graphql';
import { PlayableManagementGraphqlMapper } from '../shared/playable-management-graphql.mapper';
import { GraphqlPredictionManagementRepository } from './graphql-prediction-management.repository';

describe('GraphqlPredictionManagementRepository', () => {
  it('loads every stage through bounded pages and fetches metadata only once', async () => {
    // Arrange
    const fixture = new PlayableManagementPageFixtureFactory().create('prediction');
    const { client, requestMock } = new GraphqlClientMockFactory().create();
    requestMock.mockResolvedValueOnce(fixture.firstResponse).mockResolvedValueOnce(fixture.nextResponse);
    const identifier = new GameTypeIdentifier();
    const repository = new GraphqlPredictionManagementRepository(
      client,
      new GameIdentifier(),
      identifier,
      new PredictionPromptIdentifier(),
      new PlayableManagementGraphqlMapper(),
    );
    // Act
    const result = await repository.load(identifier.parse(fixture.gameTypeId));
    // Assert
    expect({ stages: result.items.map((item) => item.text), requests: requestMock.mock.calls }).toEqual({
      stages: ['First stage', 'Last stage'],
      requests: [
        [
          PredictionManagementDocument,
          { predictionId: fixture.gameTypeId, input: { page: 1, pageSize: 100 } },
          undefined,
        ],
        [
          PredictionManagementItemsDocument,
          { predictionId: fixture.gameTypeId, input: { page: 2, pageSize: 1 } },
          undefined,
        ],
      ],
    });
  });
});
