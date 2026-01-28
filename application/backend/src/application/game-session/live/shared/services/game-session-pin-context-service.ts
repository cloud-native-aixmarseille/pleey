import { Inject, Injectable } from '@nestjs/common';
import type { Game } from '../../../../../domain/game/entities/game';
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

interface GameSessionPinContext {
  readonly state: GameSessionState;
  readonly session: GameSession;
  readonly game: Game;
}

@Injectable()
export class GameSessionPinContextService {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
  ) {}

  async load(pin: GameSessionPin): Promise<GameSessionPinContext> {
    const state = await this.gameSessionStateService.getOrCreate(pin);
    return this.buildContext(pin, state);
  }

  async loadExisting(pin: GameSessionPin): Promise<GameSessionPinContext | undefined> {
    const state = await this.gameSessionStateService.get(pin);

    if (!state) {
      return undefined;
    }

    return this.buildContext(pin, state);
  }

  private async buildContext(
    pin: GameSessionPin,
    state: GameSessionState,
  ): Promise<GameSessionPinContext> {
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new Error(GameErrorCode.GAME_SESSION_NOT_FOUND);
    }

    const game = await this.gameRepository.findById(session.gameId);

    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    return { state, session, game };
  }
}
