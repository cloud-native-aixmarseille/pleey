import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('useGameSessionReplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores and reuses the last dispatch key returned by the rejoin runtime', async () => {
    const replayForSession = vi
      .fn<(...args: unknown[]) => string | null>()
      .mockReturnValueOnce('AB12CD:authenticated:7')
      .mockReturnValueOnce('AB12CD:authenticated:7');
    const observeSession = vi.fn();
    const { useGameSessionReplay } = await import('./use-game-session-replay');

    const { result } = renderHook(() =>
      useGameSessionReplay({
        gameSessionRejoinService: { replayForSession } as never,
        observeSession,
      }),
    );

    act(() => {
      result.current.replaySession('AB12CD');
      result.current.replaySession('AB12CD');
    });

    expect(replayForSession).toHaveBeenNthCalledWith(1, {
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
    expect(replayForSession).toHaveBeenNthCalledWith(2, {
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
    expect(observeSession).not.toHaveBeenCalled();
  });

  it('observes the session once when replay is not available', async () => {
    const replayForSession = vi.fn<(...args: unknown[]) => string | null>().mockReturnValue(null);
    const observeSession = vi.fn();
    const { useGameSessionReplay } = await import('./use-game-session-replay');

    const { result } = renderHook(() =>
      useGameSessionReplay({
        gameSessionRejoinService: { replayForSession } as never,
        observeSession,
      }),
    );

    act(() => {
      result.current.replaySession('AB12CD');
      result.current.replaySession('AB12CD');
    });

    expect(observeSession).toHaveBeenCalledTimes(1);
    expect(observeSession).toHaveBeenCalledWith('AB12CD');
    expect(result.current.lastObservedSessionPinRef.current).toBe('AB12CD');
  });

  it('clears replay state when reset is requested', async () => {
    const replayForSession = vi
      .fn<(...args: unknown[]) => string | null>()
      .mockReturnValueOnce('AB12CD:authenticated:7')
      .mockReturnValueOnce(null);
    const observeSession = vi.fn();
    const { useGameSessionReplay } = await import('./use-game-session-replay');

    const { result } = renderHook(() =>
      useGameSessionReplay({
        gameSessionRejoinService: { replayForSession } as never,
        observeSession,
      }),
    );

    act(() => {
      result.current.replaySession('AB12CD');
      result.current.resetReplayState();
      result.current.replaySession('AB12CD');
    });

    expect(replayForSession).toHaveBeenNthCalledWith(2, {
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
    expect(observeSession).toHaveBeenCalledWith('AB12CD');
  });
});
