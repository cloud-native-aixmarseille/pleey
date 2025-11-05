import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  GameSessionRepositoryProvider,
  type GameSessionRepository,
} from '../../../domain/game/repositories/game-session.repository.interface';
import { PIN } from '../../../domain/game/value-objects/pin.vo';
import {
  QuizRepositoryProvider,
  type QuizRepository,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { CreateGameSessionDto } from '../dto/create-game-session.dto';

/**
 * Create Game Session Use Case
 * Handles game session creation logic
 */
@Injectable()
export class CreateGameSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
  ) { }

  async execute(dto: CreateGameSessionDto): Promise<{ session: GameSession; pin: string }> {
    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check for existing active sessions for this admin
    const activeSessions = await this.gameSessionRepository.findActiveByAdminId(dto.adminId);
    if (activeSessions.length > 0) {
      throw new BadRequestException(
        'You already have an active game session. Please stop or complete it before starting a new one.'
      );
    }

    // Generate unique PIN
    const pin = PIN.generate();

    // Create session
    const session = await this.gameSessionRepository.create(dto.quizId, dto.adminId, pin.getValue());

    return {
      session,
      pin: pin.getValue(),
    };
  }
}
