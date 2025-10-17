import { Injectable } from '@nestjs/common';
import { IQuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';
import { Question } from '../../../domain/quiz/entities/question.entity';

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
