import type { GameId } from '../../entities/game';
import type { GameStage } from '../../entities/game-stage';
import type { GameType } from '../../enums/game-type.enum';

export interface GameContentProvider {
  resolveStages(gameId: GameId): Promise<GameStage[]>;
}

export const GameContentProviderRegistryProvider = Symbol('GameContentProviderRegistry');

export interface GameContentProviderRegistry {
  resolve(gameType: GameType): GameContentProvider;
}
