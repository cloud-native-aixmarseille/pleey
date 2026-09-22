import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { InvalidLoginResponseError } from '../../domains/identity/errors/graphql-auth-repository.error';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import type { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { UserGameHistoryFixtureFactory } from '../../test-utils/fixtures/user-game-history-fixture-factory';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { MyGameHistoryDocument } from '../graphql/generated/graphql';
import { GraphqlAuthRepository } from './graphql-auth.repository';

const authFixtureFactory = new AuthFixtureFactory();

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

  describe('login()', () => {
    it('returns the normalized auth session when the payload is valid', async () => {
      // Arrange
      const sessionPayload = authFixtureFactory.createAuthSessionPayload();
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          login: sessionPayload,
        },
      });
      const repository = createGraphqlAuthRepository(client);

      // Act
      const session = await repository.login('captain@pleey.io', 'secret');

      // Assert
      expect(session).toEqual(sessionPayload);
    });

    it('keeps backend-translated transport errors unchanged', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('Invalid email or password.'),
      });
      const repository = createGraphqlAuthRepository(client);

      // Act + Assert
      await expect(repository.login('captain@pleey.io', 'wrong')).rejects.toThrow('Invalid email or password.');
    });

    it('rejects invalid login payloads with the dedicated login response error', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          login: null,
        },
      });
      const repository = createGraphqlAuthRepository(client);

      // Act + Assert
      await expect(repository.login('captain@pleey.io', 'secret')).rejects.toBeInstanceOf(InvalidLoginResponseError);
    });
  });
});
