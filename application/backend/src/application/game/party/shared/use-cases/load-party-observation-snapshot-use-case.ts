import { Inject, Injectable } from '@nestjs/common';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { HostPartyObservationReaderPort } from '../../host/ports/host-party-observation-reader.port';
import { PlayerPartyObservationReaderPort } from '../../player/ports/player-party-observation-reader.port';
import type { PartyObservationSnapshot } from '../entities/party-observation-snapshot';
import { PartyGameTypeReaderPort } from '../ports/party-game-type-reader.port';

@Injectable()
export class LoadPartyObservationSnapshotUseCase {
  constructor(
    @Inject(HostPartyObservationReaderPort)
    private readonly hostPartyObservationReader: HostPartyObservationReaderPort,
    @Inject(PlayerPartyObservationReaderPort)
    private readonly playerPartyObservationReader: PlayerPartyObservationReaderPort,
    @Inject(PartyGameTypeReaderPort)
    private readonly partyGameTypeReader: PartyGameTypeReaderPort,
  ) {}

  async execute(input: { partyId: PartyId }): Promise<PartyObservationSnapshot> {
    const snapshot = await this.findIfPresent(input);

    if (!snapshot) {
      throw new PartyNotFoundError({ partyId: input.partyId });
    }

    return snapshot;
  }

  async findIfPresent(input: { partyId: PartyId }): Promise<PartyObservationSnapshot | null> {
    const [gameType, hostObservation, playerObservation] = await Promise.all([
      this.partyGameTypeReader.findGameTypeByPartyId(input.partyId),
      this.hostPartyObservationReader.findHostObservationByPartyId(input.partyId),
      this.playerPartyObservationReader.findPlayerObservationByPartyId(input.partyId),
    ]);

    if (!gameType || !hostObservation || !playerObservation) {
      return null;
    }

    return {
      gameType,
      hostObservation,
      playerObservation,
    };
  }
}
