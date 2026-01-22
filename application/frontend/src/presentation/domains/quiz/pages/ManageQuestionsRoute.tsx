import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import ManageQuestionsPage from "../components/questions/ManageQuestionsPage";
import { useAuthManagerContext } from "../../auth";
import { useQuizManagerContext } from "../context/QuizManagerContext";
import { useNotifications } from "../../app-shell";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../domains/quiz/quiz.payloads";

/**
 * Route container for managing quiz questions. Handles data loading concerns
 * while delegating UI to the page component.
 */
export function ManageQuestionsRoute() {
  const { quizId } = useParams();
  const quizIdNumber = Number(quizId);
  const { notify, notifyFromError } = useNotifications();

  const { isAuthenticated, isAdmin, token } = useAuthManagerContext();

  const {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    loadQuizQuestions,
    addQuestion,
    updateQuiz,
    deleteQuestion,
    updateQuestion,
  } = useQuizManagerContext();

  useEffect(() => {
    if (!token || !Number.isFinite(quizIdNumber)) {
      return;
    }

    if (questionsByQuiz[quizIdNumber]) {
      return;
    }

    loadQuizQuestions(token, quizIdNumber).catch((error) => {
      notifyFromError(error, "errors.unableToLoadQuestions");
    });
  }, [
    loadQuizQuestions,
    notifyFromError,
    questionsByQuiz,
    quizIdNumber,
    token,
  ]);

  const quiz = useMemo(
    () => quizzes.find((item) => item.id === quizIdNumber),
    [quizzes, quizIdNumber],
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

  const handleAddQuestion = async (payload: CreateQuestionPayload) => {
    if (!token) {
      return;
    }

    try {
      await addQuestion(token, payload);
      notify("quiz.success.questionCreated", "success");
    } catch (error) {
      notifyFromError(error, "errors.unableToLoadQuestions");
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!token) {
      return;
    }

    try {
      await deleteQuestion(token, quizIdNumber, questionId);
      notify("quiz.success.questionDeleted", "success");
    } catch (error) {
      notifyFromError(error, "errors.questionDeleteFailed");
      throw error;
    }
  };

  const handleUpdateQuestion = async (
    questionId: number,
    payload: UpdateQuestionPayload,
  ) => {
    if (!token) {
      return;
    }

    try {
      await updateQuestion(token, quizIdNumber, questionId, payload);
      notify("quiz.success.questionUpdated", "success");
    } catch (error) {
      notifyFromError(error, "errors.questionUpdateFailed");
      throw error;
    }
  };

  const handleUpdateQuizTitle = async (title: string) => {
    if (!token) {
      return;
    }

    try {
      await updateQuiz(token, quizIdNumber, { title });
      notify("quiz.success.quizTitleUpdated", "success");
    } catch (error) {
      notifyFromError(error, "errors.quizUpdateFailed");
      throw error;
    }
  };

  return (
    <ManageQuestionsPage
      quiz={quiz}
      questions={questions}
      onAddQuestion={handleAddQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onUpdateQuestion={handleUpdateQuestion}
      onUpdateQuizTitle={handleUpdateQuizTitle}
    />
  );
}
