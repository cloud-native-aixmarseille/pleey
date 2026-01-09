import { createContext, useContext } from "react";

export interface PatiencePlaygroundContextValue {
  container: HTMLElement | null;
}

const PatiencePlaygroundContext = createContext<PatiencePlaygroundContextValue>(
  {
    container: null,
  }
);

export function usePatiencePlayground(): PatiencePlaygroundContextValue {
  return useContext(PatiencePlaygroundContext);
}

export { PatiencePlaygroundContext };
