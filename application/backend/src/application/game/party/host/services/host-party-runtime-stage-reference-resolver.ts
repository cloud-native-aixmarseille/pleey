import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../../../../domain/game/entities/game';
import {
  type PartyStageCatalogEntry,
  PartyStageCatalogPort,
} from '../../../../game/types/shared/ports/party-stage-catalog.port';
import { PartyStageConfigurationPort } from '../../../../game/types/shared/ports/party-stage-configuration.port';
import type { HostControlledPartyRuntime } from '../ports/host-party-runtime-control.port';

type HostPartyStageReference = Pick<PartyStageCatalogEntry, 'id' | 'stagePosition'>;

@Injectable()
export class HostPartyRuntimeStageReferenceResolver {
  constructor(
    @Inject(PartyStageConfigurationPort)
    private readonly partyStageConfiguration: PartyStageConfigurationPort,
    @Inject(PartyStageCatalogPort)
    private readonly partyStageCatalog: PartyStageCatalogPort,
  ) {}

  async resolveStartState(gameId: GameId): Promise<{
    readonly firstStage: HostPartyStageReference | null;
    readonly totalStages: number;
  }> {
    const [totalStages, firstStage] = await Promise.all([
      this.partyStageConfiguration.getStageCount(gameId),
      this.partyStageCatalog.findFirstStage(gameId),
    ]);

    return {
      firstStage,
      totalStages,
    };
  }

  async findNextStage(party: HostControlledPartyRuntime): Promise<HostPartyStageReference | null> {
    const currentStageId = party.context?.lifecycle.stageId;

    if (currentStageId === null || currentStageId === undefined) {
      return null;
    }

    return this.partyStageCatalog.findNextStage(party.gameId, currentStageId);
  }

  async findPreviousStage(
    party: HostControlledPartyRuntime,
  ): Promise<HostPartyStageReference | null> {
    const currentStageId = party.context?.lifecycle.stageId;

    if (currentStageId === null || currentStageId === undefined) {
      return null;
    }

    return this.partyStageCatalog.findPreviousStage(party.gameId, currentStageId);
  }
}
