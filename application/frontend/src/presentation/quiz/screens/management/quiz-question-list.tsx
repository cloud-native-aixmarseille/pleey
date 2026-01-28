import {
  type QuizQuestion,
  QuizQuestionType,
} from '../../../../domains/quiz/entities/quiz-question';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { EmptyState } from '../../../shared/ui/feedback/state-blocks';
import { ContentStack, WrapRow } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { SectionCard } from '../../../shared/ui/layout/section-card';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';

interface QuizQuestionListProps {
  readonly title: string;
  readonly description?: string;
  readonly questions: readonly QuizQuestion[];
  readonly onEdit: (question: QuizQuestion) => void;
  readonly onDelete: (question: QuizQuestion) => void;
}

export function QuizQuestionList({
  title,
  description,
  questions,
  onEdit,
  onDelete,
}: QuizQuestionListProps) {
  const { t } = usePresentationTranslation();

  return (
    <SectionCard eyebrow={t('quiz.management.eyebrow')} title={title} description={description}>
      {questions.length === 0 ? (
        <EmptyState>{t('quiz.management.empty')}</EmptyState>
      ) : (
        <ContentStack>
          {questions.map((question) => (
            <InsetPanel key={question.id} padding="lg">
              <ContentStack gap="sm">
                <Heading level={3}>
                  {question.position}. {question.questionText}
                </Heading>
                <SupportingText tone="soft">
                  {question.type === QuizQuestionType.MULTIPLE
                    ? t('quiz.management.typeMultiple')
                    : t('quiz.management.typeTrueFalse')}
                </SupportingText>
                <SupportingText tone="soft">
                  {t('quiz.management.answerCount', { count: String(question.answers.length) })}
                </SupportingText>
                <ContentStack gap="xs">
                  {question.answers.map((answer) => (
                    <SupportingText key={`${question.id}-${answer.position}`}>
                      {answer.position}. {answer.text ?? ''}
                      {answer.isCorrect ? ` • ${t('quiz.management.correctIndicator')}` : ''}
                    </SupportingText>
                  ))}
                </ContentStack>
                <WrapRow gap="sm">
                  <Button intent="outline" onClick={() => onEdit(question)}>
                    {t('quiz.management.editAction')}
                  </Button>
                  <Button intent="ghost" onClick={() => void onDelete(question)}>
                    {t('quiz.management.deleteAction')}
                  </Button>
                </WrapRow>
              </ContentStack>
            </InsetPanel>
          ))}
        </ContentStack>
      )}
    </SectionCard>
  );
}
