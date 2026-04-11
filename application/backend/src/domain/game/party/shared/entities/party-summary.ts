import type { GameId } from '../../../entities/game';
import type { PartyRole } from '../../enums/party-role.enum';
import type { PartyStatus } from '../../enums/party-status.enum';
import type { PartyId, PartyPin } from './party';

export interface PartySummary {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: Date;
}
