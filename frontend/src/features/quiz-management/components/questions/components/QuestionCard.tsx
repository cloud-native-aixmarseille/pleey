import { useTranslation } from "react-i18next";
import { Button, Card } from "../../../../../shared/components";
import type { Question } from "../../../../../shared/types";

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

  return (
    <Card
      className="p-6 animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="glass-effect rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
            <span className="font-black text-primary-600">Q{index + 1}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-dark-800 flex-1">
            {question.question_text}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
            {t("quiz.editQuestion")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(question)}
            aria-label={t("quiz.deleteQuestion")}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          >
            <span className="sr-only">{t("quiz.deleteQuestion")}</span>
          </Button>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
            isMultipleChoice
              ? "bg-primary-100 text-primary-700 border border-primary-300"
              : "bg-secondary-100 text-secondary-700 border border-secondary-300"
          }`}
        >
          {isMultipleChoice
            ? t("quiz.multipleChoiceShort")
            : t("quiz.trueFalseShort")}
        </span>
      </div>

      {isMultipleChoice
        ? renderMultipleChoice(question)
        : renderTrueFalse(question, t)}

      <div className="flex flex-wrap gap-3 text-sm">
        <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
          <span>⏱️</span>
          <span className="font-semibold text-dark-700">
            {question.time_limit}s
          </span>
        </div>
        <div className="glass-effect rounded-lg px-3 py-2 flex items-center gap-2">
          <span>🏆</span>
          <span className="font-semibold text-dark-700">
            {question.points} points
          </span>
        </div>
      </div>
    </Card>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {options.map((option) => (
        <div
          key={option.letter}
          className={`p-3 rounded-xl transition-all ${
            question.correct_answer === option.letter
              ? "bg-success-100 border-2 border-success-500 ring-2 ring-success-200"
              : "bg-light-100 border-2 border-light-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-black text-dark-700">{option.letter}:</span>
            <span className="text-dark-800">{option.text}</span>
            {question.correct_answer === option.letter ? (
              <span className="ml-auto text-success-600">✓</span>
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
    <div className="mb-4">
      <div className="glass-effect rounded-xl p-4 inline-flex items-center gap-2">
        <span className="text-2xl">
          {question.correct_answer === "true" ? "✓" : "✗"}
        </span>
        <span className="font-bold text-dark-800">
          {t("quiz.correctAnswer")}:{" "}
          {question.correct_answer === "true"
            ? t("quiz.trueAnswer")
            : t("quiz.falseAnswer")}
        </span>
      </div>
    </div>
  );
}
