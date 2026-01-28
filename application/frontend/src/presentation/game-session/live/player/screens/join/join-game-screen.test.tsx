import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JoinGameScreenFacade } from '../../../../../../application/game-session/live/player/facades/join-game-screen.facade';
import type { DashboardActiveSessionItem } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionParticipantRole } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../../../domains/game-session/entities/game-session-status';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { JoinGameScreen } from './join-game-screen';

const mocks = vi.hoisted(() => ({
  authState: {
    hasRestoredSession: true,
    isAuthenticated: false,
    user: null as null | { id: number; username: string; email: string; avatarUri: null },
  },
  clearError: vi.fn(),
  joinAsAuthenticated: vi.fn(),
  joinAsGuest: vi.fn(),
  loadCurrentPlayerSession: vi.fn<() => Promise<DashboardActiveSessionItem | null>>(
    async () => null,
  ),
  navigate: vi.fn(),
}));

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
  });
});

vi.mock('../../../../../identity/contexts/auth-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../../../identity/contexts/auth-context')>();
  const { AuthContextMockFactory } = await import(
    'src/test-utils/factories/auth-context-mock-factory'
  );
  const authContextMockFactory = new AuthContextMockFactory();

  return {
    ...actual,
    useAuth: () => authContextMockFactory.createValue(mocks.authState),
  };
});

vi.mock('../../../shared/contexts/game-join-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../shared/contexts/game-join-context')>();
  const { GameJoinContextMockFactory } = await import(
    'src/test-utils/factories/game-join-context-mock-factory'
  );

  return {
    ...actual,
    ...new GameJoinContextMockFactory().createModule({
      guestNickname: 'Guest Pilot',
      clearError: mocks.clearError,
      joinAsAuthenticated: mocks.joinAsAuthenticated,
      joinAsGuest: mocks.joinAsGuest,
    }),
  };
});

function authenticatedState(
  user = { id: 7, username: 'Neo', email: 'neo@pleey.io', avatarUri: null },
) {
  mocks.authState = { hasRestoredSession: true, isAuthenticated: true, user };
}

describe('JoinGameScreen', () => {
  const joinGameScreenFacade = new JoinGameScreenFacade();

  beforeEach(() => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.clearError.mockReset();
    mocks.joinAsAuthenticated.mockReset();
    mocks.joinAsGuest.mockReset();
    mocks.loadCurrentPlayerSession.mockReset();
    mocks.loadCurrentPlayerSession.mockResolvedValue(null);
    mocks.navigate.mockReset();
  });

  it('renders the page header with subtitle', () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    expect(screen.getByRole('heading', { name: 'game.join.title' })).toBeInTheDocument();
    expect(screen.getByText('game.join.subtitle')).toBeInTheDocument();
  });

  it('renders the guidance bar', () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    expect(
      screen.getByRole('complementary', { name: 'game.join.guidanceBarLabel' }),
    ).toBeInTheDocument();
  });

  it('renders the pin field and continue action', () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'game.join.pinLabel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'game.join.primaryContinueCta' }),
    ).toBeInTheDocument();
  });

  it('prefills the pin field from the join URL query parameter', () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
      {
        initialPath: '/game/join?pin=ab12cd',
      },
    );

    expect(screen.getByRole('textbox', { name: 'game.join.pinLabel' })).toHaveValue('AB12CD');
  });

  it('reveals the guest nickname field after a valid unauthenticated pin submission', async () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'game.join.pinLabel' }), {
      target: { value: 'ab12cd' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'game.join.primaryContinueCta' }));

    expect(
      await screen.findByRole('textbox', { name: 'game.join.nicknameLabel' }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Guest Pilot')).toBeInTheDocument();
  });

  it('submits the guest join request with the normalized pin and nickname', async () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'game.join.pinLabel' }), {
      target: { value: 'ab12cd' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'game.join.primaryContinueCta' }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'game.join.nicknameLabel' }), {
      target: { value: '  Trinity  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'game.join.primaryGuestCta' }));

    await waitFor(() => {
      expect(mocks.joinAsGuest).toHaveBeenCalledWith({
        pin: 'AB12CD',
        nickname: 'Trinity',
      });
    });

    expect(mocks.navigate).toHaveBeenCalledWith('/game/AB12CD/lobby');
  });

  it('navigates authenticated members to the lobby after dispatching the join request', async () => {
    authenticatedState();

    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'game.join.pinLabel' }), {
      target: { value: 'ab12cd' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'game.join.primaryAuthenticatedCta' }));

    await waitFor(() => {
      expect(mocks.joinAsAuthenticated).toHaveBeenCalledWith({
        pin: 'AB12CD',
        userId: 7,
        username: 'Neo',
      });
    });

    expect(mocks.navigate).toHaveBeenCalledWith('/game/AB12CD/lobby');
  });

  it('navigates to sign-in from the guest entry step', () => {
    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) => `/game/${session.pin}/lobby`}
      />,
      {
        initialPath: '/game/join?pin=ab12cd',
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'game.join.signInCta' }));

    expect(mocks.navigate).toHaveBeenCalledWith(
      '/identity/sign-in?redirectTo=%2Fgame%2Fjoin%3Fpin%3Dab12cd',
    );
  });

  it('redirects authenticated players to their current live session when one exists', async () => {
    authenticatedState();
    mocks.loadCurrentPlayerSession.mockResolvedValue({
      sessionId: 9,
      gameId: 3,
      pin: 'ZX90YU',
      status: GameSessionStatus.ACTIVE,
      currentStageId: 4,
      participantRole: GameSessionParticipantRole.PLAYER,
      createdAt: '2026-03-20T10:00:00.000Z',
    });

    renderWithProviders(
      <JoinGameScreen
        joinGameScreenFacade={joinGameScreenFacade}
        loadCurrentPlayerSession={mocks.loadCurrentPlayerSession}
        resolveSessionEntryRoute={(session) =>
          `/game/${session.pin}/stage/${session.currentStageId}`
        }
      />,
    );

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/game/ZX90YU/stage/4');
    });
  });
});
