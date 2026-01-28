import type { GameTypeDescriptor } from '../../domains/game-catalog/entities/game-type-catalog';

let sequence = 0;

export function createGameTypeDescriptorFixture(
  overrides: Partial<GameTypeDescriptor> = {},
): GameTypeDescriptor {
  const n = ++sequence;

  return {
    key: `game-type-${n}`,
    badge: `0${n}`,
    iconKey: n % 2 === 0 ? 'prediction' : 'quiz',
    titleKey: `games.type${n}.title`,
    descriptionKey: `games.type${n}.description`,
    managementRoutePath: undefined,
    ...overrides,
  };
}

export function resetGameTypeSequence(): void {
  sequence = 0;
}
