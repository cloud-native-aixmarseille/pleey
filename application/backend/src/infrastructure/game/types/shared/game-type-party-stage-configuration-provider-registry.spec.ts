import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import type { GameTypePartyStageConfigurationProvider } from './game-type-party-stage-configuration-provider-registry';
import { GameTypePartyStageConfigurationProviderRegistry } from './game-type-party-stage-configuration-provider-registry';

describe('GameTypePartyStageConfigurationProviderRegistry', () => {
  it('resolves stage configuration providers using game-type value objects', () => {
    const quizProvider = {} as GameTypePartyStageConfigurationProvider;
    const predictionProvider = {} as GameTypePartyStageConfigurationProvider;
    const registry = new GameTypePartyStageConfigurationProviderRegistry([
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
        new GameTypePartyStageConfigurationProviderRegistry([
          {
            gameType: GameType.Quiz,
            provider: {} as GameTypePartyStageConfigurationProvider,
          },
          {
            gameType: GameType.Quiz,
            provider: {} as GameTypePartyStageConfigurationProvider,
          },
        ]),
    ).toThrow(GameErrorCode.VALIDATION_FAILED);
  });
});
