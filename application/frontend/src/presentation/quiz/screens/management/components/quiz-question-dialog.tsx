import type { ComponentProps } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { FormDialog } from '../../../../shared/ui/overlay/form-dialog';
import { QuizQuestionForm } from '../quiz-question-form';

interface QuizQuestionDialogProps extends ComponentProps<typeof QuizQuestionForm> {
  readonly isOpen: boolean;
  readonly title: string;
  readonly errorMessage: string | null;
  readonly onClose: () => void;
}

export function QuizQuestionDialog({
  isOpen,
  title,
  errorMessage,
  onClose,
  editingQuestionId,
  isSubmitting,
  onSubmit,
  ...formProps
}: QuizQuestionDialogProps) {
  const { t } = usePresentationTranslation();

  return (
    <FormDialog
      banner={errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : undefined}
      eyebrow={t('quiz.management.eyebrow')}
      footer={
        <>
          <Button intent="ghost" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button disabled={isSubmitting} intent="primary" type="submit">
            {editingQuestionId === null
              ? t('quiz.management.createQuestionAction')
              : t('quiz.management.updateQuestionAction')}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
      <QuizQuestionForm
        {...formProps}
        bare
        editingQuestionId={editingQuestionId}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </FormDialog>
  );
}
