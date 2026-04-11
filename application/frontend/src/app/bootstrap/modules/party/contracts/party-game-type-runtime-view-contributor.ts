import type { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeView } from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';

export interface PartyGameTypeRuntimeViewContributor extends PartyGameTypeRuntimeView {
  readonly gameType: GameType;
}

export const PartyGameTypeRuntimeViewContributorToken = Symbol(
  'PartyGameTypeRuntimeViewContributor',
);
