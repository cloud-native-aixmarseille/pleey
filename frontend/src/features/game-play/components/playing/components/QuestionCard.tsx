import { Card } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("QuestionCard", {
  slot1: "p-8 sm:p-12 mb-6 text-center animate-scale-in bg-gradient-to-br from-white to-light-100",
  slot2: "text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 leading-tight",
});


interface QuestionCardProps {
  questionText: string;
}

export function QuestionCard({ questionText }: QuestionCardProps) {
  return (
    <Card {...styles.slot1}>
      <h2 {...styles.slot2}>
        {questionText}
      </h2>
    </Card>
  );
}
