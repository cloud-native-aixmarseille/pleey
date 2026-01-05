import { useTranslation } from "react-i18next";
import { ArcadeBadge, Button, Card } from "../../../../../shared/components";
import type { Question } from "../../../../../shared/types";
import type { ArcadeBadgeTone } from "../../../../../shared/ui/components/ArcadeBadge";

const CARD_WRAPPER_CLASSES = "animate-slide-up";
const CARD_HEADER_CLASSES = "mb-4 flex items-start justify-between gap-3";
const CARD_TITLE_STACK_CLASSES = "flex flex-1 items-start gap-3";
const CARD_INDEX_BADGE_CLASSES =
  "glass-effect flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-primary-500/30";
const CARD_INDEX_TEXT_CLASSES =
  "font-black text-primary-700 dark:text-primary-200";
const CARD_QUESTION_TEXT_CLASSES =
  "flex-1 text-base font-medium text-dark-950 dark:text-light-100 sm:text-lg";
const ACTION_GROUP_CLASSES = "flex items-center gap-2";
const SR_ONLY_TEXT_CLASSES = "sr-only";
const QUESTION_META_LIST_CLASSES =
  "flex flex-wrap gap-3 text-sm text-dark-600 dark:text-light-300";
const QUESTION_META_ITEM_CLASSES =
  "glass-effect flex items-center gap-2 rounded-lg border border-primary-500/20 px-3 py-2 text-dark-600 dark:text-light-300";
const QUESTION_META_VALUE_CLASSES =
  "font-semibold text-dark-950 dark:text-light-100";
const MULTIPLE_OPTIONS_GRID_CLASSES =
  "mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2";
const OPTION_CONTENT_CLASSES = "flex items-center gap-2";
const OPTION_LETTER_CLASSES = "font-black text-primary-200";
const OPTION_TEXT_CLASSES = "text-light-100";
const OPTION_CORRECT_ICON_CLASSES = "ml-auto text-success-300";
const TRUE_FALSE_WRAPPER_CLASSES = "mb-4";
const TRUE_FALSE_CARD_CLASSES =
  "glass-effect inline-flex items-center gap-3 rounded-xl border border-secondary-500/30 bg-dark-600/80 px-4 py-3";
const TRUE_FALSE_ICON_CLASSES = "text-2xl text-secondary-200";
const TRUE_FALSE_TEXT_CLASSES =
  "font-bold text-light-100 drop-shadow-[0_0_12px_rgba(120,210,255,0.35)]";
const OPTION_CARD_CORRECT_CLASSES =
  "rounded-xl border-2 border-success-500/60 bg-success-500/15 p-3 ring-2 ring-success-400/40 transition-all";
const OPTION_CARD_DEFAULT_CLASSES =
  "rounded-xl border-2 border-primary-500/20 bg-dark-600/70 p-3 transition-all";

const TYPE_BADGE_TONES: Record<"multiple" | "truefalse", ArcadeBadgeTone> = {
  multiple: "primary",
  truefalse: "secondary",
};

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const isMultipleChoice = question.type === "multiple";
  const badgeType: keyof typeof TYPE_BADGE_TONES = isMultipleChoice
    ? "multiple"
    : "truefalse";

  return (
    <div
      className={CARD_WRAPPER_CLASSES}
      data-question-card="true"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Card
        surface="glass"
        tone="neutral"
        padding="md"
        border="regular"
        elevation="glow"
      >
        <div className={CARD_HEADER_CLASSES}>
          <div className={CARD_TITLE_STACK_CLASSES}>
            <div className={CARD_INDEX_BADGE_CLASSES}>
              <span className={CARD_INDEX_TEXT_CLASSES}>Q{index + 1}</span>
            </div>
            <h3 className={CARD_QUESTION_TEXT_CLASSES}>
              {question.question_text}
            </h3>
          </div>
          <div className={ACTION_GROUP_CLASSES}>
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              {t("quiz.editQuestion")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(question)}
              aria-label={t("quiz.deleteQuestion")}
              icon={{ name: "Trash2" }}
            >
              <span className={SR_ONLY_TEXT_CLASSES}>
                {t("quiz.deleteQuestion")}
              </span>
            </Button>
          </div>
          <ArcadeBadge tone={TYPE_BADGE_TONES[badgeType]}>
            {isMultipleChoice
              ? t("quiz.multipleChoiceShort")
              : t("quiz.trueFalseShort")}
          </ArcadeBadge>
        </div>

        {isMultipleChoice
          ? renderMultipleChoice(question)
          : renderTrueFalse(question, t)}

        <div className={QUESTION_META_LIST_CLASSES}>
          <div className={QUESTION_META_ITEM_CLASSES}>
            <span aria-hidden="true">⏱️</span>
            <span className={QUESTION_META_VALUE_CLASSES}>
              {question.time_limit}s
            </span>
          </div>
          <div className={QUESTION_META_ITEM_CLASSES}>
            <span aria-hidden="true">🏆</span>
            <span className={QUESTION_META_VALUE_CLASSES}>
              {question.points} points
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function renderMultipleChoice(question: Question) {
  const options = [
    { letter: "A", text: question.option_a },
    { letter: "B", text: question.option_b },
    { letter: "C", text: question.option_c },
    { letter: "D", text: question.option_d },
  ];

  // Support multiple correct answers (e.g., "A,D")
  const correctAnswers = question.correct_answer
    .split(",")
    .map((a) => a.trim());

  return (
    <div className={MULTIPLE_OPTIONS_GRID_CLASSES}>
      {options.map((option) => {
        const isCorrect = correctAnswers.includes(option.letter);
        return (
          <div
            key={option.letter}
            className={
              isCorrect
                ? OPTION_CARD_CORRECT_CLASSES
                : OPTION_CARD_DEFAULT_CLASSES
            }
          >
            <div className={OPTION_CONTENT_CLASSES}>
              <span className={OPTION_LETTER_CLASSES}>{option.letter}:</span>
              <span className={OPTION_TEXT_CLASSES}>{option.text}</span>
              {isCorrect ? (
                <span className={OPTION_CORRECT_ICON_CLASSES}>✓</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderTrueFalse(
  question: Question,
  t: ReturnType<typeof useTranslation>["t"]
) {
  return (
    <div className={TRUE_FALSE_WRAPPER_CLASSES}>
      <div className={TRUE_FALSE_CARD_CLASSES}>
        <span className={TRUE_FALSE_ICON_CLASSES} aria-hidden="true">
          {question.correct_answer === "true" ? "✓" : "✗"}
        </span>
        <span className={TRUE_FALSE_TEXT_CLASSES}>
          {t("quiz.correctAnswer")}:{" "}
          {question.correct_answer === "true"
            ? t("quiz.trueAnswer")
            : t("quiz.falseAnswer")}
        </span>
      </div>
    </div>
  );
}
