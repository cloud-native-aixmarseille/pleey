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
export class StartGameWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: string): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (!state.hasQuestions) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }

    state.startQuestion();
    await this.sessionStateRepository.save(pin, state);
    await this.gameSessionRepository.updateStatus(state.sessionId, 'active');
    await this.gameSessionRepository.updateCurrentQuestion(state.sessionId, 0);

    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }
    this.answerRevealScheduler.schedule(pin, currentQuestion.timeLimit);

    this.broadcastService.publish({
      type: 'game-started',
      pin,
      question: currentQuestion,
      questionNumber: 1,
      totalQuestions: state.totalQuestions,
    });
  }
}
