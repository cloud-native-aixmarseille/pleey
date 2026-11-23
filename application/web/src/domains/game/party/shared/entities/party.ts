import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartyPin, PartyRole, PartyStatus } from '@pleey/contracts/party';

export type { PartyId, PartyPin } from '@pleey/contracts/party';

export interface Party {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: string;
}
