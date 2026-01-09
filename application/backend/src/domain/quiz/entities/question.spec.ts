import { describe, expect, it } from 'vitest';
import { createQuestionFixture, type QuestionFixtureParams } from '../../../test-utils/fixtures';

const createMultipleChoiceQuestion = (overrides: QuestionFixtureParams = {}) =>
  createQuestionFixture({
    id: 1,
    quizId: 10,
    questionText: 'What is 2+2?',
    type: 'multiple',
    correctAnswer: 'A',
    optionA: '4',
    optionB: '3',
    optionC: '5',
    optionD: '6',
    timeLimit: 30,
    points: 1000,
    ...overrides,
  });

const createTrueFalseQuestion = (overrides: QuestionFixtureParams = {}) =>
  createQuestionFixture({
    id: 1,
    quizId: 10,
    questionText: 'TypeScript is a superset of JavaScript',
    type: 'truefalse',
    correctAnswer: 'True',
    optionA: 'True',
    optionB: 'False',
    optionC: null,
    optionD: null,
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
      expect(question.type).toBe('multiple');
      expect(question.correctAnswer).toBe('A');
      expect(question.optionA).toBe('4');
      expect(question.optionB).toBe('3');
      expect(question.optionC).toBe('5');
      expect(question.optionD).toBe('6');
      expect(question.timeLimit).toBe(30);
      expect(question.points).toBe(1000);
    });

    it('should create a true/false question', () => {
      const question = createTrueFalseQuestion();

      expect(question.type).toBe('truefalse');
      expect(question.correctAnswer).toBe('True');
      expect(question.optionA).toBe('True');
      expect(question.optionB).toBe('False');
      expect(question.optionC).toBeNull();
      expect(question.optionD).toBeNull();
    });
  });

  describe('isAnswerCorrect', () => {
    it('should return true for correct answer', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.isAnswerCorrect('A')).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const question = createMultipleChoiceQuestion();

      expect(question.isAnswerCorrect('B')).toBe(false);
      expect(question.isAnswerCorrect('C')).toBe(false);
      expect(question.isAnswerCorrect('D')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question',
        optionA: 'Answer',
        optionB: 'Wrong',
        optionC: null,
        optionD: null,
      });

      expect(question.isAnswerCorrect('A')).toBe(true);
      expect(question.isAnswerCorrect('a')).toBe(false);
    });

    it('should work with true/false questions', () => {
      const question = createTrueFalseQuestion({ questionText: 'True or false?' });

      expect(question.isAnswerCorrect('True')).toBe(true);
      expect(question.isAnswerCorrect('False')).toBe(false);
    });
  });

  describe('getOptions', () => {
    it('should return all non-null options for multiple choice', () => {
      const question = createMultipleChoiceQuestion();

      const options = question.getOptions();
      expect(options).toEqual(['4', '3', '5', '6']);
      expect(options.length).toBe(4);
    });

    it('should return only non-null options', () => {
      const question = createTrueFalseQuestion({ questionText: 'True or false?' });

      const options = question.getOptions();
      expect(options).toEqual(['True', 'False']);
      expect(options.length).toBe(2);
    });

    it('should handle questions with some null options', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionA: 'Option 1',
        optionB: 'Option 2',
        optionC: 'Option 3',
        optionD: null,
      });

      const options = question.getOptions();
      expect(options).toEqual(['Option 1', 'Option 2', 'Option 3']);
      expect(options.length).toBe(3);
    });

    it('should return empty array when all options are null', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
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
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        correctAnswer: '',
        optionC: null,
        optionD: null,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero time limit', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionC: null,
        optionD: null,
        timeLimit: 0,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative time limit', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionC: null,
        optionD: null,
        timeLimit: -30,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero points', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionC: null,
        optionD: null,
        points: 0,
      });

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative points', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'Question?',
        optionC: null,
        optionD: null,
        points: -1000,
      });

      expect(question.isValid()).toBe(false);
    });
  });
});
