import {
  ArcadeCardGrid,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import { composeClasses } from "../../../../../shared/utils/composeClasses";

const OPTION_BASE_CLASSES = composeClasses(
  "group flex flex-col items-center justify-center rounded-3xl border-2 border-transparent",
  "p-10 text-white shadow-float transition-all duration-300",
  "sm:p-12",
  "hover:-translate-y-1 hover:shadow-float-lg focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-200 focus-visible:ring-offset-dark-900",
  "disabled:cursor-not-allowed disabled:opacity-60 animate-scale-in"
);

const OPTION_VARIANT_MAP = {
  true: "bg-gradient-to-br from-success-500 via-accent-500/90 to-accent-500",
  false:
    "bg-gradient-to-br from-danger-500 via-secondary-500/90 to-secondary-500",
} as const;

const SELECTED_CLASSES =
  "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent";

const ICON_CLASSES = "mb-4 text-7xl sm:text-8xl";
const LABEL_CLASSES = "font-display text-3xl font-black uppercase sm:text-4xl";

interface TrueFalseAnswersProps {
  userAnswer: string | null;
  answerSubmitted: boolean;
  onSubmit: (value: string) => void;
}

export function TrueFalseAnswers({
  userAnswer,
  answerSubmitted,
  onSubmit,
}: TrueFalseAnswersProps) {
  return (
    <ArcadeCardGrid layout="double" bottomSpacing="none" role="group">
      <SecondaryButton
        type="button"
        onClick={() => onSubmit("true")}
        disabled={answerSubmitted}
        effect="flat"
        size="xl"
        className={composeClasses(
          OPTION_BASE_CLASSES,
          OPTION_VARIANT_MAP.true,
          userAnswer === "true" ? SELECTED_CLASSES : undefined
        )}
        aria-pressed={userAnswer === "true"}
      >
        <div className={ICON_CLASSES} aria-hidden="true">
          ✓
        </div>
        <div className={LABEL_CLASSES}>VRAI</div>
      </SecondaryButton>
      <SecondaryButton
        type="button"
        onClick={() => onSubmit("false")}
        disabled={answerSubmitted}
        effect="flat"
        size="xl"
        className={composeClasses(
          OPTION_BASE_CLASSES,
          OPTION_VARIANT_MAP.false,
          userAnswer === "false" ? SELECTED_CLASSES : undefined,
          "animation-delay-100"
        )}
        aria-pressed={userAnswer === "false"}
      >
        <div className={ICON_CLASSES} aria-hidden="true">
          ✗
        </div>
        <div className={LABEL_CLASSES}>FAUX</div>
      </SecondaryButton>
    </ArcadeCardGrid>
  );
}
