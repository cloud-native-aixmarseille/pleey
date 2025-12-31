import { describe, expect, it } from 'vitest';
import { Question } from './question.entity';

describe('Question Entity', () => {
  describe('constructor', () => {
    it('should create a multiple choice question with all properties', () => {
      const question = new Question(
        1,
        10,
        'What is 2+2?',
        'multiple',
        'A',
        '4',
        '3',
        '5',
        '6',
        30,
        1000,
      );

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
      const question = new Question(
        1,
        10,
        'TypeScript is a superset of JavaScript',
        'truefalse',
        'True',
        'True',
        'False',
        null,
        null,
        20,
        500,
      );

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
      const question = new Question(
        1,
        10,
        'What is 2+2?',
        'multiple',
        'A',
        '4',
        '3',
        '5',
        '6',
        30,
        1000,
      );

      expect(question.isAnswerCorrect('A')).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const question = new Question(
        1,
        10,
        'What is 2+2?',
        'multiple',
        'A',
        '4',
        '3',
        '5',
        '6',
        30,
        1000,
      );

      expect(question.isAnswerCorrect('B')).toBe(false);
      expect(question.isAnswerCorrect('C')).toBe(false);
      expect(question.isAnswerCorrect('D')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const question = new Question(
        1,
        10,
        'Question',
        'multiple',
        'A',
        'Answer',
        'Wrong',
        null,
        null,
        30,
        1000,
      );

      expect(question.isAnswerCorrect('A')).toBe(true);
      expect(question.isAnswerCorrect('a')).toBe(false);
    });

    it('should work with true/false questions', () => {
      const question = new Question(
        1,
        10,
        'True or false?',
        'truefalse',
        'True',
        'True',
        'False',
        null,
        null,
        20,
        500,
      );

      expect(question.isAnswerCorrect('True')).toBe(true);
      expect(question.isAnswerCorrect('False')).toBe(false);
    });
  });

  describe('getOptions', () => {
    it('should return all non-null options for multiple choice', () => {
      const question = new Question(
        1,
        10,
        'What is 2+2?',
        'multiple',
        'A',
        '4',
        '3',
        '5',
        '6',
        30,
        1000,
      );

      const options = question.getOptions();
      expect(options).toEqual(['4', '3', '5', '6']);
      expect(options.length).toBe(4);
    });

    it('should return only non-null options', () => {
      const question = new Question(
        1,
        10,
        'True or false?',
        'truefalse',
        'True',
        'True',
        'False',
        null,
        null,
        20,
        500,
      );

      const options = question.getOptions();
      expect(options).toEqual(['True', 'False']);
      expect(options.length).toBe(2);
    });

    it('should handle questions with some null options', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        'Option 1',
        'Option 2',
        'Option 3',
        null,
        30,
        1000,
      );

      const options = question.getOptions();
      expect(options).toEqual(['Option 1', 'Option 2', 'Option 3']);
      expect(options.length).toBe(3);
    });

    it('should return empty array when all options are null', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        null,
        null,
        null,
        null,
        30,
        1000,
      );

      const options = question.getOptions();
      expect(options).toEqual([]);
      expect(options.length).toBe(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid question', () => {
      const question = new Question(
        1,
        10,
        'What is 2+2?',
        'multiple',
        'A',
        '4',
        '3',
        '5',
        '6',
        30,
        1000,
      );

      expect(question.isValid()).toBe(true);
    });

    it('should return false for empty question text', () => {
      const question = new Question(1, 10, '', 'multiple', 'A', '4', '3', null, null, 30, 1000);

      expect(question.isValid()).toBe(false);
    });

    it('should return false for whitespace-only question text', () => {
      const question = new Question(1, 10, '   ', 'multiple', 'A', '4', '3', null, null, 30, 1000);

      expect(question.isValid()).toBe(false);
    });

    it('should return false for empty correct answer', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        '',
        '4',
        '3',
        null,
        null,
        30,
        1000,
      );

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero time limit', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        '4',
        '3',
        null,
        null,
        0,
        1000,
      );

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative time limit', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        '4',
        '3',
        null,
        null,
        -30,
        1000,
      );

      expect(question.isValid()).toBe(false);
    });

    it('should return false for zero points', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        '4',
        '3',
        null,
        null,
        30,
        0,
      );

      expect(question.isValid()).toBe(false);
    });

    it('should return false for negative points', () => {
      const question = new Question(
        1,
        10,
        'Question?',
        'multiple',
        'A',
        '4',
        '3',
        null,
        null,
        30,
        -1000,
      );

      expect(question.isValid()).toBe(false);
    });
  });
});
