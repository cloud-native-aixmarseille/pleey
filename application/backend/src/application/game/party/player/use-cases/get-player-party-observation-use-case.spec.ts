import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { GetPlayerPartyObservationUseCase } from './get-player-party-observation-use-case';

const partyId = backendTestIdentifiers.party(11);

describe('GetPlayerPartyObservationUseCase', () => {
  const playerPartyObservationReader = {
    findPlayerObservationByPartyId: vi.fn(),
  };

  let useCase: GetPlayerPartyObservationUseCase;

  beforeEach(() => {
    playerPartyObservationReader.findPlayerObservationByPartyId.mockReset();
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue({
      partyId,
      pin: '123456',
      status: 'WAITING',
      host: {
        avatarUri: null,
        username: 'Host',
      },
      players: [],
    });

    useCase = new GetPlayerPartyObservationUseCase(playerPartyObservationReader as never);
  });

  it('loads the player observation by party id', async () => {
    const result = await useCase.execute({ partyId });

    expect(playerPartyObservationReader.findPlayerObservationByPartyId).toHaveBeenCalledWith(
      partyId,
    );
    expect(result.partyId).toBe(partyId);
  });

  it('raises a game-domain error when the party is missing', async () => {
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue(null);

    await expect(useCase.execute({ partyId })).rejects.toThrow(GameErrorCode.PARTY_NOT_FOUND);
  });
});
