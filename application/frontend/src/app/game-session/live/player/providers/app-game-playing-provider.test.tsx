import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { RuntimeContainerMockFactory } from 'src/test-utils/factories/runtime-container-mock-factory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionPlayingRuntimeEventName } from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
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

function createGamePlayingRuntimeMock() {
  const handlers = new Map<string, (payload: unknown) => void>();

  return {
    observeSession: vi.fn(),
    submitAction: vi.fn(),
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

describe('AppGamePlayingProvider', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function renderProvider() {
    const guestPlayerService = {
      restore: vi.fn(() => null),
    };
    const gamePlayingRuntime = createGamePlayingRuntimeMock();
    const joinGameFlowService = {
      normalizePin: vi.fn((pin: string) => pin.trim().toUpperCase()),
    };
    const gameSessionRejoinService = {
      replayForSession: vi.fn((): string | null => 'AB12CD:authenticated:7'),
    };
    const gamePlayingErrorResolutionService = {
      resolve: vi.fn((error: unknown) => {
        if (error === 'GAME_SESSION_NOT_FOUND') {
          return 'GAME_NOT_FOUND';
        }

        if (error instanceof Error && error.message === 'GAME_SESSION_NOT_FOUND') {
          return 'GAME_NOT_FOUND';
        }

        return 'UNKNOWN';
      }),
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
      if (typeof token === 'function' && token.name === 'AppGuestPlayerRuntime') {
        return guestPlayerService;
      }

      if (token === GAME_SERVICE_ID.gamePlayingRuntime) {
        return gamePlayingRuntime;
      }

      if (typeof token === 'function' && token.name === 'JoinGameFlowService') {
        return joinGameFlowService;
      }

      if (typeof token === 'function' && token.name === 'AppGameSessionRejoinRuntime') {
        return gameSessionRejoinService;
      }

      if (typeof token === 'function' && token.name === 'GamePlayingErrorResolutionService') {
        return gamePlayingErrorResolutionService;
      }

      if (typeof token === 'function' && token.name === 'GetActiveHostSessionByPinUseCase') {
        return getActiveHostSessionByPinUseCase;
      }

      if (typeof token === 'function' && token.name === 'LeaveCurrentPlayerSessionUseCase') {
        return leaveCurrentPlayerSessionUseCase;
      }

      throw new Error(`Unexpected runtime token: ${String(token)}`);
    });

    const [{ AppGamePlayingProvider }, { useGamePlaying }] = await Promise.all([
      import('./app-game-playing-provider'),
      import('../../../../../presentation/game-session/live/shared/contexts/game-playing-context'),
    ]);
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGamePlayingProvider>{children}</AppGamePlayingProvider>
    );

    return {
      gamePlayingRuntime,
      gameSessionRejoinService,
      getActiveHostSessionByPinUseCase,
      ...renderHook(() => useGamePlaying(), { wrapper }),
    };
  }

  it('resets playing state and replays a normalized join when a new session is activated', async () => {
    const { gamePlayingRuntime, gameSessionRejoinService, result } = await renderProvider();

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_STARTED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        activePlayerCount: 2,
        stage: {
          id: 1,
          sourceId: 10,
          position: 0,
          text: 'Choose one',
          type: 'quiz',
          actions: [],
          timeLimit: 20,
          points: 100,
        },
        totalStages: 3,
      });
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.ACTION_RESULT, {
        isCorrect: true,
        points: 100,
        correctActionIds: [1],
      });
    });

    expect(result.current.currentStage?.id).toBe(1);
    expect(result.current.currentGameType).toBe('quiz');
    expect(result.current.isResultTransitionActive).toBe(true);
    expect(result.current.actionResult).toBeNull();

    act(() => {
      result.current.activateSession('ab12cd');
    });

    expect(result.current.sessionPin).toBe('AB12CD');
    expect(result.current.currentStage).toBeNull();
    expect(result.current.actionResult).toBeNull();
    expect(result.current.timeLeft).toBeNull();
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
    expect(gamePlayingRuntime.observeSession).not.toHaveBeenCalled();
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

  it('resets ended playing state when the same session pin is activated again', async () => {
    const { gamePlayingRuntime, result } = await renderProvider();

    act(() => {
      result.current.activateSession('AB12CD');
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_ENDED, {
        leaderboard: [
          {
            rank: 1,
            username: 'Neo',
            totalPoints: 420,
            userId: 7,
          },
        ],
      });
    });

    expect(result.current.hasGameEnded).toBe(true);
    expect(result.current.leaderboard).toHaveLength(1);

    act(() => {
      result.current.activateSession('AB12CD');
    });

    expect(result.current.hasGameEnded).toBe(false);
    expect(result.current.currentStage).toBeNull();
    expect(result.current.leaderboard).toEqual([]);
  });

  it('stores leaderboard entries from the game-ended runtime payload', async () => {
    const { gamePlayingRuntime, result } = await renderProvider();

    act(() => {
      result.current.activateSession('AB12CD');
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_ENDED, {
        leaderboard: [
          {
            rank: 1,
            username: 'Neo',
            totalPoints: 420,
            userId: 7,
          },
          {
            rank: 2,
            username: 'Trinity',
            totalPoints: 360,
            userId: 8,
          },
        ],
      });
    });

    expect(result.current.hasGameEnded).toBe(true);
    expect(result.current.leaderboard).toEqual([
      {
        rank: 1,
        username: 'Neo',
        totalPoints: 420,
        userId: 7,
      },
      {
        rank: 2,
        username: 'Trinity',
        totalPoints: 360,
        userId: 8,
      },
    ]);
    expect(result.current.currentStage).toBeNull();
  });

  it('delays the result state briefly after the stage timer reaches zero', async () => {
    vi.useFakeTimers();

    const { gamePlayingRuntime, result } = await renderProvider();

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_STARTED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        activePlayerCount: 2,
        stage: {
          id: 1,
          sourceId: 10,
          position: 0,
          text: 'Choose one',
          type: 'quiz',
          actions: [],
          timeLimit: 1,
          points: 100,
        },
        totalStages: 3,
      });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.ACTION_RESULT, {
        isCorrect: true,
        points: 100,
        correctActionIds: [1],
      });
    });

    expect(result.current.isResultTransitionActive).toBe(true);
    expect(result.current.actionResult).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1400);
    });

    expect(result.current.isResultTransitionActive).toBe(false);
    expect(result.current.actionResult?.isCorrect).toBe(true);
  });

  it('observes the session for authenticated hosts and applies room-wide result reveals', async () => {
    vi.useFakeTimers();

    const { gamePlayingRuntime, gameSessionRejoinService, result } = await renderProvider();

    gameSessionRejoinService.replayForSession.mockReturnValueOnce(null);

    act(() => {
      result.current.activateSession('AB12CD');
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_STARTED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        activePlayerCount: 2,
        stage: {
          id: 1,
          sourceId: 10,
          position: 0,
          text: 'Choose one',
          type: 'quiz',
          actions: [],
          timeLimit: 20,
          points: 100,
        },
        totalStages: 3,
      });
    });

    expect(gamePlayingRuntime.observeSession).toHaveBeenCalledWith('AB12CD');

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.RESULT_REVEALED, {
        isCorrect: false,
        points: 0,
        correctActionIds: [1],
        statistics: {
          totalActions: 3,
          actionDistribution: { 1: 2, 2: 1 },
        },
      });
    });

    expect(result.current.isResultTransitionActive).toBe(true);
    expect(result.current.actionResult).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1400);
    });

    expect(result.current.isResultTransitionActive).toBe(false);
    expect(result.current.actionResult).toEqual({
      isCorrect: false,
      points: 0,
      correctActionIds: [1],
      statistics: {
        totalActions: 3,
        actionDistribution: { 1: 2, 2: 1 },
      },
    });
  });

  it('updates the active player count from room-wide playing events', async () => {
    const { gamePlayingRuntime, result } = await renderProvider();

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.GAME_STARTED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        activePlayerCount: 2,
        stage: {
          id: 1,
          sourceId: 10,
          position: 0,
          text: 'Choose one',
          type: 'quiz',
          actions: [],
          timeLimit: 20,
          points: 100,
        },
        totalStages: 3,
      });
    });

    expect(result.current.activePlayerCount).toBe(2);

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.PLAYER_JOINED, {
        gameTitle: 'Arcade Trivia',
        gameType: 'quiz',
        players: [
          { id: 1, username: 'Neo', avatarUri: '' },
          { id: 2, username: 'Trinity', avatarUri: '' },
          { guestId: 'guest-3', username: 'Morpheus', avatarUri: '' },
        ],
      });
    });

    expect(result.current.activePlayerCount).toBe(3);
  });

  it('maps missing session runtime errors to the fatal playing not-found state', async () => {
    const { gamePlayingRuntime, result } = await renderProvider();

    act(() => {
      gamePlayingRuntime.emit(GameSessionPlayingRuntimeEventName.ERROR, {
        message: 'GAME_SESSION_NOT_FOUND',
      });
    });

    expect(result.current.errorCode).toBe('GAME_NOT_FOUND');
  });
});
