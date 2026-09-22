import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UserSessionOverview } from '../../../../domains/identity/entities/user-session-details';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { UserSessionFixtureFactory } from '../../../../test-utils/fixtures/user-session-fixture-factory';
import { AccountGatewayMockFactory } from '../../../../test-utils/mocks/account-gateway-mock-factory';
import { AuthContextMockFactory } from '../../../../test-utils/mocks/auth-context-mock-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { AccountProvider } from '../../contexts/account-context';
import { AuthProvider } from '../../contexts/auth-context';
import { ProfileSessionsSection } from './profile-sessions-section';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const fixtures = new UserSessionFixtureFactory();
const other = fixtures.create({ id: '22222222-2222-4222-8222-222222222222', ipAddress: '192.0.2.20' });
const overview = fixtures.createOverview({
  otherSessions: { items: [other], page: 1, pageSize: 5, totalPages: 1, totalCount: 1, overallCount: 1 },
});

describe('ProfileSessionsSection', () => {
  it('loads on entry, displays audit details and keeps current-device sign-out available', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create();
    const view = renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );
    const callsBeforeEntry = vi.mocked(account.sessions).mock.calls.length;

    // Act
    view.rerender(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );
    await screen.findByText('192.0.2.10');
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.signOutCta' }));

    // Assert
    expect(callsBeforeEntry).toBe(0);
    expect(account.sessions).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 5 });
    expect(screen.getByText('auth.profile.sessions.current')).toBeInTheDocument();
    expect(screen.getByText('auth.profile.sessions.signedIn')).toBeInTheDocument();
    expect(screen.getByText('auth.profile.sessions.lastActive')).toBeInTheDocument();
    expect(screen.getByText('auth.profile.sessions.expires')).toBeInTheDocument();
    expect(screen.getByText('auth.profile.sessions.empty')).toBeInTheDocument();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('confirms an individual remote sign-out and reloads the sessions', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockResolvedValueOnce(overview).mockResolvedValueOnce(fixtures.createOverview()),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: /auth.profile.sessions.revokeLabel/ }));
    const callsBeforeConfirm = vi.mocked(account.revokeSession).mock.calls.length;
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'auth.profile.sessions.confirm' }),
    );
    await screen.findByText('auth.profile.sessions.empty');

    // Assert
    expect(callsBeforeConfirm).toBe(0);
    expect(account.revokeSession).toHaveBeenCalledExactlyOnceWith(other.id);
    expect(account.sessions).toHaveBeenCalledTimes(2);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(screen.queryByText('192.0.2.20')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('auth.profile.sessions.revoked');
  });

  it('allows canceling the bulk action without revoking anything', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockResolvedValue(overview),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.revokeOthers' }));
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'auth.profile.sessions.cancel' }),
    );

    // Assert
    expect(account.revokeOtherSessions).not.toHaveBeenCalled();
    expect(account.revokeSession).not.toHaveBeenCalled();
  });

  it('retries a failed bulk sign-out and leaves the current session intact', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockResolvedValueOnce(overview).mockResolvedValueOnce(fixtures.createOverview()),
      revokeOtherSessions: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.revokeOthers' }));
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.confirm' }));
    await screen.findByText('auth.profile.sessions.revokeError');
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.confirm' }));
    await screen.findByText('auth.profile.sessions.empty');

    // Assert
    expect(account.revokeOtherSessions).toHaveBeenCalledTimes(2);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(screen.getByText('192.0.2.10')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prevents duplicate revocations while the request is pending', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockResolvedValue(overview),
      revokeSession: vi.fn().mockReturnValue(new Promise<void>(() => {})),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: /auth.profile.sessions.revokeLabel/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.sessions.revoking' }));

    // Assert
    expect(account.revokeSession).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'auth.profile.sessions.revoking' })).toBeDisabled();
  });

  it('pages other sessions and returns to page one after revocation', async () => {
    // Arrange
    const firstPage = fixtures.createOverview({
      otherSessions: { ...overview.otherSessions, totalPages: 2, totalCount: 6, overallCount: 6 },
    });
    const secondPage = fixtures.createOverview({ otherSessions: { ...firstPage.otherSessions, page: 2 } });
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi
        .fn()
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage)
        .mockResolvedValueOnce(overview),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'auth.profile.sessions.previous' })).toBeEnabled());
    const nextDisabled = screen.getByRole('button', { name: 'auth.profile.sessions.next' }).hasAttribute('disabled');
    fireEvent.click(screen.getByRole('button', { name: /auth.profile.sessions.revokeLabel/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.sessions.confirm' }));
    await screen.findByText('auth.profile.sessions.revoked');

    // Assert
    expect(nextDisabled).toBe(true);
    expect(vi.mocked(account.sessions).mock.calls).toEqual([
      [{ page: 1, pageSize: 5 }],
      [{ page: 2, pageSize: 5 }],
      [{ page: 1, pageSize: 5 }],
    ]);
  });

  it('offers refresh after a loading failure', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(fixtures.createOverview()),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    await screen.findByText('auth.profile.sessions.loadError');
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.sessions.refresh' }));
    await screen.findByText('192.0.2.10');

    // Assert
    expect(account.sessions).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('discards a previous account’s late session response', async () => {
    // Arrange
    let resolvePrevious: ((value: UserSessionOverview) => void) | undefined;
    const previousAuth = new AuthContextMockFactory().createAuthenticatedValue();
    const previous = new AccountGatewayMockFactory().create({
      sessions: vi.fn().mockReturnValue(
        new Promise<UserSessionOverview>((resolve) => {
          resolvePrevious = resolve;
        }),
      ),
    });
    const nextAuth = new AuthContextMockFactory().createAuthenticatedValue({
      user: new AuthFixtureFactory().createUser({ id: 2 }),
    });
    const next = new AccountGatewayMockFactory().create({
      sessions: vi
        .fn()
        .mockResolvedValue(fixtures.createOverview({ currentSession: fixtures.create({ ipAddress: '192.0.2.99' }) })),
    });
    const view = renderWithUiProvider(
      <AuthProvider value={previousAuth}>
        <AccountProvider value={previous}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    view.rerender(
      <AuthProvider value={nextAuth}>
        <AccountProvider value={next}>
          <ProfileSessionsSection active />
        </AccountProvider>
      </AuthProvider>,
    );
    await screen.findByText('192.0.2.99');
    await act(async () => resolvePrevious?.(overview));

    // Assert
    expect(screen.queryByText('192.0.2.10')).not.toBeInTheDocument();
    expect(screen.getByText('192.0.2.99')).toBeInTheDocument();
  });
});
