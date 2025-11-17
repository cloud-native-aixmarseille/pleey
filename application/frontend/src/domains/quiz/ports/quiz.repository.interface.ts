import { Quiz, Question } from '../../../shared/types';

/**
 * Quiz Repository Interface
 * Defines the contract for quiz data operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface IQuizRepository {
  /**
   * Fetch all quizzes
   * @param token - Authentication token
   */
  getQuizzes(token: string): Promise<Quiz[]>;

  /**
   * Fetch questions for a specific quiz
   * @param token - Authentication token
   * @param quizId - Quiz identifier
   */
  getQuestions(token: string, quizId: number): Promise<Question[]>;

  /**
   * Create a new quiz
   * @param token - Authentication token
   * @param title - Quiz title
   * @param description - Quiz description
   */
  createQuiz(token: string, title: string, description: string): Promise<Quiz>;

  /**
   * Add a question to a quiz
   * @param token - Authentication token
   * @param questionData - Question data
   */
  addQuestion(token: string, questionData: Partial<Question>): Promise<Question>;
}
