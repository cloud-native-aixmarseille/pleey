import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartyPin, PartyRole, PartyStatus } from '@pleey/contracts/party';

export interface PartySummary {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: Date;
}
