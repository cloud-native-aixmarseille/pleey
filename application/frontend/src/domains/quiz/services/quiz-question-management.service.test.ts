import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../entities/quiz-question';
import { QuizQuestionType } from '../entities/quiz-question';
import type { QuestionFormState } from '../entities/quiz-question-form-state';
import { QuizQuestionValidationErrorCode } from '../errors/quiz-question-validation-error-code';
import { QuizQuestionManagementService } from './quiz-question-management.service';

describe('QuizQuestionManagementService', () => {
  const quizQuestionManagementService = new QuizQuestionManagementService();
  const validMultipleChoice: QuestionFormState = {
    questionText: 'What is 2+2?',
    type: QuizQuestionType.MULTIPLE,
    answers: ['Three', 'Four', 'Five', ''],
    correctAnswers: [1],
    timeLimit: '30',
    points: '100',
  };

  describe('validateForm', () => {
    it('accepts a valid multiple-choice form', () => {
      expect(quizQuestionManagementService.validateForm(validMultipleChoice)).toBeNull();
    });

    it('rejects invalid numeric inputs', () => {
      expect(
        quizQuestionManagementService.validateForm({
          ...validMultipleChoice,
          timeLimit: 'nope',
        }),
      ).toBe(QuizQuestionValidationErrorCode.TIME_LIMIT_POSITIVE);

      expect(
        quizQuestionManagementService.validateForm({
          ...validMultipleChoice,
          points: 'nope',
        }),
      ).toBe(QuizQuestionValidationErrorCode.POINTS_NON_NEGATIVE);
    });

    it('rejects invalid answers and correct-answer selections', () => {
      expect(
        quizQuestionManagementService.validateForm({
          ...validMultipleChoice,
          answers: ['Only one', ''],
        }),
      ).toBe(QuizQuestionValidationErrorCode.ANSWERS_REQUIRED);

      expect(
        quizQuestionManagementService.validateForm({
          ...validMultipleChoice,
          correctAnswers: [],
        }),
      ).toBe(QuizQuestionValidationErrorCode.CORRECT_ANSWER_REQUIRED);
    });
  });

  describe('createFormState', () => {
    it('maps a question to form state', () => {
      const question: QuizQuestion = {
        id: 1,
        quizId: 10,
        position: 1,
        questionText: 'Capital of France?',
        type: QuizQuestionType.MULTIPLE,
        answers: [
          { id: 1, text: 'London', position: 1, isCorrect: false },
          { id: 2, text: 'Paris', position: 2, isCorrect: true },
        ],
        timeLimit: 20,
        points: 50,
      };

      expect(quizQuestionManagementService.createFormState(question)).toEqual({
        questionText: 'Capital of France?',
        type: QuizQuestionType.MULTIPLE,
        answers: ['London', 'Paris'],
        correctAnswers: [1],
        timeLimit: '20',
        points: '50',
      });
    });
  });

  describe('createPayload', () => {
    it('builds a payload from form state', () => {
      const result = quizQuestionManagementService.createPayload(validMultipleChoice, 5, 3);

      expect(result.quizId).toBe(5);
      expect(result.position).toBe(3);
      expect(result.questionText).toBe('What is 2+2?');
      expect(result.answers[1]).toEqual({
        text: 'Four',
        position: 2,
        isCorrect: true,
      });
    });
  });

  describe('form transitions', () => {
    it('updates answer collections and correct answers', () => {
      const added = quizQuestionManagementService.addAnswer(validMultipleChoice);
      expect(added.answers).toHaveLength(5);

      const removed = quizQuestionManagementService.removeAnswer(
        {
          ...validMultipleChoice,
          answers: ['First', 'Second', 'Third'],
          correctAnswers: [2],
        },
        0,
      );

      expect(removed.answers).toEqual(['Second', 'Third']);
      expect(removed.correctAnswers).toEqual([1]);
    });

    it('enforces true-false and multiple-choice correct-answer rules', () => {
      expect(
        quizQuestionManagementService.toggleCorrectAnswer(
          {
            ...validMultipleChoice,
            type: QuizQuestionType.TRUE_FALSE,
            answers: ['True', 'False'],
            correctAnswers: [0],
          },
          1,
        ).correctAnswers,
      ).toEqual([1]);

      expect(
        quizQuestionManagementService.toggleCorrectAnswer(validMultipleChoice, 0).correctAnswers,
      ).toEqual([1, 0]);
    });
  });
});
