import { Inject, Injectable } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz.entity';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { CreateQuizDto } from '../dto/create-quiz.dto';

/**
 * Create Quiz Use Case
 * Handles quiz creation logic
 */
@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
  ) { }

  async execute(dto: CreateQuizDto, userId: number): Promise<Quiz> {
    return this.quizRepository.create(dto.title, dto.description || null, userId);
  }
}
