import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '../../../../domains/identity/entities/user';
import { useAuth } from '../../../../presentation/identity/contexts/auth-context';
import { ProtectedRoute } from '../../../../presentation/shared/routing/protected-route';
import { AppAuthProviderFixtureFactory } from '../../../../test-utils/fixtures/app-auth-provider-fixture-factory';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { GraphqlResponseFixtureFactory } from '../../../../test-utils/fixtures/graphql-response-fixture-factory';

describe('AppAuthProviderFactory', () => {
  it('validates a replacement account independently of an earlier pending account request', async () => {
    // Arrange
    const fixtures = new AuthFixtureFactory();
    const responses = new GraphqlResponseFixtureFactory();
    const accountA = fixtures.createAuthSession({ accessToken: 'account-A', user: { id: 1 } });
    const accountB = fixtures.createAuthSession({ accessToken: 'account-B', user: { id: 2 } });
    let release!: (response: Response) => void;
    let markStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => {
        markStarted();
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      })
      .mockImplementation(() => Promise.resolve(responses.success({ me: accountB.user })));
    vi.stubGlobal('fetch', fetchMock);
    const fixture = new AppAuthProviderFixtureFactory().createConnected();
    fixture.sessions.commit(accountA);
    // Act + Assert
    try {
      const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
      await started;
      // Act
      await act(async () => {
        fixture.sessions.commit(accountB);
        fixture.authSession.watch.mock.calls[0][0]();
        release(responses.success({ me: accountA.user }));
      });
      await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
      // Assert
      expect(result.current.user).toEqual(accountB.user);
      expect(fixture.sessions.restore()?.user).toEqual(accountB.user);
      expect(fetchMock.mock.calls.map(([, options]) => options.headers.authorization)).toEqual([
        'Bearer account-A',
        'Bearer account-B',
      ]);
    } finally {
      fixture.sessions.clear();
      vi.unstubAllGlobals();
    }
  });

  it('preserves mounted drafts while revalidating a token rotation from another tab', async () => {
    // Arrange
    const fixtures = new AuthFixtureFactory();
    const fixture = new AppAuthProviderFixtureFactory().create();
    const accessToken = fixtures.createAccessToken();
    fixture.authSession.restore.mockReturnValue(fixtures.createAuthSession({ accessToken }));
    render(
      fixture.factory.wrap(
        <ProtectedRoute>
          <input aria-label="Draft" defaultValue="" />
        </ProtectedRoute>,
      ),
    );
    const draft = await screen.findByRole('textbox');
    fireEvent.change(draft, { target: { value: 'Unsaved edit' } });
    fixture.authSession.restore.mockReturnValue(
      fixtures.createAuthSession({
        accessToken: accessToken.replace('signature', 'renewed-signature'),
        refreshToken: 'renewed-refresh',
      }),
    );
    const updatedUser = fixtures.createUser({ username: 'updated-profile' });
    let complete!: (user: User) => void;
    fixture.currentUser.execute.mockReturnValue(
      new Promise<User>((resolve) => {
        complete = resolve;
      }),
    );
    // Act
    await act(async () => {
      fixture.authSession.watch.mock.calls[0][0]();
    });
    const draftDuringValidation = screen.queryByRole('textbox');
    await act(async () => {
      complete(updatedUser);
    });
    // Assert
    expect(draftDuringValidation).toBe(draft);
    expect(screen.getByRole('textbox')).toBe(draft);
    expect(draft).toHaveValue('Unsaved edit');
    expect(fixture.authSession.updateUser).toHaveBeenLastCalledWith(updatedUser);
  });

  it('retains the validated account when background validation is temporarily unavailable', async () => {
    // Arrange
    const fixtures = new AuthFixtureFactory();
    const fixture = new AppAuthProviderFixtureFactory().create();
    fixture.authSession.restore.mockReturnValue(
      fixtures.createAuthSession({ accessToken: fixtures.createAccessToken() }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    fixture.currentUser.execute.mockRejectedValue(new Error('Network unavailable'));
    // Act
    await act(async () => {
      fixture.authSession.watch.mock.calls[0][0]();
    });
    // Assert
    expect(result.current.user).toEqual(fixtures.createUser());
    expect(result.current.hasRestoredSession).toBe(true);
    expect(fixture.authSession.suspend).not.toHaveBeenCalled();
  });

  it.each(['account', 'session'] as const)(
    'clears the old account view while validating a replacement %s',
    async (change) => {
      // Arrange
      const fixtures = new AuthFixtureFactory();
      const fixture = new AppAuthProviderFixtureFactory().create();
      fixture.authSession.restore.mockReturnValue(
        fixtures.createAuthSession({ accessToken: fixtures.createAccessToken() }),
      );
      const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
      await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
      const replacement = fixtures.createAuthSession({
        accessToken: fixtures.createAccessToken(
          change === 'account' ? { id: 2 } : { sessionId: '22222222-2222-4222-8222-222222222222' },
        ),
        user: { id: change === 'account' ? 2 : 1 },
      });
      fixture.authSession.restore.mockReturnValue(replacement);
      let complete!: (user: User) => void;
      fixture.currentUser.execute.mockReturnValue(
        new Promise<User>((resolve) => {
          complete = resolve;
        }),
      );
      // Act
      await act(async () => {
        fixture.authSession.watch.mock.calls[0][0]();
      });
      const pendingUser = result.current.user;
      const pendingRestoration = result.current.hasRestoredSession;
      await act(async () => {
        complete(replacement.user);
      });
      // Assert
      expect(pendingUser).toBeNull();
      expect(pendingRestoration).toBe(false);
      expect(result.current.user).toEqual(replacement.user);
      expect(fixture.workspace.clear).toHaveBeenCalledOnce();
    },
  );

  it('waits for server validation before publishing a persisted account', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    const validated = new AuthFixtureFactory().createUser({ username: 'server-name' });
    let complete!: (user: User) => void;
    fixture.currentUser.execute.mockReturnValue(
      new Promise<User>((resolve) => {
        complete = resolve;
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    const pendingUser = result.current.user;
    const pendingRestoration = result.current.hasRestoredSession;
    // Act
    await act(async () => {
      complete(validated);
    });
    // Assert
    expect(pendingUser).toBeNull();
    expect(pendingRestoration).toBe(false);
    expect(result.current.user).toEqual(validated);
    expect(result.current.hasRestoredSession).toBe(true);
    expect(fixture.authSession.updateUser).toHaveBeenCalledWith(validated);
  });

  it('does not expose a cached account when validation is unavailable', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    fixture.currentUser.execute.mockRejectedValue(new Error('Network unavailable'));
    // Act
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    // Assert
    expect(result.current.user).toBeNull();
    expect(fixture.authSession.clear).not.toHaveBeenCalled();
    expect(fixture.authSession.suspend).toHaveBeenCalledOnce();
  });

  it('does not restore a user from renewal while sign-out is pending', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    let finishLogout!: () => void;
    fixture.logout.execute.mockReturnValue(
      new Promise<void>((resolve) => {
        finishLogout = resolve;
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    let pending!: Promise<void>;
    // Act
    await act(async () => {
      pending = result.current.signOut();
      fixture.authSession.registerHandlers.mock.calls[0][0].onSessionRefreshed?.(
        new AuthFixtureFactory().createAuthSession(),
      );
    });
    const userDuringLogout = result.current.user;
    await act(async () => {
      finishLogout();
      await pending;
    });
    // Assert
    expect(userDuringLogout).toBeNull();
    expect(result.current.user).toBeNull();
    expect(fixture.authSession.clear).toHaveBeenCalledOnce();
    expect(fixture.workspace.clear).toHaveBeenCalledOnce();
  });

  it.each(['rotation', 'profile update'] as const)(
    "keeps sign-out authoritative over another tab's same-session %s",
    async (change) => {
      // Arrange
      const fixture = new AppAuthProviderFixtureFactory().create();
      const fixtures = new AuthFixtureFactory();
      const session = fixtures.createAuthSession({ accessToken: fixtures.createAccessToken() });
      fixture.authSession.restore.mockReturnValue(session);
      let finishLogout!: () => void;
      fixture.logout.execute.mockReturnValue(
        new Promise<void>((resolve) => {
          finishLogout = resolve;
        }),
      );
      const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
      await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
      fixture.authSession.restore.mockReturnValue({
        ...session,
        accessToken: change === 'rotation' ? session.accessToken.replace('signature', 'renewed') : session.accessToken,
      });
      let pending!: Promise<void>;
      // Act
      await act(async () => {
        pending = result.current.signOut();
      });
      await act(async () => {
        fixture.authSession.watch.mock.calls[0][0]();
      });
      await act(async () => {
        finishLogout();
        await pending;
      });
      // Assert
      expect(result.current.user).toBeNull();
      expect(fixture.currentUser.execute).toHaveBeenCalledOnce();
      expect(fixture.authSession.clear).toHaveBeenCalledOnce();
    },
  );

  it.each(['account', 'session'] as const)(
    "preserves another tab's replacement %s when an earlier sign-out finishes",
    async (change) => {
      // Arrange
      const fixture = new AppAuthProviderFixtureFactory().create();
      const fixtures = new AuthFixtureFactory();
      fixture.authSession.restore.mockReturnValue(
        fixtures.createAuthSession({ accessToken: fixtures.createAccessToken() }),
      );
      let finishLogout!: () => void;
      fixture.logout.execute.mockReturnValue(
        new Promise<void>((resolve) => {
          finishLogout = resolve;
        }),
      );
      const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
      await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
      const replacement = fixtures.createAuthSession({
        accessToken: fixtures.createAccessToken(
          change === 'account' ? { id: 2 } : { sessionId: 'replacement-session' },
        ),
        user: { id: change === 'account' ? 2 : 1 },
      });
      fixture.authSession.restore.mockReturnValue(replacement);
      fixture.currentUser.execute.mockResolvedValue(replacement.user);
      let pending!: Promise<void>;
      // Act
      await act(async () => {
        pending = result.current.signOut();
      });
      await act(async () => {
        fixture.authSession.watch.mock.calls[0][0]();
      });
      await act(async () => {
        finishLogout();
        await pending;
      });
      // Assert
      expect(result.current.user).toEqual(replacement.user);
      expect(fixture.authSession.clear).not.toHaveBeenCalled();
    },
  );

  it('does not clear a newer login when an earlier sign-out finishes', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    const newer = new AuthFixtureFactory().createAuthSession({ user: { username: 'new-account' } });
    fixture.login.execute.mockResolvedValue(newer);
    let finishLogout!: () => void;
    fixture.logout.execute.mockReturnValue(
      new Promise<void>((resolve) => {
        finishLogout = resolve;
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    let pending!: Promise<void>;
    // Act
    await act(async () => {
      pending = result.current.signOut();
      await result.current.signIn({ email: 'new@example.com', password: 'password' });
      finishLogout();
      await pending;
    });
    // Assert
    expect(result.current.user).toEqual(newer.user);
    expect(fixture.authSession.clear).not.toHaveBeenCalled();
  });
  it('removes the account view after another tab clears the saved session', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => fixture.factory.wrap(children) });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    fixture.authSession.restore.mockReturnValue(null);
    // Act
    await act(async () => {
      fixture.authSession.watch.mock.calls[0][0]();
    });
    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.hasRestoredSession).toBe(true);
  });
});
