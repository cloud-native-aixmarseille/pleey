import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyIdentifier } from '../../shared/services/identifiers/party-identifier';
import { GetHostPartyObservationUseCase } from './get-host-party-observation-use-case';

const partyIdentifier = new PartyIdentifier();

describe('GetHostPartyObservationUseCase', () => {
  const hostPartyObservationReader = {
    findHostObservationByPartyId: vi.fn(),
  };

  let useCase: GetHostPartyObservationUseCase;

  beforeEach(() => {
    hostPartyObservationReader.findHostObservationByPartyId.mockReset();
    hostPartyObservationReader.findHostObservationByPartyId.mockResolvedValue({
      partyId: 11,
      gameId: 9,
      pin: '123456',
      status: 'WAITING',
      context: null,
      host: {
        avatarUri: null,
        userId: 7,
        username: 'Host',
      },
      players: [],
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
      updatedAt: new Date('2026-04-17T10:00:00.000Z'),
    });

    useCase = new GetHostPartyObservationUseCase(hostPartyObservationReader as never);
  });

  it('loads the observation by party id', async () => {
    const result = await useCase.execute({ partyId: partyIdentifier.parse(11) });

    expect(hostPartyObservationReader.findHostObservationByPartyId).toHaveBeenCalledWith(11);
    expect(result.partyId).toBe(11);
  });

  it('raises a game-domain error when the party is missing', async () => {
    hostPartyObservationReader.findHostObservationByPartyId.mockResolvedValue(null);

    await expect(useCase.execute({ partyId: partyIdentifier.parse(11) })).rejects.toThrow(
      GameErrorCode.PARTY_NOT_FOUND,
    );
  });
});
