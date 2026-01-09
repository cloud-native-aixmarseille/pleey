import type { Question } from "../../../../../../../domains/quiz/types";
import { ANSWER_OPTION_KEYS, AnswerOptionKey } from "../constants";
import { useTranslation } from "react-i18next";

const WAITING_WRAPPER_CLASSES = "flex flex-col gap-6";
const HEADER_CONTAINER_CLASSES = "mb-6 text-center";
const HEADER_TITLE_CLASSES =
  "font-display text-xl uppercase tracking-wider text-accent-500 animate-pulse-slow sm:text-2xl";
const OPTION_GRID_CLASSES =
  "grid grid-cols-1 gap-4 opacity-80 md:grid-cols-2 sm:gap-6";
const OPTION_CARD_BASE_CLASSES =
  "animate-scale-in rounded-3xl border-4 p-8 text-white shadow-float transition-transform duration-300 sm:p-10";
const OPTION_CONTENT_CLASSES = "flex items-center gap-4 sm:gap-6";
const OPTION_LETTER_WRAPPER_CLASSES =
  "flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm sm:h-24 sm:w-24";
const OPTION_LETTER_CLASSES = "text-5xl font-black sm:text-6xl";
const OPTION_TEXT_WRAPPER_CLASSES = "flex-1 text-left";
const OPTION_TEXT_CLASSES =
  "font-bold leading-tight text-2xl sm:text-3xl md:text-4xl";
const RESULT_CARD_TRUE_CLASSES =
  "animate-scale-in rounded-3xl border-4 border-white/30 bg-gradient-to-br from-success-500 to-accent-500 p-12 text-white shadow-float sm:p-16";
const RESULT_CARD_FALSE_CLASSES =
  "animate-scale-in rounded-3xl border-4 border-white/30 bg-gradient-to-br from-danger-500 to-secondary-500 p-12 text-white shadow-float animation-delay-100 sm:p-16";
const RESULT_ICON_CLASSES = "mb-6 text-center text-8xl sm:text-9xl";
const RESULT_LABEL_CLASSES =
  "font-display text-4xl font-black uppercase text-center sm:text-5xl";

const OPTION_VARIANT_CLASSES: Record<AnswerOptionKey, string> = {
  A: `${OPTION_CARD_BASE_CLASSES} bg-danger-500 border-danger-300 hover:bg-danger-400 shadow-[0_0_20px_rgba(255,0,0,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  B: `${OPTION_CARD_BASE_CLASSES} bg-primary-500 border-primary-300 hover:bg-primary-400 shadow-[0_0_20px_rgba(107,72,255,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  C: `${OPTION_CARD_BASE_CLASSES} bg-secondary-500 border-secondary-300 hover:bg-secondary-400 shadow-[0_0_20px_rgba(255,51,198,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
  D: `${OPTION_CARD_BASE_CLASSES} bg-accent-500 border-accent-300 hover:bg-accent-400 shadow-[0_0_20px_rgba(0,255,204,0.5),4px_4px_0px_rgba(0,0,0,0.8)]`,
};

interface WaitingForAnswersProps {
  question: Question;
}

export function WaitingForAnswers({ question }: WaitingForAnswersProps) {
  const { t } = useTranslation();

  if (question.type === "multiple") {
    const optionTextMap: Record<AnswerOptionKey, string | null | undefined> = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };

    return (
      <div className={WAITING_WRAPPER_CLASSES} data-waiting-for-answers="true">
        <div className={HEADER_CONTAINER_CLASSES}>
          <p className={HEADER_TITLE_CLASSES}>
            {t("game.hostPlaying.waiting.heading")}
          </p>
        </div>

        <div className={OPTION_GRID_CLASSES}>
          {ANSWER_OPTION_KEYS.map((optionKey, index) => {
            const optionText = optionTextMap[optionKey];
            return (
              <div
                key={optionKey}
                className={OPTION_VARIANT_CLASSES[optionKey]}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={OPTION_CONTENT_CLASSES}>
                  <div className={OPTION_LETTER_WRAPPER_CLASSES}>
                    <span className={OPTION_LETTER_CLASSES}>{optionKey}</span>
                  </div>
                  <div className={OPTION_TEXT_WRAPPER_CLASSES}>
                    <div className={OPTION_TEXT_CLASSES}>
                      {optionText ?? ""}
                    </div>
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
    <div className={WAITING_WRAPPER_CLASSES} data-waiting-for-answers="true">
      <div className={HEADER_CONTAINER_CLASSES}>
        <p className={HEADER_TITLE_CLASSES}>
          {t("game.hostPlaying.waiting.heading")}
        </p>
      </div>

      <div className={OPTION_GRID_CLASSES}>
        <div className={RESULT_CARD_TRUE_CLASSES}>
          <div className={RESULT_ICON_CLASSES} aria-hidden>
            ✓
          </div>
          <div className={RESULT_LABEL_CLASSES}>
            {t("game.playing.trueFalse.trueWord")}
          </div>
        </div>
        <div className={RESULT_CARD_FALSE_CLASSES}>
          <div className={RESULT_ICON_CLASSES} aria-hidden>
            ✗
          </div>
          <div className={RESULT_LABEL_CLASSES}>
            {t("game.playing.trueFalse.falseWord")}
          </div>
        </div>
      </div>
    </div>
  );
}
