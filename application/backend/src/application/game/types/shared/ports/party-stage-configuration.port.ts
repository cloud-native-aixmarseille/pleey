import type { GameId } from '@pleey/domain/game';

export abstract class PartyStageConfigurationPort {
  abstract getStageCount(gameId: GameId): Promise<number>;
}
