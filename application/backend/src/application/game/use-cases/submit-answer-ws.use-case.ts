import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionState } from '../../../domain/game/entities/game-session-state';
import { PlayerAnswer } from '../../../domain/game/entities/player-answer';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../ports';
import { RevealAnswersUseCase } from './reveal-answers.use-case';
import { SubmitAnswerUseCase } from './submit-answer.use-case';

@Injectable()
export class SubmitAnswerWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly revealAnswersUseCase: RevealAnswersUseCase,
  ) {}

  async execute(socketId: string, dto: SubmitAnswerDto): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(dto.pin);

    const { playerId } = this.validateAnswerSubmission(dto, state);

    const result = await this.submitAnswerUseCase.execute(dto);

    const player = state.findPlayerByIdentity(dto.userId, dto.guestId);
    if (player) {
      const identity =
        player.userId !== undefined
          ? { userId: player.userId }
          : { guestId: player.guestId as GuestId };
      const score = state.getOrCreateScore(playerId, player.username, identity);
      score.addPoints(result.points);
    }

    state.recordAnswer(
      PlayerAnswer.create({
        playerId,
        answerId: dto.answerId,
        isCorrect: result.isCorrect,
        points: result.points,
        timeLeft: dto.timeLeft,
      }),
    );

    await this.gameSessionStateService.update(dto.pin, state);

    this.broadcastService.publish({
      type: GameBroadcastEventType.ANSWER_ACKNOWLEDGED,
      connectionId: socketId,
    });

    if (state.haveAllNonHostPlayersAnswered()) {
      await this.revealAnswersUseCase.execute(dto.pin);
    }
  }

  private validateAnswerSubmission(
    dto: SubmitAnswerDto,
    state: GameSessionState,
  ): { playerId: string } {
    const hasUserId = dto.userId !== undefined && dto.userId !== null;
    const hasGuestId =
      dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

    if (!hasUserId && !hasGuestId) {
      throw new WsException(GameErrorCode.VALIDATION_FAILED);
    }

    if (hasUserId && hasGuestId) {
      throw new WsException(GameErrorCode.VALIDATION_FAILED);
    }

    const playerId = this.createPlayerId(dto.userId, dto.guestId);

    if (state.hasPlayerAnswered(playerId)) {
      throw new WsException(GameErrorCode.ALREADY_ANSWERED);
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
