import type { PartyPlayerIdentity } from '../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyPin } from '../../../../domain/game/party/shared/entities/party';
import type { UserId } from '../../../../domain/identity/entities/user';

interface JoinedPartyPlayerSocketData {
  identity: PartyPlayerIdentity;
  pin: PartyPin;
}

export interface PartyObserverSocketData {
  authenticatedUserId?: UserId;
  joinedPartyPlayer?: JoinedPartyPlayerSocketData;
  partyObservationRoom?: string;
  playerSessionId?: string;
}
