import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/repositories/question.repository.interface';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';

/**
 * Delete Question Use Case
 * Removes a question after ensuring it exists
 */
@Injectable()
export class DeleteQuestionUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(questionId: number): Promise<void> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(QuizErrorCode.QUESTION_NOT_FOUND);
    }

    await this.questionRepository.delete(questionId);
  }
}
