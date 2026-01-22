import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  Card,
  DangerButton,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import type { Question } from "../../../../../../domains/quiz/types";
import type { ArcadeBadgeTone } from "../../../../../../presentation/shared/ui/components/ArcadeBadge";

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
        variant="neutral"
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
              {question.questionText}
            </h3>
          </div>
          <div className={ACTION_GROUP_CLASSES}>
            <SecondaryButton
              size="sm"
              effect="flat"
              onClick={() => onEdit(question)}
            >
              {t("quiz.editQuestion")}
            </SecondaryButton>
            <DangerButton
              size="sm"
              onClick={() => onDelete(question)}
              aria-label={t("quiz.deleteQuestion")}
              icon={{ name: "Trash2" }}
            >
              {""}
            </DangerButton>
          </div>
          <ArcadeBadge variant={TYPE_BADGE_TONES[badgeType]}>
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
              {question.timeLimit}s
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
  const options = [...question.answers]
    .sort((left, right) => left.position - right.position)
    .map((answer) => ({
      letter:
        MULTIPLE_CHOICE_LABELS[answer.position] ?? `${answer.position + 1}`,
      text: answer.text ?? "",
      isCorrect: answer.isCorrect,
    }));

  return (
    <div className={MULTIPLE_OPTIONS_GRID_CLASSES}>
      {options.map((option) => {
        const isCorrect = option.isCorrect;
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
  t: ReturnType<typeof useTranslation>["t"],
) {
  const correctAnswerValue =
    question.answers.find((answer) => answer.isCorrect)?.position ?? 0;

  return (
    <div className={TRUE_FALSE_WRAPPER_CLASSES}>
      <div className={TRUE_FALSE_CARD_CLASSES}>
        <span className={TRUE_FALSE_ICON_CLASSES} aria-hidden="true">
          {correctAnswerValue === 0 ? "✓" : "✗"}
        </span>
        <span className={TRUE_FALSE_TEXT_CLASSES}>
          {t("quiz.correctAnswer")}:{" "}
          {correctAnswerValue === 0
            ? t("quiz.trueAnswer")
            : t("quiz.falseAnswer")}
        </span>
      </div>
    </div>
  );
}

const MULTIPLE_CHOICE_LABELS = ["A", "B", "C", "D"];
