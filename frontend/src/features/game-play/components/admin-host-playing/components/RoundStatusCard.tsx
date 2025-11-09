import { ArcadeProgressBar, Card } from "../../../../../shared/components";
import { TimerUrgency } from "../constants";
import { createStyles, type StyleEntry } from "../../../../../shared/ui/styles";
import type { ArcadeProgressTone } from "../../../../../shared/ui/components/ArcadeProgressBar";

const styles = createStyles("RoundStatusCard", {
  container:
    "p-6 sm:p-8 mb-6 sm:mb-8 animate-slide-down border-4 border-primary-500/50",
  headerRow:
    "flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-4",
  infoCard: "glass-effect rounded-2xl px-6 py-4 border-2 border-accent-500/50",
  centered: "text-center",
  accentLabel:
    "font-display text-accent-500 text-sm mb-1 uppercase tracking-wider",
  prominentValue: "font-display text-white font-bold text-3xl sm:text-4xl",
  timerIcon: "text-5xl sm:text-6xl",
  timerValue: "font-display text-6xl sm:text-7xl tracking-wider",
  timerSubLabel: "font-mono text-sm uppercase tracking-wider opacity-80",
  answeredCard:
    "glass-effect rounded-2xl px-6 py-4 border-2 border-primary-500/50",
  answeredLabel:
    "font-display text-primary-500 text-sm mb-1 uppercase tracking-wider",
  progressTrack:
    "relative w-full bg-dark-700 rounded-full h-8 overflow-hidden border-4 border-dark-600 shadow-inner",
  progressGlow:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float",
  timerLowStable:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-100 bg-danger-500/30 text-danger-400 border-danger-500 animate-pulse shadow-neon-danger",
  timerLowPulse:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-110 bg-danger-500/30 text-danger-400 border-danger-500 animate-pulse shadow-neon-danger",
  timerMediumStable:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-100 bg-secondary-500/30 text-secondary-400 border-secondary-500 shadow-neon-secondary",
  timerMediumPulse:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-110 bg-secondary-500/30 text-secondary-400 border-secondary-500 shadow-neon-secondary",
  timerHighStable:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-100 bg-success-500/30 text-success-400 border-success-500 shadow-neon-accent",
  timerHighPulse:
    "flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4 transition-all duration-300 transform scale-110 bg-success-500/30 text-success-400 border-success-500 shadow-neon-accent",
});

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

const TIMER_VARIANTS: Record<
  TimerUrgency,
  { stable: StyleEntry; pulse: StyleEntry }
> = {
  low: { stable: styles.timerLowStable, pulse: styles.timerLowPulse },
  medium: {
    stable: styles.timerMediumStable,
    pulse: styles.timerMediumPulse,
  },
  high: { stable: styles.timerHighStable, pulse: styles.timerHighPulse },
};

const PROGRESS_TONES: Record<TimerUrgency, ArcadeProgressTone> = {
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
  const urgencyVariants = TIMER_VARIANTS[timerUrgency];
  const timerStyle = pulseAnimation
    ? urgencyVariants.pulse
    : urgencyVariants.stable;

  return (
    <Card {...styles.container}>
      <div {...styles.headerRow}>
        <div {...styles.infoCard}>
          <div {...styles.centered}>
            <div {...styles.accentLabel}>Question</div>
            <div {...styles.prominentValue}>
              {questionNumber} / {totalQuestions}
            </div>
          </div>
        </div>

        <div {...timerStyle}>
          <span {...styles.timerIcon}>⏱️</span>
          <div {...styles.centered}>
            <div {...styles.timerValue}>{timeLeft}</div>
            <div {...styles.timerSubLabel}>seconds</div>
          </div>
        </div>

        {!showResult && typeof totalAnswers === "number" && (
          <div {...styles.answeredCard}>
            <div {...styles.centered}>
              <div {...styles.answeredLabel}>Answered</div>
              <div {...styles.prominentValue}>{totalAnswers}</div>
            </div>
          </div>
        )}
      </div>
      <ArcadeProgressBar
        value={progressPercent}
        min={0}
        max={100}
        tone={PROGRESS_TONES[timerUrgency]}
        pulse={timerUrgency === "low"}
        trackSlot={styles.progressTrack}
      >
        <div {...styles.progressGlow} />
      </ArcadeProgressBar>
    </Card>
  );
}
