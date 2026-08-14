import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { InvalidLoginResponseError } from '../../../domains/identity/errors/graphql-auth-repository.error';
import { AuthPayloadInspector } from '../../../domains/identity/services/auth-payload-inspector';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { MeDocument, type MeQuery } from '../generated/graphql';
import { GraphqlClient } from './graphql-client';

const authFixtureFactory = new AuthFixtureFactory();

function createGraphqlClient() {
  return new GraphqlClient(new AuthPayloadInspector());
}

describe('GraphqlClient', () => {
  async function withFetchMock<T>(fetchMock: ReturnType<typeof vi.fn>, callback: () => Promise<T> | T): Promise<T> {
    vi.stubGlobal('fetch', fetchMock);

    try {
      return await callback();
    } finally {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  }

  describe('request()', () => {
    it('sends a GraphQL request and returns the response data', async () => {
      // Arrange
      const currentUser = authFixtureFactory.createUserPayload({ avatarUri: undefined });
      // Act
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
      // Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

        const result = await client.request<MeQuery>(MeDocument);

        expect(result).toEqual({ me: currentUser });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
          headers: expect.objectContaining({
            'apollo-require-preflight': 'true',
            authorization: 'Bearer access-token',
          }),
        });
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
      // Act
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
      // Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({
          accessToken: 'expired-access-token',
          refreshToken: 'refresh-token',
        });

        const result = await client.request<MeQuery>(MeDocument);

        expect(result).toEqual({ me: currentUser });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({
          headers: expect.objectContaining({ authorization: 'Bearer new-access-token' }),
        });
      });
    });
  });

  describe('resolveDomainError()', () => {
    it('preserves the error message when one is available', () => {
      // Arrange
      const client = createGraphqlClient();
      const fallback = AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC];

      // Act
      const result = client.resolveDomainError(new Error('Invalid email or password.'), fallback);

      // Assert
      expect(result.message).toBe('Invalid email or password.');
      expect(result.code).toBe(fallback.code);
    });

    it('returns the fallback when the error does not expose a message', () => {
      // Arrange
      const client = createGraphqlClient();
      const fallback = AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC];

      // Act
      const result = client.resolveDomainError(null, fallback);

      // Assert
      expect(result.message).toBe('auth.errors.generic');
      expect(result.code).toBe(fallback.code);
    });

    it('keeps translated transport errors while preserving the fallback message key', () => {
      // Arrange
      const client = createGraphqlClient();
      const fallback = AUTH_ERROR_DEFINITIONS[AuthErrorCode.INVALID_CREDENTIALS];

      // Act
      const result = client.resolveDomainError(
        new Error('An unexpected error occurred (code: Unauthorized)'),
        fallback,
      );

      // Assert
      expect(result.message).toBe('An unexpected error occurred (code: Unauthorized)');
      expect(result.messageKey).toBe(fallback.messageKey);
    });

    it('preserves dedicated domain error subclasses', () => {
      // Arrange
      const client = createGraphqlClient();
      const fallback = AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC];
      const error = new InvalidLoginResponseError();

      // Act
      const result = client.resolveDomainError(error, fallback);

      // Assert
      expect(result).toBe(error);
    });
  });
});
