import { createStyles, type StyleEntry } from "../../../../../shared/ui/styles";

const OPTION_BASE_CLASSES =
  "text-white p-6 sm:p-8 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed animate-scale-in";

const styles = createStyles("MultipleChoiceAnswers", {
  slot1: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
  slot2: "flex items-center gap-4",
  slot3:
    "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center",
  slot4: "text-3xl sm:text-4xl font-black",
  slot5: "flex-1 text-left",
  slot6: "text-xl sm:text-2xl font-bold",
  optionVariantA: `${OPTION_BASE_CLASSES} bg-danger-500 border-4 border-danger-300 hover:bg-danger-400`,
  optionVariantB: `${OPTION_BASE_CLASSES} bg-primary-500 border-4 border-primary-300 hover:bg-primary-400`,
  optionVariantC: `${OPTION_BASE_CLASSES} bg-secondary-500 border-4 border-secondary-300 hover:bg-secondary-400`,
  optionVariantD: `${OPTION_BASE_CLASSES} bg-accent-500 border-4 border-accent-300 hover:bg-accent-400`,
});

const OPTION_VARIANTS: Record<string, StyleEntry> = {
  A: styles.optionVariantA,
  B: styles.optionVariantB,
  C: styles.optionVariantC,
  D: styles.optionVariantD,
};

interface MultipleChoiceAnswersProps {
  options: Array<{
    letter: string;
    text: string;
  }>;
  userAnswer: string | null;
  onSubmit: (value: string) => void;
}

export function MultipleChoiceAnswers({
  options,
  userAnswer,
  onSubmit,
}: MultipleChoiceAnswersProps) {
  return (
    <div {...styles.slot1}>
      {options.map((option, index) => (
        <button
          key={option.letter}
          type="button"
          onClick={() => onSubmit(option.letter)}
          disabled={userAnswer !== null}
          {...(OPTION_VARIANTS[option.letter] ?? styles.optionVariantA)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div {...styles.slot2}>
            <div {...styles.slot3}>
              <span {...styles.slot4}>{option.letter}</span>
            </div>
            <div {...styles.slot5}>
              <div {...styles.slot6}>{option.text}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
