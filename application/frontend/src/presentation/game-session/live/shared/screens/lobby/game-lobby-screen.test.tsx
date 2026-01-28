import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderRouteWithProviders } from '../../../../../../test-utils/render-route-with-providers';
import { GameLobbyScreen } from './game-lobby-screen';

const mocks = vi.hoisted(() => ({
  activateSession: vi.fn(),
  startGame: vi.fn(),
  leaveSession: vi.fn(),
  navigate: vi.fn(),
  lobbyOverrides: {} as Record<string, unknown>,
  joinOverrides: {} as Record<string, unknown>,
  authState: {
    hasRestoredSession: true,
    isAuthenticated: false,
    user: null as null | { id: number; username: string; email: string; avatarUri: null },
  },
}));

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
  });
});

vi.mock('../../contexts/game-lobby-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-lobby-context')>();
  const { GameLobbyContextMockFactory } = await import(
    '../../../../../../test-utils/factories/game-lobby-context-mock-factory'
  );
  const gameLobbyContextMockFactory = new GameLobbyContextMockFactory();

  return {
    ...actual,
    useGameLobby: () =>
      gameLobbyContextMockFactory.createValue({
        gameType: 'quiz',
        gameTitle: 'Arcade Trivia',
        sessionPin: 'AB12CD',
        isHost: false,
        players: [
          { guestId: 'guest-1', username: 'Trinity', avatarUri: 'avatar-1' },
          { id: 42, username: 'Neo', avatarUri: 'avatar-2' },
        ],
        hasReceivedRoster: true,
        hasGameStarted: false,
        errorCode: null,
        activateSession: mocks.activateSession,
        startGame: mocks.startGame,
        leaveSession: mocks.leaveSession,
        ...mocks.lobbyOverrides,
      }),
  };
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

vi.mock('../../contexts/game-join-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-join-context')>();
  const { GameJoinContextMockFactory } = await import(
    'src/test-utils/factories/game-join-context-mock-factory'
  );
  const gameJoinContextMockFactory = new GameJoinContextMockFactory();

  return {
    ...actual,
    useGameJoin: () =>
      gameJoinContextMockFactory.createValue({
        guestNickname: 'Trinity',
        ...mocks.joinOverrides,
      }),
  };
});

vi.mock('../../contexts/game-lobby-state-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-lobby-state-context')>();
  const { GameLobbyStateContextMockFactory } = await import(
    'src/test-utils/factories/game-lobby-state-context-mock-factory'
  );

  return {
    ...actual,
    ...new GameLobbyStateContextMockFactory().createModule(),
  };
});

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import(
    '../../../../../../test-utils/factories/react-qr-code-mock-factory'
  );

  return new ReactQrCodeMockFactory().createModule();
});

function renderLobby(pin = 'ab12cd') {
  return renderRouteWithProviders({
    initialEntries: [`/game/${pin}/lobby`],
    routes: [{ path: '/game/:sessionPin/lobby', element: <GameLobbyScreen /> }],
  });
}

function LobbyRerenderHarness() {
  const [, forceRerender] = useReducer((count: number) => count + 1, 0);

  return (
    <>
      <button onClick={() => forceRerender()} type="button">
        rerender
      </button>
      <GameLobbyScreen />
    </>
  );
}

