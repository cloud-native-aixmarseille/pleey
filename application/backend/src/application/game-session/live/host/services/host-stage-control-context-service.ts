import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { Game, GameId } from '../../../../../domain/game/entities/game';
import type { GameSession, GameSessionPin } from '../../../../../domain/game/entities/game-session';
import type { GameSessionState } from '../../../../../domain/game/entities/game-session-state';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game-session.repository';
import { GameSessionStateService } from '../../../../../domain/game/services/game-session-state-service';

interface HostStageControlContext {
  readonly state: GameSessionState;
  readonly session: GameSession;
}

@Injectable()
export class HostStageControlContextService {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
  ) {}

  async load(pin: GameSessionPin, hostId: UserId): Promise<HostStageControlContext> {
    const state = await this.gameSessionStateService.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new Error(GameErrorCode.GAME_SESSION_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new Error(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    return { state, session };
  }

  async loadGame(gameId: GameId): Promise<Game> {
    const game = await this.gameRepository.findById(gameId);

    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    return game;
  }

  async updateState(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    await this.gameSessionStateService.update(pin, state);
  }
}
