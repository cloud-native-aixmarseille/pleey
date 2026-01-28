import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { RuntimeContainerMockFactory } from 'src/test-utils/factories/runtime-container-mock-factory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetGameLobbyStateUseCase } from '../../../../../application/game-session/live/player/use-cases/get-game-lobby-state-use-case';
import { GetStageActionDistributionUseCase } from '../../../../../application/game-session/live/player/use-cases/get-stage-action-distribution-use-case';
import { JoinGameUseCase } from '../../../../../application/game-session/live/player/use-cases/join-game-use-case';
import { ListStageActionChoicesUseCase } from '../../../../../application/game-session/live/player/use-cases/list-stage-action-choices-use-case';
import { JoinGameDispatchReceiptStatus } from '../../../../../application/game-session/live/shared/contracts/game-session-join-runtime.contract';
import { GameJoinErrorResolutionService } from '../../../../../domains/game-session/services/game-join-error-resolution.service';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import { LeaderboardService } from '../../../../../domains/game-session/services/leaderboard-service';
import { AppGuestPlayerRuntime } from '../runtimes/app-guest-player-runtime';

const mocks = vi.hoisted(() => ({
  runtimeGet: vi.fn(),
}));

const runtimeContainerMockFactory = new RuntimeContainerMockFactory();

vi.mock('../../../../composition/runtime-container', () =>
  runtimeContainerMockFactory.createModule((...args: unknown[]) => mocks.runtimeGet(...args)),
);

vi.mock('../../../../../presentation/shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    params: { sessionPin: 'ab12cd' },
  });
});

