import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

    // Determine the final state after update
    const finalType = dto.type ?? question.type;
    const finalCorrectAnswer = dto.correctAnswer ?? question.correctAnswer;
    const finalOptionA = dto.optionA !== undefined ? dto.optionA : question.optionA;
    const finalOptionB = dto.optionB !== undefined ? dto.optionB : question.optionB;
    const finalOptionC = dto.optionC !== undefined ? dto.optionC : question.optionC;
    const finalOptionD = dto.optionD !== undefined ? dto.optionD : question.optionD;

    // Validate correct answer based on question type
    if (finalType === 'multiple') {
      // For multiple choice, correctAnswer must be A, B, C, or D
      const validOptions = ['A', 'B', 'C', 'D'];
      if (!validOptions.includes(finalCorrectAnswer)) {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }

      // Verify that the selected option is not empty
      const optionValues: Record<string, string | null> = {
        A: finalOptionA,
        B: finalOptionB,
        C: finalOptionC,
        D: finalOptionD,
      };
      const selectedOption = optionValues[finalCorrectAnswer];
      if (!selectedOption || !selectedOption.trim()) {
        throw new BadRequestException(QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY);
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
