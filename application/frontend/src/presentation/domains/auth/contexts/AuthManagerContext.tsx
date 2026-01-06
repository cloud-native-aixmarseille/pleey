import { createContext, useContext, ReactNode } from "react";
import { useAuthManager } from "../hooks/useAuthManager";

const AuthManagerContext = createContext<
  ReturnType<typeof useAuthManager> | undefined
>(undefined);

interface AuthManagerProviderProps {
  children: ReactNode;
}

export function AuthManagerProvider({ children }: AuthManagerProviderProps) {
  const value = useAuthManager();
  return (
    <AuthManagerContext.Provider value={value}>
      {children}
    </AuthManagerContext.Provider>
  );
}

export function useAuthManagerContext() {
  const context = useContext(AuthManagerContext);
  if (!context) {
    throw new Error(
      "useAuthManagerContext must be used within an AuthManagerProvider"
    );
  }
  return context;
}
