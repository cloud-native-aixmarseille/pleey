import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartySettings, PartyStageId } from '@pleey/contracts/party';
import { type PartyStatus } from '@pleey/contracts/party';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { HostPartyPlayerIdentity } from '../dto/host-party-player-control.dto';

export interface HostControlledPartyRuntime {
  readonly playerCount: number;
  readonly context: PartyRuntimeContext | null;
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly partyId: PartyId;
  readonly settings: PartySettings;
  readonly status: PartyStatus;
}

export interface SaveHostPartyRuntimeCommand {
  readonly context: PartyRuntimeContext | null;
  readonly partyId: PartyId;
  readonly resetPlayerProgress?: {
    readonly fromStageId: PartyStageId | null;
    readonly gameId: GameId;
    readonly partyId: PartyId;
    readonly settings: PartySettings;
  };
  readonly status: PartyStatus;
}

export interface RemoveHostPartyPlayerCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: HostPartyPlayerIdentity;
}

export abstract class HostPartyRuntimeControlPort {
  abstract findPartyRuntimeByPartyId(partyId: PartyId): Promise<HostControlledPartyRuntime | null>;

  abstract removePartyPlayer(command: RemoveHostPartyPlayerCommand): Promise<boolean>;

  abstract savePartyRuntime(command: SaveHostPartyRuntimeCommand): Promise<void>;
}
