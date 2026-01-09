import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameSessionState } from '../../../domain/game/entities/game-session-state';
import { PlayerAnswer } from '../../../domain/game/entities/player-answer';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { type GameBroadcastService, GameBroadcastServiceProvider } from '../ports';
import { RevealAnswersUseCase } from './reveal-answers.use-case';
import { SubmitAnswerUseCase } from './submit-answer.use-case';

@Injectable()
export class SubmitAnswerWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly revealAnswersUseCase: RevealAnswersUseCase,
  ) {}

  async execute(socketId: string, dto: SubmitAnswerDto): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(dto.pin);

    const { playerId } = this.validateAnswerSubmission(dto, state);

    const result = await this.submitAnswerUseCase.execute(dto);

    const player = state.findPlayerByIdentity(dto.userId, dto.guestId);
    if (player) {
      const score = state.getOrCreateScore(playerId, player.username, player.isGuest);
      score.addPoints(result.points);
    }

    state.recordAnswer(
      PlayerAnswer.create({
        playerId,
        answer: dto.answer,
        isCorrect: result.isCorrect,
        points: result.points,
        timeLeft: dto.timeLeft,
      }),
    );

    await this.sessionStateRepository.save(dto.pin, state);

    this.broadcastService.publish({ type: 'answer-acknowledged', connectionId: socketId });

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
      throw new WsException('Must provide either userId or guestId');
    }

    if (hasUserId && hasGuestId) {
      throw new WsException('Cannot provide both userId and guestId');
    }

    const playerId = this.createPlayerId(dto.userId, dto.guestId);

    if (state.hasPlayerAnswered(playerId)) {
      throw new WsException(GameErrorCode.ALREADY_ANSWERED);
    }

    return { playerId };
  }

  private createPlayerId(userId?: number, guestId?: string): string {
    if (userId !== undefined && userId !== null) {
      return `user-${userId}`;
    }
    if (guestId) {
      return `guest-${guestId}`;
    }
    throw new Error('Must provide either userId or guestId');
  }
}
