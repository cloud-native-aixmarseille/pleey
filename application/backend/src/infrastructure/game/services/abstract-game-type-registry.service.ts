import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import type { GameType } from '../../../domain/game/enums/game-type.enum';

export interface GameTypeBinding<T> {
  gameType: GameType;
  provider: T;
}

export abstract class AbstractGameTypeRegistry<T> {
  protected readonly registry: Map<GameType, T>;

  constructor(bindings: GameTypeBinding<T>[]) {
    this.registry = this.buildRegistry(bindings);
  }

  resolve(gameType: GameType): T {
    return this.resolveProvider(this.registry, gameType);
  }

  private buildRegistry(bindings: GameTypeBinding<T>[]): Map<GameType, T> {
    const registry = new Map<GameType, T>();

    for (const binding of bindings) {
      if (!binding) {
        throw new Error(GameErrorCode.GAME_TYPE_NOT_SUPPORTED);
      }

      if (registry.has(binding.gameType)) {
        throw new Error(GameErrorCode.GAME_TYPE_NOT_SUPPORTED);
      }

      registry.set(binding.gameType, binding.provider);
    }

    return registry;
  }

  private resolveProvider(registry: Map<GameType, T>, gameType: GameType): T {
    const provider = registry.get(gameType);
    if (!provider) {
      throw new Error(GameErrorCode.GAME_TYPE_NOT_SUPPORTED);
    }
    return provider;
  }
}
