import {
  ArcadeProgressBar,
  PrimaryButton,
} from "../../../../../../../presentation/shared/ui/components";
import type { AnswerResult } from "../../../../../../../domains/game/types";
import type { Question } from "../../../../../../../domains/quiz/types";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { MIN_DISPLAY_PERCENTAGE } from "../constants";
import type { ArcadeProgressTone } from "../../../../../../../presentation/shared/ui/components/ArcadeProgressBar";

const RESULTS_WRAPPER_CLASSES =
  "animate-scale-in rounded-[var(--arcade-radius-xl)] border-4 border-accent-400 bg-gradient-to-br from-accent-500 to-primary-600 p-8 text-white shadow-neon-accent sm:p-12";
const RESULTS_CONTENT_CLASSES = "space-y-10";
const RESULTS_HEADER_CLASSES = "space-y-4 text-center";
const RESULTS_ICON_CLASSES =
  "mx-auto text-7xl animate-bounce-slow drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] sm:text-8xl";
const RESULTS_TITLE_CLASSES =
  "font-display text-4xl font-black uppercase tracking-[0.45em] animate-glow sm:text-5xl md:text-6xl";
const CORRECT_ANSWER_BADGE_CLASSES =
  "mx-auto inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 shadow-[0_0_25px_rgba(255,255,255,0.12)]";
const CORRECT_ANSWER_TEXT_CLASSES =
  "font-body text-2xl font-semibold sm:text-3xl";
const CORRECT_ANSWER_VALUE_CLASSES = "text-success-200";
const RESPONSES_SECTION_CLASSES =
  "rounded-2xl border-4 border-white/30 bg-dark-900/45 p-8 backdrop-blur-md shadow-[0_0_35px_rgba(15,118,110,0.35)] animate-fade-in";
const RESPONSES_TITLE_CLASSES =
  "mb-6 text-center font-display text-2xl font-black uppercase tracking-[0.35em]";
const RESPONSE_LIST_CLASSES = "space-y-4";
const RESPONSE_ROW_CLASSES = "space-y-2";
const RESPONSE_HEADER_CLASSES =
  "flex items-center justify-between text-lg font-mono sm:text-xl";
const RESPONSE_LABEL_GROUP_CLASSES =
  "flex items-center gap-2 font-display text-xl font-semibold sm:text-2xl";
const RESPONSE_OPTION_INDEX_CLASSES = "text-2xl";
const RESPONSE_CORRECT_ICON_CLASSES = "text-3xl";
const RESPONSE_PERCENTAGE_CLASSES =
  "font-display text-2xl font-black sm:text-3xl";
const PROGRESS_VALUE_TEXT_CLASSES =
  "font-display text-xl font-black drop-shadow-lg sm:text-2xl";
const TRUE_FALSE_LABEL_CLASSES =
  "flex items-center gap-2 font-display text-xl font-semibold uppercase sm:text-2xl";
const TOTAL_WRAPPER_CLASSES = "mt-6 text-center";
const TOTAL_BADGE_CLASSES =
  "inline-flex items-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-body text-xl font-semibold sm:text-2xl";
const CTA_WRAPPER_CLASSES = "mt-8";
const CTA_CONTENT_CLASSES = "flex items-center justify-center gap-4";
const CTA_ICON_CLASSES = "text-3xl sm:text-4xl";

const PROGRESS_TONES: Record<"correct" | "default", ArcadeProgressTone> = {
  correct: "success",
  default: "primary",
};

interface ResultsDisplayProps {
  question: Question;
  answerResult: AnswerResult;
  onNextQuestion: () => void;
}

type DistributionKey = number;

function getPercentage(answerResult: AnswerResult, option: DistributionKey) {
  const { statistics } = answerResult;

  if (!statistics || statistics.totalAnswers === 0) {
    return 0;
  }

  const count = statistics.answerDistribution[option] || 0;
  return Math.round((count / statistics.totalAnswers) * 100);
}

