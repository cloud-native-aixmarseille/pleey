import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { UpdateQuizDto } from '../dto/update-quiz.dto';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';

/**
 * Update Quiz Use Case
 * Handles quiz update logic
 */
@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
  ) {}

  async execute(quizId: number, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const nextTitle = dto.title?.trim() ?? quiz.title;
    const nextDescription = dto.description ?? quiz.description;

    return this.quizRepository.update(quizId, nextTitle, nextDescription ?? null);
  }
}
