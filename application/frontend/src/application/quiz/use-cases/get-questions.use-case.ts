import { IQuizRepository } from '../../domains/quiz/ports/quiz.repository.interface';
import { Question } from '../../shared/types';

export interface GetQuestionsRequest {
  token: string;
  quizId: number;
}

/**
 * Get Questions Use Case
 * Handles fetching questions for a quiz
 * Following Clean Architecture and Single Responsibility Principle
 */
export class GetQuestionsUseCase {
  constructor(private readonly quizRepository: IQuizRepository) { }

  async execute(request: GetQuestionsRequest): Promise<Question[]> {
    return this.quizRepository.getQuestions(request.token, request.quizId);
  }
}
