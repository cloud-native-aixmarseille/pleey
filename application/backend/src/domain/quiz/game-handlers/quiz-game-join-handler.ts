import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../game/entities/game-session';
import type { GameSessionState } from '../../game/entities/game-session-state';
import type { GameStage } from '../../game/entities/game-stage';
import type { GuestId, PlayerIdentity } from '../../game/entities/player-identity';
import { PlayerState } from '../../game/entities/player-state';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import type {
  GameJoinHandler,
  GameJoinHandlerInput,
  JoinGameCommand,
} from '../../game/ports/handlers/game-join-handler.registry';
import {
  type GuestRepository,
  GuestRepositoryProvider,
} from '../../game/ports/repositories/guest.repository';
import {
  type ActionResultPayload,
  type GameBroadcastEvent,
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../game/ports/services/game-broadcast.service';
import { ActionDistributionService } from '../../game/services/action-distribution-service';
import { GameSessionStateService } from '../../game/services/game-session-state-service';

@Injectable()
export class QuizGameJoinHandler implements GameJoinHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GuestRepositoryProvider)
    private readonly guestRepository: GuestRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly actionDistributionService: ActionDistributionService,
  ) {}

  async join({ connectionId, dto, state, session }: GameJoinHandlerInput): Promise<void> {
    const identity = this.validatePlayerIdentity(dto);

    const player = this.createPlayerState(connectionId, dto.username, identity, state);
    await this.ensureGuestRecord(player, state.sessionId);
    state.addPlayer(player);
    await this.gameSessionStateService.update(dto.pin, state);

    this.broadcastService.publish(this.buildPlayerJoinedEvent(dto.pin, state));

    await this.handlePlayerRejoin(connectionId, dto, state, session);

    // Publish pause state after potential host game-state hydration,
    // so clients end up with isPaused=true.
    if (session?.status === GameSessionStatus.PAUSED && state.hasStages) {
      const currentStage = state.currentStage;
      const fallbackTimeLeft = currentStage?.timeLimit ?? 20;
      const timeLeft = state.pausedTimeLeft ?? fallbackTimeLeft;

      this.broadcastService.publish(this.buildGamePausedEvent(dto.pin, timeLeft));
    }
  }

  private validatePlayerIdentity(dto: JoinGameCommand): PlayerIdentity {
    const hasUserId = dto.userId !== undefined && dto.userId !== null;
    const hasGuestId =
      dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

    if (hasUserId && hasGuestId) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    if (hasUserId) {
      const userId = dto.userId;
      if (userId === undefined || userId === null) {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }
      return { userId };
    }

    if (hasGuestId) {
      const guestId = dto.guestId;
      if (guestId === undefined || guestId === null || guestId.trim() === '') {
        throw new Error(GameErrorCode.VALIDATION_FAILED);
      }
      return { guestId };
    }

    return {
      guestId: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as GuestId,
    };
  }

  private createPlayerState(
    connectionId: string,
    username: string,
    identity: PlayerIdentity,
    state: GameSessionState,
  ): PlayerState {
    if (identity.guestId !== undefined) {
      const existingPlayer = state.findPlayerByGuestId(identity.guestId);
      const avatarSeed = existingPlayer?.avatarSeed ?? identity.guestId;
      return PlayerState.createGuest(connectionId, identity.guestId, username, avatarSeed);
    }

    if (identity.userId !== undefined) {
      const existingPlayer = state.findPlayerByUserId(identity.userId);
      const avatarSeed = existingPlayer?.avatarSeed ?? `${identity.userId}`;
      return PlayerState.createAuthenticated(connectionId, identity.userId, username, avatarSeed);
    }

    throw new Error(GameErrorCode.PLAYER_IDENTITY_REQUIRED);
  }

  private async ensureGuestRecord(player: PlayerState, sessionId: number): Promise<void> {
    if (!player.guestId) {
      return;
    }

    const existing = await this.guestRepository.findById(player.guestId);
    if (existing) {
      return;
    }

    await this.guestRepository.create({
      id: player.guestId,
      sessionId,
      username: player.username,
      avatarSeed: player.avatarSeed,
    });
  }

  private async handlePlayerRejoin(
    connectionId: string,
    dto: JoinGameCommand,
    state: GameSessionState,
    session: GameJoinHandlerInput['session'] | null,
  ): Promise<void> {
    if (
      !session ||
      ![GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(session.status) ||
      !state.hasStages
    ) {
      return;
    }

    const currentStage = state.currentStage;
    if (!currentStage) {
      return;
    }

    const timeLeft = this.resolveTimeLeft(state, currentStage.timeLimit);

    this.broadcastService.publish(
      this.buildGameStateEvent(connectionId, state, currentStage, state.totalStages, timeLeft),
    );

    if (timeLeft > 0) {
      return;
    }

    const player = this.findJoiningPlayer(state, dto);
    if (!player) {
      return;
    }

    const actionResult = this.buildActionResultPayload(state, player);
    this.broadcastService.publish(this.buildActionResultEvent(connectionId, actionResult));
  }

  private findJoiningPlayer(
    state: GameSessionState,
    dto: JoinGameCommand,
  ): PlayerState | undefined {
    if (dto.userId !== undefined && dto.userId !== null) {
      return state.findPlayerByUserId(dto.userId);
    }

    if (dto.guestId) {
      return state.findPlayerByGuestId(dto.guestId);
    }

    return undefined;
  }

  private buildPlayerJoinedEvent(pin: GameSessionPin, state: GameSessionState): GameBroadcastEvent {
    return {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin,
      sessionId: state.sessionId,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      players: state.getNonHostPlayers(),
    };
  }

  private buildGamePausedEvent(pin: GameSessionPin, timeLeft: number): GameBroadcastEvent {
    return {
      type: GameBroadcastEventType.GAME_PAUSED,
      pin,
      timeLeft,
    };
  }

  private buildGameStateEvent(
    connectionId: string,
    state: GameSessionState,
    stage: GameStage,
    totalStages: number,
    timeLeft: number,
  ): GameBroadcastEvent {
    return {
      type: GameBroadcastEventType.GAME_STATE,
      connectionId,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      activePlayerCount: state.getNonHostPlayers().length,
      stage,
      totalStages,
      timeLeft,
    };
  }

  private buildActionResultEvent(
    connectionId: string,
    result: ActionResultPayload,
  ): GameBroadcastEvent {
    return {
      type: GameBroadcastEventType.ACTION_RESULT,
      connectionId,
      result,
    };
  }

  private buildActionResultPayload(
    state: GameSessionState,
    player: PlayerState,
  ): ActionResultPayload {
    const actions = state.getAllActions();
    const statistics = {
      totalActions: state.actionCount,
      actionDistribution: this.actionDistributionService.calculateActionDistribution(actions),
    };
    const playerAction = state.getAction(player.playerId);

    return {
      isCorrect: playerAction?.isCorrect ?? false,
      points: playerAction?.points ?? 0,
      correctActionIds: state.getCorrectActionIds(),
      statistics,
    };
  }

  private resolveTimeLeft(state: GameSessionState, timeLimit: number): number {
    if (typeof state.pausedTimeLeft === 'number') {
      return state.pausedTimeLeft;
    }

    if (!state.stageStartTime) {
      return timeLimit;
    }

    const elapsedSeconds = Math.floor((Date.now() - state.stageStartTime) / 1000);
    return Math.max(0, timeLimit - elapsedSeconds);
  }
}
