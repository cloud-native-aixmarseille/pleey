import { Injectable } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz.entity';
import type { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { CreateQuizDto } from '../dto/create-quiz.dto';

/**
 * Create Quiz Use Case
 * Handles quiz creation logic
 */
@Injectable()
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(dto: CreateQuizDto, userId: number): Promise<Quiz> {
    return this.quizRepository.create(dto.title, dto.description || null, userId);
  }
}
