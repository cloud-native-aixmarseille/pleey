import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import ManageQuestionsPage from "../components/ManageQuestionsPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useQuizManagerContext } from "../../../application/app/context/QuizManagerContext";
import { useNotifications } from "../../../application/app/hooks/useNotifications";
import type { Question } from "../../../shared/types";

/**
 * Route container for managing quiz questions. Handles data loading concerns
 * while delegating UI to the page component.
 */
export function ManageQuestionsRoute() {
  const { quizId } = useParams();
  const quizIdNumber = Number(quizId);
  const notifications = useNotifications();

  const { isAuthenticated, isAdmin, token } = useAuthManagerContext();

  const {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    loadQuizQuestions,
    addQuestion,
  } = useQuizManagerContext();

  useEffect(() => {
    if (!token || !Number.isFinite(quizIdNumber)) {
      return;
    }

    if (questionsByQuiz[quizIdNumber]) {
      return;
    }

    loadQuizQuestions(token, quizIdNumber).catch((error) => {
      notifications.notifyFromError(error, "errors.unableToLoadQuestions");
    });
  }, [loadQuizQuestions, notifications, questionsByQuiz, quizIdNumber, token]);

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

  const questions = questionsByQuiz[quizIdNumber] ?? [];

  const handleAddQuestion = async (questionData: Partial<Question>) => {
    if (!token) {
      return;
    }

    try {
      await addQuestion(token, questionData);
      await loadQuizQuestions(token, quizIdNumber);
    } catch (error) {
      notifications.notifyFromError(error, "errors.unableToLoadQuestions");
    }
  };

  return (
    <ManageQuestionsPage
      quiz={quiz}
      questions={questions}
      onAddQuestion={handleAddQuestion}
    />
  );
}
