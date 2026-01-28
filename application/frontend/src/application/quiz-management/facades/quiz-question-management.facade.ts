import { inject, injectable } from 'inversify';
import type { CreateQuizQuestionInput } from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import { QuizQuestionType } from '../../../domains/quiz/entities/quiz-question';
import type { QuestionFormState } from '../../../domains/quiz/entities/quiz-question-form-state';
import type { QuizQuestionValidationErrorCode } from '../../../domains/quiz/errors/quiz-question-validation-error-code';
import {
  MIN_MULTIPLE_ANSWERS,
  QuizQuestionManagementService,
} from '../../../domains/quiz/services/quiz-question-management.service';

@injectable()
export class QuizQuestionManagementFacade {
  constructor(
    @inject(QuizQuestionManagementService)
    private readonly service: QuizQuestionManagementService,
  ) {}

  createDefaultFormState(): QuestionFormState {
    return this.service.createDefaultFormState();
  }

  validateForm(formState: QuestionFormState): QuizQuestionValidationErrorCode | null {
    return this.service.validateForm(formState);
  }

  createFormState(question: QuizQuestion): QuestionFormState {
    return this.service.createFormState(question);
  }

  createPayload(
    formState: QuestionFormState,
    quizId: number,
    fallbackPosition: number,
  ): CreateQuizQuestionInput {
    return this.service.createPayload(formState, quizId, fallbackPosition);
  }

  isMultipleChoice(formState: QuestionFormState): boolean {
    return this.service.isMultipleChoice(formState);
  }

  canRemoveAnswer(formState: QuestionFormState): boolean {
    return this.service.canRemoveAnswer(formState);
  }

  changeType(
    formState: QuestionFormState,
    value: string,
    trueFalseAnswers: readonly string[],
  ): QuestionFormState {
    return this.service.changeType(formState, value, trueFalseAnswers);
  }

  addAnswer(formState: QuestionFormState): QuestionFormState {
    return this.service.addAnswer(formState);
  }

  removeAnswer(formState: QuestionFormState, index: number): QuestionFormState {
    return this.service.removeAnswer(formState, index);
  }

  updateAnswer(formState: QuestionFormState, index: number, value: string): QuestionFormState {
    return this.service.updateAnswer(formState, index, value);
  }

  toggleCorrectAnswer(formState: QuestionFormState, index: number): QuestionFormState {
    return this.service.toggleCorrectAnswer(formState, index);
  }
}

export { MIN_MULTIPLE_ANSWERS, QuizQuestionType };
