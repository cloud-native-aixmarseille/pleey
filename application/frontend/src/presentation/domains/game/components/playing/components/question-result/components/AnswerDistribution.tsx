import type {
  AnswerResult,
  AnswerStatistics,
} from "../../../../../../../../domains/game/types";
import type { Question } from "../../../../../../../../domains/quiz/types";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  ArcadeProgressBar,
  Card,
} from "../../../../../../../../presentation/shared/ui/components";
import type { ArcadeProgressTone } from "../../../../../../../../presentation/shared/ui/components/ArcadeProgressBar";

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
const PROGRESS_VALUE_CLASSES = "text-sm font-black text-white drop-shadow-lg";

const PROGRESS_TONES: Record<
  "correct" | "user" | "neutral",
  ArcadeProgressTone
> = {
  correct: "success",
  user: "danger",
  neutral: "neutral",
};

type AnswerDistributionKey = keyof AnswerStatistics["answerDistribution"];
type AnswerOption = number;

interface AnswerDistributionProps {
  question: Question;
  answerResult: AnswerResult;
  userAnswer: number | null;
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

  const options = question.answers
    .slice()
    .sort((left, right) => left.position - right.position)
    .map((answer) => answer.id);

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
  userAnswer: number | null;
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
  const isCorrectAnswer = answerResult.correctAnswerIds.includes(option);
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
        ariaLabel={ariaLabel}
        trackVariant="distribution"
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
  const answer = question.answers.find((candidate) => candidate.id === option);
  if (!answer) {
    return "";
  }

  if (question.type === "multiple") {
    const label =
      MULTIPLE_CHOICE_LABELS[answer.position] ?? `${answer.position + 1}`;
    return t("game.playing.result.optionLabel", {
      option: label,
      text: answer.text ?? "",
    });
  }

  const booleanKey = answer.position === 1 ? "false" : "true";
  return t(`game.playing.result.booleanLabel.${booleanKey}`);
}

function resolveOptionTone(
  option: AnswerOption,
  answerResult: AnswerResult,
  userAnswer: number | null
): ArcadeProgressTone {
  if (answerResult.correctAnswerIds.includes(option)) {
    return PROGRESS_TONES.correct;
  }

  if (
    option === userAnswer &&
    !answerResult.correctAnswerIds.includes(option)
  ) {
    return PROGRESS_TONES.user;
  }

  return PROGRESS_TONES.neutral;
}

const MULTIPLE_CHOICE_LABELS = ["A", "B", "C", "D"];

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
