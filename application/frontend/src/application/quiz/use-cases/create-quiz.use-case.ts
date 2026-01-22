import { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Quiz } from "../../../domains/quiz/types";
import { QuizErrorCode } from "../enums/quiz-error-code.enum";

export interface CreateQuizRequest {
  token: string;
  title: string;
  description: string;
  organizationId: number;
}

/**
 * Create Quiz Use Case
 * Handles quiz creation business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) { }

  async execute(request: CreateQuizRequest): Promise<Quiz> {
    const { token, title, description, organizationId } = request;

    // Business rule: validate title
    if (!title || title.trim().length === 0) {
      throw new Error(QuizErrorCode.QUIZ_TITLE_REQUIRED);
    }

    return this.quizRepository.createQuiz(
      token,
      title,
      description,
      organizationId,
    );
  }
}

