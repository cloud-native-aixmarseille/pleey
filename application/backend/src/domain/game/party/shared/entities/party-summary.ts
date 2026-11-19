import type { GameId } from '@pleey/domain/game';
import type { PartyId, PartyPin, PartyRole, PartyStatus } from '@pleey/domain/party';

export interface PartySummary {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: Date;
}
