import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { createPlayerPartyRuntimeMock } from '../../../../../test-utils/mock-factories/player-party-runtime.mock-factory';
import { LeavePartyUseCase } from './leave-party-use-case';

describe('LeavePartyUseCase', () => {
  it('returns false when the party no longer exists', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: null,
    });
    const broadcastPartyObservationUseCase = {
      broadcastIfPresent: vi.fn(),
    };
    const useCase = new LeavePartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    await expect(
      useCase.execute({
        pin: '123456',
        playerIdentity: { kind: PartyPlayerKind.USER, userId: 7 },
      }),
    ).resolves.toBe(false);
    expect(broadcastPartyObservationUseCase.broadcastIfPresent).not.toHaveBeenCalled();
  });

  it('publishes an updated observation when an authenticated player leaves', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      removePlayer: true,
    });
    const broadcastPartyObservationUseCase = {
      broadcastIfPresent: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new LeavePartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    await expect(
      useCase.execute({
        pin: '123456',
        playerIdentity: { kind: PartyPlayerKind.USER, userId: 7 },
      }),
    ).resolves.toBe(true);

    expect(runtime.removePlayer).toHaveBeenCalledWith({
      partyId: 12,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: 7 },
    });
    expect(broadcastPartyObservationUseCase.broadcastIfPresent).toHaveBeenCalledWith({
      partyId: 12,
    });
  });

  it('publishes an updated observation when a guest leaves', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      removePlayer: true,
    });
    const broadcastPartyObservationUseCase = {
      broadcastIfPresent: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new LeavePartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    await expect(
      useCase.execute({
        pin: '123456',
        playerIdentity: { kind: PartyPlayerKind.GUEST, guestId: 'guest-7' },
      }),
    ).resolves.toBe(true);

    expect(runtime.removePlayer).toHaveBeenCalledWith({
      partyId: 12,
      playerIdentity: { kind: PartyPlayerKind.GUEST, guestId: 'guest-7' },
    });
  });
});
