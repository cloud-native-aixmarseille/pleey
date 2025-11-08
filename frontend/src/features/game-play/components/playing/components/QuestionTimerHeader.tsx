import { Card } from "../../../../../shared/components";

import { PROGRESS_MAX, PROGRESS_MIN } from "../constants";
import { TimerSeverity } from "../hooks/useQuestionTimerState";

interface QuestionTimerHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  progressPercent: number;
  severity: TimerSeverity;
}

const TIMER_STYLE_BY_SEVERITY: Record<TimerSeverity, string> = {
  normal: "bg-success-500/20 text-success-400",
  warning: "bg-secondary-500/20 text-secondary-400",
  critical: "bg-danger-500/20 text-danger-400 animate-pulse",
};

const PROGRESS_STYLE_BY_SEVERITY: Record<TimerSeverity, string> = {
  normal: "bg-gradient-to-r from-success-500 to-accent-500",
  warning: "bg-gradient-to-r from-secondary-500 to-secondary-400",
  critical: "bg-gradient-to-r from-danger-500 to-danger-400 animate-pulse",
};

export function QuestionTimerHeader({
  questionNumber,
  totalQuestions,
  timeLeft,
  progressPercent,
  severity,
}: QuestionTimerHeaderProps) {
  const timerClassName = TIMER_STYLE_BY_SEVERITY[severity];
  const progressClassName = PROGRESS_STYLE_BY_SEVERITY[severity];

  return (
    <Card className="p-6 mb-6 animate-slide-down">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="glass-effect rounded-2xl px-4 py-2 border border-white/20"
            role="status"
            aria-live="polite"
          >
            <span className="text-white font-bold text-lg">
              Question {questionNumber} / {totalQuestions}
            </span>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-3xl ${timerClassName}`}
          role="timer"
          aria-live="assertive"
          aria-atomic="true"
          aria-label={`Time remaining: ${timeLeft} seconds`}
        >
          <span className="text-4xl" aria-hidden="true">
            ⏱️
          </span>
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div
        className="relative w-full bg-dark-700 rounded-full h-5 overflow-hidden border-2 border-dark-600"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={PROGRESS_MIN}
        aria-valuemax={PROGRESS_MAX}
        aria-label="Question time progress"
      >
        <div
          className={`h-full transition-all duration-1000 relative overflow-hidden ${progressClassName}`}
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float" />
        </div>
      </div>
    </Card>
  );
}
