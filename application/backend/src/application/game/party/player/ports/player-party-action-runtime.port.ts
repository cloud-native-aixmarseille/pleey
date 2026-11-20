import type { GameId, GameType } from '@pleey/domain/game';
import type { PartyActionId, PartyId, PartyPlayerIdentity, PartySettings, PartyStatus } from '@pleey/domain/party';
import type { PartyPlayerActionState } from '../../../../../domain/game/party/player/entities/party-player-action-state';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';

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
  readonly settings: PartySettings;
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
