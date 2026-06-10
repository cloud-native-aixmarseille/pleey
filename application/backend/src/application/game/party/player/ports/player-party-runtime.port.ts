import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import type {
  GuestPartyPlayerIdentity,
  PartyPlayerIdentity,
} from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { GameSettings } from '../../../../../domain/game/party/shared/entities/game-settings';
import type { PartyId, PartyPin } from '../../../../../domain/game/party/shared/entities/party';
import type { GuestId } from '../../../../../domain/identity/entities/guest';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface ActivePlayerPartySession {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
}

export interface PartyJoinTarget {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly privatePartyPasswordHash: string | null;
  readonly pin: PartyPin;
  readonly settings: GameSettings;
  readonly status: PartyStatus;
}

export interface EnsureAuthenticatedPlayerCommand {
  readonly partyId: PartyId;
  readonly userId: UserId;
}

export interface EnsureGuestPlayerCommand {
  readonly avatarSeed?: string;
  readonly partyId: PartyId;
  readonly guestId: GuestId | null;
  readonly username: string;
}

export interface FindPartyPlayerCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}

export interface RemovePartyPlayerCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}

export abstract class PlayerPartyRuntimePort {
  abstract findPartyByPin(pin: PartyPin): Promise<PartyJoinTarget | null>;

  abstract findActivePartyByUserId(userId: UserId): Promise<ActivePlayerPartySession | null>;

  abstract findPartyPlayer(command: FindPartyPlayerCommand): Promise<PartyPlayer | null>;

  abstract ensureAuthenticatedPlayer(command: EnsureAuthenticatedPlayerCommand): Promise<void>;

  abstract ensureGuestPlayer(command: EnsureGuestPlayerCommand): Promise<GuestPartyPlayerIdentity>;

  abstract removePlayer(command: RemovePartyPlayerCommand): Promise<boolean>;
}
