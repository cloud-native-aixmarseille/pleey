import { Inject, Injectable } from '@nestjs/common';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { PartyObservationBroadcasterPort } from '../ports/party-observation-broadcaster.port';
import { LoadPartyObservationSnapshotUseCase } from './load-party-observation-snapshot-use-case';

@Injectable()
export class BroadcastPartyObservationUseCase {
  constructor(
    private readonly loadPartyObservationSnapshotUseCase: LoadPartyObservationSnapshotUseCase,
    @Inject(PartyObservationBroadcasterPort)
    private readonly partyObservationBroadcaster: PartyObservationBroadcasterPort,
  ) {}

  async execute(input: { partyId: PartyId }): Promise<void> {
    const snapshot = await this.loadPartyObservationSnapshotUseCase.execute({
      partyId: input.partyId,
    });

    await this.partyObservationBroadcaster.publish(snapshot);
  }

  async broadcastIfPresent(input: { partyId: PartyId }): Promise<void> {
    const snapshot = await this.loadPartyObservationSnapshotUseCase.findIfPresent({
      partyId: input.partyId,
    });

    if (!snapshot) {
      return;
    }

    await this.partyObservationBroadcaster.publish(snapshot);
  }
}
