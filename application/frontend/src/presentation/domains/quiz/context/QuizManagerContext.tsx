import { createContext, useContext, ReactNode } from "react";
import { useQuizManager } from "../hooks/useQuizManager";

const QuizManagerContext = createContext<
  ReturnType<typeof useQuizManager> | undefined
>(undefined);

interface QuizManagerProviderProps {
  children: ReactNode;
}

export function QuizManagerProvider({ children }: QuizManagerProviderProps) {
  const value = useQuizManager();
  return (
    <QuizManagerContext.Provider value={value}>
      {children}
    </QuizManagerContext.Provider>
  );
}

export function useQuizManagerContext() {
  const context = useContext(QuizManagerContext);
  if (!context) {
    throw new Error(
      "useQuizManagerContext must be used within a QuizManagerProvider"
    );
  }
  return context;
}
