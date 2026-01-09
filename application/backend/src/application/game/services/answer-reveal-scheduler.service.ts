import { Inject, Injectable } from '@nestjs/common';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service.interface';
import { AnswerRevealPolicy } from '../../../domain/game/services/answer-reveal-policy.service';
import { RevealAnswersUseCase } from '../use-cases/reveal-answers.use-case';

@Injectable()
export class AnswerRevealSchedulerService {
  constructor(
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    private readonly answerRevealPolicy: AnswerRevealPolicy,
    private readonly revealAnswersUseCase: RevealAnswersUseCase,
  ) {}

  clear(pin: string): void {
    this.timerService.clearAnswerRevealTimer(pin);
  }

  schedule(pin: string, timeSeconds: number): void {
    const delayMs = this.answerRevealPolicy.getRevealDelayMs(timeSeconds);
    this.timerService.clearAnswerRevealTimer(pin);
    this.timerService.setAnswerRevealTimer(pin, delayMs, async () => {
      await this.revealAnswersUseCase.execute(pin);
    });
  }
}
