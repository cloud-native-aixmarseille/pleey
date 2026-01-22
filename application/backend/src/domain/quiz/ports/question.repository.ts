import type { Question, QuestionId, QuestionType } from '../entities/question';
import type { QuestionAnswerId } from '../entities/question-answer';
import type { QuizId } from '../entities/quiz';

export type QuestionAnswerInput = {
  id?: QuestionAnswerId;
  text?: string | null;
  position?: number;
  isCorrect?: boolean;
};

export const QuestionRepositoryProvider = Symbol('QuestionRepository');

/**
 * Question Repository Interface (Port)
 * Defines the contract for question data access
 */
export interface QuestionRepository {
  /**
   * Creates a new question
   */
  create(data: {
    quizId: QuizId;
    position?: number;
    questionText: string;
    type: QuestionType;
    answers: QuestionAnswerInput[];
    timeLimit?: number;
    points?: number;
  }): Promise<Question>;

  /**
   * Finds a question by ID
   */
  findById(id: QuestionId): Promise<Question | null>;

  /**
   * Finds all questions for a quiz
   */
  findByQuizId(quizId: QuizId): Promise<Question[]>;

  /**
   * Deletes a question by ID
   */
  delete(id: QuestionId): Promise<void>;

  /**
   * Updates a question
   */
  update(
    id: QuestionId,
    data: {
      quizId?: QuizId;
      position?: number;
      questionText?: string;
      type?: QuestionType;
      answers?: QuestionAnswerInput[];
      timeLimit?: number;
      points?: number;
    },
  ): Promise<Question>;
}
