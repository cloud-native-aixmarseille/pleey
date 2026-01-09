import { Injectable, Logger } from '@nestjs/common';
import type {
  GameTimerService,
  TimerCallback,
} from '../../../domain/game/ports/game-timer.service.interface';

/**
 * Implementation of GameTimerService using Node.js setTimeout.
 * Manages answer reveal timers for game sessions.
 */
@Injectable()
export class NodeGameTimerService implements GameTimerService {
  private readonly logger = new Logger(NodeGameTimerService.name);
  private readonly timers = new Map<string, NodeJS.Timeout>();

  setAnswerRevealTimer(pin: string, delayMs: number, callback: TimerCallback): void {
    // Clear existing timer if any
    this.clearAnswerRevealTimer(pin);

    const timer = setTimeout(() => {
      this.timers.delete(pin);
      callback().catch((error) => {
        this.logger.error(`Error in timer callback for pin ${pin}:`, error);
      });
    }, delayMs);

    this.timers.set(pin, timer);
  }

  clearAnswerRevealTimer(pin: string): void {
    const timer = this.timers.get(pin);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(pin);
    }
  }

  hasTimer(pin: string): boolean {
    return this.timers.has(pin);
  }

  clearAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
