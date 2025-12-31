import { IQuizRepository } from "../../domains/quiz/ports/quiz.repository.interface";
import { Quiz } from "../../shared/types";

export interface CreateQuizRequest {
  token: string;
  title: string;
  description: string;
}

/**
 * Create Quiz Use Case
 * Handles quiz creation business logic
 * Following Clean Architecture and Single Responsibility Principle
 */
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(request: CreateQuizRequest): Promise<Quiz> {
    const { token, title, description } = request;

    // Business rule: validate title
    if (!title || title.trim().length === 0) {
      throw new Error("Quiz title is required");
    }

    return this.quizRepository.createQuiz(token, title, description);
  }
}
