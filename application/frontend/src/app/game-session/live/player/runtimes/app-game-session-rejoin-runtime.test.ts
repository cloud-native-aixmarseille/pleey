import { describe, expect, it, vi } from 'vitest';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import { AppGameSessionRejoinRuntime } from './app-game-session-rejoin-runtime';
import { AppGuestPlayerRuntime } from './app-guest-player-runtime';

describe('AppGameSessionRejoinRuntime', () => {
  function createService(args?: {
    readonly restoredGuest?: { readonly id: string; readonly nickname: string } | null;
  }) {
    const restoredGuest = args?.restoredGuest ?? null;
    const guestPlayerService = {
      restore: vi.fn(() => restoredGuest),
    } as Pick<AppGuestPlayerRuntime, 'restore'> as AppGuestPlayerRuntime;
    const joinGameUseCase = {
      execute: vi.fn(),
    };

    const service = new AppGameSessionRejoinRuntime(
      guestPlayerService,
      joinGameUseCase as never,
      new JoinGameFlowService(),
    );

    return {
      service,
      guestPlayerService,
      joinGameUseCase,
    };
  }

  it('replays the authenticated join once when a matching join receipt exists', () => {
    const { service, joinGameUseCase } = createService();

    const dispatchKey = service.replayForSession({
      pin: 'ab12cd',
      hasRestoredSession: true,
      lastJoinRequest: {
        pin: 'AB12CD',
        username: 'Neo',
      },
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
      lastDispatchKey: null,
    });

    expect(dispatchKey).toBe('AB12CD:authenticated:7');
    expect(joinGameUseCase.execute).toHaveBeenCalledWith({
      pin: 'AB12CD',
      userId: 7,
      username: 'Neo',
    });
  });

  it('replays an authenticated join without a matching join receipt', () => {
    const { service, joinGameUseCase } = createService();

    const dispatchKey = service.replayForSession({
      pin: 'ab12cd',
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

    expect(dispatchKey).toBe('AB12CD:authenticated:7');
    expect(joinGameUseCase.execute).toHaveBeenCalledWith({
      pin: 'AB12CD',
      userId: 7,
      username: 'Neo',
    });
  });

  it('does not replay an authenticated join when the same dispatch already ran', () => {
    const { service, joinGameUseCase } = createService();

    const dispatchKey = service.replayForSession({
      pin: 'AB12CD',
      hasRestoredSession: true,
      lastJoinRequest: {
        pin: 'AB12CD',
        username: 'Neo',
      },
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
      lastDispatchKey: 'AB12CD:authenticated:7',
    });

    expect(dispatchKey).toBe('AB12CD:authenticated:7');
    expect(joinGameUseCase.execute).not.toHaveBeenCalled();
  });

  it('reuses the guest identity to replay the join once', () => {
    const { service, joinGameUseCase } = createService({
      restoredGuest: {
        id: 'guest-22',
        nickname: 'Switch',
      },
    });

    const dispatchKey = service.replayForSession({
      pin: 'ab12cd',
      hasRestoredSession: true,
      lastJoinRequest: null,
      isAuthenticated: false,
      user: null,
      lastDispatchKey: null,
    });

    expect(dispatchKey).toBe('AB12CD:guest:guest-22');
    expect(joinGameUseCase.execute).toHaveBeenCalledWith({
      pin: 'AB12CD',
      guestId: 'guest-22',
      username: 'Switch',
    });
  });

  it('reuses the latest request without dispatching again when the same guest already joined', () => {
    const { service, joinGameUseCase } = createService({
      restoredGuest: {
        id: 'guest-22',
        nickname: 'Switch',
      },
    });

    const dispatchKey = service.replayForSession({
      pin: 'AB12CD',
      hasRestoredSession: true,
      lastJoinRequest: {
        guestId: 'guest-22',
        pin: 'AB12CD',
        username: 'Switch',
      },
      isAuthenticated: false,
      user: null,
      lastDispatchKey: null,
    });

    expect(dispatchKey).toBe('AB12CD:guest:guest-22');
    expect(joinGameUseCase.execute).not.toHaveBeenCalled();
  });

  it('returns null when session restoration is incomplete', () => {
    const { service, joinGameUseCase } = createService();

    expect(
      service.replayForSession({
        pin: 'AB12CD',
        hasRestoredSession: false,
        lastJoinRequest: null,
        isAuthenticated: true,
        user: {
          id: 7,
          username: 'Neo',
          email: 'neo@matrix.io',
        },
        lastDispatchKey: null,
      }),
    ).toBeNull();
    expect(joinGameUseCase.execute).not.toHaveBeenCalled();
  });
});
