import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';

export interface PartyStageScoreboardSnapshot {
  readonly partyId: PartyId;
  readonly stageId: StageId;
  readonly stagePosition: number;
  readonly phase: PartyRuntimePhase;
  readonly submittedPlayerCount: number;
  readonly previousPlayers: readonly PartyObservationPlayer[] | undefined;
  readonly resultPlayers: readonly PartyObservationPlayer[] | undefined;
}

// Owned by the observation provider, which survives stage/result screen remounts.
export function updatePartyStageScoreboard(
  previous: PartyStageScoreboardSnapshot | null,
  party: PartyObservation,
): PartyStageScoreboardSnapshot | null {
  const context = party.context;
  const lifecycle = context?.lifecycle;
  if (!lifecycle || lifecycle.stageId === null || lifecycle.stagePosition === null) {
    return null;
  }

  const sameStage =
    previous?.partyId === party.partyId &&
    previous.stageId === lifecycle.stageId &&
    previous.stagePosition === lifecycle.stagePosition;
  const submittedPlayerCount = context?.stage?.actionSubmission.submittedPlayerCount ?? 0;
  const isStage = lifecycle.phase === PartyRuntimePhase.STAGE;
  const hasNoSubmissions = isStage && context?.stage?.actionSubmission.submittedPlayerCount === 0;
  const restarted =
    sameStage &&
    isStage &&
    (previous.phase !== PartyRuntimePhase.STAGE || (hasNoSubmissions && previous.submittedPlayerCount > 0));
  const retained = sameStage && !restarted ? previous : null;

  return {
    partyId: party.partyId,
    stageId: lifecycle.stageId,
    stagePosition: lifecycle.stagePosition,
    phase: lifecycle.phase,
    submittedPlayerCount,
    // Never infer a zero baseline from a result or a stage already in progress.
    previousPlayers: retained ? retained.previousPlayers : hasNoSubmissions ? [...party.players] : undefined,
    resultPlayers:
      lifecycle.phase === PartyRuntimePhase.RESULT ? (retained?.resultPlayers ?? [...party.players]) : undefined,
  };
}
