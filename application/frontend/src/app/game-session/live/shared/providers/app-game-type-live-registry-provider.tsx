import { type PropsWithChildren, useMemo } from 'react';
import type { GameTypeLiveFacade } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import { GameTypeRegistryErrorCode } from '../../../../../domains/game-catalog/errors/game-type-registry-error-code';
import {
  GameTypeLiveRegistryProvider,
  type GameTypeLiveRegistryValue,
} from '../../../../../presentation/game-session/live/shared/contexts/game-type-live-registry-context';
import { runtimeContainer } from '../../../../composition/runtime-container';
import { TOKENS } from '../../../../composition/tokens';

function normalizeGameTypeKey(gameTypeKey: string): string {
  return gameTypeKey.trim().toLowerCase();
}

export function AppGameTypeLiveRegistryProvider({ children }: PropsWithChildren) {
  const registry = useMemo<GameTypeLiveRegistryValue>(() => {
    const facades = runtimeContainer.getAll<GameTypeLiveFacade>(TOKENS.gameTypeLiveFacade);
    const facadeMap = new Map<string, GameTypeLiveFacade>();

    for (const facade of facades) {
      facadeMap.set(normalizeGameTypeKey(facade.gameTypeKey), facade);
    }

    return {
      resolve(gameTypeKey: string): GameTypeLiveFacade {
        const facade = facadeMap.get(normalizeGameTypeKey(gameTypeKey));

        if (!facade) {
          throw new Error(GameTypeRegistryErrorCode.LIVE_FACADE_MISSING);
        }

        return facade;
      },
    };
  }, []);

  return <GameTypeLiveRegistryProvider value={registry}>{children}</GameTypeLiveRegistryProvider>;
}
