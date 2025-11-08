import { Card } from "../../../../../shared/components";

interface QuestionCardProps {
  questionText: string;
}

export function QuestionCard({ questionText }: QuestionCardProps) {
  return (
    <Card className="p-8 sm:p-12 mb-6 text-center animate-scale-in bg-gradient-to-br from-white to-light-100">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 leading-tight">
        {questionText}
      </h2>
    </Card>
  );
}
