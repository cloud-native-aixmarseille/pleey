import { Inject, Injectable } from '@nestjs/common';
import type { QuestionId } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/ports/question.repository';

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

  async execute(questionId: QuestionId): Promise<void> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new Error(QuizErrorCode.QUESTION_NOT_FOUND);
    }

    await this.questionRepository.delete(questionId);
  }
}
