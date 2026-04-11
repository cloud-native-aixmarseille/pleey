import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { AuthenticatedPartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyPin } from '../../../../../domain/game/party/shared/entities/party';
import type { GuestId } from '../../../../../domain/identity/entities/guest';

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;

export interface JoinPartyDto {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyJoiningPlayerIdentity;
  readonly username: string;
}
