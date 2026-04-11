import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import type { GameType } from '../../../../domain/game/types/shared/entities/game-type';

export interface GameTypeBinding<T> {
  readonly gameType: GameType;
  readonly provider: T;
}

export abstract class AbstractGameTypeRegistry<T> {
  private readonly registry: ReadonlyMap<GameType, T>;

  protected constructor(bindings: readonly GameTypeBinding<T>[]) {
    this.registry = this.buildRegistry(bindings);
  }

  resolveByGameType(gameType: GameType): T {
    const provider = this.registry.get(gameType);

    if (!provider) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    return provider;
  }

  private buildRegistry(bindings: readonly GameTypeBinding<T>[]): ReadonlyMap<GameType, T> {
    const registry = new Map<GameType, T>();

    for (const binding of bindings) {
      if (!binding) {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }

      if (registry.has(binding.gameType)) {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }

      registry.set(binding.gameType, binding.provider);
    }

    return registry;
  }
}
