import type { Question } from '../entities/question.entity';

/**
 * Question Repository Interface (Port)
 * Defines the contract for question data access
 */
export interface IQuestionRepository {
  /**
   * Creates a new question
   */
  create(data: {
    quizId: number;
    questionText: string;
    type: 'multiple' | 'truefalse';
    correctAnswer: string;
    optionA?: string | null;
    optionB?: string | null;
    optionC?: string | null;
    optionD?: string | null;
    timeLimit?: number;
    points?: number;
  }): Promise<Question>;

  /**
   * Finds a question by ID
   */
  findById(id: number): Promise<Question | null>;

  /**
   * Finds all questions for a quiz
   */
  findByQuizId(quizId: number): Promise<Question[]>;

  /**
   * Deletes a question by ID
   */
  delete(id: number): Promise<void>;

  /**
   * Updates a question
   */
  update(id: number, data: Partial<Question>): Promise<Question>;
}
