import type { Dispatch, SetStateAction } from 'react';
import { QuizQuestionType } from '../../../../domains/quiz/entities/quiz-question';
import type { QuestionFormState } from '../../../../domains/quiz/entities/quiz-question-form-state';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { FieldShell } from '../../../shared/ui/forms/field-shell';
import { FormRoot } from '../../../shared/ui/forms/frames';
import { Input } from '../../../shared/ui/forms/input';
import { Select } from '../../../shared/ui/forms/select';
import { Textarea } from '../../../shared/ui/forms/textarea';
import { ContentStack, ResponsiveGrid, WrapRow } from '../../../shared/ui/layout/containers';
import { SectionCard } from '../../../shared/ui/layout/section-card';
import { QuizQuestionAnswerFields } from './components/quiz-question-answer-fields';
import { useQuizQuestionFormControls } from './use-quiz-question-form-controls';

interface QuizQuestionFormProps {
  readonly formState: QuestionFormState;
  readonly setFormState: Dispatch<SetStateAction<QuestionFormState>>;
  readonly editingQuestionId: number | null;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onCancelEdit: () => void;
  readonly withinSection?: boolean;
  readonly bare?: boolean;
}

export function QuizQuestionForm({
  formState,
  setFormState,
  editingQuestionId,
  isSubmitting,
  onSubmit,
  onCancelEdit,
  withinSection = true,
  bare = false,
}: QuizQuestionFormProps) {
  const { t } = usePresentationTranslation();
  const trueFalseAnswers = [
    t('quiz.management.trueOption'),
    t('quiz.management.falseOption'),
  ] as const;
  const {
    isMultiple,
    canRemoveAnswer,
    handleTypeChange,
    handleAddAnswer,
    handleRemoveAnswer,
    handleAnswerChange,
    handleToggleCorrectAnswer,
  } = useQuizQuestionFormControls({
    formState,
    setFormState,
    trueFalseAnswers,
  });

  const fieldContent = (
    <ContentStack>
      <FieldShell id="quiz-management-question-text" label={t('quiz.management.questionLabel')}>
        <Textarea
          id="quiz-management-question-text"
          onChange={(event) => {
            const { value } = event.currentTarget;

            setFormState((current) => ({ ...current, questionText: value }));
          }}
          placeholder={t('quiz.management.questionPlaceholder')}
          value={formState.questionText}
        />
      </FieldShell>

      <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="md">
        <FieldShell id="quiz-management-question-type" label={t('quiz.management.typeLabel')}>
          <Select
            id="quiz-management-question-type"
            onChange={(event) => handleTypeChange(event.currentTarget.value)}
            value={formState.type}
          >
            <option value={QuizQuestionType.MULTIPLE}>{t('quiz.management.typeMultiple')}</option>
            <option value={QuizQuestionType.TRUE_FALSE}>
              {t('quiz.management.typeTrueFalse')}
            </option>
          </Select>
        </FieldShell>
        <FieldShell id="quiz-management-time-limit" label={t('quiz.management.timeLimitLabel')}>
          <Input
            id="quiz-management-time-limit"
            onChange={(event) => {
              const { value } = event.currentTarget;

              setFormState((current) => ({ ...current, timeLimit: value }));
            }}
            type="number"
            value={formState.timeLimit}
          />
        </FieldShell>
        <FieldShell id="quiz-management-points" label={t('quiz.management.pointsLabel')}>
          <Input
            id="quiz-management-points"
            onChange={(event) => {
              const { value } = event.currentTarget;

              setFormState((current) => ({ ...current, points: value }));
            }}
            type="number"
            value={formState.points}
          />
        </FieldShell>
      </ResponsiveGrid>

      <fieldset
        aria-label={t('quiz.management.correctAnswerLabel')}
        role={isMultiple ? 'group' : 'radiogroup'}
        style={{ border: 0, margin: 0, padding: 0 }}
      >
        <QuizQuestionAnswerFields
          addAnswerLabel={t('quiz.management.addAnswerAction')}
          answerLabel={(position) =>
            t('quiz.management.answerLabel', { position: String(position) })
          }
          answers={formState.answers}
          canRemoveAnswer={canRemoveAnswer}
          correctAnswers={formState.correctAnswers}
          isMultiple={isMultiple}
          onAddAnswer={handleAddAnswer}
          onAnswerChange={handleAnswerChange}
          onRemoveAnswer={handleRemoveAnswer}
          onToggleCorrectAnswer={handleToggleCorrectAnswer}
          removeAnswerLabel={(position) =>
            t('quiz.management.removeAnswerAction', { position: String(position) })
          }
        />
      </fieldset>

      {!bare && (
        <WrapRow gap="sm">
          <Button disabled={isSubmitting} type="submit">
            {editingQuestionId === null
              ? t('quiz.management.createQuestionAction')
              : t('quiz.management.updateQuestionAction')}
          </Button>
          {editingQuestionId !== null ? (
            <Button intent="ghost" onClick={onCancelEdit}>
              {t('quiz.management.cancelEditAction')}
            </Button>
          ) : null}
        </WrapRow>
      )}
    </ContentStack>
  );

  if (bare) {
    return fieldContent;
  }

  const formContent = (
    <FormRoot noValidate onSubmit={onSubmit}>
      {fieldContent}
    </FormRoot>
  );

  if (!withinSection) {
    return formContent;
  }

  return (
    <SectionCard
      eyebrow={t('quiz.management.eyebrow')}
      title={t('quiz.management.questionsTitle')}
      description={t('quiz.management.questionsDescription')}
    >
      {formContent}
    </SectionCard>
  );
}
