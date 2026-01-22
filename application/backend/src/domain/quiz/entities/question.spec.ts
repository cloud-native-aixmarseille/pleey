import { describe, expect, it } from 'vitest';
import {
  createQuestionFixture,
  type QuestionFixtureParams,
} from '../../../test-utils/fixtures/unit';
import { Question, QuestionType } from './question';
import { QuestionAnswer } from './question-answer';

const createMultipleChoiceQuestion = (overrides: QuestionFixtureParams = {}) =>
  createQuestionFixture({
    id: 1,
    quizId: 10,
    questionText: 'What is 2+2?',
    type: QuestionType.MULTIPLE,
    answers: [
      new QuestionAnswer(11, 10, '4', 0, true),
      new QuestionAnswer(12, 10, '3', 1, false),
      new QuestionAnswer(13, 10, '5', 2, false),
      new QuestionAnswer(14, 10, '6', 3, false),
    ],
    timeLimit: 30,
    points: 1000,
    ...overrides,
  });

const createTrueFalseQuestion = (overrides: QuestionFixtureParams = {}) =>
  createQuestionFixture({
    id: 1,
    quizId: 10,
    questionText: 'TypeScript is a superset of JavaScript',
    type: QuestionType.TRUE_FALSE,
    answers: [
      new QuestionAnswer(21, 10, null, 0, true),
      new QuestionAnswer(22, 10, null, 1, false),
    ],
    timeLimit: 20,
    points: 500,
    ...overrides,
  });

describe('Question', () => {
  describe('constructor', () => {
    it('should create a multiple choice question with all properties', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.id).toBe(1);
      expect(question.quizId).toBe(10);
      expect(question.questionText).toBe('What is 2+2?');
      expect(question.type).toBe(QuestionType.MULTIPLE);
      expect(question.answers).toHaveLength(4);
      expect(question.timeLimit).toBe(30);
      expect(question.points).toBe(1000);
    });

    it('should create a true/false question', () => {
      const question = createTrueFalseQuestion();

      expect(question.type).toBe(QuestionType.TRUE_FALSE);
      expect(question.answers).toHaveLength(2);
    });
  });

  describe('isAnswerCorrect', () => {
    it('should return true for correct answer', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.isAnswerCorrect(11)).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.isAnswerCorrect(12)).toBe(false);
      expect(question.isAnswerCorrect(13)).toBe(false);
      expect(question.isAnswerCorrect(14)).toBe(false);
    });

    it('should return false for non-matching answer id', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question',
        answers: [
          new QuestionAnswer(31, 10, 'Answer', 0, true),
          new QuestionAnswer(32, 10, 'Wrong', 1, false),
        ],
      });

      expect(question.isAnswerCorrect(31)).toBe(true);
      expect(question.isAnswerCorrect(32)).toBe(false);
    });

    it('should work with true/false questions', () => {
      const question = createTrueFalseQuestion({ questionText: 'True or false?' });

      expect(question.isAnswerCorrect(21)).toBe(true);
      expect(question.isAnswerCorrect(22)).toBe(false);
    });
  });

  describe('getOptions', () => {
    it('should return all non-null options for multiple choice', () => {
      const question = createMultipleChoiceQuestion();

      const options = question.getOptions();
      expect(options.map((answer) => answer.position)).toEqual([0, 1, 2, 3]);
      expect(options.length).toBe(4);
    });

    it('should return only non-null options', () => {
      const question = createTrueFalseQuestion({ questionText: 'True or false?' });

      const options = question.getOptions();
      expect(options.map((answer) => answer.position)).toEqual([0, 1]);
      expect(options.length).toBe(2);
    });

    it('should handle questions with some null options', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [
          new QuestionAnswer(41, 10, 'Option 1', 0, true),
          new QuestionAnswer(42, 10, 'Option 2', 1, false),
          new QuestionAnswer(43, 10, 'Option 3', 2, false),
        ],
      });

      const options = question.getOptions();
      expect(options.map((answer) => answer.position)).toEqual([0, 1, 2]);
      expect(options.length).toBe(3);
    });

    it('should return empty array when all options are null', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [],
      });

      const options = question.getOptions();
      expect(options).toEqual([]);
      expect(options.length).toBe(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid question', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.isValid()).toBe(true);
    });

    it('should return false for empty question text', () => {
      const question = createMultipleChoiceQuestion({ questionText: '' });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for whitespace-only question text', () => {
      const question = createMultipleChoiceQuestion({ questionText: '   ' });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for empty correct answer', () => {
      const question = new Question(
        1,
        10,
        1,
        'Question?',
        QuestionType.MULTIPLE,
        [
          new QuestionAnswer(11, 10, '4', 0, false),
          new QuestionAnswer(12, 10, '3', 1, false),
          new QuestionAnswer(13, 10, '5', 2, false),
          new QuestionAnswer(14, 10, '6', 3, false),
        ],
        30,
        1000,
      );

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero time limit', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [new QuestionAnswer(51, 10, 'Option 1', 0, true)],
        timeLimit: 0,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative time limit', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [new QuestionAnswer(61, 10, 'Option 1', 0, true)],
        timeLimit: -30,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero points', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [new QuestionAnswer(71, 10, 'Option 1', 0, true)],
        points: 0,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative points', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        answers: [new QuestionAnswer(81, 10, 'Option 1', 0, true)],
        points: -1000,
      });

      expect(question.isValid()).toBe(false);
    });
  });
});
