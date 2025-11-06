import { ReactNode } from "react";
import { AuthManagerProvider } from "../context/AuthManagerContext";
import { GuestSessionProvider } from "../context/GuestSessionContext";
import { QuizManagerProvider } from "../context/QuizManagerContext";
import { GameSessionProvider } from "../context/GameSessionContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthManagerProvider>
      <GuestSessionProvider>
        <QuizManagerProvider>
          <GameSessionProvider>{children}</GameSessionProvider>
        </QuizManagerProvider>
      </GuestSessionProvider>
    </AuthManagerProvider>
  );
}
