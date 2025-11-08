import { Card } from "../../../../../shared/components";
import { TimerUrgency } from "../constants";

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

function getTimerStyle(timerUrgency: TimerUrgency) {
  switch (timerUrgency) {
    case "low":
      return "bg-danger-500/30 text-danger-400 border-danger-500 animate-pulse shadow-neon-danger";
    case "medium":
      return "bg-secondary-500/30 text-secondary-400 border-secondary-500 shadow-neon-secondary";
    default:
      return "bg-success-500/30 text-success-400 border-success-500 shadow-neon-accent";
  }
}

function getProgressFill(timerUrgency: TimerUrgency) {
  switch (timerUrgency) {
    case "low":
      return "bg-gradient-to-r from-danger-600 to-danger-400 animate-pulse";
    case "medium":
      return "bg-gradient-to-r from-secondary-600 to-secondary-400";
    default:
      return "bg-gradient-to-r from-success-600 to-accent-500";
  }
}

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
  const timerStyle = getTimerStyle(timerUrgency);
  const progressFill = getProgressFill(timerUrgency);

  return (
    <Card className="p-6 sm:p-8 mb-6 sm:mb-8 animate-slide-down border-4 border-primary-500/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-4">
        <div className="glass-effect rounded-2xl px-6 py-4 border-2 border-accent-500/50">
          <div className="text-center">
            <div className="font-display text-accent-500 text-sm mb-1 uppercase tracking-wider">
              Question
            </div>
            <div className="font-display text-white font-bold text-3xl sm:text-4xl">
              {questionNumber} / {totalQuestions}
            </div>
          </div>
        </div>

        <div
          className={`
              flex items-center gap-4 px-8 py-5 rounded-2xl font-black border-4
              ${timerStyle}
              ${pulseAnimation ? "scale-110" : "scale-100"}
              transition-all duration-300
            `}
        >
          <span className="text-5xl sm:text-6xl">⏱️</span>
          <div className="text-center">
            <div className="font-display text-6xl sm:text-7xl tracking-wider">
              {timeLeft}
            </div>
            <div className="font-mono text-sm uppercase tracking-wider opacity-80">
              seconds
            </div>
          </div>
        </div>

        {!showResult && typeof totalAnswers === "number" && (
          <div className="glass-effect rounded-2xl px-6 py-4 border-2 border-primary-500/50">
            <div className="text-center">
              <div className="font-display text-primary-500 text-sm mb-1 uppercase tracking-wider">
                Answered
              </div>
              <div className="font-display text-white font-bold text-3xl sm:text-4xl">
                {totalAnswers}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative w-full bg-dark-700 rounded-full h-8 overflow-hidden border-4 border-dark-600 shadow-inner">
        <div
          className={`
                h-full transition-all duration-1000 relative overflow-hidden
                ${progressFill}
              `}
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float" />
        </div>
      </div>
    </Card>
  );
}
