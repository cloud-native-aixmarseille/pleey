import {
  ArcadeProgressBar,
  ArcadeTimer,
  Card,
} from "../../../../../../presentation/shared/ui/components";

import { PROGRESS_MAX, PROGRESS_MIN } from "../constants";
import { TimerSeverity } from "../hooks/useQuestionTimerState";
import type { ArcadeProgressTone } from "../../../../../../presentation/shared/ui/components/ArcadeProgressBar";
import type { ArcadeTimerTone } from "../../../../../../presentation/shared/ui/components/ArcadeTimer";

const CONTAINER_CLASSES = "mb-6 animate-slide-down";
const HEADER_ROW_CLASSES =
  "mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row";
const QUESTION_META_CLASSES =
  "inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2";
const QUESTION_META_TEXT_CLASSES =
  "font-mono text-base font-semibold uppercase tracking-[0.24em] text-white";

const PROGRESS_GLARE_CLASSES =
  "pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-float";

const PROGRESS_TONES: Record<TimerSeverity, ArcadeProgressTone> = {
  normal: "success",
  warning: "warning",
  critical: "danger",
};

const TIMER_TONES: Record<TimerSeverity, ArcadeTimerTone> = {
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
  const ariaLabel = `Time remaining: ${timeLeft} seconds`;

  return (
    <div className={CONTAINER_CLASSES}>
      <Card
        surface="glass"
        variant="neutral"
        padding="lg"
        elevation="glow"
        border="regular"
      >
        <div className={HEADER_ROW_CLASSES}>
          <div className="flex items-center gap-3">
            <div
              className={QUESTION_META_CLASSES}
              role="status"
              aria-live="polite"
            >
              <span className={QUESTION_META_TEXT_CLASSES}>
                Question {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>

          <ArcadeTimer
            value={timeLeft}
            suffix="s"
            tone={TIMER_TONES[severity]}
            variant="chip"
            size="md"
            pulse={severity === "critical"}
            role="timer"
            ariaLabel={ariaLabel}
            ariaLive="assertive"
            ariaAtomic
          />
        </div>

        <ArcadeProgressBar
          value={progressPercent}
          min={PROGRESS_MIN}
          max={PROGRESS_MAX}
          tone={PROGRESS_TONES[severity]}
          pulse={severity === "critical"}
          trackVariant="timer"
          ariaLabel="Question time progress"
        >
          <div className={PROGRESS_GLARE_CLASSES} aria-hidden />
        </ArcadeProgressBar>
      </Card>
    </div>
  );
}
