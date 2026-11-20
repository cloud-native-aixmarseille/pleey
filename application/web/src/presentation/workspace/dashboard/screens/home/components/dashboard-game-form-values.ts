import { GameType } from '@pleey/contracts/game';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';

export interface DashboardGameFormValues {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

export function createEmptyDashboardGameForm(gameTypes: readonly GameTypeDescriptor[]): DashboardGameFormValues {
  const firstSupportedGameType =
    gameTypes.find((gameType) => gameType.key === GameType.Quiz)?.key ?? gameTypes[0]?.key ?? null;

  return {
    description: '',
    title: '',
    type: firstSupportedGameType,
  };
}

export function resolveDashboardGameTypeFromInput(value: string): GameType | null {
  if (value === GameType.Prediction) {
    return GameType.Prediction;
  }

  if (value === GameType.Quiz) {
    return GameType.Quiz;
  }

  return null;
}
