import { vi } from "vitest";
import type { QuizRepository } from "../../domains/quiz/ports/quiz.repository";

export const createQuizRepositoryMock = (
  overrides: Partial<QuizRepository> = {}
): QuizRepository => ({
  getQuizzes: vi.fn(),
  getQuestions: vi.fn(),
  createQuiz: vi.fn(),
  addQuestion: vi.fn(),
  updateQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
  deleteQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  ...overrides,
});
