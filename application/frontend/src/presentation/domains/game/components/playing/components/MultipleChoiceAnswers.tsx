import {
  ArcadeCardGrid,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import { composeClasses } from "../../../../../shared/utils/composeClasses";

const OPTION_WRAPPER_BASE_CLASSES = composeClasses(
  "relative rounded-3xl border-2 border-transparent shadow-float transition-all duration-300",
  "animate-scale-in"
);

const OPTION_WRAPPER_TONE_CLASS_MAP: Record<string, string> = {
  A: "bg-danger-200/90 hover:bg-danger-300 border-danger-400 dark:bg-danger-500/95 dark:hover:bg-danger-400 dark:border-danger-300",
  B: "bg-primary-200/90 hover:bg-primary-300 border-primary-400 dark:bg-primary-500/95 dark:hover:bg-primary-400 dark:border-primary-300",
  C: "bg-secondary-200/90 hover:bg-secondary-300 border-secondary-400 dark:bg-secondary-500/95 dark:hover:bg-secondary-400 dark:border-secondary-300",
  D: "bg-accent-200/90 hover:bg-accent-300 border-accent-400 dark:bg-accent-500/95 dark:hover:bg-accent-400 dark:border-accent-300",
};

const SELECTED_CLASSES =
  "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent";

interface MultipleChoiceAnswersProps {
  options: Array<{
    id: number;
    label: string;
    text: string;
  }>;
  userAnswer: number | null;
  answerSubmitted: boolean;
  onSubmit: (answerId: number) => void;
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
        <div
          key={option.id}
          className={composeClasses(
            OPTION_WRAPPER_BASE_CLASSES,
            OPTION_WRAPPER_TONE_CLASS_MAP[option.label] ??
              OPTION_WRAPPER_TONE_CLASS_MAP.D,
            userAnswer === option.id ? SELECTED_CLASSES : undefined,
            answerSubmitted ? "cursor-not-allowed opacity-60" : undefined
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {(() => {
            return (
              <SecondaryButton
                type="button"
                onClick={() => onSubmit(option.id)}
                disabled={answerSubmitted}
                fullWidth
                size="xl"
                alignment="start"
                effect="flat"
                aria-pressed={userAnswer === option.id}
              >
                {option.text}
              </SecondaryButton>
            );
          })()}
        </div>
      ))}
    </ArcadeCardGrid>
  );
}
