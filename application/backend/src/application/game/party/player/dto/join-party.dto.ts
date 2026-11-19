import type { GuestId } from '@pleey/domain/identity';
import type { PartyPin } from '@pleey/domain/party';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { AuthenticatedPartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;

export interface JoinPartyDto {
  readonly guestCredential?: string;
  readonly avatarSeed?: string;
  readonly partyPassword?: string;
  readonly pin: PartyPin;
  readonly playerIdentity: PartyJoiningPlayerIdentity;
  readonly username: string;
}
