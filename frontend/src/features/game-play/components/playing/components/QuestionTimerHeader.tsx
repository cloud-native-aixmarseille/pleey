import { ArcadeProgressBar, Card } from "../../../../../shared/components";

import { PROGRESS_MAX, PROGRESS_MIN } from "../constants";
import { TimerSeverity } from "../hooks/useQuestionTimerState";
import { createStyles, type StyleEntry } from "../../../../../shared/ui/styles";
import type { ArcadeProgressTone } from "../../../../../shared/ui/components/ArcadeProgressBar";

const TIMER_BASE_CLASSES =
  "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-3xl";

const styles = createStyles("QuestionTimerHeader", {
  slot1: "p-6 mb-6 animate-slide-down",
  slot2: "flex flex-col sm:flex-row justify-between items-center gap-4 mb-4",
  slot3: "flex items-center gap-3",
  slot4: "glass-effect rounded-2xl px-4 py-2 border border-white/20",
  slot5: "text-white font-bold text-lg",
  slot6: "text-4xl",
  slot7:
    "relative w-full bg-dark-700 rounded-full h-5 overflow-hidden border-2 border-dark-600",
  slot8:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float",
  timerNormal: `${TIMER_BASE_CLASSES} bg-success-500/20 text-success-400`,
  timerWarning: `${TIMER_BASE_CLASSES} bg-secondary-500/20 text-secondary-400`,
  timerCritical: `${TIMER_BASE_CLASSES} bg-danger-500/20 text-danger-400 animate-pulse`,
});

const TIMER_VARIANTS: Record<TimerSeverity, StyleEntry> = {
  normal: styles.timerNormal,
  warning: styles.timerWarning,
  critical: styles.timerCritical,
};

const PROGRESS_TONES: Record<TimerSeverity, ArcadeProgressTone> = {
  normal: "success",
  warning: "warning",
  critical: "danger",
};

interface QuestionTimerHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  progressPercent: number;
  severity: TimerSeverity;
}

export function QuestionTimerHeader({
  questionNumber,
  totalQuestions,
  timeLeft,
  progressPercent,
  severity,
}: QuestionTimerHeaderProps) {
  const timerStyle = TIMER_VARIANTS[severity];

  return (
    <Card {...styles.slot1}>
      <div {...styles.slot2}>
        <div {...styles.slot3}>
          <div {...styles.slot4} role="status" aria-live="polite">
            <span {...styles.slot5}>
              Question {questionNumber} / {totalQuestions}
            </span>
          </div>
        </div>
        <div
          {...timerStyle}
          role="timer"
          aria-live="assertive"
          aria-atomic="true"
          aria-label={`Time remaining: ${timeLeft} seconds`}
        >
          <span {...styles.slot6} aria-hidden="true">
            ⏱️
          </span>
          <span>{timeLeft}s</span>
        </div>
      </div>

      <ArcadeProgressBar
        value={progressPercent}
        min={PROGRESS_MIN}
        max={PROGRESS_MAX}
        tone={PROGRESS_TONES[severity]}
        pulse={severity === "critical"}
        trackSlot={styles.slot7}
        aria-label="Question time progress"
      >
        <div {...styles.slot8} />
      </ArcadeProgressBar>
    </Card>
  );
}
