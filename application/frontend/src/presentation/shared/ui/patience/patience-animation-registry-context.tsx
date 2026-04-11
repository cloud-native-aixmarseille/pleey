import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import type { PatienceAnimationId } from './types';

type PatienceAnimationComponent = ComponentType<{ container: HTMLElement | null }>;

export type PatienceAnimationRegistry = Record<PatienceAnimationId, PatienceAnimationComponent>;

export const PatienceAnimationRegistryToken = Symbol('PatienceAnimationRegistry');

const PatienceAnimationRegistryContext = createContext<PatienceAnimationRegistry | undefined>(
  undefined,
);

interface PatienceAnimationRegistryProviderProps extends PropsWithChildren {
  readonly value?: PatienceAnimationRegistry;
}

export function PatienceAnimationRegistryProvider({
  children,
  value,
}: PatienceAnimationRegistryProviderProps) {
  return (
    <PatienceAnimationRegistryContext.Provider value={value}>
      {children}
    </PatienceAnimationRegistryContext.Provider>
  );
}

export function usePatienceAnimationRegistry(): PatienceAnimationRegistry | undefined {
  return useContext(PatienceAnimationRegistryContext);
}
