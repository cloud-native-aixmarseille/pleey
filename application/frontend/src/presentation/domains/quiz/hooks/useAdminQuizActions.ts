import { useCallback } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { Question, Quiz } from "../../../../domains/quiz/types";
import type { CreateQuestionPayload } from "../../../../domains/quiz/quiz.service";

type LoadQuizQuestions = (token: string, quizId: number) => Promise<Question[]>;

type LoadQuizzes = (token: string) => Promise<Quiz[]>;

type CreateQuiz = (
  token: string,
  title: string,
  description: string,
  organizationId: number
) => Promise<Quiz>;

type AddQuestion = (
  token: string,
  payload: CreateQuestionPayload
) => Promise<Question>;

type DeleteQuiz = (token: string, quizId: number) => Promise<void>;

type NotifyFromError = (error: unknown, fallbackKey: string) => void;

interface UseAdminQuizActionsParams {
  token: string | null;
  createQuiz: CreateQuiz;
  loadQuizzes: LoadQuizzes;
  fetchQuizQuestions: LoadQuizQuestions;
  addQuestion: AddQuestion;
  deleteQuiz: DeleteQuiz;
  notifyFromError: NotifyFromError;
  navigate: NavigateFunction;
}


export function useAdminQuizActions({
  token,
  createQuiz,
  loadQuizzes,
  fetchQuizQuestions,
  addQuestion,
  deleteQuiz,
  notifyFromError,
  navigate,
}: UseAdminQuizActionsParams) {
  const handleLoadQuizQuestions = useCallback(
    async (quizId: number) => {
      if (!token) {
        return;
      }

      await fetchQuizQuestions(token, quizId);
    },
    [token, fetchQuizQuestions]
  );

  const handleCreateQuiz = useCallback(
    async (title: string, description: string, organizationId: number) => {
      if (!token) {
        return;
      }

      try {
        await createQuiz(token, title, description, organizationId);
        await loadQuizzes(token);
      } catch (error) {
        notifyFromError(error, "errors.createQuizFailed");
      }
    },
    [token, createQuiz, loadQuizzes, notifyFromError]
  );

  const handleManageQuiz = useCallback(
    async (quiz: Quiz) => {
      await handleLoadQuizQuestions(quiz.id);
      navigate(`/admin/quizzes/${quiz.id}`);
    },
    [handleLoadQuizQuestions, navigate]
  );

  const handleAddQuestion = useCallback(
    async (questionData: CreateQuestionPayload) => {
      if (!token) {
        return;
      }

      try {
        await addQuestion(token, questionData);
      } catch (error) {
        notifyFromError(error, "errors.unableToLoadQuestions");
      }
    },
    [token, addQuestion, notifyFromError]
  );

  const handleDeleteQuiz = useCallback(
    async (quizId: number) => {
      if (!token) {
        return;
      }

      try {
        await deleteQuiz(token, quizId);
      } catch (error) {
        notifyFromError(error, "errors.deleteQuizFailed");
      }
    },
    [token, deleteQuiz, notifyFromError]
  );

  return {
    handleLoadQuizQuestions,
    handleCreateQuiz,
    handleManageQuiz,
    handleAddQuestion,
    handleDeleteQuiz,
  };
}
