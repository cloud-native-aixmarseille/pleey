import { Injectable, NotFoundException } from '@nestjs/common';
import { IQuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';
import { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { Question } from '../../../domain/quiz/entities/question.entity';

/**
 * Create Question Use Case
 * Handles question creation logic
 */
@Injectable()
export class CreateQuestionUseCase {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly quizRepository: IQuizRepository,
  ) {}

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
