import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domain/game/party/shared/entities/party-action';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';

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
  abstract evaluateSubmission(
    command: EvaluatePartyActionSubmissionCommand,
  ): Promise<PartyActionSubmissionResolution>;
}

export abstract class GameTypePartyActionPolicyRegistryPort {
  abstract resolveByGameType(gameType: GameType): GameTypePartyActionPolicy;
}
