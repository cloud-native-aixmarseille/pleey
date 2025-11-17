import { NotificationProvider } from "./application/app/context/NotificationContext";
import { AuthManagerProvider } from "./application/app/context/AuthManagerContext";
import { GuestSessionProvider } from "./application/app/context/GuestSessionContext";
import { QuizManagerProvider } from "./application/app/context/QuizManagerContext";
import { GameSessionProvider } from "./application/app/context/GameSessionContext";
import { OrganizationProvider } from "./shared/context/OrganizationContext";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
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
  );
}
