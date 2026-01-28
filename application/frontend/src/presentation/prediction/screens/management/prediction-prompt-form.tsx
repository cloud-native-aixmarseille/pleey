import type { Dispatch, SetStateAction } from 'react';
import type { PromptFormState } from '../../../../domains/prediction/entities/prediction-prompt-form-state';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { FieldShell } from '../../../shared/ui/forms/field-shell';
import { FormRoot } from '../../../shared/ui/forms/frames';
import { Input } from '../../../shared/ui/forms/input';
import { Select } from '../../../shared/ui/forms/select';
import { Textarea } from '../../../shared/ui/forms/textarea';
import { ContentStack, ResponsiveGrid, WrapRow } from '../../../shared/ui/layout/containers';
import { SectionCard } from '../../../shared/ui/layout/section-card';
import { optionLabel } from './prediction-prompt-helpers';

interface PredictionPromptFormProps {
  readonly formState: PromptFormState;
  readonly setFormState: Dispatch<SetStateAction<PromptFormState>>;
  readonly editingPromptId: number | null;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onCancelEdit: () => void;
}

export function PredictionPromptForm({
  formState,
  setFormState,
  editingPromptId,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: PredictionPromptFormProps) {
  const { t } = usePresentationTranslation();

  return (
    <SectionCard
      eyebrow={t('prediction.management.eyebrow')}
      title={t('prediction.management.promptsTitle')}
      description={t('prediction.management.promptsDescription')}
    >
      <FormRoot noValidate onSubmit={onSubmit}>
        <ContentStack>
          <FieldShell
            id="prediction-management-prompt-text"
            label={t('prediction.management.promptLabel')}
          >
            <Textarea
              id="prediction-management-prompt-text"
              onChange={(event) => {
                const { value } = event.currentTarget;

                setFormState((current) => ({ ...current, promptText: value }));
              }}
              placeholder={t('prediction.management.promptPlaceholder')}
              value={formState.promptText}
            />
          </FieldShell>

          {formState.options.map((option) => (
            <FieldShell
              key={option.position}
              id={`prediction-management-option-${option.position}`}
              label={t('prediction.management.optionLabel', {
                label: optionLabel(option.position),
              })}
            >
              <Input
                id={`prediction-management-option-${option.position}`}
                onChange={(event) => {
                  const { value } = event.currentTarget;

                  setFormState((current) => ({
                    ...current,
                    options: current.options.map((candidate) =>
                      candidate.position === option.position
                        ? { ...candidate, text: value }
                        : candidate,
                    ),
                  }));
                }}
                value={option.text}
              />
            </FieldShell>
          ))}

          <FieldShell
            id="prediction-management-correct-option"
            label={t('prediction.management.correctOptionLabel')}
          >
            <Select
              id="prediction-management-correct-option"
              onChange={(event) => {
                const nextCorrectOptionPosition = Number.parseInt(event.currentTarget.value, 10);

                setFormState((current) => ({
                  ...current,
                  correctOptionPosition: nextCorrectOptionPosition,
                }));
              }}
              value={String(formState.correctOptionPosition)}
            >
              {formState.options.map((option) => (
                <option key={option.position} value={String(option.position)}>
                  {optionLabel(option.position)}
                </option>
              ))}
            </Select>
          </FieldShell>

          <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
            <FieldShell
              id="prediction-management-time-limit"
              label={t('prediction.management.timeLimitLabel')}
            >
              <Input
                id="prediction-management-time-limit"
                onChange={(event) => {
                  const { value } = event.currentTarget;

                  setFormState((current) => ({ ...current, timeLimit: value }));
                }}
                type="number"
                value={formState.timeLimit}
              />
            </FieldShell>
            <FieldShell
              id="prediction-management-points"
              label={t('prediction.management.pointsLabel')}
            >
              <Input
                id="prediction-management-points"
                onChange={(event) => {
                  const { value } = event.currentTarget;

                  setFormState((current) => ({ ...current, points: value }));
                }}
                type="number"
                value={formState.points}
              />
            </FieldShell>
          </ResponsiveGrid>

          <WrapRow gap="sm">
            <Button disabled={isSubmitting} type="submit">
              {editingPromptId === null
                ? t('prediction.management.createPromptAction')
                : t('prediction.management.updatePromptAction')}
            </Button>
            {editingPromptId !== null ? (
              <Button intent="ghost" onClick={onCancelEdit} type="button">
                {t('prediction.management.cancelEditAction')}
              </Button>
            ) : null}
          </WrapRow>
        </ContentStack>
      </FormRoot>
    </SectionCard>
  );
}