describe('AppGameProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderProvider(overrides?: {
    readonly restoredGuest?: { id: string; nickname: string } | null;
    readonly executeWithReceiptImpl?: (input: {
      readonly pin: string;
      readonly username: string;
      readonly guestId?: string;
      readonly userId?: number;
    }) => Promise<{
      readonly request: {
        readonly pin: string;
        readonly username: string;
        readonly guestId?: string;
        readonly userId?: number;
      };
      readonly receipt:
        | {
            readonly status: JoinGameDispatchReceiptStatus.ACCEPTED;
            readonly avatarUri: string | null;
          }
        | {
            readonly status: JoinGameDispatchReceiptStatus.REJECTED;
            readonly errorCode: string;
          };
    }>;
  }) {
    const leaderboardService = {
      sortEntries: vi.fn(),
      findCurrentPlayer: vi.fn(),
      isSameEntry: vi.fn(),
    };
    const gameLobbyStateUseCase = {
      execute: vi.fn(),
    };
    const stageActionChoicesUseCase = {
      execute: vi.fn(),
    };
    const stageActionDistributionUseCase = {
      execute: vi.fn(),
    };
    const guestPlayerService = {
      restore: vi.fn(() => overrides?.restoredGuest ?? null),
      resolveIdentity: vi.fn((nickname: string) => ({
        id: 'guest-1',
        nickname: nickname.trim(),
      })),
      remember: vi.fn(),
    };
    const joinGameUseCase = {
      execute: vi.fn((input: { pin: string; username: string }) => ({
        pin: input.pin.trim().toUpperCase(),
        username: input.username.trim(),
      })),
      executeWithReceipt: vi.fn(
        overrides?.executeWithReceiptImpl ??
          (async (input: { pin: string; username: string; guestId?: string; userId?: number }) => ({
            request: {
              pin: input.pin.trim().toUpperCase(),
              username: input.username.trim(),
              guestId: input.guestId,
              userId: input.userId,
            },
            receipt: {
              status: JoinGameDispatchReceiptStatus.ACCEPTED,
              avatarUri: '/api/avatars/guests/guest-1',
            },
          })),
      ),
      buildRequest: vi.fn((input: { pin: string; username: string; guestId?: string }) => ({
        pin: input.pin.trim().toUpperCase(),
        username: input.username.trim(),
        guestId: input.guestId,
        userId: undefined,
      })),
    };
    const gameJoinErrorResolutionService = {
      resolve: vi.fn((error: unknown) => {
        if (error instanceof Error) {
          return error.message;
        }

        return 'UNKNOWN';
      }),
    };
    mocks.runtimeGet.mockImplementation((token: unknown) => {
      if (token === JoinGameFlowService) {
        return {};
      }

      if (token === LeaderboardService) {
        return leaderboardService;
      }

      if (token === GetGameLobbyStateUseCase) {
        return gameLobbyStateUseCase;
      }

      if (token === ListStageActionChoicesUseCase) {
        return stageActionChoicesUseCase;
      }

      if (token === GetStageActionDistributionUseCase) {
        return stageActionDistributionUseCase;
      }

      if (token === AppGuestPlayerRuntime) {
        return guestPlayerService;
      }

      if (token === JoinGameUseCase) {
        return joinGameUseCase;
      }

      if (token === GameJoinErrorResolutionService) {
        return gameJoinErrorResolutionService;
      }
      throw new Error(`Unexpected runtime token: ${String(token)}`);
    });

    const [
      { AppGameProvider },
      { useGameJoin },
      { useGameLobbyState },
      { useGameStage },
      { useGameLeaderboard },
    ] = await Promise.all([
      import('./app-game-provider'),
      import('../../../../../presentation/game-session/live/shared/contexts/game-join-context'),
      import(
        '../../../../../presentation/game-session/live/shared/contexts/game-lobby-state-context'
      ),
      import('../../../../../presentation/game-session/live/shared/contexts/game-stage-context'),
      import(
        '../../../../../presentation/game-session/live/shared/contexts/game-leaderboard-context'
      ),
    ]);

    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGameProvider>{children}</AppGameProvider>
    );

    return {
      guestPlayerService,
      joinGameUseCase,
      ...renderHook(
        () => ({
          join: useGameJoin(),
          lobbyState: useGameLobbyState(),
          stage: useGameStage(),
          leaderboard: useGameLeaderboard(),
        }),
        { wrapper },
      ),
    };
  }

  it('hydrates the restored guest nickname and stores the authenticated join receipt', async () => {
    const { joinGameUseCase, result } = await renderProvider({
      restoredGuest: { id: 'guest-1', nickname: 'Saved Guest' },
    });

    expect(result.current.join.guestNickname).toBe('Saved Guest');
    expect(result.current.lobbyState.execute).toBeTypeOf('function');
    expect(result.current.stage.stageActionChoices.execute).toBeTypeOf('function');
    expect(result.current.leaderboard.sortEntries).toBeTypeOf('function');

    await act(async () => {
      await result.current.join.joinAsAuthenticated({
        pin: 'ab12cd',
        userId: 9,
        username: 'Neo',
      });
    });

    expect(joinGameUseCase.executeWithReceipt).toHaveBeenCalledWith({
      pin: 'ab12cd',
      userId: 9,
      username: 'Neo',
    });
    expect(result.current.join.isSubmitting).toBe(false);
    expect(result.current.join.errorCode).toBeNull();
    expect(result.current.join.lastJoinRequest).toEqual({
      pin: 'AB12CD',
      username: 'Neo',
    });
  });

  it('remembers the resolved guest identity and stores the guest join receipt', async () => {
    const { guestPlayerService, joinGameUseCase, result } = await renderProvider();

    await act(async () => {
      await result.current.join.joinAsGuest({
        pin: 'ab12cd',
        nickname: ' Trinity ',
      });
    });

    expect(guestPlayerService.resolveIdentity).toHaveBeenCalledWith(' Trinity ');
    expect(joinGameUseCase.buildRequest).toHaveBeenCalledWith({
      pin: 'ab12cd',
      guestId: 'guest-1',
      username: 'Trinity',
    });
    expect(joinGameUseCase.executeWithReceipt).toHaveBeenCalledWith({
      pin: 'ab12cd',
      guestId: 'guest-1',
      username: 'Trinity',
    });
    expect(guestPlayerService.remember).toHaveBeenCalledWith({
      id: 'guest-1',
      nickname: 'Trinity',
    });
    expect(result.current.join.guestNickname).toBe('Trinity');
    expect(result.current.join.lastJoinRequest).toEqual({
      avatarUri: '/api/avatars/guests/guest-1',
      guestId: 'guest-1',
      pin: 'AB12CD',
      username: 'Trinity',
    });
  });

  it('maps join failures to context error codes and clears them on demand', async () => {
    const { result } = await renderProvider({
      executeWithReceiptImpl: async () => {
        throw new Error('PIN_INVALID');
      },
    });

    await act(async () => {
      await result.current.join.joinAsAuthenticated({
        pin: 'bad',
        userId: 9,
        username: 'Neo',
      });
    });

    expect(result.current.join.isSubmitting).toBe(false);
    expect(result.current.join.errorCode).toBe('PIN_INVALID');
    expect(result.current.join.lastJoinRequest).toBeNull();

    act(() => {
      result.current.join.clearError();
    });

    expect(result.current.join.errorCode).toBeNull();
  });
});
