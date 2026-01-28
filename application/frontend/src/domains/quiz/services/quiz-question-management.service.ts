import { injectable } from 'inversify';
import type { CreateQuizQuestionInput } from '../entities/quiz-management-input';
import type { QuizQuestion } from '../entities/quiz-question';
import { QuizQuestionType } from '../entities/quiz-question';
import type { QuestionFormState } from '../entities/quiz-question-form-state';
import { QuizQuestionValidationErrorCode } from '../errors/quiz-question-validation-error-code';

export const MIN_MULTIPLE_ANSWERS = 2;

@injectable()
export class QuizQuestionManagementService {
  createDefaultFormState(): QuestionFormState {
    return {
      questionText: '',
      type: QuizQuestionType.MULTIPLE,
      answers: ['', ''],
      correctAnswers: [0],
      timeLimit: '30',
      points: '100',
    };
  }

  validateForm(formState: QuestionFormState): QuizQuestionValidationErrorCode | null {
    if (!formState.questionText.trim()) {
      return QuizQuestionValidationErrorCode.QUESTION_REQUIRED;
    }

    const timeLimit = Number.parseInt(formState.timeLimit, 10);
    if (!Number.isFinite(timeLimit) || timeLimit <= 0) {
      return QuizQuestionValidationErrorCode.TIME_LIMIT_POSITIVE;
    }

    const points = Number.parseInt(formState.points, 10);
    if (!Number.isFinite(points) || points < 0) {
      return QuizQuestionValidationErrorCode.POINTS_NON_NEGATIVE;
    }

    if (formState.type === QuizQuestionType.MULTIPLE) {
      const filledAnswers = formState.answers.filter((answer) => answer.trim().length > 0);

      if (filledAnswers.length < MIN_MULTIPLE_ANSWERS) {
        return QuizQuestionValidationErrorCode.ANSWERS_REQUIRED;
      }
    }

    if (formState.correctAnswers.length === 0) {
      return QuizQuestionValidationErrorCode.CORRECT_ANSWER_REQUIRED;
    }

    const hasInvalidIndex = formState.correctAnswers.some(
      (index) => index < 0 || index >= formState.answers.length,
    );

    if (hasInvalidIndex) {
      return QuizQuestionValidationErrorCode.CORRECT_ANSWER_REQUIRED;
    }

    return null;
  }

  createFormState(question: QuizQuestion): QuestionFormState {
    const sorted = [...question.answers].sort((left, right) => left.position - right.position);
    const correctIndices = sorted
      .map((answer, index) => (answer.isCorrect ? index : -1))
      .filter((index) => index !== -1);

    return {
      questionText: question.questionText,
      type: question.type,
      answers: sorted.map((answer) => answer.text ?? ''),
      correctAnswers: correctIndices.length > 0 ? correctIndices : [0],
      timeLimit: String(question.timeLimit),
      points: String(question.points),
    };
  }

  createPayload(
    formState: QuestionFormState,
    quizId: number,
    fallbackPosition: number,
  ): CreateQuizQuestionInput {
    const timeLimit = Number.parseInt(formState.timeLimit, 10);
    const points = Number.parseInt(formState.points, 10);

    if (formState.type === QuizQuestionType.MULTIPLE) {
      return {
        quizId,
        position: fallbackPosition,
        questionText: formState.questionText.trim(),
        type: QuizQuestionType.MULTIPLE,
        answers: formState.answers.map((text, index) => ({
          text: text.trim() || null,
          position: index + 1,
          isCorrect: formState.correctAnswers.includes(index),
        })),
        timeLimit,
        points,
      };
    }

    return {
      quizId,
      position: fallbackPosition,
      questionText: formState.questionText.trim(),
      type: QuizQuestionType.TRUE_FALSE,
      answers: formState.answers.slice(0, 2).map((text, index) => ({
        text: text.trim() || null,
        position: index + 1,
        isCorrect: formState.correctAnswers.includes(index),
      })),
      timeLimit,
      points,
    };
  }

  isMultipleChoice(formState: QuestionFormState): boolean {
    return formState.type === QuizQuestionType.MULTIPLE;
  }

  canRemoveAnswer(formState: QuestionFormState): boolean {
    return this.isMultipleChoice(formState) && formState.answers.length > MIN_MULTIPLE_ANSWERS;
  }

  changeType(
    formState: QuestionFormState,
    value: string,
    trueFalseAnswers: readonly string[],
  ): QuestionFormState {
    const nextType =
      value === QuizQuestionType.MULTIPLE ? QuizQuestionType.MULTIPLE : QuizQuestionType.TRUE_FALSE;

    return {
      ...formState,
      type: nextType,
      answers:
        nextType === QuizQuestionType.MULTIPLE
          ? formState.answers.length < MIN_MULTIPLE_ANSWERS
            ? ['', '']
            : formState.answers
          : [...trueFalseAnswers],
      correctAnswers: [0],
    };
  }

  addAnswer(formState: QuestionFormState): QuestionFormState {
    return {
      ...formState,
      answers: [...formState.answers, ''],
    };
  }

  removeAnswer(formState: QuestionFormState, index: number): QuestionFormState {
    const nextAnswers = formState.answers.filter((_, answerIndex) => answerIndex !== index);
    const nextCorrect = formState.correctAnswers
      .filter((correctIndex) => correctIndex !== index)
      .map((correctIndex) => (correctIndex > index ? correctIndex - 1 : correctIndex));

    return {
      ...formState,
      answers: nextAnswers,
      correctAnswers: nextCorrect.length > 0 ? nextCorrect : [0],
    };
  }

  updateAnswer(formState: QuestionFormState, index: number, value: string): QuestionFormState {
    return {
      ...formState,
      answers: formState.answers.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    };
  }

  toggleCorrectAnswer(formState: QuestionFormState, index: number): QuestionFormState {
    if (formState.type === QuizQuestionType.TRUE_FALSE) {
      return { ...formState, correctAnswers: [index] };
    }

    const isSelected = formState.correctAnswers.includes(index);

    if (isSelected && formState.correctAnswers.length === 1) {
      return formState;
    }

    const nextCorrectAnswers = isSelected
      ? formState.correctAnswers.filter((correctIndex) => correctIndex !== index)
      : [...formState.correctAnswers, index];

    return { ...formState, correctAnswers: nextCorrectAnswers };
  }
}
