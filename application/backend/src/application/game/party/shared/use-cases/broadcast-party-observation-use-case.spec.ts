import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { BroadcastPartyObservationUseCase } from './broadcast-party-observation-use-case';

const PARTY_ID = backendTestIdentifiers.party(11);

describe('BroadcastPartyObservationUseCase', () => {
  function arrangeUseCase() {
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue({
        gameType: GameType.Quiz,
        hostObservation: { partyId: PARTY_ID },
        playerObservation: { partyId: PARTY_ID },
      }),
      findIfPresent: vi.fn().mockResolvedValue({
        gameType: GameType.Quiz,
        hostObservation: { partyId: PARTY_ID },
        playerObservation: { partyId: PARTY_ID },
      }),
    };
    const partyObservationBroadcaster = {
      publish: vi.fn(),
    };
    const useCase = new BroadcastPartyObservationUseCase(
      loadPartyObservationSnapshotUseCase as never,
      partyObservationBroadcaster as never,
    );

    return { useCase, loadPartyObservationSnapshotUseCase, partyObservationBroadcaster };
  }

  it('publishes the loaded snapshot', async () => {
    // Arrange
    const { useCase, loadPartyObservationSnapshotUseCase, partyObservationBroadcaster } = arrangeUseCase();

    // Act
    await useCase.execute({ partyId: PARTY_ID });

    // Assert
    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
    expect(partyObservationBroadcaster.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        hostObservation: expect.objectContaining({ partyId: PARTY_ID }),
        playerObservation: expect.objectContaining({ partyId: PARTY_ID }),
      }),
    );
  });

  it('does not publish anything when no snapshot is present', async () => {
    // Arrange
    const { useCase, loadPartyObservationSnapshotUseCase, partyObservationBroadcaster } = arrangeUseCase();

    loadPartyObservationSnapshotUseCase.findIfPresent.mockResolvedValue(null);

    // Act
    await useCase.broadcastIfPresent({ partyId: PARTY_ID });

    // Assert
    expect(partyObservationBroadcaster.publish).not.toHaveBeenCalled();
  });
});
