import type { ActionPermission } from '../../../../shared/value-objects/action-permission';
import { GameErrorCode } from '../../../enums/game-error-code.enum';

export class PartyObservationPolicy {
  decide(facts: {
    readonly isPrivate: boolean;
    readonly isHost: boolean;
    readonly isVerifiedParticipant: boolean;
  }): ActionPermission<GameErrorCode> {
    return facts.isPrivate === false || facts.isHost || facts.isVerifiedParticipant
      ? { allowed: true, reason: null }
      : { allowed: false, reason: GameErrorCode.PARTY_NOT_FOUND };
  }
}
