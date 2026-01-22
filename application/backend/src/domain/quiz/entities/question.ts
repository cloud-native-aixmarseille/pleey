import type { QuestionAnswer, QuestionAnswerId } from './question-answer';
import type { QuizId } from './quiz';

export type QuestionId = number;

export enum QuestionType {
  MULTIPLE = 'multiple',
  TRUE_FALSE = 'truefalse',
}

/**
 * Question Domain Entity
 * Represents a quiz question in the domain
 */
export class Question {
  constructor(
    public readonly id: QuestionId,
    public readonly quizId: QuizId,
    public readonly position: number,
    public readonly questionText: string,
    public readonly type: QuestionType,
    public readonly answers: QuestionAnswer[],
    public readonly timeLimit: number,
    public readonly points: number,
  ) {}

  /**
   * Returns the correct answers for this question
   */
  getCorrectAnswers(): QuestionAnswer[] {
    return this.answers.filter((answer) => answer.isCorrect);
  }

  /**
   * Checks if the answer is correct
   */
  isAnswerCorrect(answerId: QuestionAnswerId): boolean {
    return this.getCorrectAnswers().some((answer) => answer.id === answerId);
  }

  /**
   * Gets all options for the question
   */
  getOptions(): QuestionAnswer[] {
    return this.answers;
  }

  /**
   * Validates if question has minimum required data
   */
  isValid(): boolean {
    const hasCorrectAnswer = this.getCorrectAnswers().length > 0;
    return (
      this.questionText.trim().length > 0 &&
      hasCorrectAnswer &&
      this.answers.length > 0 &&
      this.timeLimit > 0 &&
      this.points > 0
    );
  }
}
