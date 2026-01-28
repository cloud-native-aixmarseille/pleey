import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../auth/entities/user';
import type { GameSessionState } from '../../game/entities/game-session-state';
import { PlayerAction } from '../../game/entities/player-action';
import type { GuestId } from '../../game/entities/player-state';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import type {
  GameSubmitActionHandler,
  GameSubmitActionHandlerInput,
  GameSubmitActionHandlerResult,
} from '../../game/ports/handlers/game-submit-action-handler.registry';
import {
  type GuestRepository,
  GuestRepositoryProvider,
} from '../../game/ports/repositories/guest.repository';
import {
  type ScoreRepository,
  ScoreRepositoryProvider,
} from '../../game/ports/repositories/score.repository';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../game/ports/services/game-broadcast.service';
import {
  type ResultRevealService,
  ResultRevealServiceProvider,
} from '../../game/ports/services/result-reveal.service';
import {
  ScoreCalculatorProvider,
  type ScoreCalculatorService,
} from '../../game/ports/services/score-calculator.service';
import { GameSessionStateService } from '../../game/services/game-session-state-service';

@Injectable()
export class PredictionGameSubmitActionHandler implements GameSubmitActionHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    @Inject(ScoreRepositoryProvider)
    private readonly scoreRepository: ScoreRepository,
    @Inject(GuestRepositoryProvider)
    private readonly guestRepository: GuestRepository,
    @Inject(ScoreCalculatorProvider)
    private readonly scoreCalculatorService: ScoreCalculatorService,
    @Inject(ResultRevealServiceProvider)
    private readonly resultRevealService: ResultRevealService,
  ) {}

  async submit({
    dto,
    connectionId,
    state,
    gameType,
  }: GameSubmitActionHandlerInput): Promise<GameSubmitActionHandlerResult> {
    const { playerId } = this.validateActionSubmission(dto, state);

    const currentStage = state.currentStage;
    if (!currentStage) {
      throw new Error(GameErrorCode.NO_STAGES_AVAILABLE);
    }

    const isCorrect = currentStage.isActionCorrect(dto.actionId);

    const gameScore = this.scoreCalculatorService.calculateScore(
      gameType,
      currentStage.points,
      dto.timeLeft,
      currentStage.timeLimit,
      isCorrect,
    );

    const isGuest = !dto.userId && dto.guestId !== undefined;
    const actedAt = new Date().toISOString();
    const actionTime = currentStage.timeLimit - dto.timeLeft;
    if (isGuest && dto.guestId) {
      const guest = await this.guestRepository.findById(dto.guestId);
      await this.scoreRepository.create({
        sessionId: state.sessionId,
        guestId: dto.guestId,
        context: {
          stageId: currentStage.id,
          actionTime,
          isCorrect,
          actedAt,
          guestId: dto.guestId,
          guestUsername: guest?.username ?? null,
        },
        points: gameScore.getTotalPoints(),
      });
    }

    if (!isGuest && dto.userId) {
      await this.scoreRepository.create({
        sessionId: state.sessionId,
        userId: dto.userId,
        context: {
          stageId: currentStage.id,
          actionTime,
          isCorrect,
          actedAt,
        },
        points: gameScore.getTotalPoints(),
      });
    }

    const player = state.findPlayerByIdentity(dto.userId, dto.guestId);
    if (player) {
      const identity =
        player.userId !== undefined
          ? { userId: player.userId }
          : { guestId: player.guestId as GuestId };
      const score = state.getOrCreateScore(playerId, player.username, identity);
      score.addPoints(gameScore.getTotalPoints());
    }

    state.recordAction(
      PlayerAction.create({
        playerId,
        actionId: dto.actionId,
        isCorrect,
        points: gameScore.getTotalPoints(),
        timeLeft: dto.timeLeft,
      }),
    );

    await this.gameSessionStateService.update(dto.pin, state);

    if (connectionId) {
      this.broadcastService.publish({
        type: GameBroadcastEventType.ACTION_ACKNOWLEDGED,
        connectionId,
      });
    }

    if (state.haveAllNonHostPlayersActed()) {
      await this.resultRevealService.execute(dto.pin);
    }

    return {
      isCorrect,
      points: gameScore.getTotalPoints(),
      correctActionIds: state.getCorrectActionIds(),
    };
  }

  private validateActionSubmission(
    dto: GameSubmitActionHandlerInput['dto'],
    state: GameSessionState,
  ): { playerId: string } {
    const hasUserId = dto.userId !== undefined && dto.userId !== null;
    const hasGuestId =
      dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

    if (!hasUserId && !hasGuestId) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    if (hasUserId && hasGuestId) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    const playerId = this.createPlayerId(dto.userId, dto.guestId);

    if (state.hasPlayerActed(playerId)) {
      throw new Error(GameErrorCode.ALREADY_ACTED);
    }

    return { playerId };
  }

  private createPlayerId(userId?: UserId, guestId?: GuestId): string {
    if (userId !== undefined && userId !== null) {
      return `user-${userId}`;
    }
    if (guestId) {
      return `guest-${guestId}`;
    }
    throw new Error(GameErrorCode.VALIDATION_FAILED);
  }
}
