import type { ActionStatistics } from './action-statistics';

export interface ActionResult {
  readonly isCorrect: boolean;
  readonly points: number;
  readonly correctActionIds: readonly number[];
  readonly statistics?: ActionStatistics;
}
