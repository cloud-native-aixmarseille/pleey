import type { ReactNode } from "react";

import { AuthManagerProvider } from "../../auth/context/AuthManagerContext";
import { GuestSessionProvider } from "../../game/state/GuestSessionContext";
import { QuizManagerProvider } from "../../quiz/context/QuizManagerContext";
import { GameSessionProvider } from "../../game/state/GameSessionContext";

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
