import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Quiz, Question } from "../../../shared/types";
import { useAuth } from "../../../shared/context/AuthContext";
import ManageQuestionsPage from "./ManageQuestionsPage";

interface ManageQuestionsRouteProps {
  quizzes: Quiz[];
  questionsByQuiz: Record<number, Question[]>;
  hasLoadedQuizzes: boolean;
  loadQuizQuestions: (token: string, quizId: number) => Promise<void>;
  onAddQuestion: (
    token: string,
    questionData: Partial<Question>
  ) => Promise<void>;
}

/**
 * Manage Questions Route Component
 * Handles route logic for managing quiz questions
 * Following Single Responsibility Principle
 */
export function ManageQuestionsRoute({
  quizzes,
  questionsByQuiz,
  hasLoadedQuizzes,
  loadQuizQuestions,
  onAddQuestion,
}: ManageQuestionsRouteProps) {
  const { token } = useAuth();
  const { quizId } = useParams();
  const numericQuizId = Number(quizId);

  useEffect(() => {
    if (!Number.isFinite(numericQuizId) || !token) {
      return;
    }
    if (questionsByQuiz[numericQuizId]) {
      return;
    }
    loadQuizQuestions(token, numericQuizId).catch(() => {
      // Failed loads are handled upstream
    });
  }, [numericQuizId, questionsByQuiz, loadQuizQuestions, token]);

  const quiz = quizzes.find((item) => item.id === numericQuizId);
  const questions = questionsByQuiz[numericQuizId];

  if (!quiz) {
    if (!hasLoadedQuizzes) {
      return null;
    }
    return <Navigate to="/admin" replace />;
  }

  return (
    <ManageQuestionsPage
      quiz={quiz}
      questions={questions ?? []}
      onAddQuestion={async (questionData) => {
        if (token) {
          await onAddQuestion(token, questionData);
        }
      }}
    />
  );
}
