import { Inject, Injectable } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/ports/question.repository';
import {
  type QuizRepository,
  QuizRepositoryProvider,
} from '../../../domain/quiz/ports/quiz.repository';
import { QuestionAnswerService } from '../../../domain/quiz/services/question-answer-service';
import type { CreateQuestionDto } from '../dto/create-question.dto';

/**
 * Create Question Use Case
 * Handles question creation logic
 */
@Injectable()
export class CreateQuestionUseCase {
  constructor(
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    private readonly questionAnswerService: QuestionAnswerService,
  ) {}

  async execute(dto: CreateQuestionDto): Promise<Question> {
    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const normalizedAnswers = this.questionAnswerService.normalizeAnswers(dto.answers);
    this.questionAnswerService.validateAnswers(dto.type, normalizedAnswers);

    // Create question
    return this.questionRepository.create({
      quizId: dto.quizId,
      position: dto.position,
      questionText: dto.questionText,
      type: dto.type,
      answers: normalizedAnswers,
      timeLimit: dto.timeLimit ?? 20,
      points: dto.points ?? 1000,
    });
  }
}
