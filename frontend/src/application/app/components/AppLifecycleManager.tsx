import { useLocation, useNavigate } from "react-router-dom";
import { useAuthManagerContext } from "../context/AuthManagerContext";
import { useQuizManagerContext } from "../context/QuizManagerContext";
import { useGameSessionContext } from "../context/GameSessionContext";
import { useNotifications } from "../hooks/useNotifications";
import { useAppLifecycle } from "../hooks/useAppLifecycle";

/**
 * Coordinates global application lifecycle effects (session restore, redirects).
 * Wrapped in dedicated component to keep App shell declarative.
 */
export function AppLifecycleManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { user, token, refreshProfile, clearSession, restoreSession } =
    useAuthManagerContext();

  const { loadQuizzes } = useQuizManagerContext();
  const { gameStarted, gameEnded, gamePin } = useGameSessionContext();

  useAppLifecycle({
    restoreSession,
    user,
    token,
    refreshProfile,
    loadQuizzes,
    clearSession,
    notifyFromError: notifications.notifyFromError,
    navigate,
    locationPathname: location.pathname,
    gameStarted,
    gameEnded,
    gamePin,
  });

  return null;
}
