import { Inject, Injectable } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/ports/question.repository';

/**
 * Get Quiz Questions Use Case
 * Retrieves all questions for a quiz
 */
@Injectable()
export class ListQuizQuestionsUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(quizId: QuizId): Promise<Question[]> {
    return this.questionRepository.findByQuizId(quizId);
  }
}
