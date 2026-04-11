import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyIdentifier } from '../../shared/services/identifiers/party-identifier';
import { GetPlayerPartyObservationUseCase } from './get-player-party-observation-use-case';

const partyIdentifier = new PartyIdentifier();

describe('GetPlayerPartyObservationUseCase', () => {
  const playerPartyObservationReader = {
    findPlayerObservationByPartyId: vi.fn(),
  };

  let useCase: GetPlayerPartyObservationUseCase;

  beforeEach(() => {
    playerPartyObservationReader.findPlayerObservationByPartyId.mockReset();
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue({
      partyId: 11,
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
    const result = await useCase.execute({ partyId: partyIdentifier.parse(11) });

    expect(playerPartyObservationReader.findPlayerObservationByPartyId).toHaveBeenCalledWith(11);
    expect(result.partyId).toBe(11);
  });

  it('raises a game-domain error when the party is missing', async () => {
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue(null);

    await expect(useCase.execute({ partyId: partyIdentifier.parse(11) })).rejects.toThrow(
      GameErrorCode.PARTY_NOT_FOUND,
    );
  });
});
