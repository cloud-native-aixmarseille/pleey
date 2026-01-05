import { ArcadeProgressBar, Button } from "../../../../../shared/components";
import { AnswerResult, Question } from "../../../../../shared/types";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ANSWER_OPTION_KEYS,
  MIN_DISPLAY_PERCENTAGE,
  AnswerOptionKey,
} from "../constants";
import type { ArcadeProgressTone } from "../../../../../shared/ui/components/ArcadeProgressBar";

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
const PROGRESS_TRACK_CLASSES =
  "relative h-12 overflow-hidden rounded-2xl border-2 border-white/30 bg-dark-700/60 sm:h-16";
const PROGRESS_FILL_CLASSES = "px-4 sm:px-6";
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
  const { t } = useTranslation();
  const statistics = answerResult.statistics;
  const totalResponses = statistics?.totalAnswers ?? 0;
  const distribution: Partial<Record<DistributionKey, number>> =
    statistics?.answerDistribution ?? {};

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
                {answerResult.correctAnswer}
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
              {question.type === "multiple"
                ? ANSWER_OPTION_KEYS.map((optionKey, index) => {
                    const optionText = getMultipleChoiceText(
                      question,
                      optionKey
                    );
                    const percentage = getPercentage(answerResult, optionKey);
                    const count = distribution[optionKey] || 0;
                    const isCorrect = optionKey === answerResult.correctAnswer;
                    const fallbackLabel = t(
                      "game.hostPlaying.results.fallbackOption",
                      {
                        letter: optionKey,
                      }
                    );
                    const optionLabel = optionText
                      ? t("game.hostPlaying.results.optionLabel", {
                          letter: optionKey,
                          text: optionText,
                        })
                      : fallbackLabel;
                    const ariaLabel = buildProgressAriaLabel({
                      label: optionLabel,
                      percentage,
                      count,
                      total: totalResponses,
                      isCorrect,
                      t,
                    });
                    const tone = resolveProgressTone(isCorrect);

                    return (
                      <div key={optionKey} className={RESPONSE_ROW_CLASSES}>
                        <div className={RESPONSE_HEADER_CLASSES}>
                          <span className={RESPONSE_LABEL_GROUP_CLASSES}>
                            <span className={RESPONSE_OPTION_INDEX_CLASSES}>
                              {optionKey}.
                            </span>
                            <span>{optionText || fallbackLabel}</span>
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
                          aria-label={ariaLabel}
                          className={PROGRESS_TRACK_CLASSES}
                          fillClassName={PROGRESS_FILL_CLASSES}
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
                  })
                : (["true", "false"] as const).map((optionKey, index) => {
                    const label =
                      optionKey === "true"
                        ? t("game.playing.trueFalse.trueWord")
                        : t("game.playing.trueFalse.falseWord");
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
                      t,
                    });
                    const tone = resolveProgressTone(isCorrect);

                    return (
                      <div key={optionKey} className={RESPONSE_ROW_CLASSES}>
                        <div className={RESPONSE_HEADER_CLASSES}>
                          <span className={TRUE_FALSE_LABEL_CLASSES}>
                            <span>{icon}</span>
                            <span>{label}</span>
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
                          aria-label={ariaLabel}
                          className={PROGRESS_TRACK_CLASSES}
                          fillClassName={PROGRESS_FILL_CLASSES}
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
          <Button
            variant="accent"
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
          </Button>
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
