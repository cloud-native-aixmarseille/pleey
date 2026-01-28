import { createContext, type PropsWithChildren, useContext } from 'react';
import type { GameTypeLiveFacade } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface GameTypeLiveRegistryValue {
  resolve(gameTypeKey: string): GameTypeLiveFacade;
}

const GameTypeLiveRegistryContext = createContext<GameTypeLiveRegistryValue | null>(null);

interface GameTypeLiveRegistryProviderProps extends PropsWithChildren {
  readonly value: GameTypeLiveRegistryValue;
}

export function GameTypeLiveRegistryProvider({
  children,
  value,
}: GameTypeLiveRegistryProviderProps) {
  return (
    <GameTypeLiveRegistryContext.Provider value={value}>
      {children}
    </GameTypeLiveRegistryContext.Provider>
  );
}

export function useGameTypeLiveRegistry(): GameTypeLiveRegistryValue {
  const value = useContext(GameTypeLiveRegistryContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PROVIDER_REQUIRED);
  }

  return value;
}
