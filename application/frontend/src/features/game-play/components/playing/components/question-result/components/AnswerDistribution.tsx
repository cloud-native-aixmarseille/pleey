import type {
  AnswerResult,
  AnswerStatistics,
  Question,
} from "../../../../../../../shared/types";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  ArcadeProgressBar,
  Card,
} from "../../../../../../../shared/components";
import type { ArcadeProgressTone } from "../../../../../../../shared/ui/components/ArcadeProgressBar";

const DISTRIBUTION_WRAPPER_CLASSES = "mb-8 animate-fade-in";
const DISTRIBUTION_TITLE_CLASSES =
  "mb-4 text-center font-display text-xl font-bold uppercase tracking-[0.24em] text-light-100";
const DISTRIBUTION_LIST_CLASSES = "space-y-3";
const DISTRIBUTION_FOOTER_CLASSES =
  "mt-4 text-center text-sm font-mono text-light-400";
const OPTION_WRAPPER_CLASSES = "relative";
const OPTION_HEADER_CLASSES =
  "mb-1 flex items-center justify-between text-sm font-mono text-light-100";
const OPTION_LABEL_CLASSES = "font-bold";
const OPTION_PERCENTAGE_CLASSES = "font-black";
const PROGRESS_TRACK_CLASSES =
  "relative h-8 overflow-hidden rounded-full border border-white/20 bg-dark-700/50";
const PROGRESS_VALUE_CLASSES = "text-sm font-black text-white drop-shadow-lg";

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
    <section
      className={DISTRIBUTION_WRAPPER_CLASSES}
      data-answer-distribution="true"
      style={{ animationDelay: "0.3s" }}
    >
      <Card
        surface="glass"
        tone="neutral"
        padding="lg"
        elevation="glow"
        border="regular"
      >
        <h4 className={DISTRIBUTION_TITLE_CLASSES}>
          {t("game.playing.result.distributionTitle")}
        </h4>

        <div
          className={DISTRIBUTION_LIST_CLASSES}
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

        <p className={DISTRIBUTION_FOOTER_CLASSES}>
          {t("game.playing.result.distributionCount", {
            count: statistics.totalAnswers,
          })}
        </p>
      </Card>
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
    <div className={OPTION_WRAPPER_CLASSES} role="listitem">
      <div className={OPTION_HEADER_CLASSES}>
        <span className={OPTION_LABEL_CLASSES}>
          {label}
          {isCorrectAnswer && " ✓"}
          {isUserAnswer && " ✗"}
        </span>
        <span className={OPTION_PERCENTAGE_CLASSES}>{percentage}%</span>
      </div>

      <ArcadeProgressBar
        value={percentage}
        max={100}
        tone={resolveOptionTone(option, answerResult, userAnswer)}
        animationDelay={`${index * 0.1}s`}
        aria-label={ariaLabel}
        className={PROGRESS_TRACK_CLASSES}
      >
        {percentage > 10 && (
          <span className={PROGRESS_VALUE_CLASSES}>{count}</span>
        )}
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
