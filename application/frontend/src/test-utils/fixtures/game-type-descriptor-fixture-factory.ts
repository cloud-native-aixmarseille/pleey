import { GameType } from '../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../domains/game/types/shared/game-type-catalog';

let sequence = 0;

export function createGameTypeDescriptorFixture(
  overrides: Partial<GameTypeDescriptor> = {},
): GameTypeDescriptor {
  const n = ++sequence;
  const defaultKey = n % 2 === 0 ? GameType.Prediction : GameType.Quiz;

  return {
    key: defaultKey,
    badge: `0${n}`,
    iconKey: defaultKey,
    titleKey: `games.type${n}.title`,
    descriptionKey: `games.type${n}.description`,
    managementRoutePath: undefined,
    ...overrides,
  };
}

export function resetGameTypeSequence(): void {
  sequence = 0;
}
