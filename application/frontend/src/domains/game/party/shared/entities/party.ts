import type { GameId } from '@pleey/domain/game';
import type { PartyId, PartyPin, PartyRole, PartyStatus } from '@pleey/domain/party';

export type { PartyId, PartyPin } from '@pleey/domain/party';

export interface Party {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: string;
}
