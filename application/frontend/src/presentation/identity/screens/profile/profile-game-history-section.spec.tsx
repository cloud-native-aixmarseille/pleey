import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UserGameHistoryPage } from '../../../../domains/identity/ports/auth-repository';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { UserGameHistoryFixtureFactory } from '../../../../test-utils/fixtures/user-game-history-fixture-factory';
import { AccountGatewayMockFactory } from '../../../../test-utils/mocks/account-gateway-mock-factory';
import { AuthContextMockFactory } from '../../../../test-utils/mocks/auth-context-mock-factory';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { AccountProvider } from '../../contexts/account-context';
import { AuthProvider } from '../../contexts/auth-context';
import { ProfileGameHistorySection } from './profile-game-history-section';

const historyFixtureFactory = new UserGameHistoryFixtureFactory();

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');
  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('ProfileGameHistorySection', () => {
  it('loads only when visited and keeps the current page while switching sections', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage())
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ page: 2 }));
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    const { rerender } = renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );
    expect(history).not.toHaveBeenCalled();

    // Act
    rerender(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    await screen.findByRole('heading', { name: 'Game 21' });
    rerender(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );
    rerender(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Assert
    expect(history).toHaveBeenCalledTimes(2);
    expect(screen.getByText('auth.profile.history.page (page=2)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Game 21' })).toBeInTheDocument();
  });

  it('resets paging for a new account and ignores the previous account’s late response', async () => {
    // Arrange
    let resolvePrevious: ((history: UserGameHistoryPage) => void) | undefined;
    const previousResponse = new Promise<UserGameHistoryPage>((resolve) => {
      resolvePrevious = resolve;
    });
    const previousAuth = new AuthContextMockFactory().createAuthenticatedValue();
    const previous = new AccountGatewayMockFactory().create({
      gameHistory: vi
        .fn()
        .mockResolvedValueOnce(historyFixtureFactory.createPage())
        .mockReturnValueOnce(previousResponse),
    });
    const nextAuth = new AuthContextMockFactory().createAuthenticatedValue({
      user: new AuthFixtureFactory().createUser({ id: 2 }),
    });
    const next = new AccountGatewayMockFactory().create({});
    const { rerender } = renderWithFormProvider(
      <AuthProvider value={previousAuth}>
        <AccountProvider value={previous}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    await waitFor(() => expect(previous.gameHistory).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 }));

    // Act
    rerender(
      <AuthProvider value={nextAuth}>
        <AccountProvider value={next}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    await screen.findByText('auth.profile.history.empty');
    await act(async () => {
      resolvePrevious?.({
        page: 2,
        pageSize: 20,
        totalPages: 2,
        totalCount: 21,
        overallCount: 21,
        items: [
          {
            partyId: 'old-party',
            title: 'Previous account game',
            gameType: 'quiz',
            role: 'player',
            status: 'ENDED',
            createdAt: '2026-09-01T12:00:00Z',
            points: 42,
          },
        ],
      });
      await previousResponse;
    });

    // Assert
    expect(next.gameHistory).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 20 });
    expect(screen.queryByRole('heading', { name: 'Previous account game' })).not.toBeInTheDocument();
    expect(screen.queryByText('auth.profile.history.page (page=2)')).not.toBeInTheDocument();
  });

  it('shows an empty state for an account without sessions', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create();
    // Act
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    // Assert
    expect(await screen.findByText('auth.profile.history.empty')).toBeInTheDocument();
    expect(account.gameHistory).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('shows the current user’s game title, participation role, and score', async () => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      gameHistory: vi.fn().mockResolvedValue({
        page: 1,
        pageSize: 20,
        totalPages: 1,
        totalCount: 1,
        overallCount: 1,
        items: [
          {
            partyId: 'party-one',
            title: 'Friday quiz',
            gameType: 'quiz',
            role: 'player',
            status: 'ENDED',
            createdAt: '2026-09-01T12:00:00Z',
            points: 0,
          },
        ],
      }),
    });
    // Act
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    // Assert
    expect(await screen.findByRole('heading', { name: 'Friday quiz' })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('auth.profile.history.player');
    expect(screen.getByRole('listitem')).toHaveTextContent('auth.profile.history.points (points=0)');
  });

  it.each([21, 40])('stops at the final page with %i sessions', async (totalCount) => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ totalCount }))
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ page: 2, totalCount }));
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    await screen.findByRole('heading', { name: 'Game 21' });
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.history.next' }));

    // Assert
    expect(history.mock.calls).toEqual([[{ page: 1, pageSize: 20 }], [{ page: 2, pageSize: 20 }]]);
    expect(screen.getAllByRole('listitem')).toHaveLength(totalCount - 20);
    expect(screen.queryByRole('heading', { name: 'Game 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.profile.history.next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'auth.profile.history.previous' })).toBeEnabled();
  });

  it('returns to newer sessions and stops at the first page', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage())
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ page: 2 }))
      .mockResolvedValueOnce(historyFixtureFactory.createPage());
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    await screen.findByRole('heading', { name: 'Game 21' });
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.history.previous' }));
    await screen.findByRole('heading', { name: 'Game 1' });
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.history.previous' }));

    // Assert
    expect(history.mock.calls).toEqual([
      [{ page: 1, pageSize: 20 }],
      [{ page: 2, pageSize: 20 }],
      [{ page: 1, pageSize: 20 }],
    ]);
    expect(screen.getAllByRole('listitem')).toHaveLength(20);
    expect(screen.queryByRole('heading', { name: 'Game 21' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.profile.history.previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'auth.profile.history.next' })).toBeEnabled();
  });

  it('disables navigation while the next page is loading', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage())
      .mockReturnValueOnce(new Promise<UserGameHistoryPage>(() => {}));
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.history.next' }));
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.history.previous' }));

    // Assert
    expect(history).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('region', { name: 'auth.profile.history.title' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'auth.profile.history.previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'auth.profile.history.next' })).toBeDisabled();
  });

  it.each([1, 20])('hides pagination when all %i sessions fit on one page', async (totalCount) => {
    // Arrange
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({
      gameHistory: vi.fn().mockResolvedValue(historyFixtureFactory.createPage({ totalCount })),
    });

    // Act
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    await screen.findByRole('heading', { name: 'Game 1' });

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(totalCount);
    expect(screen.queryByRole('navigation', { name: 'auth.profile.history.paginationLabel' })).not.toBeInTheDocument();
  });

  it('keeps backward navigation available when the next page becomes empty', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage())
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ page: 2, totalCount: 20 }));
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    await screen.findByText('auth.profile.history.emptyPage');
    // Assert
    expect(history).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 20 });
    expect(screen.getByRole('button', { name: 'auth.profile.history.previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'auth.profile.history.next' })).toBeDisabled();
    expect(screen.queryByText('auth.profile.history.empty')).not.toBeInTheDocument();
  });

  it('retries a failed second page without resetting pagination', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockResolvedValueOnce(historyFixtureFactory.createPage())
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(historyFixtureFactory.createPage({ page: 2 }));
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.retry' }));
    await screen.findByRole('heading', { name: 'Game 21' });

    // Assert
    expect(history.mock.calls).toEqual([
      [{ page: 1, pageSize: 20 }],
      [{ page: 2, pageSize: 20 }],
      [{ page: 2, pageSize: 20 }],
    ]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('offers retry after a loading failure', async () => {
    // Arrange
    const history = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ page: 1, pageSize: 20, totalPages: 1, totalCount: 0, overallCount: 0, items: [] });
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    const account = new AccountGatewayMockFactory().create({ gameHistory: history });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileGameHistorySection active />
        </AccountProvider>
      </AuthProvider>,
    );
    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'auth.profile.history.retry' }));
    await screen.findByText('auth.profile.history.empty');
    // Assert
    expect(history).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
