import type { Question } from "../../../../../shared/types";
import { QuestionCard } from "./QuestionCard";

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
    <div className="space-y-4">
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
