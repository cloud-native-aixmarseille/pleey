import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeViewContributor } from '../party-game-type-runtime-view-contributor';
import { AppPartyGameTypeRuntimeRegistry } from './app-party-game-type-runtime-registry';

class TestRuntimeViewContributor implements PartyGameTypeRuntimeViewContributor {
  constructor(readonly gameType: GameType) {}

  renderHostResultPanel() {
    return createElement('div');
  }

  renderHostStagePanel() {
    return createElement('div');
  }

  renderPlayerResultSurface() {
    return createElement('div');
  }

  renderPlayerStageSurface() {
    return createElement('div');
  }
}

describe('AppPartyGameTypeRuntimeRegistry', () => {
  it.each(Object.values(GameType))('resolves the registered runtime view for %s', (gameType) => {
    // Arrange
    const quizRuntimeView = new TestRuntimeViewContributor(GameType.Quiz);
    const predictionRuntimeView = new TestRuntimeViewContributor(GameType.Prediction);
    const contributors = [quizRuntimeView, predictionRuntimeView];
    const registry = new AppPartyGameTypeRuntimeRegistry(contributors);

    // Act
    const runtimeView = registry.resolve(gameType);

    // Assert
    expect(runtimeView).toBe(contributors.find((contributor) => contributor.gameType === gameType));
  });

  it('rejects a game type without a registered runtime view', () => {
    // Arrange
    const registry = new AppPartyGameTypeRuntimeRegistry([new TestRuntimeViewContributor(GameType.Quiz)]);

    // Act + Assert
    expect(() => registry.resolve(GameType.Prediction)).toThrow(
      'No party runtime view registered for game type: prediction',
    );
  });

  it('rejects duplicate runtime view registrations for the same game type', () => {
    // Arrange
    const contributors = [new TestRuntimeViewContributor(GameType.Quiz), new TestRuntimeViewContributor(GameType.Quiz)];

    // Act + Assert
    expect(() => new AppPartyGameTypeRuntimeRegistry(contributors)).toThrow(
      'Duplicate party runtime view registration for game type: quiz',
    );
  });
});
