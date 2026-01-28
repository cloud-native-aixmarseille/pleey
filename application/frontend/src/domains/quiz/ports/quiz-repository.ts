import type { Quiz } from '../entities/quiz';
import type {
  CreateQuizQuestionInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../entities/quiz-management-input';
import type { QuizQuestion } from '../entities/quiz-question';

export interface QuizRepository {
  getQuizById(quizId: number): Promise<Quiz | null>;
  getQuizzesByProject(projectId: number): Promise<Quiz[]>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  updateQuiz(quizId: number, input: UpdateQuizInput): Promise<Quiz>;
  createQuizQuestion(input: CreateQuizQuestionInput): Promise<QuizQuestion>;
  updateQuizQuestion(questionId: number, input: UpdateQuizQuestionInput): Promise<QuizQuestion>;
  deleteQuizQuestion(questionId: number): Promise<void>;
}
