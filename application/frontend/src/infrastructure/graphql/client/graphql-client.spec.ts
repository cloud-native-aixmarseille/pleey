import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { AuthPayloadInspector } from '../../../domains/identity/services/auth-payload-inspector';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { MeDocument, type MeQuery } from '../generated/graphql';
import { GraphqlClient } from './graphql-client';

const authFixtureFactory = new AuthFixtureFactory();

function createGraphqlClient() {
  return new GraphqlClient(new AuthPayloadInspector());
}

describe('GraphqlClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('request()', () => {
    it('sends a GraphQL request and returns the response data', async () => {
      // Arrange
      const currentUser = authFixtureFactory.createUserPayload({ avatarUri: undefined });
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              me: currentUser,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
      vi.stubGlobal('fetch', fetchMock);
      const client = createGraphqlClient();
      client.setAuthSessionTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

      // Act
      const result = await client.request<MeQuery>(MeDocument);

      // Assert
      expect(result).toEqual({ me: currentUser });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
        headers: expect.objectContaining({ authorization: 'Bearer access-token' }),
      });
    });

    it('refreshes the session when GraphQL wraps unauthorized as an internal server error', async () => {
      // Arrange
      const refreshedSession = authFixtureFactory.createAuthSessionPayload({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { avatarUri: null },
      });
      const currentUser = authFixtureFactory.createUserPayload({ avatarUri: undefined });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              errors: [
                {
                  message: 'An unexpected error occurred (code: Unauthorized)',
                  extensions: { code: 'INTERNAL_SERVER_ERROR' },
                },
              ],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: {
                refresh: refreshedSession,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: {
                me: currentUser,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      vi.stubGlobal('fetch', fetchMock);
      const client = createGraphqlClient();
      client.setAuthSessionTokens({
        accessToken: 'expired-access-token',
        refreshToken: 'refresh-token',
      });

      // Act
      const result = await client.request<MeQuery>(MeDocument);

      // Assert
      expect(result).toEqual({ me: currentUser });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({
        headers: expect.objectContaining({ authorization: 'Bearer new-access-token' }),
      });
    });
  });

  describe('extractMessage()', () => {
    it('returns the error message when one is available', () => {
      // Arrange
      const client = createGraphqlClient();

      // Act
      const result = client.extractMessage(
        new Error('Email ou mot de passe invalide.'),
        'Fallback',
      );

      // Assert
      expect(result).toBe('Email ou mot de passe invalide.');
    });

    it('returns the fallback when the error does not expose a message', () => {
      // Arrange
      const client = createGraphqlClient();

      // Act
      const result = client.extractMessage(null, 'auth.errors.generic');

      // Assert
      expect(result).toBe('auth.errors.generic');
    });

    it('maps wrapped unauthorized GraphQL errors to the translated auth error', () => {
      // Arrange
      const client = createGraphqlClient();

      // Act
      const result = client.extractMessage(
        new Error('An unexpected error occurred (code: Unauthorized)'),
        AuthErrorCode.GENERIC,
      );

      // Assert
      expect(result).toBe('An unexpected error occurred (code: Unauthorized)');
    });
  });
});
