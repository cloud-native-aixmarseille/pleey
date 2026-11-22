import { describe, expect, it, vi } from 'vitest';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { GraphqlResponseFixtureFactory } from '../../../test-utils/fixtures/graphql-response-fixture-factory';
import { MeDocument, MyGameHistoryDocument } from '../generated/graphql';
import { GraphqlClient } from './graphql-client';

async function withFetchMock<T>(fetchMock: ReturnType<typeof vi.fn>, callback: () => Promise<T>): Promise<T> {
  vi.stubGlobal('fetch', fetchMock);
  try {
    return await callback();
  } finally {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
}

describe('GraphqlClient', () => {
  it('shares concurrent queries and refetches after completion', async () => {
    // Arrange
    const responses = new GraphqlResponseFixtureFactory();
    const initialUser = new AuthFixtureFactory().createUserPayload();
    const updatedUser = new AuthFixtureFactory().createUserPayload({ username: 'updated' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responses.success({ me: initialUser }))
      .mockResolvedValueOnce(responses.success({ me: updatedUser }));

    // Act + Assert
    await withFetchMock(fetchMock, async () => {
      const client = new GraphqlClient();
      const concurrent = await Promise.all([client.request(MeDocument), client.request(MeDocument)]);
      const subsequent = await client.request(MeDocument);

      expect(concurrent).toEqual([{ me: initialUser }, { me: initialUser }]);
      expect(subsequent).toEqual({ me: updatedUser });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('sends the host cookie and CSRF preflight metadata without bearer credentials', async () => {
    // Arrange
    const responses = new GraphqlResponseFixtureFactory();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(responses.success({ me: new AuthFixtureFactory().createUserPayload() }));

    // Act + Assert
    await withFetchMock(fetchMock, async () => {
      await new GraphqlClient().request(MeDocument);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.credentials).toBe('include');
      expect(options.headers.authorization).toBeUndefined();
      expect(options.headers['apollo-require-preflight']).toBe('true');
    });
  });

  it('releases a failed shared query so a later request can retry', async () => {
    // Arrange
    const responses = new GraphqlResponseFixtureFactory();
    const user = new AuthFixtureFactory().createUserPayload();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responses.failure('INTERNAL_SERVER_ERROR'))
      .mockResolvedValueOnce(responses.success({ me: user }));

    // Act + Assert
    await withFetchMock(fetchMock, async () => {
      const client = new GraphqlClient();
      const failed = await Promise.allSettled([client.request(MeDocument), client.request(MeDocument)]);
      const retried = await client.request(MeDocument);

      expect(failed.map((result) => result.status)).toEqual(['rejected', 'rejected']);
      expect(retried).toEqual({ me: user });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('normalizes an unauthorized cookie session as a domain failure', async () => {
    // Arrange
    const responses = new GraphqlResponseFixtureFactory();
    const fetchMock = vi.fn().mockResolvedValue(responses.failure('UNAUTHORIZED'));

    // Act + Assert
    await withFetchMock(fetchMock, async () => {
      await expect(new GraphqlClient().request(MyGameHistoryDocument)).rejects.toThrow('UNAUTHORIZED');
    });
  });
});
