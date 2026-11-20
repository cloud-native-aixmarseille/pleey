import { useContext } from 'react';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStageScoreboardContext } from '../contexts/party-stage-scoreboard-context';

export function usePartyStageScoreboardSnapshot(party: PartyObservation) {
  const snapshot = useContext(PartyStageScoreboardContext);
  const lifecycle = party.context?.lifecycle;
  const matchesResult =
    snapshot?.partyId === party.partyId &&
    snapshot.stageId === lifecycle?.stageId &&
    snapshot.stagePosition === lifecycle.stagePosition &&
    snapshot.phase === PartyRuntimePhase.RESULT &&
    lifecycle.phase === PartyRuntimePhase.RESULT;

  return {
    players: matchesResult ? (snapshot.resultPlayers ?? party.players) : party.players,
    previousPlayers: matchesResult ? snapshot.previousPlayers : undefined,
  };
}
