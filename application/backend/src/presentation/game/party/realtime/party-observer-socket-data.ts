import type { PartyId, PartyPin, PartyPlayerIdentity } from '@pleey/contracts/party';
import type { UserId } from '../../../../domain/identity/entities/user';

interface JoinedPartyPlayerSocketData {
  partyId: PartyId;
  identity: PartyPlayerIdentity;
  pin: PartyPin;
}

export interface PartyObserverSocketData {
  authenticatedUserId?: UserId;
  authenticatedSessionId?: string;
  authenticatedSessionExpiresAt?: Date;
  joinedPartyPlayer?: JoinedPartyPlayerSocketData;
  partyObservationRoom?: string;
  playerSessionId?: string;
}
