import type { Quiz, Question } from "../types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
  UpdateQuizPayload,
} from "../quiz.payloads";

/**
 * Quiz Repository Interface
 * Defines the contract for quiz data operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface QuizRepository {
  /**
   * Fetch all quizzes
   * @param token - Authentication token
   */
  getQuizzes(
    token: string,
    options?: {
      force?: boolean;
    },
  ): Promise<Quiz[]>;

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
  createQuiz(
    token: string,
    title: string,
    description: string,
    organizationId: number,
  ): Promise<Quiz>;

  /**
   * Add a question to a quiz
   * @param token - Authentication token
   * @param questionData - Question data
   */
  addQuestion(
    token: string,
    questionData: CreateQuestionPayload,
  ): Promise<Question>;

  /**
   * Update quiz metadata
   */
  updateQuiz(
    token: string,
    quizId: number,
    payload: UpdateQuizPayload,
  ): Promise<Quiz>;

  /**
   * Delete quiz
   */
  deleteQuiz(token: string, quizId: number): Promise<void>;

  /**
   * Delete quiz question
   */
  deleteQuestion(token: string, questionId: number): Promise<void>;

  /**
   * Update quiz question
   */
  updateQuestion(
    token: string,
    questionId: number,
    payload: UpdateQuestionPayload,
  ): Promise<Question>;
}
