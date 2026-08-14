import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { LoadPartyObservationSnapshotUseCase } from './load-party-observation-snapshot-use-case';

const PARTY_ID = backendTestIdentifiers.party(11);

describe('LoadPartyObservationSnapshotUseCase', () => {
  function arrangeUseCase() {
    const partyGameTypeReader = {
      findGameTypeByPartyId: vi.fn().mockResolvedValue('quiz'),
    };
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
    const playerPartyObservationReader = {
      findPlayerObservationByPartyId: vi.fn().mockResolvedValue({
        partyId: PARTY_ID,
        pin: '123456',
        status: 'WAITING',
        host: {
          avatarUri: null,
          username: 'Host',
        },
        players: [],
      }),
    };
    const useCase = new LoadPartyObservationSnapshotUseCase(
      hostPartyObservationReader as never,
      playerPartyObservationReader as never,
      partyGameTypeReader as never,
    );

    return {
      useCase,
      partyGameTypeReader,
      hostPartyObservationReader,
      playerPartyObservationReader,
    };
  }

  it('loads the role-specific observations by party id', async () => {
    // Arrange
    const { useCase, partyGameTypeReader, hostPartyObservationReader, playerPartyObservationReader } = arrangeUseCase();

    // Act
    const result = await useCase.execute({ partyId: PARTY_ID });

    // Assert
    expect(partyGameTypeReader.findGameTypeByPartyId).toHaveBeenCalledWith(PARTY_ID);
    expect(hostPartyObservationReader.findHostObservationByPartyId).toHaveBeenCalledWith(PARTY_ID);
    expect(playerPartyObservationReader.findPlayerObservationByPartyId).toHaveBeenCalledWith(PARTY_ID);
    expect(result.gameType).toBe('quiz');
    expect(result.hostObservation.partyId).toBe(PARTY_ID);
    expect(result.playerObservation.partyId).toBe(PARTY_ID);
  });

  it('raises a game-domain error when the party is missing', async () => {
    // Arrange
    const { useCase, playerPartyObservationReader } = arrangeUseCase();

    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute({ partyId: PARTY_ID })).rejects.toThrow(GameErrorCode.PARTY_NOT_FOUND);
  });
});
