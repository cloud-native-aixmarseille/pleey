import { describe, expect, it } from 'vitest';
import { IdentityGraphqlTestHarness } from '../../../test-utils/fixtures/integration/identity-graphql-test-harness';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;
const historyQuery =
  'query { myGameHistory(input: { page: 1 }) { page pageSize totalPages totalCount overallCount items { partyId title role points } } }';

describeWithDatabase('AuthResolver', () => {
  const harness = new IdentityGraphqlTestHarness();

  it('completes password recovery, rejects reuse, revokes old credentials, and permits sign-in with the replacement password', async () => {
    // Arrange
    const account = await harness.createAccount();
    const resetMutation = 'mutation($input: ResetPasswordInput!) { resetPassword(input: $input) }';
    // Act
    const requested = await harness.graphql(
      'mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) }',
      { input: { email: account.user.email, locale: 'en' } },
    );
    const token = await harness.deliverReset(account.user.email);
    const completed = await harness.graphql(resetMutation, { input: { token, password: 'replacement-password' } });
    const reused = await harness.graphql(resetMutation, { input: { token, password: 'another-password' } });
    const oldAccess = await harness.graphql('{ me { id email } }', {}, account.session.accessToken);
    const oldRefresh = await harness.graphql(
      'mutation($input: RefreshTokenInput!) { refresh(input: $input) { accessToken } }',
      { input: { refreshToken: account.session.refreshToken } },
    );
    const login = await harness.graphql(
      'mutation($input: LoginInput!) { login(input: $input) { accessToken user { id } } }',
      { input: { email: account.user.email, password: 'replacement-password' } },
    );
    const current = await harness.graphql('{ me { id email } }', {}, login.body.data?.login.accessToken);
    const logout = await harness.graphql('mutation { logout }', {}, login.body.data?.login.accessToken);
    const afterLogout = await harness.graphql('{ me { id } }', {}, login.body.data?.login.accessToken);
    // Assert
    expect(requested.body).toEqual({ data: { forgotPassword: true } });
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(completed.body).toEqual({ data: { resetPassword: true } });
    expect(reused.body.errors[0].message).toBe('INVALID_RESET_TOKEN');
    expect(oldAccess.body.data).toBeNull();
    expect(oldRefresh.body.errors).toBeDefined();
    expect(current.body).toEqual({ data: { me: { id: account.user.id, email: account.user.email } } });
    expect(logout.body).toEqual({ data: { logout: true } });
    expect(afterLogout.body.data).toBeNull();
  });

  it('returns the same public response for unknown and registered addresses', async () => {
    // Arrange
    const account = await harness.createAccount();
    const query = 'mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) }';
    // Act
    const registered = await harness.graphql(query, { input: { email: account.user.email, locale: 'fr' } });
    const unknown = await harness.graphql(query, { input: { email: 'unknown-478@example.com', locale: 'fr' } });
    // Assert
    expect(registered.body).toEqual({ data: { forgotPassword: true } });
    expect(unknown.body).toEqual(registered.body);
  });

  it('returns only the current user’s hosted and played sessions and their own score', async () => {
    // Arrange
    const owner = await harness.createAccount();
    const other = await harness.createAccount();
    const parties = await harness.createHistory(owner.user.id, other.user.id);
    // Act
    const response = await harness.graphql(historyQuery, {}, owner.session.accessToken);
    // Assert
    expect(response.body.data.myGameHistory).toEqual({
      page: 1,
      pageSize: 9,
      totalPages: 1,
      totalCount: 2,
      overallCount: 2,
      items: expect.arrayContaining([
        { partyId: parties.hosted.id, title: 'History quiz', role: 'host', points: null },
        { partyId: parties.played.id, title: 'History quiz', role: 'player', points: 42 },
      ]),
    });
    expect(response.body.data.myGameHistory.items).toHaveLength(2);
  });

  it('paginates history with tied timestamps without leaking other users into counts', async () => {
    // Arrange
    const owner = await harness.createAccount();
    const other = await harness.createAccount();
    const parties = await harness.createHistory(owner.user.id, other.user.id);
    await harness.prisma.party.updateMany({
      where: { id: { in: [parties.hosted.id, parties.played.id] } },
      data: { createdAt: new Date('2026-01-01T00:00:00Z') },
    });
    const query =
      'query($input: UserGameHistoryInput!) { myGameHistory(input: $input) { items { partyId } page pageSize totalPages totalCount overallCount } }';
    // Act
    const responses = await Promise.all(
      [1, 2, 3].map((page) => harness.graphql(query, { input: { page, pageSize: 1 } }, owner.session.accessToken)),
    );
    // Assert
    const ids = [parties.hosted.id, parties.played.id].sort().reverse();
    expect(responses.map((response) => response.body.data.myGameHistory)).toEqual([
      { items: [{ partyId: ids[0] }], page: 1, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 },
      { items: [{ partyId: ids[1] }], page: 2, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 },
      { items: [], page: 3, pageSize: 1, totalCount: 2, overallCount: 2, totalPages: 2 },
    ]);
  });

  it.each(['project', 'organization'] as const)('excludes history and counts beneath a deleted %s', async (parent) => {
    // Arrange
    const owner = await harness.createAccount();
    const other = await harness.createAccount();
    const parties = await harness.createHistory(owner.user.id, other.user.id);
    const game = await harness.prisma.game.findUniqueOrThrow({
      where: { id: parties.hosted.gameId },
      include: { project: true },
    });
    if (parent === 'project') {
      await harness.prisma.project.update({ where: { id: game.projectId }, data: { deletedAt: new Date() } });
    } else {
      await harness.prisma.organization.update({
        where: { id: game.project.organizationId },
        data: { deletedAt: new Date() },
      });
    }
    // Act
    const response = await harness.graphql(historyQuery, {}, owner.session.accessToken);
    // Assert
    expect(response.body.data.myGameHistory).toEqual({
      items: [],
      page: 1,
      pageSize: 9,
      totalPages: 1,
      totalCount: 0,
      overallCount: 0,
    });
  });

  it('rejects anonymous history access and attempts to select another account', async () => {
    // Arrange
    const account = await harness.createAccount();
    // Act
    const anonymous = await harness.graphql(historyQuery);
    const targeted = await harness.graphql(
      'query { myGameHistory(input: { page: 1, userId: "someone-else" }) { totalPages } }',
      {},
      account.session.accessToken,
    );
    const invalidPage = await harness.graphql(
      'query { myGameHistory(input: { page: 0 }) { totalPages } }',
      {},
      account.session.accessToken,
    );
    // Assert
    expect(anonymous.body.errors).toBeDefined();
    expect(anonymous.body.data).toBeNull();
    expect(targeted.body.errors).toBeDefined();
    expect(targeted.body.data).toBeUndefined();
    expect(invalidPage.body.errors).toBeDefined();
  });
});
