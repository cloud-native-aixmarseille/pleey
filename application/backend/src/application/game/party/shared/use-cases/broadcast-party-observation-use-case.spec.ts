import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { BroadcastPartyObservationUseCase } from './broadcast-party-observation-use-case';

describe('BroadcastPartyObservationUseCase', () => {
  const loadPartyObservationSnapshotUseCase = {
    execute: vi.fn(),
    findIfPresent: vi.fn(),
  };
  const partyObservationBroadcaster = {
    publish: vi.fn(),
  };

  let useCase: BroadcastPartyObservationUseCase;

  beforeEach(() => {
    loadPartyObservationSnapshotUseCase.execute.mockReset();
    loadPartyObservationSnapshotUseCase.findIfPresent.mockReset();
    partyObservationBroadcaster.publish.mockReset();
    loadPartyObservationSnapshotUseCase.execute.mockResolvedValue({
      gameType: GameType.Quiz,
      hostObservation: { partyId: backendTestIdentifiers.party(11) },
      playerObservation: { partyId: backendTestIdentifiers.party(11) },
    });
    loadPartyObservationSnapshotUseCase.findIfPresent.mockResolvedValue({
      gameType: GameType.Quiz,
      hostObservation: { partyId: backendTestIdentifiers.party(11) },
      playerObservation: { partyId: backendTestIdentifiers.party(11) },
    });

    useCase = new BroadcastPartyObservationUseCase(
      loadPartyObservationSnapshotUseCase as never,
      partyObservationBroadcaster as never,
    );
  });

  it('publishes the loaded snapshot', async () => {
    await useCase.execute({ partyId: backendTestIdentifiers.party(11) });

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: backendTestIdentifiers.party(11),
    });
    expect(partyObservationBroadcaster.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        hostObservation: expect.objectContaining({ partyId: backendTestIdentifiers.party(11) }),
        playerObservation: expect.objectContaining({ partyId: backendTestIdentifiers.party(11) }),
      }),
    );
  });

  it('does not publish anything when no snapshot is present', async () => {
    loadPartyObservationSnapshotUseCase.findIfPresent.mockResolvedValue(null);

    await useCase.broadcastIfPresent({ partyId: backendTestIdentifiers.party(11) });

    expect(partyObservationBroadcaster.publish).not.toHaveBeenCalled();
  });
});
