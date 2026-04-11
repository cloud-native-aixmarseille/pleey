import { injectable, multiInject } from 'inversify';
import type { GameType } from '../../../../../domains/game/types/shared/game-type';
import type {
  PartyGameTypeRuntimeRegistry,
  PartyGameTypeRuntimeView,
} from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import {
  type PartyGameTypeRuntimeViewContributor,
  PartyGameTypeRuntimeViewContributorToken,
} from '../contracts/party-game-type-runtime-view-contributor';

@injectable()
export class AppPartyGameTypeRuntimeRegistry implements PartyGameTypeRuntimeRegistry {
  private readonly runtimeViewsByType: ReadonlyMap<GameType, PartyGameTypeRuntimeView>;

  constructor(
    @multiInject(PartyGameTypeRuntimeViewContributorToken)
    contributors: readonly PartyGameTypeRuntimeViewContributor[],
  ) {
    this.runtimeViewsByType = this.createRuntimeViewsByType(contributors);
  }

  resolve(gameType: GameType): PartyGameTypeRuntimeView | null {
    return this.runtimeViewsByType.get(gameType) ?? null;
  }

  private createRuntimeViewsByType(
    contributors: readonly PartyGameTypeRuntimeViewContributor[],
  ): ReadonlyMap<GameType, PartyGameTypeRuntimeView> {
    const runtimeViewsByType = new Map<GameType, PartyGameTypeRuntimeView>();

    for (const contributor of contributors) {
      if (runtimeViewsByType.has(contributor.gameType)) {
        throw new Error(
          `Duplicate party runtime view registration for game type: ${contributor.gameType}`,
        );
      }

      runtimeViewsByType.set(contributor.gameType, contributor);
    }

    return runtimeViewsByType;
  }
}
