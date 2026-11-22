import type { PartyId, PartyPin, PartyPlayerIdentity } from '@pleey/contracts/party';
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
  authenticatedSessionId?: string;
  authenticatedSessionExpiresAt?: Date;
  joinedPartyPlayer?: JoinedPartyPlayerSocketData;
  partyObservationRoom?: string;
  playerSessionId?: string;
}
