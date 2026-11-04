import { useEffect, useState } from 'react';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';

const COUNTDOWN_TICK_INTERVAL_MS = 250;

export function useStageTiming(party: PartyObservation) {
  const lifecycle = party.context?.lifecycle;
  const phase = lifecycle?.phase;
  const stageEndsAtEpochMs = lifecycle?.stageEndsAtEpochMs ?? null;
  const readingEndsAtEpochMs = lifecycle?.reading?.endsAtEpochMs ?? null;
  const [, setNowEpochMs] = useState(() => Date.now());
  const nowEpochMs = Date.now();

  useEffect(() => {
    if (phase !== PartyRuntimePhase.STAGE || party.status !== PartyStatus.ACTIVE) return;

    const tick = () => setNowEpochMs(Date.now());
    const intervalId = stageEndsAtEpochMs === null ? undefined : window.setInterval(tick, COUNTDOWN_TICK_INTERVAL_MS);
    const readingTimeoutId =
      readingEndsAtEpochMs !== null
        ? window.setTimeout(tick, Math.max(0, readingEndsAtEpochMs - Date.now()))
        : undefined;

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(readingTimeoutId);
    };
  }, [phase, party.status, stageEndsAtEpochMs, readingEndsAtEpochMs]);

  const totalDurationMs = lifecycle?.stageTimeLimitSeconds ? lifecycle.stageTimeLimitSeconds * 1_000 : null;
  const isReading =
    phase === PartyRuntimePhase.STAGE &&
    !!lifecycle?.reading &&
    (party.status === PartyStatus.PAUSED || readingEndsAtEpochMs === null
      ? lifecycle.reading.remainingDurationMs > 0
      : nowEpochMs < readingEndsAtEpochMs);
  let remainingDurationMs: number | null = null;

  if (phase === PartyRuntimePhase.STAGE) {
    if (party.status === PartyStatus.PAUSED) {
      remainingDurationMs = lifecycle?.stageRemainingDurationMs ?? null;
    } else if (party.status === PartyStatus.ACTIVE && stageEndsAtEpochMs !== null && totalDurationMs !== null) {
      remainingDurationMs = Math.max(0, Math.min(totalDurationMs, stageEndsAtEpochMs - nowEpochMs));
    }
  }

  return { isReading, remainingDurationMs, totalDurationMs };
}
