import { Inject, Injectable } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';

/**
 * Get Active Sessions Use Case
 * Retrieves all active/paused sessions for an admin
 */
@Injectable()
export class GetActiveSessionsUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(adminId: number): Promise<GameSession[]> {
    return await this.gameSessionRepository.findActiveByAdminId(adminId);
  }
}
