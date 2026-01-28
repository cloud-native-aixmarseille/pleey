import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameSession } from '../../../../domain/game/entities/game-session';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';

@Injectable()
export class ListActiveHostSessionsUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(hostId: UserId): Promise<GameSession[]> {
    return await this.gameSessionRepository.findActiveByHostId(hostId);
  }
}
