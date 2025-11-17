import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ManageQuizSessionsPage } from "../components/sessions/ManageQuizSessionsPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useQuizManagerContext } from "../../../application/app/context/QuizManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useNotifications } from "../../../application/app/hooks/useNotifications";
import type { GameSession } from "../../../shared/types";

export function ManageQuizSessionsRoute() {
  const { quizId } = useParams();
  const quizIdNumber = Number(quizId);

  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { quizzes, hasLoadedQuizzes } = useQuizManagerContext();
  const { sessionsByQuiz, loadSessionsForQuiz, rejoinSession } =
    useGameSessionContext();
  const { notifyFromError } = useNotifications();

  useEffect(() => {
    if (!Number.isFinite(quizIdNumber)) {
      return;
    }

    if (sessionsByQuiz[quizIdNumber]) {
      return;
    }

    loadSessionsForQuiz(quizIdNumber).catch((error) => {
      notifyFromError(error, "errors.sessionsLoadFailed");
    });
  }, [quizIdNumber, loadSessionsForQuiz, notifyFromError, sessionsByQuiz]);

  const quiz = useMemo(
    () => quizzes.find((item) => item.id === quizIdNumber),
    [quizzes, quizIdNumber]
  );

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!quiz) {
    if (!hasLoadedQuizzes) {
      return null;
    }
    return <Navigate to="/admin" replace />;
  }

  const sessions = sessionsByQuiz[quizIdNumber] ?? [];

  const handleRefreshSessions = async () => {
    try {
      await loadSessionsForQuiz(quizIdNumber);
    } catch (error) {
      notifyFromError(error, "errors.sessionsLoadFailed");
    }
  };

  const handleRejoinSession = async (session: GameSession) => {
    await rejoinSession(session);
  };

  return (
    <ManageQuizSessionsPage
      quiz={quiz}
      sessions={sessions}
      onRefreshSessions={handleRefreshSessions}
      onRejoinSession={handleRejoinSession}
    />
  );
}
