import { useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useQuizManagerContext } from "../../../application/app/context/QuizManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useAdminQuizActions } from "../../../application/app/hooks/useAdminQuizActions";
import { useNotifications } from "../../../application/app/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import { ArcadePage, Card } from "../../../shared/components";

const LOADING_WRAPPER_CLASSES = "crt-screen";
const LOADING_CARD_WRAPPER_CLASSES =
  "animate-pulse rounded-[var(--arcade-radius-xl)] border-2 border-primary-500/50 glass-effect";
const LOADING_TEXT_CLASSES =
  "font-display text-2xl uppercase tracking-wider text-accent-400";

export function AdminRoute() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notifyFromError } = useNotifications();
  const { token, isAdmin, isAuthenticated } = useAuthManagerContext();
  const {
    quizzes,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
    deleteQuiz,
    hasLoadedQuizzes,
    isPending,
  } = useQuizManagerContext();
  const { handleLaunchQuiz, activeSessions, rejoinSession } =
    useGameSessionContext();

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
    deleteQuiz,
    notifyFromError,
    navigate,
  });

  const { handleCreateQuiz, handleManageQuiz, handleDeleteQuiz } =
    adminQuizActions;

  const routeElement = useMemo(() => {
    if (!isAuthenticated || !isAdmin) {
      return <Navigate to="/auth/login" replace />;
    }

    if (!hasLoadedQuizzes || isPending) {
      return (
        <div className={LOADING_WRAPPER_CLASSES} data-admin-loading="true">
          <ArcadePage
            variant="gradient"
            padding="md"
            contentWidth="sm"
            gap="md"
            align="center"
            verticalAlign="center"
          >
            <div className={LOADING_CARD_WRAPPER_CLASSES}>
              <Card padding="lg" elevation="glow" surface="glass" border="none">
                <span className={LOADING_TEXT_CLASSES}>
                  {t("common.loading")}
                </span>
              </Card>
            </div>
          </ArcadePage>
        </div>
      );
    }

    return (
      <AdminDashboard
        quizzes={quizzes}
        activeSessions={activeSessions}
        onCreateQuiz={handleCreateQuiz}
        onManageQuiz={handleManageQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        onLaunchQuiz={handleLaunchQuiz}
        onJoinSession={rejoinSession}
      />
    );
  }, [
    isAuthenticated,
    isAdmin,
    quizzes,
    handleCreateQuiz,
    handleManageQuiz,
    handleDeleteQuiz,
    handleLaunchQuiz,
    activeSessions,
    rejoinSession,
    hasLoadedQuizzes,
    isPending,
    t,
  ]);

  return routeElement;
}
