import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
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
import { EndGameUseCase } from './end-game.use-case';

@Injectable()
export class NextQuestionWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly endGameUseCase: EndGameUseCase,
    private readonly answerRevealScheduler: AnswerRevealSchedulerService,
  ) {}

  async execute(pin: GameSessionPin): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(pin);

    if (!state.hasMoreQuestions) {
      await this.endGameUseCase.endGame(pin, state);
      return;
    }

    state.advanceToNextQuestion();
    await this.gameSessionStateService.update(pin, state);
    const nextQuestion = state.currentQuestion;
    if (!nextQuestion) {
      await this.endGameUseCase.endGame(pin, state);
      return;
    }
    await this.gameSessionRepository.updateCurrentQuestion(state.sessionId, nextQuestion.id);
    this.answerRevealScheduler.schedule(pin, nextQuestion.timeLimit);

    this.broadcastService.publish({
      type: GameBroadcastEventType.NEXT_QUESTION,
      pin,
      question: nextQuestion,
    });
  }
}
