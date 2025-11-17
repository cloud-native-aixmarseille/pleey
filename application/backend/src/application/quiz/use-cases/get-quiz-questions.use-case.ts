import { Inject, Injectable } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';

/**
 * Get Quiz Questions Use Case
 * Retrieves all questions for a quiz
 */
@Injectable()
export class GetQuizQuestionsUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) { }

  async execute(quizId: number): Promise<Question[]> {
    return this.questionRepository.findByQuizId(quizId);
  }
}
