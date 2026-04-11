import { describe, expect, it } from 'vitest';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeView } from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import type { PartyGameTypeRuntimeViewContributor } from '../contracts/party-game-type-runtime-view-contributor';
import { AppPartyGameTypeRuntimeRegistry } from './app-party-game-type-runtime-registry';

class TestRuntimeViewContributor implements PartyGameTypeRuntimeViewContributor {
  constructor(readonly gameType: GameType) {}

  renderHostResultPanel() {
    return null;
  }

  renderHostStagePanel() {
    return null;
  }

  renderPlayerResultSurface() {
    return null;
  }

  renderPlayerStageSurface() {
    return null;
  }
}

function createRuntimeView(): PartyGameTypeRuntimeView {
  return {
    renderHostResultPanel: () => null,
    renderHostStagePanel: () => null,
    renderPlayerResultSurface: () => null,
    renderPlayerStageSurface: () => null,
  };
}

describe('AppPartyGameTypeRuntimeRegistry', () => {
  it('resolves the registered runtime view for a game type', () => {
    const quizRuntimeView = new TestRuntimeViewContributor(GameType.Quiz);
    const registry = new AppPartyGameTypeRuntimeRegistry([quizRuntimeView]);

    expect(registry.resolve(GameType.Quiz)).toEqual(quizRuntimeView);
    expect(registry.resolve(GameType.Quiz)?.renderHostStagePanel).toBeTypeOf('function');
    expect(registry.resolve(GameType.Quiz)?.renderPlayerStageSurface).toBeTypeOf('function');
    expect(registry.resolve(GameType.Prediction)).toBeNull();
  });

  it('rejects duplicate runtime view registrations for the same game type', () => {
    expect(
      () =>
        new AppPartyGameTypeRuntimeRegistry([
          {
            ...createRuntimeView(),
            gameType: GameType.Quiz,
          } satisfies PartyGameTypeRuntimeViewContributor,
          {
            ...createRuntimeView(),
            gameType: GameType.Quiz,
          } satisfies PartyGameTypeRuntimeViewContributor,
        ]),
    ).toThrow('Duplicate party runtime view registration for game type: quiz');
  });
});
