import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("TrueFalseAnswers", {
  slot1: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
  slot2: "bg-gradient-to-br from-success-500 to-accent-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in",
  slot3: "text-7xl sm:text-8xl mb-4",
  slot4: "text-3xl sm:text-4xl font-black",
  slot5: "bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-10 sm:p-12 rounded-3xl shadow-float hover:shadow-float-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60 animate-scale-in animation-delay-100",
});

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
    <div {...styles.slot1}>
      <button
        type="button"
        onClick={() => onSubmit("true")}
        disabled={answerSubmitted}
        {...styles.slot2}
      >
        <div {...styles.slot3}>✓</div>
        <div {...styles.slot4}>VRAI</div>
      </button>
      <button
        type="button"
        onClick={() => onSubmit("false")}
        disabled={answerSubmitted}
        {...styles.slot5}
      >
        <div {...styles.slot3}>✗</div>
        <div {...styles.slot4}>FAUX</div>
      </button>
    </div>
  );
}
