import type { GameId } from '../../../entities/game';
import type { PartyRole } from './party-role';
import type { PartyStatus } from './party-status';

export type PartyId = string & {
  readonly __identifierBrand: 'PartyId';
};

export type PartyPin = string & {
  readonly __identifierBrand: 'PartyPin';
};

export interface Party {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly role: PartyRole;
  readonly createdAt: string;
}
