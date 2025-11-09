import { useTranslation } from "react-i18next";
import { ArcadeBadge, Button, Card } from "../../../../../shared/components";
import type { Question } from "../../../../../shared/types";
import { createStyles } from "../../../../../shared/ui/styles";
import type { ArcadeBadgeTone } from "../../../../../shared/ui/components/ArcadeBadge";

const styles = createStyles("QuestionCard", {
  slot1: "p-6",
  slot2: "flex justify-between items-start mb-4",
  slot3: "flex items-start gap-3 flex-1",
  slot4:
    "glass-effect rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0",
  slot5: "font-black text-primary-600",
  slot6: "text-lg sm:text-xl font-bold text-dark-800 flex-1",
  slot7: "flex items-center gap-2",
  slot9: "sr-only",
  slot10: "flex flex-wrap gap-3 text-sm",
  slot11: "glass-effect rounded-lg px-3 py-2 flex items-center gap-2",
  slot12: "font-semibold text-dark-700",
  slot13: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4",
  slot14: "font-black text-dark-700",
  slot15: "text-dark-800",
  slot16: "ml-auto text-success-600",
  slot17: "mb-4",
  slot18: "glass-effect rounded-xl p-4 inline-flex items-center gap-2",
  slot19: "text-2xl",
  slot20: "font-bold text-dark-800",
  optionCardCorrect:
    "p-3 rounded-xl transition-all border-2 bg-success-100 border-success-500 ring-2 ring-success-200",
  optionCardDefault:
    "p-3 rounded-xl transition-all border-2 bg-light-100 border-light-300",
  cardWrapper: "animate-slide-up",
});

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
    <div {...styles.cardWrapper} style={{ animationDelay: `${index * 0.05}s` }}>
      <Card {...styles.slot1}>
        <div {...styles.slot2}>
          <div {...styles.slot3}>
            <div {...styles.slot4}>
              <span {...styles.slot5}>Q{index + 1}</span>
            </div>
            <h3 {...styles.slot6}>{question.question_text}</h3>
          </div>
          <div {...styles.slot7}>
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
              <span {...styles.slot9}>{t("quiz.deleteQuestion")}</span>
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

        <div {...styles.slot10}>
          <div {...styles.slot11}>
            <span>⏱️</span>
            <span {...styles.slot12}>{question.time_limit}s</span>
          </div>
          <div {...styles.slot11}>
            <span>🏆</span>
            <span {...styles.slot12}>{question.points} points</span>
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

  return (
    <div {...styles.slot13}>
      {options.map((option) => (
        <div
          key={option.letter}
          {...(question.correct_answer === option.letter
            ? styles.optionCardCorrect
            : styles.optionCardDefault)}
        >
          <div {...styles.slot7}>
            <span {...styles.slot14}>{option.letter}:</span>
            <span {...styles.slot15}>{option.text}</span>
            {question.correct_answer === option.letter ? (
              <span {...styles.slot16}>✓</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderTrueFalse(
  question: Question,
  t: ReturnType<typeof useTranslation>["t"]
) {
  return (
    <div {...styles.slot17}>
      <div {...styles.slot18}>
        <span {...styles.slot19}>
          {question.correct_answer === "true" ? "✓" : "✗"}
        </span>
        <span {...styles.slot20}>
          {t("quiz.correctAnswer")}:{" "}
          {question.correct_answer === "true"
            ? t("quiz.trueAnswer")
            : t("quiz.falseAnswer")}
        </span>
      </div>
    </div>
  );
}
