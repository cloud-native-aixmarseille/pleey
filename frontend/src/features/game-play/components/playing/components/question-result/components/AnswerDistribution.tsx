import type {
  AnswerResult,
  AnswerStatistics,
  Question,
} from "../../../../../../../shared/types";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { createStyles } from "../../../../../../../shared/ui/styles";
import { ArcadeProgressBar } from "../../../../../../../shared/components";
import type { ArcadeProgressTone } from "../../../../../../../shared/ui/components/ArcadeProgressBar";

const styles = createStyles("AnswerDistribution", {
  slot1:
    "mb-8 glass-effect rounded-2xl p-6 border-2 border-white/30 animate-fade-in",
  slot2: "text-xl font-bold mb-4 text-center font-display uppercase",
  slot3: "space-y-3",
  slot4: "text-center text-sm mt-4 text-white/80 font-mono",
  slot5: "relative",
  slot6: "flex items-center justify-between mb-1 text-sm font-mono",
  slot7: "font-bold",
  slot8: "font-black",
  slot9:
    "relative h-8 bg-dark-700/50 rounded-full overflow-hidden border border-white/20",
  slot10: "text-white font-black text-sm drop-shadow-lg",
});

const PROGRESS_TONES: Record<
  "correct" | "user" | "neutral",
  ArcadeProgressTone
> = {
  correct: "success",
  user: "danger",
  neutral: "neutral",
};

const MULTIPLE_OPTIONS = ["A", "B", "C", "D"] as const;
const BOOLEAN_OPTIONS = ["true", "false"] as const;

type AnswerDistributionKey = keyof AnswerStatistics["answerDistribution"];
type AnswerOption =
  | (typeof MULTIPLE_OPTIONS)[number]
  | (typeof BOOLEAN_OPTIONS)[number];

interface AnswerDistributionProps {
  question: Question;
  answerResult: AnswerResult;
  userAnswer: string | null;
}

export function AnswerDistribution({
  question,
  answerResult,
  userAnswer,
}: AnswerDistributionProps) {
  const { t } = useTranslation();
  const { statistics } = answerResult;

  if (!statistics || statistics.totalAnswers === 0) {
    return null;
  }

  const options: ReadonlyArray<AnswerOption> =
    question.type === "multiple" ? MULTIPLE_OPTIONS : BOOLEAN_OPTIONS;

  return (
    <section {...styles.slot1} style={{ animationDelay: "0.3s" }}>
      <h4 {...styles.slot2}>{t("game.playing.result.distributionTitle")}</h4>

      <div
        {...styles.slot3}
        role="list"
        aria-label={t("game.playing.result.distributionAriaLabel")}
      >
        {options.map((option, index) => (
          <DistributionOption
            key={option}
            option={option}
            index={index}
            question={question}
            answerResult={answerResult}
            userAnswer={userAnswer}
            t={t}
          />
        ))}
      </div>

      <p {...styles.slot4}>
        {t("game.playing.result.distributionCount", {
          count: statistics.totalAnswers,
        })}
      </p>
    </section>
  );
}

type DistributionOptionProps = {
  option: AnswerOption;
  index: number;
  question: Question;
  answerResult: AnswerResult;
  userAnswer: string | null;
  t: TFunction;
};

function DistributionOption({
  option,
  index,
  question,
  answerResult,
  userAnswer,
  t,
}: DistributionOptionProps) {
  const statsKey = option as AnswerDistributionKey;
  const percentage = getPercentage(statsKey, answerResult);
  const count = getCount(statsKey, answerResult);
  const isCorrectAnswer = option === answerResult.correctAnswer;
  const isUserAnswer = option === userAnswer && !isCorrectAnswer;
  const label = getOptionLabel(option, question, t);
  const ariaLabel = buildAriaLabel({
    label,
    percentage,
    count,
    total: answerResult.statistics?.totalAnswers ?? 0,
    isCorrectAnswer,
    isUserAnswer: option === userAnswer,
    t,
  });

  return (
    <div {...styles.slot5} role="listitem">
      <div {...styles.slot6}>
        <span {...styles.slot7}>
          {label}
          {isCorrectAnswer && " ✓"}
          {isUserAnswer && " ✗"}
        </span>
        <span {...styles.slot8}>{percentage}%</span>
      </div>

      <ArcadeProgressBar
        value={percentage}
        max={100}
        tone={resolveOptionTone(option, answerResult, userAnswer)}
        animationDelay={`${index * 0.1}s`}
        aria-label={ariaLabel}
        trackSlot={styles.slot9}
      >
        {percentage > 10 && <span {...styles.slot10}>{count}</span>}
      </ArcadeProgressBar>
    </div>
  );
}

function getPercentage(
  option: AnswerDistributionKey,
  answerResult: AnswerResult
) {
  const { statistics } = answerResult;
  if (!statistics || statistics.totalAnswers === 0) {
    return 0;
  }

  const count = statistics.answerDistribution[option] ?? 0;
  return Math.round((count / statistics.totalAnswers) * 100);
}

function getCount(option: AnswerDistributionKey, answerResult: AnswerResult) {
  return answerResult.statistics?.answerDistribution[option] ?? 0;
}

function getOptionLabel(
  option: AnswerOption,
  question: Question,
  t: TFunction
) {
  if (question.type === "multiple") {
    const key = `option_${option.toLowerCase()}` as
      | "option_a"
      | "option_b"
      | "option_c"
      | "option_d";
    const text = question[key] ?? "";
    return t("game.playing.result.optionLabel", { option, text });
  }

  const booleanKey = option === "true" ? "true" : "false";
  return t(`game.playing.result.booleanLabel.${booleanKey}`);
}

function resolveOptionTone(
  option: AnswerOption,
  answerResult: AnswerResult,
  userAnswer: string | null
): ArcadeProgressTone {
  if (option === answerResult.correctAnswer) {
    return PROGRESS_TONES.correct;
  }

  if (option === userAnswer && option !== answerResult.correctAnswer) {
    return PROGRESS_TONES.user;
  }

  return PROGRESS_TONES.neutral;
}

interface AriaLabelArgs {
  label: string;
  percentage: number;
  count: number;
  total: number;
  isCorrectAnswer: boolean;
  isUserAnswer: boolean;
  t: TFunction;
}

function buildAriaLabel({
  label,
  percentage,
  count,
  total,
  isCorrectAnswer,
  isUserAnswer,
  t,
}: AriaLabelArgs) {
  const parts = [
    `${label}: ${t("game.playing.result.ariaPercent", {
      percent: percentage,
    })}`,
    t("game.playing.result.ariaCount", { count, total }),
  ];

  if (isCorrectAnswer) {
    parts.push(t("game.playing.result.ariaCorrect"));
  }

  if (isUserAnswer) {
    parts.push(t("game.playing.result.ariaUser"));
  }

  return parts.join(", ");
}
