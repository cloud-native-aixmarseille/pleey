import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { UpdateQuestionDto } from '../dto/update-question.dto';

/**
 * Update Question Use Case
 * Applies partial updates to an existing question
 */
@Injectable()
export class UpdateQuestionUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) { }

  async execute(questionId: number, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(QuizErrorCode.QUESTION_NOT_FOUND);
    }

    return this.questionRepository.update(questionId, dto);
  }
}
