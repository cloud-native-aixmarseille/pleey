import type { UserId } from '../../auth/entities/user';
import type { GameSessionId } from './game-session';
import type { GameStageId } from './game-stage';
import type { GuestId } from './player-state';

type ScoreId = number;

export type ScoreContext = {
  stageId?: GameStageId;
  actionTime?: number | null;
  isCorrect?: boolean;
  actedAt?: string;
  guestId?: GuestId;
  guestUsername?: string | null;
};

/**
 * Score Domain Entity
 * Represents a player's score for a game stage
 */
export class Score {
  constructor(
    public readonly id: ScoreId,
    public readonly sessionId: GameSessionId,
    public readonly userId: UserId | undefined,
    public readonly guestId: GuestId | undefined,
    public readonly context: ScoreContext | null,
    public readonly points: number,
  ) {}

  get stageId(): GameStageId | null {
    return this.context?.stageId ?? null;
  }

  get guestUsername(): string | null {
    return this.context?.guestUsername ?? null;
  }

  get actionTime(): number | null {
    return this.context?.actionTime ?? null;
  }

  get isCorrect(): boolean {
    return this.context?.isCorrect ?? false;
  }

  get actedAt(): Date | null {
    const raw = this.context?.actedAt;
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
