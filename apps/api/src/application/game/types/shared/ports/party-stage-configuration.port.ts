import type { GameId } from '@pleey/contracts/game';

export abstract class PartyStageConfigurationPort {
  abstract getStageCount(gameId: GameId): Promise<number>;
}
