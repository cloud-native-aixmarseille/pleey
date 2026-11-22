import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import type { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';
import { UserGameHistoryFixtureFactory } from '../../test-utils/fixtures/user-game-history-fixture-factory';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { MyGameHistoryDocument } from '../graphql/generated/graphql';
import { GraphqlAuthRepository } from './graphql-auth.repository';

function createGraphqlAuthRepository(client: GraphqlClient) {
  return new GraphqlAuthRepository(client, new AuthPayloadInspector());
}

describe('GraphqlAuthRepository', () => {
  it('sends the selected history page and page size and preserves pagination metadata', async () => {
    // Arrange
    const page = new UserGameHistoryFixtureFactory().createPage({ page: 2 });
    const { client, requestMock } = new GraphqlClientMockFactory().create({ requestResult: { myGameHistory: page } });
    const repository = createGraphqlAuthRepository(client);

    // Act
    const result = await repository.gameHistory({ page: 2, pageSize: 20 });

    // Assert
    expect(requestMock).toHaveBeenCalledExactlyOnceWith(
      MyGameHistoryDocument,
      { input: { page: 2, pageSize: 20 } },
      undefined,
    );
    expect(result).toEqual(page);
  });
});
