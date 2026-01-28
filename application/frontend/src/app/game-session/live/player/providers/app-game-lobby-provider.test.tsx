import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { RuntimeContainerMockFactory } from 'src/test-utils/factories/runtime-container-mock-factory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionLobbyRuntimeEventName } from '../../../../../application/game-session/live/player/ports/game-session-lobby-runtime.port';
import { GAME_SERVICE_ID } from '../../../../../application/game-session/live/shared/contracts/game-session-service-id';
import { GameSessionParticipantRole } from '../../../../../domains/game-session/entities/active-game-session';

const mocks = vi.hoisted(() => ({
  runtimeGet: vi.fn(),
}));

const runtimeContainerMockFactory = new RuntimeContainerMockFactory();

vi.mock('../../../../../presentation/identity/contexts/auth-context', async () => {
  const { AuthContextMockFactory } = await import(
    'src/test-utils/factories/auth-context-mock-factory'
  );

  return new AuthContextMockFactory().createPartialModule(
    () =>
      vi.importActual<typeof import('../../../../../presentation/identity/contexts/auth-context')>(
        '../../../../../presentation/identity/contexts/auth-context',
      ),
    {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
    },
  );
});

vi.mock(
  '../../../../../presentation/game-session/live/shared/contexts/game-join-context',
  async () => {
    const { GameJoinContextMockFactory } = await import(
      'src/test-utils/factories/game-join-context-mock-factory'
    );

    return new GameJoinContextMockFactory().createPartialModule(
      () =>
        vi.importActual<
          typeof import('../../../../../presentation/game-session/live/shared/contexts/game-join-context')
        >('../../../../../presentation/game-session/live/shared/contexts/game-join-context'),
      {
        lastJoinRequest: null,
      },
    );
  },
);

vi.mock('../../../../composition/runtime-container', () =>
  runtimeContainerMockFactory.createModule((...args: unknown[]) => mocks.runtimeGet(...args)),
);

function createGameLobbyRuntimeMock() {
  const handlers = new Map<string, (payload: unknown) => void>();

  return {
    observeSession: vi.fn(),
    on: vi.fn((eventName: string, handler: (payload: unknown) => void) => {
      handlers.set(eventName, handler);
    }),
    off: vi.fn((eventName: string) => {
      handlers.delete(eventName);
    }),
    emit<TPayload>(eventName: string, payload: TPayload) {
      const handler = handlers.get(eventName);
      if (handler) {
        handler(payload);
      }
    },
  };
}

