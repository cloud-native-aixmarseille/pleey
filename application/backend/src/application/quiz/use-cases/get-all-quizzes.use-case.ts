import { Inject, Injectable } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';

/**
 * Get All Quizzes Use Case
 * Retrieves all quizzes
 */
@Injectable()
export class GetAllQuizzesUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
  ) {}

  async execute(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
  }
}