export function ResultsDisplay({
  question,
  answerResult,
  onNextQuestion,
}: ResultsDisplayProps) {
  const { t } = useTranslation();
  const statistics = answerResult.statistics;
  const totalResponses = statistics?.totalAnswers ?? 0;
  const distribution: Partial<Record<DistributionKey, number>> =
    statistics?.answerDistribution ?? {};
  const sortedAnswers = question.answers
    .slice()
    .sort((left, right) => left.position - right.position);
  const correctAnswerLabel = getCorrectAnswerLabel(
    question,
    answerResult.correctAnswerIds,
    t
  );

  return (
    <div className={RESULTS_WRAPPER_CLASSES}>
      <div className={RESULTS_CONTENT_CLASSES}>
        <div className={RESULTS_HEADER_CLASSES}>
          <div className={RESULTS_ICON_CLASSES} aria-hidden>
            🎯
          </div>
          <h3 className={RESULTS_TITLE_CLASSES}>
            {t("game.hostPlaying.results.title")}
          </h3>
          <div className={CORRECT_ANSWER_BADGE_CLASSES}>
            <p className={CORRECT_ANSWER_TEXT_CLASSES}>
              {t("game.hostPlaying.results.correctAnswerLabel")}{" "}
              <span className={CORRECT_ANSWER_VALUE_CLASSES}>
                {correctAnswerLabel}
              </span>
            </p>
          </div>
        </div>

        {statistics && totalResponses > 0 && (
          <div className={RESPONSES_SECTION_CLASSES}>
            <h4 className={RESPONSES_TITLE_CLASSES}>
              {t("game.hostPlaying.results.responsesTitle")}
            </h4>

            <div className={RESPONSE_LIST_CLASSES}>
              {sortedAnswers.map((answer, index) => {
                const percentage = getPercentage(answerResult, answer.id);
                const count = distribution[answer.id] || 0;
                const isCorrect = answerResult.correctAnswerIds.includes(
                  answer.id
                );
                const { label, icon, displayText, ariaLabelText } =
                  buildAnswerDisplay(question, answer, t);
                const ariaLabel = buildProgressAriaLabel({
                  label: ariaLabelText,
                  percentage,
                  count,
                  total: totalResponses,
                  isCorrect,
                  t,
                });
                const tone = resolveProgressTone(isCorrect);

                return (
                  <div key={answer.id} className={RESPONSE_ROW_CLASSES}>
                    <div className={RESPONSE_HEADER_CLASSES}>
                      <span
                        className={
                          question.type === "multiple"
                            ? RESPONSE_LABEL_GROUP_CLASSES
                            : TRUE_FALSE_LABEL_CLASSES
                        }
                      >
                        {label && (
                          <span className={RESPONSE_OPTION_INDEX_CLASSES}>
                            {label}.
                          </span>
                        )}
                        {icon && <span>{icon}</span>}
                        <span>{displayText}</span>
                        {isCorrect && (
                          <span
                            className={RESPONSE_CORRECT_ICON_CLASSES}
                            aria-hidden
                          >
                            ✓
                          </span>
                        )}
                      </span>
                      <span className={RESPONSE_PERCENTAGE_CLASSES}>
                        {t("game.hostPlaying.results.percentage", {
                          percentage,
                        })}
                      </span>
                    </div>
                    <ArcadeProgressBar
                      value={percentage}
                      max={100}
                      tone={tone}
                      animationDelay={`${index * 0.1}s`}
                      ariaLabel={ariaLabel}
                      trackVariant="results"
                      fillPadding="results"
                      size="lg"
                    >
                      {percentage > MIN_DISPLAY_PERCENTAGE && (
                        <span className={PROGRESS_VALUE_TEXT_CLASSES}>
                          {t("game.hostPlaying.results.playerCount", {
                            count,
                          })}
                        </span>
                      )}
                    </ArcadeProgressBar>
                  </div>
                );
              })}
            </div>

            <div className={TOTAL_WRAPPER_CLASSES}>
              <div className={TOTAL_BADGE_CLASSES}>
                {t("game.hostPlaying.results.totalResponses", {
                  count: totalResponses,
                })}
              </div>
            </div>
          </div>
        )}

        <div className={CTA_WRAPPER_CLASSES}>
          <PrimaryButton
            size="xl"
            fullWidth
            effect="retro"
            onClick={onNextQuestion}
          >
            <span className={CTA_CONTENT_CLASSES}>
              <span className={CTA_ICON_CLASSES} aria-hidden>
                ▶
              </span>
              <span>{t("game.hostPlaying.results.nextQuestion")}</span>
              <span className={CTA_ICON_CLASSES} aria-hidden>
                ◀
              </span>
            </span>
          </PrimaryButton>
        </div>
      </div>
    </div>
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
  t: TFunction;
}

function buildProgressAriaLabel({
  label,
  percentage,
  count,
  total,
  isCorrect,
  t,
}: ProgressLabelArgs) {
  const segments = [
    t("game.hostPlaying.results.aria.percent", { label, percentage }),
    t("game.hostPlaying.results.aria.count", { count, total }),
  ];

  if (isCorrect) {
    segments.push(t("game.hostPlaying.results.aria.correct"));
  }

  return segments.join(", ");
}

const MULTIPLE_CHOICE_LABELS = ["A", "B", "C", "D"];

function getCorrectAnswerLabel(
  question: Question,
  correctAnswerIds: number[],
  t: TFunction
) {
  if (correctAnswerIds.length === 0) {
    return "";
  }

  const labels = correctAnswerIds
    .map((answerId) =>
      question.answers.find((candidate) => candidate.id === answerId)
    )
    .filter((answer): answer is NonNullable<typeof answer> => Boolean(answer))
    .map((answer) => {
      if (answer.text && answer.text.trim()) {
        return answer.text;
      }

      if (question.type === "truefalse") {
        return answer.position === 1
          ? t("game.playing.trueFalse.falseWord")
          : t("game.playing.trueFalse.trueWord");
      }

      return (
        MULTIPLE_CHOICE_LABELS[answer.position] ?? `${answer.position + 1}`
      );
    });

  return labels.join(", ");
}

function buildAnswerDisplay(
  question: Question,
  answer: Question["answers"][number],
  t: TFunction
) {
  if (question.type === "truefalse") {
    const isFalse = answer.position === 1;
    const label = isFalse
      ? t("game.playing.trueFalse.falseWord")
      : t("game.playing.trueFalse.trueWord");
    return {
      label: "",
      icon: isFalse ? "✗" : "✓",
      displayText: label,
      ariaLabelText: label,
    };
  }

  const letter =
    MULTIPLE_CHOICE_LABELS[answer.position] ?? `${answer.position + 1}`;
  const fallbackLabel = t("game.hostPlaying.results.fallbackOption", {
    letter,
  });
  const displayText = answer.text?.trim() ? answer.text : fallbackLabel;
  const ariaLabelText = answer.text?.trim()
    ? t("game.hostPlaying.results.optionLabel", {
        letter,
        text: answer.text,
      })
    : fallbackLabel;

  return {
    label: letter,
    icon: "",
    displayText,
    ariaLabelText,
  };
}
