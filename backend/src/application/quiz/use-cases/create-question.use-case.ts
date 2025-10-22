import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Question } from '../../../domain/quiz/entities/question.entity';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';
import {
  QuizRepositoryProvider,
  type QuizRepository,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
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
  ) { }

  async execute(dto: CreateQuestionDto): Promise<Question> {
    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Create question
    return this.questionRepository.create({
      quizId: dto.quizId,
      questionText: dto.questionText,
      type: dto.type,
      correctAnswer: dto.correctAnswer,
      optionA: dto.optionA || null,
      optionB: dto.optionB || null,
      optionC: dto.optionC || null,
      optionD: dto.optionD || null,
      timeLimit: dto.timeLimit || 20,
      points: dto.points || 1000,
    });
  }
}
