import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '../../../../domains/identity/entities/user';
import { useAuth } from '../../../../presentation/identity/contexts/auth-context';
import { AppAuthProviderFixtureFactory } from '../../../../test-utils/fixtures/app-auth-provider-fixture-factory';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';

const { authFetch, resetPassword, signInEmail, signOut } = vi.hoisted(() => ({
  authFetch: vi.fn(),
  resetPassword: vi.fn(),
  signInEmail: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../../../infrastructure/identity/better-auth-client', () => ({
  betterAuthClient: {
    $fetch: authFetch,
    resetPassword,
    signIn: { email: signInEmail },
    signOut,
  },
}));

describe('AppAuthProviderFactory', () => {
  it('publishes only a confirmed and server-validated cookie identity', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    const confirmed = new AuthFixtureFactory().createUser({ username: 'server-name' });
    fixture.currentUser.execute.mockResolvedValue(confirmed);

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));

    // Assert
    expect(result.current.user).toEqual({ ...confirmed, isAnonymous: false });
    expect(fixture.authSession.updateUser).toHaveBeenCalledWith({ ...confirmed, isAnonymous: false });
  });

  it('does not publish cached application state when cookie validation is unavailable', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    fixture.currentUser.execute.mockRejectedValue(new Error('Network unavailable'));

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));

    // Assert
    expect(result.current.user).toBeNull();
    expect(fixture.workspace.clear).toHaveBeenCalledOnce();
    expect(fixture.authSession.suspend).toHaveBeenCalledOnce();
  });

  it('lets a newer account confirmation win over a delayed earlier validation', async () => {
    // Arrange
    const fixtures = new AuthFixtureFactory();
    const fixture = new AppAuthProviderFixtureFactory().create();
    const accountA = fixtures.createUser({ id: 1, username: 'account-a' });
    const accountB = fixtures.createUser({ id: 2, username: 'account-b' });
    fixture.authSession.restore
      .mockResolvedValueOnce(fixtures.createAuthSession({ user: accountA }))
      .mockResolvedValueOnce(fixtures.createAuthSession({ user: accountB }));
    let completeA!: (user: User) => void;
    fixture.currentUser.execute
      .mockImplementationOnce(() => new Promise<User>((resolve) => (completeA = resolve)))
      .mockResolvedValueOnce(accountB);
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(fixture.currentUser.execute).toHaveBeenCalledOnce());

    // Act
    await act(async () => {
      fixture.authSession.watch.mock.calls[0][0]();
    });
    await waitFor(() => expect(result.current.user).toEqual({ ...accountB, isAnonymous: false }));
    await act(async () => completeA(accountA));

    // Assert
    expect(result.current.user).toEqual({ ...accountB, isAnonymous: false });
  });

  it('confirms the new Better Auth cookie before publishing a sign-in', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    const session = new AuthFixtureFactory().createAuthSession({ user: { username: 'new-account' } });
    signInEmail.mockResolvedValueOnce({ data: {}, error: null });
    fixture.authSession.restore.mockResolvedValue(session);
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));

    // Act
    await act(async () => {
      await result.current.signIn({ email: 'new@example.com', password: 'password' });
    });

    // Assert
    expect(signInEmail).toHaveBeenCalledWith({ email: 'new@example.com', password: 'password' });
    expect(result.current.user).toEqual(session.user);
    expect(fixture.authSession.commit).toHaveBeenCalledWith(session);
    expect(fixture.workspace.clear).toHaveBeenCalled();
  });

  it('keeps sign-out authoritative over delayed cookie restoration', async () => {
    // Arrange
    const fixture = new AppAuthProviderFixtureFactory().create();
    let finishSignOut!: () => void;
    signOut.mockImplementationOnce(() => new Promise<void>((resolve) => (finishSignOut = resolve)));
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));
    let pending!: Promise<void>;

    // Act
    await act(async () => {
      pending = result.current.signOut();
      fixture.authSession.watch.mock.calls[0][0]();
    });
    await act(async () => {
      finishSignOut();
      await pending;
    });

    // Assert
    expect(result.current.user).toBeNull();
    expect(fixture.authSession.clear).toHaveBeenCalledOnce();
    expect(fixture.workspace.clear).toHaveBeenCalled();
  });

  it('requests registration and password recovery through native Better Auth endpoints', async () => {
    // Arrange
    authFetch.mockResolvedValueOnce({ data: {}, error: null });
    authFetch.mockResolvedValueOnce({ data: {}, error: null });
    const fixture = new AppAuthProviderFixtureFactory().create();
    const session = new AuthFixtureFactory().createAuthSession();
    fixture.authSession.restore.mockResolvedValue(session);
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => fixture.factory.wrap(children),
    });
    await waitFor(() => expect(result.current.hasRestoredSession).toBe(true));

    // Act
    await act(async () => {
      await result.current.register({
        captchaToken: 'captcha',
        email: 'new@example.com',
        password: 'password',
        username: 'new-user',
      });
      await result.current.requestPasswordReset('new@example.com', 'fr', 'captcha');
    });

    // Assert
    expect(authFetch).toHaveBeenCalledWith('/sign-up/email', {
      body: {
        captchaToken: 'captcha',
        email: 'new@example.com',
        name: 'new-user',
        password: 'password',
      },
      method: 'POST',
    });
    expect(authFetch).toHaveBeenCalledWith('/request-password-reset', {
      body: {
        captchaToken: 'captcha',
        email: 'new@example.com',
        redirectTo: `${globalThis.location.origin}/auth/reset-password`,
      },
      method: 'POST',
    });
  });
});
