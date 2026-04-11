import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import type { GameTypePartyStageCatalogProvider } from './game-type-party-stage-catalog-provider-registry';
import { GameTypePartyStageCatalogProviderRegistry } from './game-type-party-stage-catalog-provider-registry';

describe('GameTypePartyStageCatalogProviderRegistry', () => {
  it('resolves stage catalog providers using game-type value objects', () => {
    const quizProvider = {} as GameTypePartyStageCatalogProvider;
    const predictionProvider = {} as GameTypePartyStageCatalogProvider;
    const registry = new GameTypePartyStageCatalogProviderRegistry([
      {
        gameType: GameType.Prediction,
        provider: predictionProvider,
      },
      {
        gameType: GameType.Quiz,
        provider: quizProvider,
      },
    ]);

    expect(registry.resolveByGameType(GameType.Prediction)).toBe(predictionProvider);
    expect(registry.resolveByGameType(GameType.Quiz)).toBe(quizProvider);
  });

  it('rejects duplicate game-type bindings', () => {
    expect(
      () =>
        new GameTypePartyStageCatalogProviderRegistry([
          {
            gameType: GameType.Prediction,
            provider: {} as GameTypePartyStageCatalogProvider,
          },
          {
            gameType: GameType.Prediction,
            provider: {} as GameTypePartyStageCatalogProvider,
          },
        ]),
    ).toThrow(GameErrorCode.VALIDATION_FAILED);
  });
});
