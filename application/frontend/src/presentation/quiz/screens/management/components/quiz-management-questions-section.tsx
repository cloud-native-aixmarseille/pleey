import { Button } from '../../../../shared/ui/actions/button';
import { SectionCard } from '../../../../shared/ui/layout/section-card';
import { SupportingText } from '../../../../shared/ui/layout/typography';

interface QuizManagementQuestionsSectionProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly createQuestionLabel: string;
  readonly onCreateQuestion: () => void;
}

export function QuizManagementQuestionsSection({
  eyebrow,
  title,
  description,
  summary,
  createQuestionLabel,
  onCreateQuestion,
}: QuizManagementQuestionsSectionProps) {
  return (
    <SectionCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={<Button onClick={onCreateQuestion}>{createQuestionLabel}</Button>}
    >
      <SupportingText tone="soft">{summary}</SupportingText>
    </SectionCard>
  );
}
