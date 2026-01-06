import { createContext, type ReactNode, useContext } from "react";
import { useGuestSession } from "../hooks/useGuestSession";

const GuestSessionContext = createContext<
  ReturnType<typeof useGuestSession> | undefined
>(undefined);

interface GuestSessionProviderProps {
  children: ReactNode;
}

export function GuestSessionProvider({ children }: GuestSessionProviderProps) {
  const value = useGuestSession();
  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSessionContext() {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error(
      "useGuestSessionContext must be used within a GuestSessionProvider"
    );
  }
  return context;
}
