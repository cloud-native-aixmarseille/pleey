import type { Question } from "../../../../../shared/types";
import { QuestionCard } from "./QuestionCard";

const QUESTION_LIST_CLASSES = "space-y-4";

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  return (
    <div className={QUESTION_LIST_CLASSES} data-question-list="true">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
