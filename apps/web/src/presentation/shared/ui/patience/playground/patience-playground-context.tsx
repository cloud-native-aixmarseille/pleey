import { createContext, useContext } from 'react';

interface PatiencePlaygroundContextValue {
  readonly container: HTMLElement | null;
}

const PatiencePlaygroundContext = createContext<PatiencePlaygroundContextValue>({
  container: null,
});

export function usePatiencePlayground(): PatiencePlaygroundContextValue {
  return useContext(PatiencePlaygroundContext);
}

export { PatiencePlaygroundContext };
