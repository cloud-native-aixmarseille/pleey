import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { LoadPartyObservationSnapshotUseCase } from './load-party-observation-snapshot-use-case';

describe('LoadPartyObservationSnapshotUseCase', () => {
  const partyGameTypeReader = {
    findGameTypeByPartyId: vi.fn(),
  };
  const hostPartyObservationReader = {
    findHostObservationByPartyId: vi.fn(),
  };
  const playerPartyObservationReader = {
    findPlayerObservationByPartyId: vi.fn(),
  };

  let useCase: LoadPartyObservationSnapshotUseCase;

  beforeEach(() => {
    partyGameTypeReader.findGameTypeByPartyId.mockReset();
    hostPartyObservationReader.findHostObservationByPartyId.mockReset();
    playerPartyObservationReader.findPlayerObservationByPartyId.mockReset();
    partyGameTypeReader.findGameTypeByPartyId.mockResolvedValue('quiz');
    hostPartyObservationReader.findHostObservationByPartyId.mockResolvedValue({
      partyId: backendTestIdentifiers.party(11),
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
    });
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue({
      partyId: backendTestIdentifiers.party(11),
      pin: '123456',
      status: 'WAITING',
      host: {
        avatarUri: null,
        username: 'Host',
      },
      players: [],
    });

    useCase = new LoadPartyObservationSnapshotUseCase(
      hostPartyObservationReader as never,
      playerPartyObservationReader as never,
      partyGameTypeReader as never,
    );
  });

  it('loads the role-specific observations by party id', async () => {
    const result = await useCase.execute({ partyId: backendTestIdentifiers.party(11) });

    expect(partyGameTypeReader.findGameTypeByPartyId).toHaveBeenCalledWith(
      backendTestIdentifiers.party(11),
    );
    expect(hostPartyObservationReader.findHostObservationByPartyId).toHaveBeenCalledWith(
      backendTestIdentifiers.party(11),
    );
    expect(playerPartyObservationReader.findPlayerObservationByPartyId).toHaveBeenCalledWith(
      backendTestIdentifiers.party(11),
    );
    expect(result.gameType).toBe('quiz');
    expect(result.hostObservation.partyId).toBe(backendTestIdentifiers.party(11));
    expect(result.playerObservation.partyId).toBe(backendTestIdentifiers.party(11));
  });

  it('raises a game-domain error when the party is missing', async () => {
    playerPartyObservationReader.findPlayerObservationByPartyId.mockResolvedValue(null);

    await expect(useCase.execute({ partyId: backendTestIdentifiers.party(11) })).rejects.toThrow(
      GameErrorCode.PARTY_NOT_FOUND,
    );
  });
});
