import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
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
export class StartGameWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: GameSessionPin): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (!state.hasQuestions) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }

    state.startQuestion();
    await this.gameSessionStateService.update(pin, state);
    await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.ACTIVE);
    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }
    await this.gameSessionRepository.updateCurrentQuestion(state.sessionId, currentQuestion.id);
    this.answerRevealScheduler.schedule(pin, currentQuestion.timeLimit);

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_STARTED,
      pin,
      question: currentQuestion,
      totalQuestions: state.totalQuestions,
    });
  }
}
