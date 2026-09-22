import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../../domains/identity/errors/auth-error-code';
import { InvalidLoginResponseError } from '../../../domains/identity/errors/graphql-auth-repository.error';
import { AuthPayloadInspector } from '../../../domains/identity/services/auth-payload-inspector';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { GraphqlResponseFixtureFactory } from '../../../test-utils/fixtures/graphql-response-fixture-factory';
import { MeDocument, type MeQuery, MyGameHistoryDocument } from '../generated/graphql';
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
    it('shares concurrent queries within one session and fetches again after completion', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const initialUser = authFixtureFactory.createUserPayload();
      const updatedUser = authFixtureFactory.createUserPayload({ username: 'updated' });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.success({ me: initialUser }))
        .mockResolvedValueOnce(responses.success({ me: updatedUser }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({ accessToken: 'access', refreshToken: 'refresh' });
        // Act
        const concurrent = await Promise.all([client.request(MeDocument), client.request(MeDocument)]);
        const subsequent = await client.request(MeDocument);
        // Assert
        expect(concurrent).toEqual([{ me: initialUser }, { me: initialUser }]);
        expect(subsequent).toEqual({ me: updatedUser });
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });
    });

    it('releases a failed shared query so a later request can retry', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const user = authFixtureFactory.createUserPayload();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('INTERNAL_SERVER_ERROR'))
        .mockResolvedValueOnce(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        // Act
        const failed = await Promise.allSettled([client.request(MeDocument), client.request(MeDocument)]);
        const retried = await client.request(MeDocument);
        // Assert
        expect(failed.map((result) => result.status)).toEqual(['rejected', 'rejected']);
        expect(retried).toEqual({ me: user });
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });
    });

    it('keeps the credentials captured before asynchronous request dispatch', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const user = authFixtureFactory.createUserPayload();
      const fetchMock = vi.fn().mockResolvedValue(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        // Act
        const pending = client.request(MeDocument);
        client.setAuthSessionTokens({ accessToken: 'replacement', refreshToken: 'refresh' });
        await pending;
        // Assert
        expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
      });
    });

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

  describe('session recovery', () => {
    it('retries with credentials rotated by another tab before the expired request responds', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const pending = responses.pending();
      const user = authFixtureFactory.createUserPayload();
      const accessToken = authFixtureFactory.createAccessToken();
      const renewedAccessToken = accessToken.replace('signature', 'renewed');
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(pending.fetch)
        .mockResolvedValueOnce(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({ accessToken, refreshToken: 'old-refresh' });
        // Act
        const request = client.request(MeDocument);
        await pending.started;
        client.setAuthSessionTokens({ accessToken: renewedAccessToken, refreshToken: 'renewed-refresh' });
        pending.respond(responses.failure('UNAUTHENTICATED'));
        const result = await request;
        // Assert
        expect(result).toEqual({ me: user });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][1].headers.authorization).toBe(`Bearer ${renewedAccessToken}`);
      });
    });

    it.each(['account', 'session', 'logout'] as const)(
      'does not retry an earlier request after %s replacement',
      async (change) => {
        // Arrange
        const responses = new GraphqlResponseFixtureFactory();
        const pending = responses.pending();
        const accessToken = authFixtureFactory.createAccessToken();
        const replacementAccessToken = authFixtureFactory.createAccessToken(
          change === 'account' ? { id: 2 } : change === 'session' ? { sessionId: 'replacement-session' } : {},
        );
        const fetchMock = vi.fn().mockImplementationOnce(pending.fetch);
        // Act + Assert
        await withFetchMock(fetchMock, async () => {
          const client = createGraphqlClient();
          const invalidated = vi.fn();
          client.registerAuthSessionHandlers({ onSessionInvalidated: invalidated });
          client.setAuthSessionTokens({ accessToken, refreshToken: 'old-refresh' });
          // Act
          const request = client.request(MeDocument).catch((error: unknown) => error);
          await pending.started;
          if (change === 'logout') client.setAuthSessionTokens({ accessToken: null, refreshToken: null });
          client.setAuthSessionTokens({ accessToken: replacementAccessToken, refreshToken: 'replacement-refresh' });
          pending.respond(responses.failure('UNAUTHENTICATED'));
          const result = await request;
          // Assert
          expect(result).toMatchObject({ code: 'UNAUTHENTICATED' });
          expect(fetchMock).toHaveBeenCalledOnce();
          expect(invalidated).not.toHaveBeenCalled();
        });
      },
    );

    it('discards a pending refresh after another tab rotates the same session and retries with its credentials', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const pending = responses.pending();
      const user = authFixtureFactory.createUserPayload();
      const accessToken = authFixtureFactory.createAccessToken();
      const renewedAccessToken = accessToken.replace('signature', 'renewed');
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('UNAUTHENTICATED'))
        .mockImplementationOnce(pending.fetch)
        .mockResolvedValueOnce(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        const refreshed = vi.fn();
        client.registerAuthSessionHandlers({ onSessionRefreshed: refreshed });
        client.setAuthSessionTokens({ accessToken, refreshToken: 'old-refresh' });
        // Act
        const request = client.request(MeDocument);
        await pending.started;
        client.setAuthSessionTokens({ accessToken: renewedAccessToken, refreshToken: 'renewed-refresh' });
        pending.respond(responses.success({ refresh: authFixtureFactory.createAuthSessionPayload() }));
        const result = await request;
        // Assert
        expect(result).toEqual({ me: user });
        expect(refreshed).not.toHaveBeenCalled();
        expect(fetchMock.mock.calls[2][1].headers.authorization).toBe(`Bearer ${renewedAccessToken}`);
      });
    });

    it('renews an expired session after an HTTP 401 before retrying the operation', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const session = authFixtureFactory.createAuthSessionPayload({ accessToken: 'renewed', refreshToken: 'rotated' });
      const user = authFixtureFactory.createUserPayload();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('UNAUTHORIZED', 401))
        .mockResolvedValueOnce(responses.success({ refresh: session }))
        .mockResolvedValueOnce(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        const invalidated = vi.fn();
        client.registerAuthSessionHandlers({ onSessionInvalidated: invalidated });
        client.setAuthSessionTokens({ accessToken: 'expired', refreshToken: 'refresh' });
        // Act
        const result = await client.request(MeDocument);
        // Assert
        expect(result).toEqual({ me: user });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(invalidated).not.toHaveBeenCalled();
      });
    });

    it('does not refresh or sign out on an authorization denial', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const fetchMock = vi.fn().mockResolvedValueOnce(responses.failure('FORBIDDEN'));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        const invalidated = vi.fn();
        client.registerAuthSessionHandlers({ onSessionInvalidated: invalidated });
        client.setAuthSessionTokens({ accessToken: 'access', refreshToken: 'refresh' });
        // Act
        const failure = await client.request(MeDocument).catch((error: unknown) => error);
        // Assert
        expect(failure).toMatchObject({ code: 'FORBIDDEN' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(invalidated).not.toHaveBeenCalled();
      });
    });

    it('invalidates a session when renewal is rejected', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('UNAUTHENTICATED'))
        .mockResolvedValueOnce(responses.failure('INVALID_REFRESH_TOKEN'));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        const invalidated = vi.fn();
        client.registerAuthSessionHandlers({ onSessionInvalidated: invalidated });
        client.setAuthSessionTokens({ accessToken: 'expired', refreshToken: 'revoked' });
        // Act
        const failure = await client.request(MeDocument).catch((error: unknown) => error);
        // Assert
        expect(failure).toBeInstanceOf(Error);
        expect(invalidated).toHaveBeenCalledOnce();
      });
    });

    it.each(['logout', 'replacement'] as const)(
      'ignores a delayed refresh response after session %s',
      async (change) => {
        // Arrange
        const responses = new GraphqlResponseFixtureFactory();
        let release!: (response: Response) => void;
        let markStarted!: () => void;
        const started = new Promise<void>((resolve) => {
          markStarted = resolve;
        });
        const delayed = new Promise<Response>((resolve) => {
          release = resolve;
        });
        const fetchMock = vi
          .fn()
          .mockResolvedValueOnce(responses.failure('UNAUTHENTICATED'))
          .mockImplementationOnce(() => {
            markStarted();
            return delayed;
          });
        // Act + Assert
        await withFetchMock(fetchMock, async () => {
          const client = createGraphqlClient();
          const refreshed = vi.fn();
          const invalidated = vi.fn();
          client.registerAuthSessionHandlers({ onSessionRefreshed: refreshed, onSessionInvalidated: invalidated });
          client.setAuthSessionTokens({ accessToken: 'expired', refreshToken: 'old-refresh' });
          // Act
          const pending = client.request(MeDocument).catch((error: unknown) => error);
          await started;
          client.setAuthSessionTokens(
            change === 'logout'
              ? { accessToken: null, refreshToken: null }
              : { accessToken: 'another-account', refreshToken: 'another-refresh' },
          );
          release(responses.success({ refresh: authFixtureFactory.createAuthSessionPayload() }));
          const result = await pending;
          // Assert
          expect(result).toBeInstanceOf(Error);
          expect(refreshed).not.toHaveBeenCalled();
          expect(invalidated).not.toHaveBeenCalled();
          expect(fetchMock).toHaveBeenCalledTimes(2);
        });
      },
    );

    it('does not invalidate a replacement session when an earlier retry finishes with an auth error', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      let release!: (response: Response) => void;
      let markRetryStarted!: () => void;
      const started = new Promise<void>((resolve) => {
        markRetryStarted = resolve;
      });
      const delayed = new Promise<Response>((resolve) => {
        release = resolve;
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('UNAUTHENTICATED'))
        .mockResolvedValueOnce(responses.success({ refresh: authFixtureFactory.createAuthSessionPayload() }))
        .mockImplementationOnce(() => {
          markRetryStarted();
          return delayed;
        });
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        const invalidated = vi.fn();
        client.registerAuthSessionHandlers({ onSessionInvalidated: invalidated });
        client.setAuthSessionTokens({ accessToken: 'expired', refreshToken: 'refresh' });
        // Act
        const pending = client.request(MeDocument).catch((error: unknown) => error);
        await started;
        client.setAuthSessionTokens({ accessToken: 'new-account', refreshToken: 'new-account-refresh' });
        release(responses.failure('UNAUTHENTICATED'));
        const failure = await pending;
        // Assert
        expect(failure).toBeInstanceOf(Error);
        expect(invalidated).not.toHaveBeenCalled();
      });
    });

    it('reuses credentials already rotated by another tab without rotating the stale token', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const oldAccess = authFixtureFactory.createAccessToken();
      const peerAccess = oldAccess.replace('signature', 'renewed');
      const user = authFixtureFactory.createUserPayload();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(responses.failure('UNAUTHENTICATED'))
        .mockResolvedValueOnce(responses.success({ me: user }));
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({ accessToken: oldAccess, refreshToken: 'old-refresh' });
        client.registerAuthSessionHandlers({
          readSessionTokens: () => ({ accessToken: peerAccess, refreshToken: 'peer-refresh' }),
        });
        // Act
        const result = await client.request(MeDocument);
        // Assert
        expect(result).toEqual({ me: user });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][1].headers.authorization).toBe(`Bearer ${peerAccess}`);
      });
    });

    it('shares renewal between concurrent operations and retries each operation once', async () => {
      // Arrange
      const responses = new GraphqlResponseFixtureFactory();
      const session = authFixtureFactory.createAuthSessionPayload({
        accessToken: 'renewed-access',
        refreshToken: 'rotated-refresh',
      });
      const user = authFixtureFactory.createUserPayload();
      let renewals = 0;
      const fetchMock = vi.fn().mockImplementation(async (_url, init: RequestInit) => {
        const body = JSON.parse(init.body as string) as { operationName: string };
        if (body.operationName === 'Refresh') {
          renewals++;
          return responses.success({ refresh: session });
        }
        const headers = init.headers as Record<string, string>;
        if (headers.authorization !== 'Bearer renewed-access') return responses.failure('UNAUTHENTICATED');
        return body.operationName === 'Me'
          ? responses.success({ me: user })
          : responses.success({
              myGameHistory: { page: 1, pageSize: 20, totalPages: 1, totalCount: 0, overallCount: 0, items: [] },
            });
      });
      // Act + Assert
      await withFetchMock(fetchMock, async () => {
        const client = createGraphqlClient();
        client.setAuthSessionTokens({ accessToken: 'expired', refreshToken: 'refresh' });
        // Act
        const results = await Promise.all([
          client.request(MeDocument),
          client.request(MyGameHistoryDocument, { input: { page: 1 } }),
        ]);
        // Assert
        expect(results).toEqual([
          { me: user },
          { myGameHistory: { page: 1, pageSize: 20, totalPages: 1, totalCount: 0, overallCount: 0, items: [] } },
        ]);
        expect(renewals).toBe(1);
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
