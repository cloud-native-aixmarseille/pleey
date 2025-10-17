import { Injectable, NotFoundException } from '@nestjs/common';
import { IGameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import { IQuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { PIN } from '../../../domain/game/value-objects/pin.vo';
import { CreateGameSessionDto } from '../dto/create-game-session.dto';
import { GameSession } from '../../../domain/game/entities/game-session.entity';

/**
 * Create Game Session Use Case
 * Handles game session creation logic
 */
@Injectable()
export class CreateGameSessionUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(dto: CreateGameSessionDto): Promise<{ session: GameSession; pin: string }> {
    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Generate unique PIN
    const pin = PIN.generate();

    // Create session
    const session = await this.gameSessionRepository.create(
      dto.quizId,
      pin.getValue(),
    );

    return {
      session,
      pin: pin.getValue(),
    };
  }
}
