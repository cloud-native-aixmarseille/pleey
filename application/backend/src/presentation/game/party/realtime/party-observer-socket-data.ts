import type { PartyPlayerIdentity } from '../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId, PartyPin } from '../../../../domain/game/party/shared/entities/party';
import type { UserId } from '../../../../domain/identity/entities/user';

interface JoinedPartyPlayerSocketData {
  partyId: PartyId;
  identity: PartyPlayerIdentity;
  pin: PartyPin;
}

export interface PartyObserverSocketData {
  authenticatedUserId?: UserId;
  authenticatedSession?: {
    readonly id: UserId;
    readonly username: string;
    readonly sessionId: string;
    readonly exp: number;
    readonly tokenType: 'access';
  };
  joinedPartyPlayer?: JoinedPartyPlayerSocketData;
  partyObservationRoom?: string;
  playerSessionId?: string;
}
