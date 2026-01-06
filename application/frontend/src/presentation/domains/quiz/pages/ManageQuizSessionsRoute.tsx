import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ManageQuizSessionsPage } from "../components/ManageQuizSessionsPage";
import { useAuthManagerContext } from "../../auth";
import { useQuizManagerContext } from "../context/QuizManagerContext";
import { useGameSessionContext } from "../../game/contexts/GameSessionContext";
import { useNotifications } from "../../app-shell";
import type { GameSession } from "../../../../domains/game/types";

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
