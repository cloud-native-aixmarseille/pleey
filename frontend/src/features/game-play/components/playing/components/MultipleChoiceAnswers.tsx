import { ArcadeCardGrid } from "../../../../../shared/components";
import { composeClasses } from "../../../../../shared/ui/utils/composeClasses";

const OPTION_BASE_CLASSES = composeClasses(
  "group relative flex items-center gap-4 rounded-3xl border-2 border-transparent",
  "p-6 text-left text-white shadow-float transition-all duration-300",
  "sm:p-8 sm:gap-5",
  "hover:-translate-y-1 hover:shadow-float-lg focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-200 focus-visible:ring-offset-dark-900",
  "disabled:cursor-not-allowed disabled:opacity-60 animate-scale-in"
);

const OPTION_VARIANT_CLASS_MAP: Record<string, string> = {
  A: "bg-danger-500/95 hover:bg-danger-400 border-danger-300",
  B: "bg-primary-500/95 hover:bg-primary-400 border-primary-300",
  C: "bg-secondary-500/95 hover:bg-secondary-400 border-secondary-300",
  D: "bg-accent-500/95 hover:bg-accent-400 border-accent-300",
};

const LETTER_BADGE_BASE_CLASSES = composeClasses(
  "flex h-16 w-16 items-center justify-center rounded-2xl",
  "bg-white/20 backdrop-blur-sm font-display text-3xl font-black",
  "drop-shadow-[0_0_16px_rgba(0,0,0,0.25)]",
  "sm:h-20 sm:w-20 sm:text-4xl"
);

const LETTER_BADGE_TONE_MAP: Record<string, string> = {
  A: "text-white",
  B: "text-white",
  C: "text-dark-900",
  D: "text-dark-900",
};

const SELECTED_CLASSES =
  "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent";

interface MultipleChoiceAnswersProps {
  options: Array<{
    letter: string;
    text: string;
  }>;
  userAnswer: string | null;
  answerSubmitted: boolean;
  onSubmit: (value: string) => void;
}

export function MultipleChoiceAnswers({
  options,
  userAnswer,
  answerSubmitted,
  onSubmit,
}: MultipleChoiceAnswersProps) {
  return (
    <ArcadeCardGrid layout="double" bottomSpacing="none" role="list">
      {options.map((option, index) => (
        <button
          key={option.letter}
          type="button"
          onClick={() => onSubmit(option.letter)}
          disabled={answerSubmitted}
          className={composeClasses(
            OPTION_BASE_CLASSES,
            OPTION_VARIANT_CLASS_MAP[option.letter] ??
              OPTION_VARIANT_CLASS_MAP.D,
            userAnswer === option.letter ? SELECTED_CLASSES : undefined
          )}
          aria-pressed={userAnswer === option.letter}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={composeClasses(
                LETTER_BADGE_BASE_CLASSES,
                LETTER_BADGE_TONE_MAP[option.letter]
              )}
              aria-hidden="true"
            >
              {option.letter}
            </div>
            <div className="flex-1 text-left">
              <div className="font-display text-xl font-bold uppercase tracking-[0.12em] sm:text-2xl">
                {option.text}
              </div>
            </div>
          </div>
        </button>
      ))}
    </ArcadeCardGrid>
  );
}
