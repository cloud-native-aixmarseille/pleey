import { useLocation, useNavigate } from "react-router-dom";

import { useAuthManagerContext } from "../../auth/contexts/AuthManagerContext";
import { useQuizManagerContext } from "../../quiz/context/QuizManagerContext";
import { useGameSessionContext } from "../../game/contexts/GameSessionContext";
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
  const { gameStarted, gameEnded, gamePin, currentQuestion } =
    useGameSessionContext();

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
    currentQuestionId: currentQuestion?.id ?? null,
  });

  return null;
}
