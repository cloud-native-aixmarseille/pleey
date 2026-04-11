import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import type { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { GraphqlAuthRepository } from './graphql-auth.repository';

const authFixtureFactory = new AuthFixtureFactory();

function createGraphqlAuthRepository(client: GraphqlClient) {
  return new GraphqlAuthRepository(client, new AuthPayloadInspector());
}

describe('GraphqlAuthRepository', () => {
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
        requestError: new Error('Email ou mot de passe invalide.'),
      });
      const repository = createGraphqlAuthRepository(client);

      // Act + Assert
      await expect(repository.login('captain@pleey.io', 'wrong')).rejects.toThrow(
        'Email ou mot de passe invalide.',
      );
    });
  });
});
