import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameSession } from '../../../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';
import { GameSessionStateService } from '../../../../domain/game/services/game-session-state-service';

@Injectable()
export class GetCurrentPlayerSessionUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(userId: UserId): Promise<GameSession | null> {
    const pin = await this.gameSessionStateService.findPinByUserId(userId);

    if (!pin) {
      return null;
    }

    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session || session.status === GameSessionStatus.ENDED) {
      await this.gameSessionStateService.removePinByUserId(userId);
      return null;
    }

    return session;
  }
}
