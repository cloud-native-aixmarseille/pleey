import { Inject, Injectable } from '@nestjs/common';
import {
  type GameTypePartyActionPolicy,
  GameTypePartyActionPolicyRegistryPort,
} from '../../../../application/game/types/shared/ports/game-type-party-action-policy-registry.port';
import { AbstractGameTypeRegistry, type GameTypeBinding } from './abstract-game-type-registry';

export const GAME_TYPE_PARTY_ACTION_POLICIES = Symbol('GAME_TYPE_PARTY_ACTION_POLICIES');

@Injectable()
export class GameTypePartyActionPolicyRegistry
  extends AbstractGameTypeRegistry<GameTypePartyActionPolicy>
  implements GameTypePartyActionPolicyRegistryPort
{
  constructor(
    @Inject(GAME_TYPE_PARTY_ACTION_POLICIES)
    bindings: readonly GameTypeBinding<GameTypePartyActionPolicy>[],
  ) {
    super(bindings);
  }
}
