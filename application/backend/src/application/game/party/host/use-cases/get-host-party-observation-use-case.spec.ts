import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { GetHostPartyObservationUseCase } from './get-host-party-observation-use-case';

const PARTY_ID = backendTestIdentifiers.party(11);

describe('GetHostPartyObservationUseCase', () => {
  function arrangeUseCase() {
    const hostPartyObservationReader = {
      findHostObservationByPartyId: vi.fn().mockResolvedValue({
        partyId: PARTY_ID,
        gameId: backendTestIdentifiers.game(9),
        pin: '123456',
        status: 'WAITING',
        context: null,
        host: {
          avatarUri: null,
          userId: backendTestIdentifiers.user(7),
          username: 'Host',
        },
        players: [],
        createdAt: new Date('2026-04-17T10:00:00.000Z'),
        updatedAt: new Date('2026-04-17T10:00:00.000Z'),
      }),
    };
    const useCase = new GetHostPartyObservationUseCase(hostPartyObservationReader as never);

    return { useCase, hostPartyObservationReader };
  }

  it('loads the observation by party id', async () => {
    // Arrange
    const { useCase, hostPartyObservationReader } = arrangeUseCase();

    // Act
    const result = await useCase.execute({ partyId: PARTY_ID });

    // Assert
    expect(hostPartyObservationReader.findHostObservationByPartyId).toHaveBeenCalledWith(PARTY_ID);
    expect(result.partyId).toBe(PARTY_ID);
  });

  it('raises a game-domain error when the party is missing', async () => {
    // Arrange
    const { useCase, hostPartyObservationReader } = arrangeUseCase();

    hostPartyObservationReader.findHostObservationByPartyId.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute({ partyId: PARTY_ID })).rejects.toThrow(GameErrorCode.PARTY_NOT_FOUND);
  });
});
