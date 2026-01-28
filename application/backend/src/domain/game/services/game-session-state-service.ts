import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../auth/entities/user';
import type { GameSessionPin } from '../entities/game-session';
import { GameSessionState } from '../entities/game-session-state';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameSessionStatus } from '../enums/game-session-status.enum';
import { type GameRepository, GameRepositoryProvider } from '../ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../ports/repositories/game-session.repository';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../ports/repositories/session-state.repository';
import {
  type GameContentProviderRegistry,
  GameContentProviderRegistryProvider,
} from '../ports/services/game-content-provider';

@Injectable()
export class GameSessionStateService {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(GameContentProviderRegistryProvider)
    private readonly contentProviderRegistry: GameContentProviderRegistry,
  ) {}

  async getOrCreate(pin: GameSessionPin): Promise<GameSessionState> {
    const cached = await this.sessionStateRepository.get(pin);
    if (cached) {
      return cached;
    }

    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new Error(GameErrorCode.GAME_SESSION_NOT_FOUND);
    }

    if (session.status === GameSessionStatus.ENDED) {
      throw new Error(GameErrorCode.GAME_SESSION_ENDED);
    }

    const game = await this.gameRepository.findById(session.gameId);
    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const stages = await this.resolveStages(session.gameId);

    const state = GameSessionState.create({
      sessionId: session.id,
      gameId: session.gameId,
      gameTitle: game.title,
      gameType: game.type,
      hostId: session.hostId,
      stages,
      currentStageId: session.currentStageId ?? null,
    });

    await this.update(pin, state);
    return state;
  }

  async get(pin: GameSessionPin): Promise<GameSessionState | undefined> {
    return this.sessionStateRepository.get(pin);
  }

  async update(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    await this.sessionStateRepository.save(pin, state);
  }

  async remove(pin: GameSessionPin): Promise<void> {
    await this.sessionStateRepository.remove(pin);
  }

  async findPinBySocketId(socketId: string): Promise<GameSessionPin | undefined> {
    return this.sessionStateRepository.findPinBySocketId(socketId);
  }

  async findPinByUserId(userId: UserId): Promise<GameSessionPin | undefined> {
    return this.sessionStateRepository.findPinByUserId(userId);
  }

  async savePinByUserId(userId: UserId, pin: GameSessionPin): Promise<void> {
    await this.sessionStateRepository.savePinByUserId(userId, pin);
  }

  async removePinByUserId(userId: UserId): Promise<void> {
    await this.sessionStateRepository.removePinByUserId(userId);
  }

  async removePinsBySession(pin: GameSessionPin): Promise<void> {
    await this.sessionStateRepository.removePinsBySession(pin);
  }

  private async resolveStages(gameId: number) {
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      return [];
    }

    const provider = this.contentProviderRegistry.resolve(game.type);
    return provider.resolveStages(gameId);
  }
}
