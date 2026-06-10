import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../../../../domain/game/entities/game';
import {
  type PartyStageCatalogEntry,
  PartyStageCatalogPort,
} from '../../../../game/types/shared/ports/party-stage-catalog.port';
import { PartyStageConfigurationPort } from '../../../../game/types/shared/ports/party-stage-configuration.port';
import type { HostControlledPartyRuntime } from '../ports/host-party-runtime-control.port';

type HostPartyStageReference = Pick<
  PartyStageCatalogEntry,
  'id' | 'stagePosition' | 'timeLimitSeconds'
>;

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
    return this.resolveStartStateForGame({
      gameId,
      partyId: null,
      settings: {
        allowOptionChangeAfterVoting: false,
        randomizeOptionOrder: false,
        randomizeStageOrder: false,
      },
    });
  }

  async resolveStartStateForGame(party: {
    readonly gameId: GameId;
    readonly partyId: HostControlledPartyRuntime['partyId'] | null;
    readonly settings: HostControlledPartyRuntime['settings'];
  }): Promise<{
    readonly firstStage: HostPartyStageReference | null;
    readonly totalStages: number;
  }> {
    const [totalStages, firstStage] = await Promise.all([
      this.partyStageConfiguration.getStageCount(party.gameId),
      this.partyStageCatalog.findFirstStage(party.gameId, {
        ...(party.partyId ? { partyId: party.partyId } : {}),
        settings: party.settings,
      }),
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

    return this.partyStageCatalog.findNextStage(party.gameId, currentStageId, {
      partyId: party.partyId,
      settings: party.settings,
    });
  }

  async findPreviousStage(
    party: HostControlledPartyRuntime,
  ): Promise<HostPartyStageReference | null> {
    const currentStageId = party.context?.lifecycle.stageId;

    if (currentStageId === null || currentStageId === undefined) {
      return null;
    }

    return this.partyStageCatalog.findPreviousStage(party.gameId, currentStageId, {
      partyId: party.partyId,
      settings: party.settings,
    });
  }
}
