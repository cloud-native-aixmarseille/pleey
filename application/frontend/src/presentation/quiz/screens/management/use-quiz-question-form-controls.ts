import type { Dispatch, SetStateAction } from 'react';
import { QuizQuestionManagementFacade } from '../../../../application/quiz-management/facades/quiz-question-management.facade';
import type { QuestionFormState } from '../../../../domains/quiz/entities/quiz-question-form-state';
import { useRuntimeDependency } from '../../../shared/di/use-runtime-dependency';

interface UseQuizQuestionFormControlsParams {
  readonly formState: QuestionFormState;
  readonly setFormState: Dispatch<SetStateAction<QuestionFormState>>;
  readonly trueFalseAnswers: readonly [string, string] | readonly string[];
}

export function useQuizQuestionFormControls({
  formState,
  setFormState,
  trueFalseAnswers,
}: UseQuizQuestionFormControlsParams) {
  const quizQuestionManagementFacade = useRuntimeDependency(QuizQuestionManagementFacade);
  const isMultiple = quizQuestionManagementFacade.isMultipleChoice(formState);
  const canRemoveAnswer = quizQuestionManagementFacade.canRemoveAnswer(formState);

  function handleTypeChange(value: string) {
    setFormState((current) =>
      quizQuestionManagementFacade.changeType(current, value, trueFalseAnswers),
    );
  }

  function handleAddAnswer() {
    setFormState((current) => quizQuestionManagementFacade.addAnswer(current));
  }

  function handleRemoveAnswer(index: number) {
    setFormState((current) => quizQuestionManagementFacade.removeAnswer(current, index));
  }

  function handleAnswerChange(index: number, value: string) {
    setFormState((current) => quizQuestionManagementFacade.updateAnswer(current, index, value));
  }

  function handleToggleCorrectAnswer(index: number) {
    setFormState((current) => quizQuestionManagementFacade.toggleCorrectAnswer(current, index));
  }

  return {
    isMultiple,
    canRemoveAnswer,
    handleTypeChange,
    handleAddAnswer,
    handleRemoveAnswer,
    handleAnswerChange,
    handleToggleCorrectAnswer,
  };
}
