import type { PredictionPrompt } from '../../../../domains/prediction/entities/prediction-prompt';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { EmptyState } from '../../../shared/ui/feedback/state-blocks';
import { ContentStack, WrapRow } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { SectionCard } from '../../../shared/ui/layout/section-card';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';
import { optionLabel, resolveCorrectOptionLabel } from './prediction-prompt-helpers';

interface PredictionPromptListProps {
  readonly prompts: readonly PredictionPrompt[];
  readonly onEdit: (prompt: PredictionPrompt) => void;
  readonly onDelete: (prompt: PredictionPrompt) => void;
}

export function PredictionPromptList({ prompts, onEdit, onDelete }: PredictionPromptListProps) {
  const { t } = usePresentationTranslation();

  return (
    <SectionCard
      eyebrow={t('prediction.management.eyebrow')}
      title={t('prediction.management.promptsTitle')}
      description={t('prediction.management.promptsDescription')}
    >
      {prompts.length === 0 ? (
        <EmptyState>{t('prediction.management.empty')}</EmptyState>
      ) : (
        <ContentStack>
          {prompts.map((prompt) => (
            <InsetPanel key={prompt.id} padding="lg">
              <ContentStack gap="sm">
                <Heading level={3}>{`${prompt.position}. ${prompt.promptText}`}</Heading>
                <SupportingText tone="soft">
                  {`${t('prediction.management.timeLimitLabel')}: ${prompt.timeLimit}`}
                </SupportingText>
                <SupportingText tone="soft">
                  {`${t('prediction.management.pointsLabel')}: ${prompt.points}`}
                </SupportingText>
                <SupportingText tone="soft">
                  {t('prediction.management.correctAnswerSummary', {
                    answer: resolveCorrectOptionLabel(prompt.options),
                  })}
                </SupportingText>
                <ContentStack gap="xs">
                  {prompt.options
                    .slice()
                    .sort((left, right) => left.position - right.position)
                    .map((option) => (
                      <SupportingText key={option.id}>
                        {`${optionLabel(option.position)}. ${option.text ?? ''}`}
                        {option.isCorrect
                          ? ` (${t('prediction.management.correctOptionBadge')})`
                          : ''}
                      </SupportingText>
                    ))}
                </ContentStack>
                <WrapRow gap="sm">
                  <Button intent="outline" onClick={() => onEdit(prompt)}>
                    {t('prediction.management.editAction')}
                  </Button>
                  <Button intent="ghost" onClick={() => void onDelete(prompt)}>
                    {t('prediction.management.deleteAction')}
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
