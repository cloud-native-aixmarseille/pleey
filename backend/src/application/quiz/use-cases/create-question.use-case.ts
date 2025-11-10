import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';
import {
  QuizRepositoryProvider,
  type QuizRepository,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
import { VALID_MULTIPLE_CHOICE_OPTIONS } from '../../../domain/quiz/constants/question.constants';
import type { CreateQuestionDto } from '../dto/create-question.dto';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';

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
  ) { }

  async execute(dto: CreateQuestionDto): Promise<Question> {
    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    // Validate correct answer based on question type
    if (dto.type === 'multiple') {
      // For multiple choice, correctAnswer must be A, B, C, or D
      if (!VALID_MULTIPLE_CHOICE_OPTIONS.includes(dto.correctAnswer)) {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }

      // Verify that the selected option is not empty
      const optionValues: Record<string, string | null | undefined> = {
        A: dto.optionA,
        B: dto.optionB,
        C: dto.optionC,
        D: dto.optionD,
      };
      const selectedOption = optionValues[dto.correctAnswer];
      if (!selectedOption || !selectedOption.trim()) {
        throw new BadRequestException(QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY);
      }
    } else if (dto.type === 'truefalse') {
      // For true/false, correctAnswer must be "true" or "false"
      if (dto.correctAnswer !== 'true' && dto.correctAnswer !== 'false') {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }
    }

    // Create question
    return this.questionRepository.create({
      quizId: dto.quizId,
      questionText: dto.questionText,
      type: dto.type,
      correctAnswer: dto.correctAnswer,
      optionA: dto.optionA ?? null,
      optionB: dto.optionB ?? null,
      optionC: dto.optionC ?? null,
      optionD: dto.optionD ?? null,
      timeLimit: dto.timeLimit ?? 20,
      points: dto.points ?? 1000,
    });
  }
}
