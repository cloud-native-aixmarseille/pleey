import { useRef } from 'react';

import type { PartyObservationPlayer } from '../../../../../domains/game/party/shared/entities/party-observation-player';
import { toPartyFinalSummaryPlayerKey } from './components/party-final-summary-panel.model';

/**
 * Captures the cumulative scoreboard as it stood **before** the current stage's
 * result was revealed.
 *
 * The hook keeps two snapshots in refs:
 * - `latestSnapshotRef`: the scores observed during the most recent rendered
 *   stage result phase. Becomes the baseline once the next stage advances.
 * - `baselineRef`: the previous-stage baseline returned to the caller, used to
 *   compute rank/score deltas while rendering the current stage result.
 *
 * Snapshots are recomputed during render when the observed `stagePosition`
 * changes, so the freshly mounted result panel renders the previous standings
 * before animating to the new ones.
 */
export function usePartyStageScoreboardSnapshot(
  players: readonly PartyObservationPlayer[],
  stagePosition: number | null | undefined,
): ReadonlyMap<string, number> {
  const latestSnapshotRef = useRef<ReadonlyMap<string, number>>(new Map());
  const baselineRef = useRef<ReadonlyMap<string, number>>(new Map());
  const lastCapturedStageRef = useRef<number | null>(null);

  if (stagePosition !== null && stagePosition !== undefined) {
    if (stagePosition !== lastCapturedStageRef.current) {
      const hadPreviousSnapshot = lastCapturedStageRef.current !== null;
      baselineRef.current = hadPreviousSnapshot
        ? latestSnapshotRef.current
        : buildZeroedScoreboard(players);
      latestSnapshotRef.current = buildScoreboard(players);
      lastCapturedStageRef.current = stagePosition;
    }
  }

  return baselineRef.current;
}

function buildScoreboard(players: readonly PartyObservationPlayer[]): ReadonlyMap<string, number> {
  const scoreboard = new Map<string, number>();

  for (const player of players) {
    scoreboard.set(toPartyFinalSummaryPlayerKey(player), player.totalScore);
  }

  return scoreboard;
}

function buildZeroedScoreboard(
  players: readonly PartyObservationPlayer[],
): ReadonlyMap<string, number> {
  const scoreboard = new Map<string, number>();

  for (const player of players) {
    scoreboard.set(toPartyFinalSummaryPlayerKey(player), 0);
  }

  return scoreboard;
}
