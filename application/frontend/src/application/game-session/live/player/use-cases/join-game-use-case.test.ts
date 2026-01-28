import { describe, expect, it, vi } from 'vitest';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import {
  type GameSessionJoinRuntimePort,
  JoinGameDispatchReceiptStatus,
} from '../../shared/contracts/game-session-join-runtime.contract';
import { JoinGameUseCase } from './join-game-use-case';

describe('JoinGameUseCase', () => {
  it('normalizes the pin and display name before dispatching the join command', () => {
    const gameJoinRuntime: GameSessionJoinRuntimePort = {
      joinGame: vi.fn(),
      joinGameWithReceipt: vi.fn(),
    };
    const useCase = new JoinGameUseCase(gameJoinRuntime, new JoinGameFlowService());

    const request = useCase.execute({
      pin: ' ab12cd ',
      username: '  Neo  ',
      userId: 42,
    });

    expect(request).toEqual({
      pin: 'AB12CD',
      username: 'Neo',
      userId: 42,
      guestId: undefined,
    });
    expect(gameJoinRuntime.joinGame).toHaveBeenCalledWith(request);
  });

  it('throws when the pin is missing', () => {
    const useCase = new JoinGameUseCase(
      { joinGame: vi.fn(), joinGameWithReceipt: vi.fn() },
      new JoinGameFlowService(),
    );

    expect(() =>
      useCase.execute({
        pin: '   ',
        username: 'Neo',
      }),
    ).toThrow('PIN_REQUIRED');
  });

  it('throws when the pin is not complete', () => {
    const useCase = new JoinGameUseCase(
      { joinGame: vi.fn(), joinGameWithReceipt: vi.fn() },
      new JoinGameFlowService(),
    );

    expect(() =>
      useCase.execute({
        pin: 'AB12',
        username: 'Neo',
      }),
    ).toThrow('PIN_INVALID');
  });

  it('throws when the display name is missing', () => {
    const useCase = new JoinGameUseCase(
      { joinGame: vi.fn(), joinGameWithReceipt: vi.fn() },
      new JoinGameFlowService(),
    );

    expect(() =>
      useCase.execute({
        pin: 'AB12CD',
        username: '   ',
      }),
    ).toThrow('DISPLAY_NAME_REQUIRED');
  });

  it('builds a normalized request without dispatching it', () => {
    const gameJoinRuntime: GameSessionJoinRuntimePort = {
      joinGame: vi.fn(),
      joinGameWithReceipt: vi.fn(),
    };
    const useCase = new JoinGameUseCase(gameJoinRuntime, new JoinGameFlowService());

    const request = useCase.buildRequest({
      pin: ' ab12cd ',
      username: '  Trinity  ',
      guestId: 'guest-1',
    });

    expect(request).toEqual({
      pin: 'AB12CD',
      username: 'Trinity',
      userId: undefined,
      guestId: 'guest-1',
    });
    expect(gameJoinRuntime.joinGame).not.toHaveBeenCalled();
  });

  it('returns the dispatch receipt for acknowledged joins', async () => {
    const acceptedReceipt = {
      status: JoinGameDispatchReceiptStatus.ACCEPTED as JoinGameDispatchReceiptStatus.ACCEPTED,
      avatarUri: null,
    };
    const gameJoinRuntime: GameSessionJoinRuntimePort = {
      joinGame: vi.fn(),
      joinGameWithReceipt: vi.fn(async () => acceptedReceipt),
    };
    const useCase = new JoinGameUseCase(gameJoinRuntime, new JoinGameFlowService());

    const result = await useCase.executeWithReceipt({
      pin: ' ab12cd ',
      username: 'Neo',
      userId: 42,
    });

    expect(result.request).toEqual({
      pin: 'AB12CD',
      username: 'Neo',
      userId: 42,
      guestId: undefined,
    });
    expect(result.receipt).toEqual({
      status: JoinGameDispatchReceiptStatus.ACCEPTED,
      avatarUri: null,
    });
    expect(gameJoinRuntime.joinGameWithReceipt).toHaveBeenCalledWith(result.request);
  });
});