describe('GameLobbyScreen', () => {
  it('renders the status bar with the title and waiting message', () => {
    renderLobby();

    const statusBar = screen.getByRole('banner', { name: 'game.lobby.sessionBarLabel' });

    expect(statusBar).toBeInTheDocument();
    expect(statusBar).toHaveTextContent('quiz.gameType.title');
    expect(statusBar).toHaveTextContent('Arcade Trivia');
    expect(statusBar).toHaveTextContent('game.lobby.waitingForHost');
  });

  it('renders the join panel with QR code and PIN for the host', () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: { id: 1, username: 'Host', email: 'host@pleey.io', avatarUri: null },
    };
    mocks.lobbyOverrides = { isHost: true };

    renderLobby();

    expect(screen.getByRole('region', { name: 'game.lobby.joinPanelLabel' })).toBeInTheDocument();
    expect(screen.getByText('game.lobby.joinHeading')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.scanToJoin')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.enterCode')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
    mocks.lobbyOverrides = {};
  });

  it('hides the join panel for players', () => {
    renderLobby();

    expect(
      screen.queryByRole('region', { name: 'game.lobby.joinPanelLabel' }),
    ).not.toBeInTheDocument();
  });

  it('renders the player grid with connected players', () => {
    renderLobby();

    expect(screen.getByRole('region', { name: 'game.lobby.playerGridLabel' })).toBeInTheDocument();
    expect(screen.getByText('game.lobby.youBadge')).toBeInTheDocument();
    expect(screen.getByText('Trinity')).toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
  });

  it('shows the just-joined guest before the first roster event arrives', () => {
    mocks.lobbyOverrides = {
      players: [],
      hasReceivedRoster: false,
    };
    mocks.joinOverrides = {
      guestNickname: 'Switch',
      lastJoinRequest: {
        avatarUri: '/api/avatars/guests/guest-22',
        guestId: 'guest-22',
        pin: 'AB12CD',
        username: 'Switch',
      },
    };

    renderLobby();

    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Switch avatar' })).toHaveAttribute(
      'src',
      '/api/avatars/guests/guest-22',
    );

    mocks.lobbyOverrides = {};
    mocks.joinOverrides = {};
  });

  it('renders the waiting status in the status bar', () => {
    renderLobby();

    expect(screen.getByText('game.lobby.waitingForHost')).toBeInTheDocument();
  });

  it('renders unknown socket errors in the status bar', () => {
    mocks.lobbyOverrides = {
      errorCode: 'UNKNOWN',
    };

    renderLobby();

    expect(screen.getByText('game.join.errors.UNKNOWN')).toBeInTheDocument();

    mocks.lobbyOverrides = {};
  });

  it('shows a syncing banner when the auth session is not yet restored', () => {
    mocks.authState = { hasRestoredSession: false, isAuthenticated: false, user: null };

    renderLobby();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.syncingRoster')).toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
  });

  it('keeps hook ordering stable when the lobby rerenders from loading to ready', async () => {
    mocks.authState = { hasRestoredSession: false, isAuthenticated: false, user: null };

    renderRouteWithProviders({
      initialEntries: ['/game/ab12cd/lobby'],
      routes: [{ path: '/game/:sessionPin/lobby', element: <LobbyRerenderHarness /> }],
    });

    expect(screen.getByText('game.lobby.syncingRoster')).toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };

    await userEvent.click(screen.getByRole('button', { name: 'rerender' }));

    expect(screen.getByRole('button', { name: 'game.lobby.leaveCta' })).toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
  });

  it('shows the syncing banner when lobby state signals a join redirect', () => {
    mocks.lobbyOverrides = {
      errorCode: 'GAME_SESSION_ENDED',
    };

    renderLobby();

    expect(screen.queryByText('game.lobby.joinHeading')).not.toBeInTheDocument();
    expect(screen.getByText('game.lobby.syncingRoster')).toBeInTheDocument();

    mocks.lobbyOverrides = {};
  });

  it('shows the syncing banner when the game has started', () => {
    mocks.lobbyOverrides = {
      hasGameStarted: true,
    };

    renderLobby();

    expect(screen.getByText('game.lobby.syncingRoster')).toBeInTheDocument();

    mocks.lobbyOverrides = {};
  });

  it('renders a start game button for the host', () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: { id: 1, username: 'Host', email: 'host@pleey.io', avatarUri: null },
    };
    mocks.lobbyOverrides = { isHost: true };

    renderLobby();

    expect(screen.getByRole('button', { name: 'game.lobby.startGameCta' })).toBeInTheDocument();
    expect(screen.queryByText('game.lobby.waitingForHost')).not.toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
    mocks.lobbyOverrides = {};
  });

  it('calls startGame when the host clicks the start button', async () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: { id: 1, username: 'Host', email: 'host@pleey.io', avatarUri: null },
    };
    mocks.lobbyOverrides = { isHost: true };

    renderLobby();

    await userEvent.click(screen.getByRole('button', { name: 'game.lobby.startGameCta' }));

    expect(mocks.startGame).toHaveBeenCalledOnce();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
    mocks.lobbyOverrides = {};
  });

  it('keeps the player lobby view for authenticated users who do not host the session', () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: { id: 42, username: 'Neo', email: 'neo@matrix.io', avatarUri: null },
    };
    mocks.lobbyOverrides = { isHost: false };

    renderLobby();

    expect(
      screen.queryByRole('region', { name: 'game.lobby.joinPanelLabel' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'game.lobby.leaveCta' })).toBeInTheDocument();

    mocks.authState = { hasRestoredSession: true, isAuthenticated: false, user: null };
    mocks.lobbyOverrides = {};
  });

  it('renders a leave button for the player', () => {
    renderLobby();

    expect(screen.getByRole('button', { name: 'game.lobby.leaveCta' })).toBeInTheDocument();
  });

  it('calls leaveSession and navigates to join when the player clicks leave', async () => {
    renderRouteWithProviders({
      initialEntries: ['/game/ab12cd/lobby'],
      routes: [
        { path: '/game/:sessionPin/lobby', element: <GameLobbyScreen /> },
        { path: '/game/join', element: <div>join-screen</div> },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: 'game.lobby.leaveCta' }));

    expect(mocks.leaveSession).toHaveBeenCalledOnce();
  });
});
