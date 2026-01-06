import {
  ArcadeProgressBar,
  ArcadeTimer,
  Card,
} from "../../../../../../presentation/shared/ui/components";
import { useTranslation } from "react-i18next";
import { TimerUrgency } from "../constants";
import type { ArcadeProgressTone } from "../../../../../../presentation/shared/ui/components/ArcadeProgressBar";
import type { ArcadeTimerTone } from "../../../../../../presentation/shared/ui/components/ArcadeTimer";

const CARD_WRAPPER_CLASSES = "mb-6 sm:mb-8 animate-slide-down";
const HEADER_ROW_CLASSES =
  "mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6";
const INFO_CARD_CLASSES =
  "glass-effect rounded-2xl border-2 border-accent-500/50 px-6 py-4";
const ANSWERED_CARD_CLASSES =
  "glass-effect rounded-2xl border-2 border-primary-500/50 px-6 py-4";
const CENTERED_TEXT_CLASSES = "text-center";
const ACCENT_LABEL_CLASSES =
  "mb-1 font-display text-sm uppercase tracking-wider text-accent-500";
const ANSWERED_LABEL_CLASSES =
  "mb-1 font-display text-sm uppercase tracking-wider text-primary-500";
const PROMINENT_VALUE_CLASSES =
  "font-display text-3xl font-bold text-white sm:text-4xl";
const PROGRESS_GLOW_CLASSES =
  "pointer-events-none absolute inset-0 animate-float bg-gradient-to-r from-transparent via-white/40 to-transparent";

interface RoundStatusCardProps {
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  progressPercent: number;
  timerUrgency: TimerUrgency;
  pulseAnimation: boolean;
  totalAnswers: number | null;
  showResult: boolean;
}

const PROGRESS_TONES: Record<TimerUrgency, ArcadeProgressTone> = {
  low: "danger",
  medium: "warning",
  high: "success",
};

const TIMER_TONES: Record<TimerUrgency, ArcadeTimerTone> = {
  low: "danger",
  medium: "warning",
  high: "success",
};

export function RoundStatusCard({
  questionNumber,
  totalQuestions,
  timeLeft,
  progressPercent,
  timerUrgency,
  pulseAnimation,
  totalAnswers,
  showResult,
}: RoundStatusCardProps) {
  const { t } = useTranslation();
  const questionLabel = t("game.hostPlaying.round.questionLabel");
  const secondsLabel = t("game.hostPlaying.round.secondsLabel");
  const answeredLabel = t("game.hostPlaying.round.answeredLabel");
  const ariaTimeRemaining = t("game.playing.timer.ariaTimeRemaining", {
    count: timeLeft,
  });

  return (
    <div className={CARD_WRAPPER_CLASSES} data-round-status-card="true">
      <Card
        surface="panel"
        tone="primary"
        elevation="panel"
        padding="lg"
        border="thick"
        motion="slide-down"
      >
        <div className={HEADER_ROW_CLASSES}>
          <div className={INFO_CARD_CLASSES}>
            <div className={CENTERED_TEXT_CLASSES}>
              <div className={ACCENT_LABEL_CLASSES}>{questionLabel}</div>
              <div className={PROMINENT_VALUE_CLASSES}>
                {questionNumber} / {totalQuestions}
              </div>
            </div>
          </div>

          <ArcadeTimer
            value={timeLeft}
            label={secondsLabel}
            tone={TIMER_TONES[timerUrgency]}
            variant="panel"
            size="lg"
            pulse={pulseAnimation}
            role="timer"
            ariaLabel={ariaTimeRemaining}
            ariaLive="polite"
          />

          {!showResult && typeof totalAnswers === "number" ? (
            <div className={ANSWERED_CARD_CLASSES}>
              <div className={CENTERED_TEXT_CLASSES}>
                <div className={ANSWERED_LABEL_CLASSES}>{answeredLabel}</div>
                <div className={PROMINENT_VALUE_CLASSES}>{totalAnswers}</div>
              </div>
            </div>
          ) : null}
        </div>
        <ArcadeProgressBar
          value={progressPercent}
          min={0}
          max={100}
          tone={PROGRESS_TONES[timerUrgency]}
          pulse={timerUrgency === "low"}
          trackVariant="host"
        >
          <div className={PROGRESS_GLOW_CLASSES} aria-hidden />
        </ArcadeProgressBar>
      </Card>
    </div>
  );
}
