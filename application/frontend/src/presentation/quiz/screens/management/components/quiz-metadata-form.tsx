import { type FormEvent, useEffect, useState } from 'react';
import { QuizMetadataFormFacade } from '../../../../../application/quiz-management/facades/quiz-metadata-form.facade';
import type { Quiz } from '../../../../../domains/quiz/entities/quiz';
import type { UpdateQuizInput } from '../../../../../domains/quiz/entities/quiz-management-input';
import { useRuntimeDependency } from '../../../../shared/di/use-runtime-dependency';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { FormRoot } from '../../../../shared/ui/forms/frames';
import { Input } from '../../../../shared/ui/forms/input';
import { Textarea } from '../../../../shared/ui/forms/textarea';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../shared/ui/layout/section-card';

interface QuizMetadataFormProps {
  readonly quiz: Quiz;
  readonly onSave: (quizId: number, input: UpdateQuizInput) => Promise<Quiz>;
  readonly onSaved: (updatedQuiz: Quiz) => void;
}

export function QuizMetadataForm({ quiz, onSave, onSaved }: QuizMetadataFormProps) {
  const { t } = usePresentationTranslation();
  const quizMetadataFormFacade = useRuntimeDependency(QuizMetadataFormFacade);
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle(quiz.title);
    setDescription(quiz.description ?? '');
  }, [quiz.id, quiz.title, quiz.description]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = quizMetadataFormFacade.validateTitle(title);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const updatedQuiz = await onSave(
        quiz.id,
        quizMetadataFormFacade.createUpdateInput(title, description) as UpdateQuizInput,
      );

      setTitle(updatedQuiz.title);
      setDescription(updatedQuiz.description ?? '');
      setSuccessMessage('quiz.success.metadataUpdated');
      onSaved(updatedQuiz);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'quiz.errors.updateFailed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard
      eyebrow={t('quiz.management.eyebrow')}
      title={t('quiz.management.metadataTitle')}
      description={t('quiz.management.metadataDescription')}
    >
      <FormRoot noValidate onSubmit={handleSubmit}>
        <ContentStack gap="sm">
          <FieldShell id="quiz-metadata-title" label={t('quiz.management.titleLabel')} required>
            <Input
              id="quiz-metadata-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSaving}
            />
          </FieldShell>

          <FieldShell id="quiz-metadata-description" label={t('quiz.management.descriptionLabel')}>
            <Textarea
              id="quiz-metadata-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSaving}
            />
          </FieldShell>

          <StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>
          <StatusBanner tone="success">{successMessage ? t(successMessage) : null}</StatusBanner>

          <Button disabled={isSaving} type="submit">
            {isSaving
              ? t('quiz.management.savingMetadataAction')
              : t('quiz.management.saveMetadataAction')}
          </Button>
        </ContentStack>
      </FormRoot>
    </SectionCard>
  );
}
