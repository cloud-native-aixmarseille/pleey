import {
  ArcadeProgressBar,
  Button,
  Card,
} from "../../../../../shared/components";
import { AnswerResult, Question } from "../../../../../shared/types";
import {
  ANSWER_OPTION_KEYS,
  MIN_DISPLAY_PERCENTAGE,
  AnswerOptionKey,
} from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";
import type { ArcadeProgressTone } from "../../../../../shared/ui/components/ArcadeProgressBar";

const styles = createStyles("ResultsDisplay", {
  slot1:
    "p-8 sm:p-12 bg-gradient-to-br from-accent-500 to-primary-600 text-white animate-scale-in border-4 border-accent-400",
  slot2: "text-center mb-8",
  slot3: "text-8xl sm:text-9xl mb-4 animate-bounce-slow",
  slot4:
    "text-4xl sm:text-5xl md:text-6xl font-black mb-4 font-display uppercase animate-glow",
  slot5:
    "inline-block glass-effect rounded-2xl px-8 py-4 border-2 border-white/50",
  slot6: "text-3xl sm:text-4xl font-bold font-body",
  slot7: "text-success-200",
  slot8:
    "glass-effect rounded-2xl p-8 border-4 border-white/30 animate-fade-in",
  slot9:
    "text-2xl sm:text-3xl font-bold mb-6 text-center font-display uppercase",
  slot10: "space-y-4",
  slot11: "relative",
  slot12: "flex items-center justify-between mb-2 text-lg sm:text-xl font-mono",
  slot13: "font-bold flex items-center gap-2",
  slot14: "text-2xl",
  slot15: "text-3xl",
  slot16: "font-black text-2xl sm:text-3xl",
  slot17:
    "relative h-12 sm:h-16 bg-dark-700/50 rounded-2xl overflow-hidden border-2 border-white/30",
  slot18: "text-white font-black text-xl sm:text-2xl drop-shadow-lg",
  slot19: "font-bold uppercase flex items-center gap-2",
  slot20: "text-center mt-6",
  slot21:
    "inline-block glass-effect rounded-xl px-6 py-3 border-2 border-white/30",
  slot22: "text-xl sm:text-2xl font-bold font-mono",
  slot23: "mt-8",
  slot24:
    "border-4 border-white text-white hover:bg-white hover:text-dark-900 font-display uppercase text-xl sm:text-2xl py-6 sm:py-8 retro-shadow",
  slot25: "flex items-center justify-center gap-4",
  slot26: "text-3xl sm:text-4xl",
  slot27: "px-4 sm:px-6",
});

const PROGRESS_TONES: Record<"correct" | "default", ArcadeProgressTone> = {
  correct: "success",
  default: "primary",
};

interface ResultsDisplayProps {
  question: Question;
  answerResult: AnswerResult;
  onNextQuestion: () => void;
}

type DistributionKey = AnswerOptionKey | "true" | "false";

function getPercentage(answerResult: AnswerResult, option: DistributionKey) {
  const { statistics } = answerResult;

  if (!statistics || statistics.totalAnswers === 0) {
    return 0;
  }

  const count = statistics.answerDistribution[option] || 0;
  return Math.round((count / statistics.totalAnswers) * 100);
}

function getMultipleChoiceText(
  question: Question,
  option: AnswerOptionKey
): string {
  switch (option) {
    case "A":
      return question.option_a ?? "";
    case "B":
      return question.option_b ?? "";
    case "C":
      return question.option_c ?? "";
    case "D":
      return question.option_d ?? "";
    default:
      return "";
  }
}

