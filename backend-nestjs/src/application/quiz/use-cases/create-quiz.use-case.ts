import { Injectable } from '@nestjs/common';
import { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { Quiz } from '../../../domain/quiz/entities/quiz.entity';

/**
 * Create Quiz Use Case
 * Handles quiz creation logic
 */
@Injectable()
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(dto: CreateQuizDto, userId: number): Promise<Quiz> {
    return this.quizRepository.create(
      dto.title,
      dto.description || null,
      userId,
    );
  }
}
