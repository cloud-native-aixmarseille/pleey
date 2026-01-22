import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Question, QuestionId } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/ports/question.repository';
import type { UpdateQuestionDto } from '../dto/update-question.dto';
import {
  normalizeAnswers,
  normalizeDomainAnswers,
  validateAnswers,
} from '../utils/question-answer.utils';

/**
 * Update Question Use Case
 * Applies partial updates to an existing question
 */
@Injectable()
export class UpdateQuestionUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(questionId: QuestionId, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(QuizErrorCode.QUESTION_NOT_FOUND);
    }

    const finalType = dto.type ?? question.type;
    const shouldValidate = dto.answers !== undefined || dto.type !== undefined;
    const finalAnswersSource = dto.answers
      ? normalizeAnswers(dto.answers)
      : normalizeDomainAnswers(question.answers);

    if (shouldValidate) {
      validateAnswers(finalType, finalAnswersSource);
    }

    return this.questionRepository.update(questionId, {
      quizId: dto.quizId,
      position: dto.position,
      questionText: dto.questionText,
      type: dto.type,
      answers: dto.answers ? finalAnswersSource : undefined,
      timeLimit: dto.timeLimit,
      points: dto.points,
    });
  }
}