describe('AppGameLobbyProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function renderProvider() {
    const lobbyRuntime = createGameLobbyRuntimeMock();
    const gameSessionRoutingService = {
      resolveJoinRoute: vi.fn((pin?: string) =>
        pin && pin.length > 0 ? `/game/join?pin=${encodeURIComponent(pin)}` : '/game/join',
      ),
    };
    const joinGameFlowService = {
      normalizePin: vi.fn((pin: string) => pin.trim().toUpperCase()),
    };
    const gameSessionRejoinService = {
      replayForSession: vi.fn((): string | null => 'AB12CD:authenticated:7'),
    };
    const getActiveHostSessionByPinUseCase = {
      execute: vi.fn().mockResolvedValue({
        sessionId: 12,
        gameId: 4,
        pin: 'AB12CD',
        status: 'ACTIVE',
        currentStageId: 2,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-04-09T10:00:00.000Z',
      }),
    };
    const leaveCurrentPlayerSessionUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };

    mocks.runtimeGet.mockImplementation((token: unknown) => {
      if (token === GAME_SERVICE_ID.gameLobbyRuntime) {
        return lobbyRuntime;
      }

      if (typeof token === 'function' && token.name === 'JoinGameFlowService') {
        return joinGameFlowService;
      }

      if (typeof token === 'function' && token.name === 'GameSessionRoutingService') {
        return gameSessionRoutingService;
      }

      if (typeof token === 'function' && token.name === 'AppGameSessionRejoinRuntime') {
        return gameSessionRejoinService;
      }

      if (typeof token === 'function' && token.name === 'GetActiveHostSessionByPinUseCase') {
        return getActiveHostSessionByPinUseCase;
      }

      if (typeof token === 'function' && token.name === 'LeaveCurrentPlayerSessionUseCase') {
        return leaveCurrentPlayerSessionUseCase;
      }

      if (typeof token === 'function' && token.name === 'GameLobbyErrorResolutionService') {
        return {
          resolve: vi.fn((error: string) =>
            error === 'GAME_SESSION_NOT_FOUND' ? 'GAME_NOT_FOUND' : error,
          ),
        };
      }

      throw new Error(`Unexpected runtime token: ${String(token)}`);
    });

    const [{ AppGameLobbyProvider }, { useGameLobby }] = await Promise.all([
      import('./app-game-lobby-provider'),
      import('../../../../../presentation/game-session/live/shared/contexts/game-lobby-context'),
    ]);
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGameLobbyProvider>{children}</AppGameLobbyProvider>
    );

    return {
      gameSessionRoutingService,
      getActiveHostSessionByPinUseCase,
      lobbyRuntime,
      gameSessionRejoinService,
      ...renderHook(() => useGameLobby(), { wrapper }),
    };
  }

  it('resets lobby state and replays a normalized join when a new session is activated', async () => {
    const { lobbyRuntime, gameSessionRejoinService, result } = await renderProvider();

    act(() => {
      lobbyRuntime.emit(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, {
        players: [{ id: 'guest-1', username: 'Trinity', isConnected: true }],
      });
      lobbyRuntime.emit(GameSessionLobbyRuntimeEventName.ERROR, {
        message: 'UNKNOWN',
      });
    });

    expect(result.current.players).toHaveLength(1);
    expect(result.current.hasReceivedRoster).toBe(true);
    expect(result.current.errorCode).toBe('UNKNOWN');

    act(() => {
      result.current.activateSession('ab12cd');
    });

    expect(result.current.sessionPin).toBe('AB12CD');
    expect(result.current.players).toEqual([]);
    expect(result.current.hasReceivedRoster).toBe(false);
    expect(result.current.errorCode).toBeNull();
    expect(gameSessionRejoinService.replayForSession).toHaveBeenCalledWith({
      pin: 'AB12CD',
      hasRestoredSession: true,
      lastJoinRequest: null,
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
      lastDispatchKey: null,
    });
    expect(lobbyRuntime.observeSession).not.toHaveBeenCalled();
  });

  it('reuses the stored replay dispatch key on repeated activation', async () => {
    const { gameSessionRejoinService, result } = await renderProvider();

    act(() => {
      result.current.activateSession('AB12CD');
      result.current.activateSession('AB12CD');
    });

    expect(gameSessionRejoinService.replayForSession).toHaveBeenNthCalledWith(1, {
      pin: 'AB12CD',
      hasRestoredSession: true,
      lastJoinRequest: null,
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
      lastDispatchKey: null,
    });
    expect(gameSessionRejoinService.replayForSession).toHaveBeenNthCalledWith(2, {
      pin: 'AB12CD',
      hasRestoredSession: true,
      lastJoinRequest: null,
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
      lastDispatchKey: 'AB12CD:authenticated:7',
    });
  });

  it('resets started lobby state when the same session pin is activated again', async () => {
    const { lobbyRuntime, result } = await renderProvider();

    act(() => {
      result.current.activateSession('AB12CD');
      lobbyRuntime.emit(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        players: [{ id: 'guest-1', username: 'Trinity', isConnected: true }],
      });
      lobbyRuntime.emit(GameSessionLobbyRuntimeEventName.GAME_STARTED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        totalStages: 3,
      });
    });

    expect(result.current.hasGameStarted).toBe(true);
    expect(result.current.players).toHaveLength(1);

    act(() => {
      result.current.activateSession('AB12CD');
    });

    expect(result.current.hasGameStarted).toBe(false);
    expect(result.current.players).toEqual([]);
    expect(result.current.hasReceivedRoster).toBe(false);
  });

  it('maps missing session runtime errors to the fatal lobby not-found state', async () => {
    const { lobbyRuntime, result } = await renderProvider();

    act(() => {
      lobbyRuntime.emit(GameSessionLobbyRuntimeEventName.ERROR, {
        message: 'GAME_SESSION_NOT_FOUND',
      });
    });

    expect(result.current.errorCode).toBe('GAME_NOT_FOUND');
  });

  it('observes the session for authenticated hosts when no player rejoin is available', async () => {
    const { lobbyRuntime, gameSessionRejoinService, result } = await renderProvider();

    gameSessionRejoinService.replayForSession.mockReturnValueOnce(null);

    act(() => {
      result.current.activateSession('ab12cd');
    });

    expect(lobbyRuntime.observeSession).toHaveBeenCalledWith('AB12CD');
  });

  it('exposes host ownership for the active hosted session pin', async () => {
    const { getActiveHostSessionByPinUseCase, result } = await renderProvider();

    expect(result.current.isHost).toBe(false);

    act(() => {
      result.current.activateSession('AB12CD');
    });

    await waitFor(() => {
      expect(getActiveHostSessionByPinUseCase.execute).toHaveBeenCalledWith('AB12CD');
      expect(result.current.isHost).toBe(true);
    });
  });
});
