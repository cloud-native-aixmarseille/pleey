import type { GameId } from '../../../../../domain/game/entities/game';
import type { GameSettings } from '../../../../../domain/game/party/shared/entities/game-settings';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domain/game/party/shared/entities/party-action';
import type { PartyStageId } from '../../../../../domain/game/party/shared/entities/party-stage';

interface PartyStageActionCatalogEntry {
  readonly id: PartyActionId;
  readonly isCorrect: boolean;
  readonly text: string;
}

export interface PartyStageCatalogEntry {
  readonly actions: readonly PartyStageActionCatalogEntry[];
  readonly id: PartyStageId;
  readonly points: number;
  readonly stagePosition: number;
  readonly timeLimitSeconds: number;
  readonly text: string;
}

export interface PartyStageCatalogQueryOptions {
  readonly partyId?: PartyId;
  readonly settings?: GameSettings;
}

export abstract class PartyStageCatalogPort {
  abstract findStageById(
    gameId: GameId,
    stageId: PartyStageId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null>;

  abstract findFirstStage(
    gameId: GameId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null>;

  abstract findNextStage(
    gameId: GameId,
    currentStageId: PartyStageId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null>;

  abstract findPreviousStage(
    gameId: GameId,
    currentStageId: PartyStageId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null>;

  abstract listStages(
    gameId: GameId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<readonly PartyStageCatalogEntry[]>;
}
