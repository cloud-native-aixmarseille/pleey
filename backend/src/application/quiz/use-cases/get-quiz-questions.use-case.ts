import { Injectable } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import type { IQuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';

/**
 * Get Quiz Questions Use Case
 * Retrieves all questions for a quiz
 */
@Injectable()
export class GetQuizQuestionsUseCase {
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(quizId: number): Promise<Question[]> {
    return this.questionRepository.findByQuizId(quizId);
  }
}
