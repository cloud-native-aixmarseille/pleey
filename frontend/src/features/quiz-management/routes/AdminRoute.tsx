import { useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useQuizManagerContext } from "../../../application/app/context/QuizManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useAdminQuizActions } from "../../../application/app/hooks/useAdminQuizActions";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

export function AdminRoute() {
  const navigate = useNavigate();
  const { notifyFromError } = useNotifications();
  const { token, isAdmin, isAuthenticated } = useAuthManagerContext();
  const {
    quizzes,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
    hasLoadedQuizzes,
  } = useQuizManagerContext();
  const { handleLaunchQuiz } = useGameSessionContext();

  useEffect(() => {
    if (!token || hasLoadedQuizzes) {
      return;
    }

    loadQuizzes(token).catch((error) => {
      notifyFromError(error, "errors.quizzesLoadFailed");
    });
  }, [token, hasLoadedQuizzes, loadQuizzes, notifyFromError]);

  const adminQuizActions = useAdminQuizActions({
    token,
    createQuiz,
    loadQuizzes,
    fetchQuizQuestions: loadQuizQuestions,
    addQuestion,
    notifyFromError,
    navigate,
  });

  const { handleCreateQuiz, handleManageQuiz } = adminQuizActions;

  const routeElement = useMemo(() => {
    if (!isAuthenticated || !isAdmin) {
      return <Navigate to="/auth/login" replace />;
    }

    return (
      <AdminDashboard
        quizzes={quizzes}
        onCreateQuiz={handleCreateQuiz}
        onManageQuiz={handleManageQuiz}
        onLaunchQuiz={handleLaunchQuiz}
      />
    );
  }, [
    isAuthenticated,
    isAdmin,
    quizzes,
    handleCreateQuiz,
    handleManageQuiz,
    handleLaunchQuiz,
  ]);

  return routeElement;
}
