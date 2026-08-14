import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { GetPlayerPartyObservationUseCase } from './get-player-party-observation-use-case';

const partyId = backendTestIdentifiers.party(11);

describe('GetPlayerPartyObservationUseCase', () => {
  function arrangeUseCase() {
    const playerPartyObservationReader = {
      findPlayerObservationByPartyId: vi.fn().mockResolvedValue({
        partyId,
        pin: '123456',
        status: 'WAITING',
        host: {
          avatarUri: null,
          username: 'Host',
        },
        players: [],
      }),
    };
    const useCase = new GetPlayerPartyObservationUseCase(playerPartyObservationReader as never);

    return { useCase, playerPartyObservationReader };
  }

  it('loads the player observation by party id', async () => {
    // Arrange
    const { useCase, playerPartyObservationReader } = arrangeUseCase();

    // Act
    const result = await useCase.execute({ partyId });

    // Assert
    expect(playerPartyObservationReader.findPlayerObservationByPartyId).toHaveBeenCalledWith(partyId);
    expect(result.partyId).toBe(partyId);
  });

  it('raises a game-domain error when the party is missing', async () => {
    // Arrange
    const { useCase, playerPartyObservationReader } = arrangeUseCase();

    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute({ partyId })).rejects.toThrow(GameErrorCode.PARTY_NOT_FOUND);
  });
});
