import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSession } from '../../../domain/game/entities/game-session';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';

/**
 * Get Active Sessions Use Case
 * Retrieves all active/paused sessions for a host
 */
@Injectable()
export class GetActiveSessionsUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(hostId: UserId): Promise<GameSession[]> {
    return await this.gameSessionRepository.findActiveByHostId(hostId);
  }
}
