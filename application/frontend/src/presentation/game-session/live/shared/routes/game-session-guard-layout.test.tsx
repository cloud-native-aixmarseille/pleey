import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { GameSessionGuardLayout } from './game-session-guard-layout';

const guardState = vi.hoisted(() => ({
  redirectTo: null as string | null,
  activateLobby: vi.fn(),
  activatePlaying: vi.fn(),
  resolveRedirect: vi.fn(),
}));

vi.mock('../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');
  const actual = await importOriginal<typeof import('../../../../shared/routing/router')>();

  return {
    ...(await new RoutingMockFactory().createPartialModule(importOriginal, {
      params: { sessionPin: 'ab12cd' },
    })),
    PresentationRedirect: ({ to }: { to: string }) => <div data-testid="guard-redirect">{to}</div>,
    Outlet: actual.Outlet,
  };
});

vi.mock('../contexts/game-lobby-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/game-lobby-context')>();

  return {
    ...actual,
    useGameLobby: () => ({
      activateSession: guardState.activateLobby,
    }),
  };
});

vi.mock('../contexts/game-playing-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/game-playing-context')>();

  return {
    ...actual,
    useGamePlaying: () => ({
      activateSession: guardState.activatePlaying,
    }),
  };
});

vi.mock('../hooks/use-game-session-route-guard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/use-game-session-route-guard')>();

  return {
    ...actual,
    useGameSessionRouteGuard: () => ({
      redirectTo: guardState.redirectTo,
    }),
  };
});

describe('GameSessionGuardLayout', () => {
  it('activates the normalized session and renders nested routes when no redirect is needed', () => {
    guardState.redirectTo = null;
    guardState.activateLobby.mockReset();
    guardState.activatePlaying.mockReset();

    renderWithProviders(
      <GameSessionGuardLayout
        routeGuardService={{ resolveRedirect: guardState.resolveRedirect }}
      />,
      { initialPath: '/game/ab12cd/lobby' },
    );

    expect(guardState.activateLobby).toHaveBeenCalledWith('AB12CD');
    expect(guardState.activatePlaying).toHaveBeenCalledWith('AB12CD');
  });

  it('renders a redirect when the route guard resolves one', () => {
    guardState.redirectTo = '/game/AB12CD/lobby';

    renderWithProviders(
      <GameSessionGuardLayout
        routeGuardService={{ resolveRedirect: guardState.resolveRedirect }}
      />,
      { initialPath: '/game/ab12cd/stage/4' },
    );

    expect(screen.getByTestId('guard-redirect')).toHaveTextContent('/game/AB12CD/lobby');
  });

  it('does not reactivate the same session pin on rerender', () => {
    guardState.redirectTo = null;
    guardState.activateLobby.mockReset();
    guardState.activatePlaying.mockReset();

    const { rerender } = renderWithProviders(
      <GameSessionGuardLayout
        routeGuardService={{ resolveRedirect: guardState.resolveRedirect }}
      />,
      { initialPath: '/game/ab12cd/stage/4' },
    );

    rerender(
      <GameSessionGuardLayout
        routeGuardService={{ resolveRedirect: guardState.resolveRedirect }}
      />,
    );

    expect(guardState.activateLobby).toHaveBeenCalledTimes(1);
    expect(guardState.activatePlaying).toHaveBeenCalledTimes(1);
  });
});
