import { Injectable, NotFoundException } from '@nestjs/common';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';

/**
 * Delete Quiz Use Case
 * Handles quiz deletion logic
 */
@Injectable()
export class DeleteQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(quizId: number): Promise<void> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizRepository.delete(quizId);
  }
}
