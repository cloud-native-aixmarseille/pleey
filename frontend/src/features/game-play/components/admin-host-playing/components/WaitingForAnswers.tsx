import { Question } from "../../../../../shared/types";
import { ANSWER_OPTION_KEYS, AnswerOptionKey } from "../constants";
import { createStyles, type StyleEntry } from "../../../../../shared/ui/styles";

const OPTION_CARD_BASE_CLASSES =
  "text-white p-8 sm:p-10 rounded-3xl shadow-float border-4 animate-scale-in transition-transform duration-300";

const styles = createStyles("WaitingForAnswers", {
  headerContainer: "text-center mb-6",
  headerTitle:
    "font-display text-accent-500 text-xl sm:text-2xl uppercase tracking-wider animate-pulse-slow",
  optionGrid: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-80",
  optionContent: "flex items-center gap-4 sm:gap-6",
  optionLetterWrapper:
    "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0",
  optionLetter: "text-5xl sm:text-6xl font-black",
  optionTextWrapper: "flex-1 text-left",
  optionText: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight",
  resultCardTrue:
    "bg-gradient-to-br from-success-500 to-accent-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in",
  resultCardFalse:
    "bg-gradient-to-br from-danger-500 to-secondary-500 text-white p-12 sm:p-16 rounded-3xl shadow-float border-4 border-white/30 animate-scale-in animation-delay-100",
  resultIcon: "text-8xl sm:text-9xl mb-6 text-center",
  resultLabel:
    "text-4xl sm:text-5xl font-black text-center font-display uppercase",
  optionVariantA: `${OPTION_CARD_BASE_CLASSES} bg-danger-500 border-danger-300 hover:bg-danger-400 shadow-[0_0_20px_rgba(255,0,0,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  optionVariantB: `${OPTION_CARD_BASE_CLASSES} bg-primary-500 border-primary-300 hover:bg-primary-400 shadow-[0_0_20px_rgba(107,72,255,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  optionVariantC: `${OPTION_CARD_BASE_CLASSES} bg-secondary-500 border-secondary-300 hover:bg-secondary-400 shadow-[0_0_20px_rgba(255,51,198,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  optionVariantD: `${OPTION_CARD_BASE_CLASSES} bg-accent-500 border-accent-300 hover:bg-accent-400 shadow-[0_0_20px_rgba(0,255,204,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
});

const OPTION_VARIANTS: Record<AnswerOptionKey, StyleEntry> = {
  A: styles.optionVariantA,
  B: styles.optionVariantB,
  C: styles.optionVariantC,
  D: styles.optionVariantD,
};

interface WaitingForAnswersProps {
  question: Question;
}

export function WaitingForAnswers({ question }: WaitingForAnswersProps) {
  if (question.type === "multiple") {
    const optionTextMap: Record<AnswerOptionKey, string | null | undefined> = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };

    return (
      <div>
        <div {...styles.headerContainer}>
          <p {...styles.headerTitle}>⏳ Waiting for players to answer...</p>
        </div>

        <div {...styles.optionGrid}>
          {ANSWER_OPTION_KEYS.map((optionKey, index) => {
            const optionText = optionTextMap[optionKey];
            return (
              <div
                key={optionKey}
                {...OPTION_VARIANTS[optionKey]}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div {...styles.optionContent}>
                  <div {...styles.optionLetterWrapper}>
                    <span {...styles.optionLetter}>{optionKey}</span>
                  </div>
                  <div {...styles.optionTextWrapper}>
                    <div {...styles.optionText}>{optionText ?? ""}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div {...styles.headerContainer}>
        <p {...styles.headerTitle}>⏳ Waiting for players to answer...</p>
      </div>

      <div {...styles.optionGrid}>
        <div {...styles.resultCardTrue}>
          <div {...styles.resultIcon}>✓</div>
          <div {...styles.resultLabel}>VRAI</div>
        </div>
        <div {...styles.resultCardFalse}>
          <div {...styles.resultIcon}>✗</div>
          <div {...styles.resultLabel}>FAUX</div>
        </div>
      </div>
    </div>
  );
}
