import { useMemo } from "react";

import {
  LOW_TIME_THRESHOLD_SECONDS,
  MEDIUM_TIME_THRESHOLD_SECONDS,
  PROGRESS_MAX,
  PROGRESS_MIN,
} from "../constants";

export type TimerSeverity = "normal" | "warning" | "critical";

export function useQuestionTimerState(timeLeft: number, timeLimit: number) {
  return useMemo(() => {
    if (timeLimit <= 0) {
      return {
        progressPercent: PROGRESS_MIN,
        severity: "normal" as TimerSeverity,
      };
    }

    const clampedTimeLeft = Math.max(0, timeLeft);
    const rawProgress = (clampedTimeLeft / timeLimit) * PROGRESS_MAX;
    const progressPercent = Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, rawProgress));

    const severity: TimerSeverity = getSeverity(clampedTimeLeft);

    return { progressPercent, severity };
  }, [timeLeft, timeLimit]);
}

function getSeverity(timeLeft: number): TimerSeverity {
  if (timeLeft <= LOW_TIME_THRESHOLD_SECONDS) {
    return "critical";
  }

  if (timeLeft <= MEDIUM_TIME_THRESHOLD_SECONDS) {
    return "warning";
  }

  return "normal";
}
