import { Inject, Injectable } from '@nestjs/common';
import type { ProjectId } from '../../../domain/project/entities/project';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';

/**
 * Get All Quizzes Use Case
 * Retrieves all quizzes
 */
@Injectable()
export class ListQuizzesUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
  ) {}

  async execute(projectId?: ProjectId): Promise<Quiz[]> {
    if (projectId) {
      return this.quizRepository.findByProject(projectId);
    }

    return this.quizRepository.findAll();
  }
}
