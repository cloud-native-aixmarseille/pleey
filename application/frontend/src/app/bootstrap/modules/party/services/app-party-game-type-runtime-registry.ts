import { injectable, multiInject } from 'inversify';
import type { GameType } from '../../../../../domains/game/types/shared/game-type';
import { createDomainError } from '../../../../../domains/shared/errors/domain-error';
import type {
  PartyGameTypeRuntimeRegistry,
  PartyGameTypeRuntimeView,
} from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import {
  type PartyGameTypeRuntimeViewContributor,
  PartyGameTypeRuntimeViewContributorToken,
} from '../party-game-type-runtime-view-contributor';

const PARTY_RUNTIME_VIEW_DUPLICATE_REGISTRATION_ERROR = {
  code: 'PARTY_RUNTIME_VIEW_DUPLICATE_REGISTRATION',
  messageKey: 'PARTY_RUNTIME_VIEW_DUPLICATE_REGISTRATION',
} as const;

const PARTY_RUNTIME_VIEW_MISSING_REGISTRATION_ERROR = {
  code: 'PARTY_RUNTIME_VIEW_MISSING_REGISTRATION',
  messageKey: 'PARTY_RUNTIME_VIEW_MISSING_REGISTRATION',
} as const;

@injectable()
export class AppPartyGameTypeRuntimeRegistry implements PartyGameTypeRuntimeRegistry {
  private readonly runtimeViewsByType: ReadonlyMap<GameType, PartyGameTypeRuntimeView>;

  constructor(
    @multiInject(PartyGameTypeRuntimeViewContributorToken)
    contributors: readonly PartyGameTypeRuntimeViewContributor[],
  ) {
    this.runtimeViewsByType = this.createRuntimeViewsByType(contributors);
  }

  resolve(gameType: GameType): PartyGameTypeRuntimeView {
    const runtimeView = this.runtimeViewsByType.get(gameType);

    if (!runtimeView) {
      throw createDomainError(
        {
          ...PARTY_RUNTIME_VIEW_MISSING_REGISTRATION_ERROR,
          message: `No party runtime view registered for game type: ${gameType}`,
        },
        { gameType },
      );
    }

    return runtimeView;
  }

  private createRuntimeViewsByType(
    contributors: readonly PartyGameTypeRuntimeViewContributor[],
  ): ReadonlyMap<GameType, PartyGameTypeRuntimeView> {
    const runtimeViewsByType = new Map<GameType, PartyGameTypeRuntimeView>();

    for (const contributor of contributors) {
      if (runtimeViewsByType.has(contributor.gameType)) {
        throw createDomainError(
          {
            ...PARTY_RUNTIME_VIEW_DUPLICATE_REGISTRATION_ERROR,
            message: `Duplicate party runtime view registration for game type: ${contributor.gameType}`,
          },
          {
            gameType: contributor.gameType,
          },
        );
      }

      runtimeViewsByType.set(contributor.gameType, contributor);
    }

    return runtimeViewsByType;
  }
}
