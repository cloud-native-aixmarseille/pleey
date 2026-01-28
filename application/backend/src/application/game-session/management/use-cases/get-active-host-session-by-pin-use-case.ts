import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameSession, GameSessionPin } from '../../../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';

@Injectable()
export class GetActiveHostSessionByPinUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(pin: GameSessionPin, hostId: UserId): Promise<GameSession | null> {
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session || session.hostId !== hostId) {
      return null;
    }

    if (
      ![GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(
        session.status,
      )
    ) {
      return null;
    }

    return session;
  }
}
