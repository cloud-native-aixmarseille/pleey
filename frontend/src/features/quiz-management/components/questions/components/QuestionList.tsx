import type { Question } from "../../../../../shared/types";
import { QuestionCard } from "./QuestionCard";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("QuestionList", {
  slot1: "space-y-4",
});


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
    <div {...styles.slot1}>
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
