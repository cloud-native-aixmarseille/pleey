import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';
import { VALID_MULTIPLE_CHOICE_OPTIONS } from '../../../domain/quiz/constants/question.constants';
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

    // Determine the final state after update
    const finalType = dto.type ?? question.type;
    const finalCorrectAnswer = dto.correctAnswer ?? question.correctAnswer;
    // Extract final option values using a loop to reduce repetition
    const optionKeys = ['A', 'B', 'C', 'D'] as const;
    const finalOptions: Record<typeof optionKeys[number], string | null> = {} as any;
    for (const key of optionKeys) {
      const dtoKey = `option${key}` as keyof UpdateQuestionDto;
      const questionKey = `option${key}` as keyof Question;
      finalOptions[key] = dto[dtoKey] !== undefined ? dto[dtoKey] as string | null : question[questionKey] as string | null;
    }
    const finalOptionA = finalOptions['A'];
    const finalOptionB = finalOptions['B'];
    const finalOptionC = finalOptions['C'];
    const finalOptionD = finalOptions['D'];

    // Validate correct answer based on question type
    if (finalType === 'multiple') {
      // For multiple choice, correctAnswer can be single (e.g., "A") or multiple (e.g., "A,D")
      const correctAnswers = finalCorrectAnswer.split(',').map(a => a.trim());

      // Validate each correct answer
      for (const answer of correctAnswers) {
        if (!VALID_MULTIPLE_CHOICE_OPTIONS.includes(answer)) {
          throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
        }
      }

      // Check for duplicate correct answers
      if (correctAnswers.length !== new Set(correctAnswers).size) {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }

      // Verify that each selected option is not empty
      const optionValues: Record<string, string | null> = {
        A: finalOptionA,
        B: finalOptionB,
        C: finalOptionC,
        D: finalOptionD,
      };

      for (const answer of correctAnswers) {
        const selectedOption = optionValues[answer];
        if (!selectedOption || !selectedOption.trim()) {
          throw new BadRequestException(QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY);
        }
      }
    } else if (finalType === 'truefalse') {
      // For true/false, correctAnswer must be "true" or "false"
      if (finalCorrectAnswer !== 'true' && finalCorrectAnswer !== 'false') {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }
    }

    return this.questionRepository.update(questionId, dto);
  }
}
