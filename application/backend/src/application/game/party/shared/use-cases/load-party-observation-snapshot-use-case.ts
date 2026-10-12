import { Inject, Injectable } from '@nestjs/common';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import { PartyStageConfigurationPort } from '../../../types/shared/ports/party-stage-configuration.port';
import { HostPartyObservationReaderPort } from '../../host/ports/host-party-observation-reader.port';
import { PlayerPartyObservationReaderPort } from '../../player/ports/player-party-observation-reader.port';
import type { PartyObservationSnapshot } from '../entities/party-observation-snapshot';
import { PartyGameTypeReaderPort } from '../ports/party-game-type-reader.port';

@Injectable()
export class LoadPartyObservationSnapshotUseCase {
  constructor(
    private readonly lifecyclePolicy: HostPartyLifecyclePolicy,
    private readonly stageConfiguration: PartyStageConfigurationPort,
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
      hostPermissions: this.lifecyclePolicy.permissions({
        status: hostObservation.status,
        runtime: hostObservation.context,
        playerCount: hostObservation.players.length,
        stageCount: await this.stageConfiguration.getStageCount(hostObservation.gameId),
      }),
      gameType,
      hostObservation,
      playerObservation,
    };
  }
}
