import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import { AnswerRevealSchedulerService } from '../../../domain/game/services/answer-reveal-scheduler.service';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../ports';

@Injectable()
export class ResumeGameWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    await this.gameSessionRepository.updateStatus(session.id, GameSessionStatus.ACTIVE);

    const remainingTime = state.resume();
    await this.gameSessionStateService.update(pin, state);
    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }

    if (remainingTime > 0) {
      this.answerRevealScheduler.schedule(pin, remainingTime);
    }

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_RESUMED,
      pin,
      question: currentQuestion,
      totalQuestions: state.totalQuestions,
      timeLeft: remainingTime,
    });
  }
}
