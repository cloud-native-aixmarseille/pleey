import { NotificationProvider } from "./domains/app-shell";
import { AuthManagerProvider } from "./domains/auth";
import { QuizManagerProvider } from "./domains/quiz/context/QuizManagerContext";
import { OrganizationProvider } from "./domains/admin/context/OrganizationContext";
import { GameSessionProvider } from "./domains/game/contexts/GameSessionContext";
import { GuestSessionProvider } from "./domains/game/contexts/GuestSessionContext";
import { AppRoutes } from "./routing/routes";
import {
  ColorSchemeProvider,
  ThemeProvider,
} from "../presentation/shared/ui/theme";

export function RootApp() {
  return (
    <ColorSchemeProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthManagerProvider>
            <GuestSessionProvider>
              <QuizManagerProvider>
                <GameSessionProvider>
                  <OrganizationProvider>
                    <AppRoutes />
                  </OrganizationProvider>
                </GameSessionProvider>
              </QuizManagerProvider>
            </GuestSessionProvider>
          </AuthManagerProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ColorSchemeProvider>
  );
}
