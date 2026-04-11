import { describe, expect, it } from 'vitest';
import type { GameTypePartyActionPolicy } from '../../../../application/game/types/shared/ports/game-type-party-action-policy-registry.port';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import { GameTypePartyActionPolicyRegistry } from './game-type-party-action-policy-registry';

describe('GameTypePartyActionPolicyRegistry', () => {
  it('resolves policies using game-type value objects', () => {
    const quizPolicy = {} as GameTypePartyActionPolicy;
    const predictionPolicy = {} as GameTypePartyActionPolicy;
    const registry = new GameTypePartyActionPolicyRegistry([
      {
        gameType: GameType.Prediction,
        provider: predictionPolicy,
      },
      {
        gameType: GameType.Quiz,
        provider: quizPolicy,
      },
    ]);

    expect(registry.resolveByGameType(GameType.Prediction)).toBe(predictionPolicy);
    expect(registry.resolveByGameType(GameType.Quiz)).toBe(quizPolicy);
  });

  it('rejects duplicate game-type bindings', () => {
    expect(
      () =>
        new GameTypePartyActionPolicyRegistry([
          {
            gameType: GameType.Quiz,
            provider: {} as GameTypePartyActionPolicy,
          },
          {
            gameType: GameType.Quiz,
            provider: {} as GameTypePartyActionPolicy,
          },
        ]),
    ).toThrow(GameErrorCode.VALIDATION_FAILED);
  });
});
