import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartyPin, PartyPlayerIdentity, PartySettings, PartyStatus } from '@pleey/contracts/party';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
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
  readonly settings: PartySettings;
  readonly status: PartyStatus;
}

export interface EnsureAuthenticatedPlayerCommand {
  readonly partyId: PartyId;
  readonly userId: UserId;
}

export interface FindPartyPlayerCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}

export interface RemovePartyPlayerCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
  readonly status: 'LEFT';
}

export abstract class PlayerPartyRuntimePort {
  abstract findPartyByPin(pin: PartyPin): Promise<PartyJoinTarget | null>;

  abstract findActivePartyByUserId(userId: UserId): Promise<ActivePlayerPartySession | null>;

  abstract findPartyPlayer(command: FindPartyPlayerCommand): Promise<PartyPlayer | null>;

  abstract ensureAuthenticatedPlayer(command: EnsureAuthenticatedPlayerCommand): Promise<void>;

  abstract removePlayer(command: RemovePartyPlayerCommand): Promise<boolean>;
}
