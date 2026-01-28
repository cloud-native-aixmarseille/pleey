import type { QuestionFormState } from '../../../../../domains/quiz/entities/quiz-question-form-state';
import { Button } from '../../../../shared/ui/actions/button';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
import { ContentStack } from '../../../../shared/ui/layout/containers';

const answerRowStyle = {
  alignItems: 'flex-end',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

const answerToggleLabelStyle = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  gap: uiThemeTokens.spacing.xxs,
  paddingBottom: uiThemeTokens.spacing.xs,
} as const;

const removeButtonWrapStyle = {
  flexShrink: 0,
  paddingBottom: uiThemeTokens.spacing.xxs,
} as const;

interface QuizQuestionAnswerFieldsProps {
  readonly answers: QuestionFormState['answers'];
  readonly correctAnswers: QuestionFormState['correctAnswers'];
  readonly canRemoveAnswer: boolean;
  readonly isMultiple: boolean;
  readonly addAnswerLabel: string;
  readonly removeAnswerLabel: (position: number) => string;
  readonly answerLabel: (position: number) => string;
  readonly onAddAnswer: () => void;
  readonly onRemoveAnswer: (index: number) => void;
  readonly onAnswerChange: (index: number, value: string) => void;
  readonly onToggleCorrectAnswer: (index: number) => void;
}

export function QuizQuestionAnswerFields({
  answers,
  correctAnswers,
  canRemoveAnswer,
  isMultiple,
  addAnswerLabel,
  removeAnswerLabel,
  answerLabel,
  onAddAnswer,
  onRemoveAnswer,
  onAnswerChange,
  onToggleCorrectAnswer,
}: QuizQuestionAnswerFieldsProps) {
  return (
    <ContentStack gap="sm">
      {answers.map((answer, index) => {
        const position = index + 1;
        const fieldId = `quiz-management-answer-${position}`;
        const toggleId = `quiz-management-correct-${position}`;
        const isCorrect = correctAnswers.includes(index);

        return (
          <div key={fieldId} style={answerRowStyle}>
            <label htmlFor={toggleId} style={answerToggleLabelStyle}>
              <input
                checked={isCorrect}
                id={toggleId}
                name={isMultiple ? undefined : 'quiz-management-correct-answer'}
                onChange={() => onToggleCorrectAnswer(index)}
                type={isMultiple ? 'checkbox' : 'radio'}
                value={String(index)}
              />
            </label>
            <div style={{ flex: 1 }}>
              <FieldShell id={fieldId} label={answerLabel(position)}>
                {isMultiple ? (
                  <Input
                    id={fieldId}
                    onChange={(event) => onAnswerChange(index, event.currentTarget.value)}
                    value={answer}
                  />
                ) : (
                  <Input disabled id={fieldId} readOnly value={answer} />
                )}
              </FieldShell>
            </div>
            {canRemoveAnswer ? (
              <div style={removeButtonWrapStyle}>
                <Button
                  aria-label={removeAnswerLabel(position)}
                  intent="ghost"
                  onClick={() => onRemoveAnswer(index)}
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
      {isMultiple ? (
        <Button intent="outline" onClick={onAddAnswer} size="sm">
          {addAnswerLabel}
        </Button>
      ) : null}
    </ContentStack>
  );
}
