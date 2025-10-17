import { Injectable } from '@nestjs/common';
import { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { Quiz } from '../../../domain/quiz/entities/quiz.entity';

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
