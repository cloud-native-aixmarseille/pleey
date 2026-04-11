import type { GameId } from '../../../../../domain/game/entities/game';

export abstract class PartyStageConfigurationPort {
  abstract getStageCount(gameId: GameId): Promise<number>;
}
