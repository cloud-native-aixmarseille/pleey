import type { GameId } from '../../../../../domain/game/entities/game';
import { type PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { GameSettings } from '../../../../../domain/game/party/shared/entities/game-settings';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { PartyStageId } from '../../../../../domain/game/party/shared/entities/party-stage';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { HostPartyPlayerIdentity } from '../dto/host-party-player-control.dto';

export interface HostControlledPartyRuntime {
  readonly context: PartyRuntimeContext | null;
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly partyId: PartyId;
  readonly settings: GameSettings;
  readonly status: PartyStatus;
}

export interface SaveHostPartyRuntimeCommand {
  readonly context: PartyRuntimeContext | null;
  readonly partyId: PartyId;
  readonly resetPlayerProgress?: {
    readonly fromStageId: PartyStageId | null;
    readonly gameId: GameId;
    readonly partyId: PartyId;
    readonly settings: GameSettings;
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
