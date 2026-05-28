import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { KickPartyPlayerUseCase } from './kick-party-player-use-case';

describe('KickPartyPlayerUseCase', () => {
  it('removes the targeted player and republishes the party observation', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: 17,
        hostUserId: 7,
        partyId: 44,
        status: PartyStatus.WAITING,
      }),
      removePartyPlayer: vi.fn().mockResolvedValue(true),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new KickPartyPlayerUseCase(
      hostPartyRuntimeControl as never,
      broadcastPartyObservationUseCase as never,
    );

    await useCase.execute({
      hostUserId: 7 as never,
      partyId: 44 as never,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: 'guest-7' as never,
      },
    });

    expect(hostPartyRuntimeControl.removePartyPlayer).toHaveBeenCalledWith({
      partyId: 44,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: 'guest-7',
      },
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: 44 });
  });

  it('rejects non-host callers', async () => {
    const useCase = new KickPartyPlayerUseCase(
      {
        findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
          context: null,
          gameId: 17,
          hostUserId: 3,
          partyId: 44,
          status: PartyStatus.WAITING,
        }),
        removePartyPlayer: vi.fn(),
      } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        hostUserId: 7 as never,
        partyId: 44 as never,
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: 9 as never,
        },
      }),
    ).rejects.toThrow(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
  });
});
