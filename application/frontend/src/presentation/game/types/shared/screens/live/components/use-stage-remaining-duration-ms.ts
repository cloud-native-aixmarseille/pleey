import { useEffect, useState } from 'react';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';

const countdownTickIntervalMs = 250;

export function useStageRemainingDurationMs(party: PartyObservation): number | null {
  const lifecycle = party.context?.lifecycle;
  const phase = lifecycle?.phase;
  const stageEndsAtEpochMs = lifecycle?.stageEndsAtEpochMs ?? null;
  const pausedRemainingDurationMs = lifecycle?.stageRemainingDurationMs ?? null;
  const [nowEpochMs, setNowEpochMs] = useState(() => Date.now());

  useEffect(() => {
    if (
      phase !== PartyRuntimePhase.STAGE ||
      party.status !== PartyStatus.ACTIVE ||
      stageEndsAtEpochMs === null
    ) {
      return;
    }

    setNowEpochMs(Date.now());

    const intervalId = window.setInterval(() => {
      setNowEpochMs(Date.now());
    }, countdownTickIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [phase, party.status, stageEndsAtEpochMs]);

  if (phase !== PartyRuntimePhase.STAGE) {
    return null;
  }

  if (party.status === PartyStatus.PAUSED) {
    return pausedRemainingDurationMs === null ? null : Math.max(0, pausedRemainingDurationMs);
  }

  if (party.status !== PartyStatus.ACTIVE || stageEndsAtEpochMs === null) {
    return null;
  }

  return Math.max(0, stageEndsAtEpochMs - nowEpochMs);
}

export function resolveStageTotalDurationMs(party: PartyObservation): number | null {
  const seconds = party.context?.lifecycle.stageTimeLimitSeconds ?? null;

  return seconds === null ? null : seconds * 1_000;
}
