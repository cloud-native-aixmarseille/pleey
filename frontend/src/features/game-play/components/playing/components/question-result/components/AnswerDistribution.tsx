import type {
  AnswerResult,
  AnswerStatistics,
  Question,
} from "../../../../../../../shared/types";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

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
      className="mb-8 glass-effect rounded-2xl p-6 border-2 border-white/30 animate-fade-in"
      style={{ animationDelay: "0.3s" }}
    >
      <h4 className="text-xl font-bold mb-4 text-center font-display uppercase">
        {t("game.playing.result.distributionTitle")}
      </h4>

      <div
        className="space-y-3"
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

      <p className="text-center text-sm mt-4 text-white/80 font-mono">
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
    <div className="relative" role="listitem">
      <div className="flex items-center justify-between mb-1 text-sm font-mono">
        <span className="font-bold">
          {label}
          {isCorrectAnswer && " ✓"}
          {isUserAnswer && " ✗"}
        </span>
        <span className="font-black">{percentage}%</span>
      </div>

      <div
        className="relative h-8 bg-dark-700/50 rounded-full overflow-hidden border border-white/20"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={`h-full bg-gradient-to-r ${getOptionColor(
            option,
            answerResult,
            userAnswer
          )} transition-all duration-1000 flex items-center justify-end px-3`}
          style={{ width: `${percentage}%`, animationDelay: `${index * 0.1}s` }}
          aria-hidden="true"
        >
          {percentage > 10 && (
            <span className="text-white font-black text-sm drop-shadow-lg">
              {count}
            </span>
          )}
        </div>
      </div>
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

function getOptionColor(
  option: AnswerOption,
  answerResult: AnswerResult,
  userAnswer: string | null
) {
  if (option === answerResult.correctAnswer) {
    return "from-success-500 to-accent-500";
  }

  if (option === userAnswer && option !== answerResult.correctAnswer) {
    return "from-danger-500 to-secondary-500";
  }

  return "from-light-300 to-light-400";
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
