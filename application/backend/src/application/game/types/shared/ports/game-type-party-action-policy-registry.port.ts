import type { GameId, GameType } from '@pleey/domain/game';
import type { PartyActionId, PartyId, PartyStatus } from '@pleey/domain/party';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';

export interface EvaluatePartyActionSubmissionCommand {
  readonly actionId: PartyActionId;
  readonly context: PartyRuntimeContext | null;
  readonly gameId: GameId;
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
  readonly status: PartyStatus;
}

export interface PartyActionSubmissionResolution {
  readonly context: PartyRuntimeContext | null;
  readonly scoreDelta: number;
  readonly status: PartyStatus;
}

export abstract class GameTypePartyActionPolicy {
  abstract evaluateSubmission(command: EvaluatePartyActionSubmissionCommand): Promise<PartyActionSubmissionResolution>;
}

export abstract class GameTypePartyActionPolicyRegistryPort {
  abstract resolveByGameType(gameType: GameType): GameTypePartyActionPolicy;
}