export function ResultsDisplay({
  question,
  answerResult,
  onNextQuestion,
}: ResultsDisplayProps) {
  const statistics = answerResult.statistics;
  const totalResponses = statistics?.totalAnswers ?? 0;
  const distribution: Partial<Record<DistributionKey, number>> =
    statistics?.answerDistribution ?? {};

  return (
    <Card {...styles.slot1}>
      <div {...styles.slot2}>
        <div {...styles.slot3}>🎯</div>
        <h3 {...styles.slot4}>RESULTS</h3>
        <div {...styles.slot5}>
          <p {...styles.slot6}>
            Correct Answer:{" "}
            <span {...styles.slot7}>{answerResult.correctAnswer}</span>
          </p>
        </div>
      </div>

      {statistics && totalResponses > 0 && (
        <div {...styles.slot8}>
          <h4 {...styles.slot9}>📊 Player Responses</h4>

          <div {...styles.slot10}>
            {question.type === "multiple"
              ? ANSWER_OPTION_KEYS.map((optionKey, index) => {
                  const optionText = getMultipleChoiceText(question, optionKey);
                  const percentage = getPercentage(answerResult, optionKey);
                  const count = distribution[optionKey] || 0;
                  const isCorrect = optionKey === answerResult.correctAnswer;
                  const optionLabel = optionText
                    ? `${optionKey}. ${optionText}`
                    : `Option ${optionKey}`;
                  const ariaLabel = buildProgressAriaLabel({
                    label: optionLabel,
                    percentage,
                    count,
                    total: totalResponses,
                    isCorrect,
                  });
                  const tone = resolveProgressTone(isCorrect);

                  return (
                    <div key={optionKey} {...styles.slot11}>
                      <div {...styles.slot12}>
                        <span {...styles.slot13}>
                          <span {...styles.slot14}>{optionKey}.</span>
                          <span>{optionText}</span>
                          {isCorrect && <span {...styles.slot15}>✓</span>}
                        </span>
                        <span {...styles.slot16}>{percentage}%</span>
                      </div>
                      <ArcadeProgressBar
                        value={percentage}
                        max={100}
                        tone={tone}
                        animationDelay={`${index * 0.1}s`}
                        aria-label={ariaLabel}
                        trackSlot={styles.slot17}
                        fillSlot={styles.slot27}
                        size="lg"
                      >
                        {percentage > MIN_DISPLAY_PERCENTAGE && (
                          <span {...styles.slot18}>
                            {count} player{count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </ArcadeProgressBar>
                    </div>
                  );
                })
              : (["true", "false"] as const).map((optionKey, index) => {
                  const label = optionKey === "true" ? "VRAI" : "FAUX";
                  const icon = optionKey === "true" ? "✓" : "✗";
                  const percentage = getPercentage(answerResult, optionKey);
                  const count = distribution[optionKey] || 0;
                  const isCorrect = optionKey === answerResult.correctAnswer;
                  const ariaLabel = buildProgressAriaLabel({
                    label,
                    percentage,
                    count,
                    total: totalResponses,
                    isCorrect,
                  });
                  const tone = resolveProgressTone(isCorrect);

                  return (
                    <div key={optionKey} {...styles.slot11}>
                      <div {...styles.slot12}>
                        <span {...styles.slot19}>
                          <span {...styles.slot14}>{icon}</span>
                          <span>{label}</span>
                          {isCorrect && <span {...styles.slot15}>✓</span>}
                        </span>
                        <span {...styles.slot16}>{percentage}%</span>
                      </div>
                      <ArcadeProgressBar
                        value={percentage}
                        max={100}
                        tone={tone}
                        animationDelay={`${index * 0.1}s`}
                        aria-label={ariaLabel}
                        trackSlot={styles.slot17}
                        fillSlot={styles.slot27}
                        size="lg"
                      >
                        {percentage > MIN_DISPLAY_PERCENTAGE && (
                          <span {...styles.slot18}>
                            {count} player{count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </ArcadeProgressBar>
                    </div>
                  );
                })}
          </div>

          <div {...styles.slot20}>
            <div {...styles.slot21}>
              <p {...styles.slot22}>
                Total: {totalResponses}{" "}
                {totalResponses === 1 ? "response" : "responses"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div {...styles.slot23}>
        <Button
          variant="ghost"
          size="xl"
          fullWidth
          onClick={onNextQuestion}
          {...styles.slot24}
        >
          <span {...styles.slot25}>
            <span {...styles.slot26}>▶</span>
            <span>NEXT QUESTION</span>
            <span {...styles.slot26}>◀</span>
          </span>
        </Button>
      </div>
    </Card>
  );
}

function resolveProgressTone(isCorrect: boolean): ArcadeProgressTone {
  return PROGRESS_TONES[isCorrect ? "correct" : "default"];
}

interface ProgressLabelArgs {
  label: string;
  percentage: number;
  count: number;
  total: number;
  isCorrect: boolean;
}

function buildProgressAriaLabel({
  label,
  percentage,
  count,
  total,
  isCorrect,
}: ProgressLabelArgs) {
  const segments = [`${label}: ${percentage}%`, `${count} of ${total} players`];

  if (isCorrect) {
    segments.push("Correct answer");
  }

  return segments.join(", ");
}
