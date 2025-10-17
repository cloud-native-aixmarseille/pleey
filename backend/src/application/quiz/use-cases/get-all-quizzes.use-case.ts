import { Injectable } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz.entity';
import type { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';

/**
 * Get All Quizzes Use Case
 * Retrieves all quizzes
 */
@Injectable()
export class GetAllQuizzesUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
  }
}
