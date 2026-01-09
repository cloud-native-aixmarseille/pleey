import { IQuizRepository } from "../../../domains/quiz/ports/quiz.repository.interface";
import type { Quiz } from "../../../domains/quiz/types";

export interface GetQuizzesRequest {
  token: string;
}

/**
 * Get Quizzes Use Case
 * Handles fetching all quizzes
 * Following Clean Architecture and Single Responsibility Principle
 */
export class GetQuizzesUseCase {
  constructor(private readonly quizRepository: IQuizRepository) { }

  async execute(request: GetQuizzesRequest): Promise<Quiz[]> {
    return this.quizRepository.getQuizzes(request.token);
  }
}

