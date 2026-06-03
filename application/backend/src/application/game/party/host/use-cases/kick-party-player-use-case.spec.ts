import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { KickPartyPlayerUseCase } from './kick-party-player-use-case';

describe('KickPartyPlayerUseCase', () => {
  it('removes the targeted player and republishes the party observation', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(7),
        partyId: backendTestIdentifiers.party(44),
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
      hostUserId: backendTestIdentifiers.user(7),
      partyId: backendTestIdentifiers.party(44),
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: backendTestIdentifiers.guest('guest-7'),
      },
    });

    expect(hostPartyRuntimeControl.removePartyPlayer).toHaveBeenCalledWith({
      partyId: backendTestIdentifiers.party(44),
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: backendTestIdentifiers.guest('guest-7'),
      },
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: backendTestIdentifiers.party(44),
    });
  });

  it('rejects non-host callers', async () => {
    const useCase = new KickPartyPlayerUseCase(
      {
        findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
          context: null,
          gameId: backendTestIdentifiers.game(17),
          hostUserId: backendTestIdentifiers.user(3),
          partyId: backendTestIdentifiers.party(44),
          status: PartyStatus.WAITING,
        }),
        removePartyPlayer: vi.fn(),
      } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        hostUserId: backendTestIdentifiers.user(7),
        partyId: backendTestIdentifiers.party(44),
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(9),
        },
      }),
    ).rejects.toThrow(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
  });
});
