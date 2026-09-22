import { describe, expect, it } from 'vitest';
import { PrismaUserAuthenticationRepository } from '../../../infrastructure/identity/repositories/prisma-user-authentication-repository';
import { IdentityGraphqlTestHarness } from '../../../test-utils/fixtures/integration/identity-graphql-test-harness';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;
const login = 'mutation($input: LoginInput!) { login(input: $input) { accessToken refreshToken } }';
const refresh = 'mutation($input: RefreshTokenInput!) { refresh(input: $input) { accessToken refreshToken } }';
const overview = `query($input: UserSessionListInput!) {
  myCurrentSession { id createdAt lastActiveAt expiresAt userAgent ipAddress }
  myOtherSessions(input: $input) { items { id } page pageSize totalPages totalCount overallCount }
}`;
const revoke = 'mutation($input: RevokeUserSessionInput!) { revokeSession(input: $input) }';

describeWithDatabase('AuthResolver', () => {
  const harness = new IdentityGraphqlTestHarness();

  it('preserves independent logins and returns only the owner’s session details and paginated devices', async () => {
    // Arrange
    const account = await harness.createAccount();
    await harness.createAccount();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0) Chrome/140.0.0.0';
    const second = await harness
      .graphql(login, { input: { email: account.user.email, password: account.password } })
      .set('User-Agent', userAgent)
      .set('X-Forwarded-For', '203.0.113.55');
    const token = second.body.data.login.accessToken;

    // Act
    const [firstPage, beyondEnd, original] = await Promise.all([
      harness.graphql(overview, { input: { page: 1, pageSize: 1 } }, token),
      harness.graphql(overview, { input: { page: 2, pageSize: 1 } }, token),
      harness.graphql('{ me { id } }', {}, account.session.accessToken),
    ]);

    // Assert
    expect(original.body.data.me.id).toBe(account.user.id);
    const current = firstPage.body.data.myCurrentSession;
    expect(current).toMatchObject({
      userAgent,
      createdAt: expect.any(String),
      lastActiveAt: expect.any(String),
      expiresAt: expect.any(String),
    });
    expect(current.ipAddress).not.toBe('203.0.113.55');
    expect(firstPage.body.data.myOtherSessions).toEqual({
      items: [{ id: expect.not.stringMatching(current.id) }],
      page: 1,
      pageSize: 1,
      totalPages: 1,
      totalCount: 1,
      overallCount: 1,
    });
    expect(beyondEnd.body.data.myOtherSessions).toEqual({
      items: [],
      page: 2,
      pageSize: 1,
      totalPages: 1,
      totalCount: 1,
      overallCount: 1,
    });
  });

  it('revokes one device’s API and refresh access while preserving the current and unrelated accounts', async () => {
    // Arrange
    const account = await harness.createAccount();
    const stranger = await harness.createAccount();
    const second = await harness.graphql(login, { input: { email: account.user.email, password: account.password } });
    const token = second.body.data.login.accessToken;
    const other = await harness.graphql('{ myCurrentSession { id } }', {}, account.session.accessToken);

    // Act
    const revoked = await harness.graphql(revoke, { input: { sessionId: other.body.data.myCurrentSession.id } }, token);
    const [oldAccess, oldRefresh, current, unrelated] = await Promise.all([
      harness.graphql('{ me { id } }', {}, account.session.accessToken),
      harness.graphql(refresh, { input: { refreshToken: account.session.refreshToken } }),
      harness.graphql(overview, { input: { page: 1, pageSize: 5 } }, token),
      harness.graphql('{ me { id } }', {}, stranger.session.accessToken),
    ]);

    // Assert
    expect(revoked.body).toEqual({ data: { revokeSession: true } });
    expect(oldAccess.body.errors).toBeDefined();
    expect(oldRefresh.body.errors).toBeDefined();
    expect(current.body.data.myOtherSessions.totalCount).toBe(0);
    expect(unrelated.body.data.me.id).toBe(stranger.user.id);
  });

  it('does not let another account revoke a session, and rejects anonymous or invalid requests', async () => {
    // Arrange
    const owner = await harness.createAccount();
    const stranger = await harness.createAccount();
    const ownerSession = await harness.graphql('{ myCurrentSession { id } }', {}, owner.session.accessToken);
    const input = { sessionId: ownerSession.body.data.myCurrentSession.id };

    // Act
    const foreign = await harness.graphql(revoke, { input }, stranger.session.accessToken);
    const anonymous = await harness.graphql(overview, { input: { page: 1, pageSize: 5 } });
    const malformed = await harness.graphql(revoke, { input: { sessionId: 'invalid' } }, stranger.session.accessToken);
    const valid = await harness.graphql('{ me { id } }', {}, owner.session.accessToken);

    // Assert
    expect(foreign.body).toEqual({ data: { revokeSession: true } });
    expect(anonymous.body.errors).toBeDefined();
    expect(malformed.body.errors).toBeDefined();
    expect(valid.body.data.me.id).toBe(owner.user.id);
  });

  it('signs out all other devices without invalidating this device’s refresh token', async () => {
    // Arrange
    const account = await harness.createAccount();
    const devices = await Promise.all(
      [1, 2].map(() => harness.graphql(login, { input: { email: account.user.email, password: account.password } })),
    );

    // Act
    const revoked = await harness.graphql('mutation { revokeOtherSessions }', {}, account.session.accessToken);
    const others = await Promise.all(
      devices.map((device) => harness.graphql('{ me { id } }', {}, device.body.data.login.accessToken)),
    );
    const renewed = await harness.graphql(refresh, { input: { refreshToken: account.session.refreshToken } });

    // Assert
    expect(revoked.body).toEqual({ data: { revokeOtherSessions: true } });
    expect(others.every((response) => response.body.errors?.length > 0)).toBe(true);
    expect(renewed.body.data.refresh.accessToken).toEqual(expect.any(String));
  });

  it('rotates each device independently and preserves its sign-in metadata', async () => {
    // Arrange
    const account = await harness.createAccount();
    const second = await harness.graphql(login, { input: { email: account.user.email, password: account.password } });
    const before = await harness.graphql('{ myCurrentSession { id createdAt } }', {}, account.session.accessToken);

    // Act
    const renewed = await harness.graphql(refresh, { input: { refreshToken: account.session.refreshToken } });
    const reused = await harness.graphql(refresh, { input: { refreshToken: account.session.refreshToken } });
    const otherRenewed = await harness.graphql(refresh, {
      input: { refreshToken: second.body.data.login.refreshToken },
    });
    const after = await harness.graphql(
      '{ myCurrentSession { id createdAt } }',
      {},
      renewed.body.data.refresh.accessToken,
    );

    // Assert
    expect(after.body).toEqual(before.body);
    expect(reused.body.errors).toBeDefined();
    expect(otherRenewed.body.data.refresh.accessToken).toEqual(expect.any(String));
  });

  it('excludes expired sessions and paginates tied sign-in dates deterministically', async () => {
    // Arrange
    const account = await harness.createAccount();
    await Promise.all(
      [1, 2, 3].map(() => harness.graphql(login, { input: { email: account.user.email, password: account.password } })),
    );
    const before = await harness.graphql(overview, { input: { page: 1, pageSize: 5 } }, account.session.accessToken);
    const ids = before.body.data.myOtherSessions.items
      .map((session: { id: string }) => session.id)
      .sort()
      .reverse();
    await harness.prisma.userSession.updateMany({
      where: { id: { in: ids } },
      data: { createdAt: new Date('2026-01-01T00:00:00Z') },
    });
    await harness.prisma.userSession.update({ where: { id: ids[2] }, data: { refreshTokenExpiresAt: new Date(0) } });

    // Act
    const pages = await Promise.all(
      [1, 2, 3].map((page) => harness.graphql(overview, { input: { page, pageSize: 1 } }, account.session.accessToken)),
    );

    // Assert
    expect(pages.map((response) => response.body.data.myOtherSessions)).toEqual([
      { items: [{ id: ids[0] }], page: 1, pageSize: 1, totalPages: 2, totalCount: 2, overallCount: 2 },
      { items: [{ id: ids[1] }], page: 2, pageSize: 1, totalPages: 2, totalCount: 2, overallCount: 2 },
      { items: [], page: 3, pageSize: 1, totalPages: 2, totalCount: 2, overallCount: 2 },
    ]);
  });

  it('records recent activity without treating idle socket checks as activity', async () => {
    // Arrange
    const account = await harness.createAccount();
    const response = await harness.graphql('{ myCurrentSession { id } }', {}, account.session.accessToken);
    const sessionId = response.body.data.myCurrentSession.id;
    const earlier = new Date(Date.now() - 120_000);
    await harness.prisma.userSession.update({ where: { id: sessionId }, data: { lastActiveAt: earlier } });
    const repository = new PrismaUserAuthenticationRepository(harness.prisma);

    // Act
    await repository.isSessionActive(account.session.user.id, sessionId, false);
    const idle = await harness.prisma.userSession.findUniqueOrThrow({ where: { id: sessionId } });
    await repository.isSessionActive(account.session.user.id, sessionId);
    const active = await harness.prisma.userSession.findUniqueOrThrow({ where: { id: sessionId } });
    await repository.isSessionActive(account.session.user.id, sessionId);
    const repeated = await harness.prisma.userSession.findUniqueOrThrow({ where: { id: sessionId } });

    // Assert
    expect(idle.lastActiveAt).toEqual(earlier);
    expect(active.lastActiveAt?.getTime()).toBeGreaterThan(earlier.getTime());
    expect(repeated.lastActiveAt).toEqual(active.lastActiveAt);
  });
});
