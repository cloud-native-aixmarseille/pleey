import { Card } from "../../../../../../presentation/shared/ui/components";

interface QuestionCardProps {
  questionText: string;
}

export function QuestionCard({ questionText }: QuestionCardProps) {
  return (
    <div className="mb-6 animate-scale-in">
      <Card
        surface="glass"
        tone="neutral"
        padding="xl"
        elevation="glow"
        border="regular"
        alignment="center"
      >
        <h2 className="font-display text-3xl font-black leading-tight text-light-100 sm:text-4xl md:text-5xl">
          {questionText}
        </h2>
      </Card>
    </div>
  );
}
