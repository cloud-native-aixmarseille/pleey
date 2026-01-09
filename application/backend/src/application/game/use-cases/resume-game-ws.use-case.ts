import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { type GameBroadcastService, GameBroadcastServiceProvider } from '../ports';
import { AnswerRevealSchedulerService } from '../services/answer-reveal-scheduler.service';

@Injectable()
export class ResumeGameWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: string, hostId: number): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    await this.gameSessionRepository.updateStatus(session.id, 'active');

    const remainingTime = state.resume();
    await this.sessionStateRepository.save(pin, state);
    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }

    if (remainingTime > 0) {
      this.answerRevealScheduler.schedule(pin, remainingTime);
    }

    this.broadcastService.publish({
      type: 'game-resumed',
      pin,
      question: currentQuestion,
      questionNumber: state.currentQuestionIndex + 1,
      totalQuestions: state.totalQuestions,
      timeLeft: remainingTime,
    });
  }
}
