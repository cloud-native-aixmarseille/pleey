import { Inject, Injectable } from '@nestjs/common';
import { RevealAnswersUseCase } from '../../../application/game/use-cases/reveal-answers.use-case';
import type { GameSessionPin } from '../entities/game-session';
import { type GameTimerService, GameTimerServiceProvider } from '../ports/game-timer.service';
import { AnswerRevealPolicy } from './answer-reveal-policy.service';

@Injectable()
export class AnswerRevealSchedulerService {
  constructor(
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    private readonly answerRevealPolicy: AnswerRevealPolicy,
    private readonly revealAnswersUseCase: RevealAnswersUseCase,
  ) {}

  clear(pin: GameSessionPin): void {
    this.timerService.clearAnswerRevealTimer(pin);
  }

  schedule(pin: GameSessionPin, timeSeconds: number): void {
    const delayMs = this.answerRevealPolicy.getRevealDelayMs(timeSeconds);
    this.timerService.clearAnswerRevealTimer(pin);
    this.timerService.setAnswerRevealTimer(pin, delayMs, async () => {
      await this.revealAnswersUseCase.execute(pin);
    });
  }
}
