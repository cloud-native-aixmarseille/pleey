import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Quiz, QuizId } from '../../../domain/quiz/entities/quiz';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import type { UpdateQuizDto } from '../dto/update-quiz.dto';

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

  async execute(quizId: QuizId, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const nextTitle = dto.title?.trim() ?? quiz.title;
    const nextDescription = dto.description ?? quiz.description;

    return this.quizRepository.update(quizId, nextTitle, nextDescription ?? null);
  }
}
