import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AuthPayloadInspector } from '../../domains/auth/services/auth-payload-inspector';
import type { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';
import { GraphqlClientMockFactory } from '../../test-utils/factories/graphql-client-mock-factory';
import { GraphqlAuthRepository } from './graphql-auth.repository';

function createGraphqlAuthRepository(client: GraphqlClient) {
  return new GraphqlAuthRepository(client, new AuthPayloadInspector());
}

describe('GraphqlAuthRepository', () => {
  describe('login()', () => {
    it('returns the normalized auth session when the payload is valid', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          login: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600,
            user: {
              id: 1,
              username: 'captain',
              email: 'captain@pleey.io',
              avatarUri: 'https://api.example.com/api/avatars/users/1',
            },
          },
        },
      });
      const repository = createGraphqlAuthRepository(client);

      // Act
      const session = await repository.login('captain@pleey.io', 'secret');

      // Assert
      expect(session).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: 1,
          username: 'captain',
          email: 'captain@pleey.io',
          avatarUri: 'https://api.example.com/api/avatars/users/1',
        },
      });
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
