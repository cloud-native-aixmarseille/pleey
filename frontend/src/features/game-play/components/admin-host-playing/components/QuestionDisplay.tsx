import { Card } from "../../../../../shared/components";
import { Question } from "../../../../../shared/types";

interface QuestionDisplayProps {
  question: Question;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const questionTypeLabel =
    question.type === "multiple" ? "📋 Multiple Choice" : "✓/✗ True or False";

  return (
    <Card className="p-10 sm:p-16 mb-6 sm:mb-8 text-center animate-scale-in bg-gradient-to-br from-white to-light-100 border-4 border-accent-500/50 shadow-neon-accent">
      <div className="mb-6">
        <div className="inline-block glass-effect rounded-xl px-6 py-2 border-2 border-primary-500/30 mb-4">
          <p className="font-display text-primary-600 text-sm sm:text-base uppercase tracking-wider">
            {questionTypeLabel}
          </p>
        </div>
      </div>
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-dark-900 leading-tight font-display uppercase">
        {question.question_text}
      </h2>
    </Card>
  );
}
