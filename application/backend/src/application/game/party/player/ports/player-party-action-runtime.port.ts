import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyPlayerActionState } from '../../../../../domain/game/party/player/entities/party-player-action-state';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domain/game/party/shared/entities/party-action';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';

export interface FindPartyActionSubmissionTargetCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}

interface PartyActionSubmissionTarget {
  readonly context: PartyRuntimeContext | null;
  readonly gameId: GameId;
  readonly gameType: GameType;
  readonly partyId: PartyId;
  readonly playerActionState?: PartyPlayerActionState | null;
  readonly playerIdentity: PartyPlayerIdentity;
  readonly status: PartyStatus;
}

export interface SavePartyActionSubmissionResultCommand {
  readonly actionId: PartyActionId;
  readonly context: PartyRuntimeContext | null;
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
  readonly scoreDelta: number;
  readonly status: PartyStatus;
}

export abstract class PlayerPartyActionRuntimePort {
  abstract findSubmissionTarget(
    command: FindPartyActionSubmissionTargetCommand,
  ): Promise<PartyActionSubmissionTarget | null>;

  abstract saveSubmissionResult(command: SavePartyActionSubmissionResultCommand): Promise<void>;
}
