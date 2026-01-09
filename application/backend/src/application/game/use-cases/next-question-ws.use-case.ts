import { Inject, Injectable } from '@nestjs/common';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { type GameBroadcastService, GameBroadcastServiceProvider } from '../ports';
import { AnswerRevealSchedulerService } from '../services/answer-reveal-scheduler.service';
import { EndGameUseCase } from './end-game.use-case';

@Injectable()
export class NextQuestionWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly endGameUseCase: EndGameUseCase,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: string): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(pin);

    if (!state.hasMoreQuestions) {
      await this.endGameUseCase.endGame(pin, state);
      return;
    }

    state.advanceToNextQuestion();
    await this.sessionStateRepository.save(pin, state);
    await this.gameSessionRepository.updateCurrentQuestion(
      state.sessionId,
      state.currentQuestionIndex,
    );

    const nextQuestion = state.currentQuestion;
    if (!nextQuestion) {
      await this.endGameUseCase.endGame(pin, state);
      return;
    }
    this.answerRevealScheduler.schedule(pin, nextQuestion.timeLimit);

    this.broadcastService.publish({
      type: 'next-question',
      pin,
      question: nextQuestion,
      questionNumber: state.currentQuestionIndex + 1,
    });
  }
}
