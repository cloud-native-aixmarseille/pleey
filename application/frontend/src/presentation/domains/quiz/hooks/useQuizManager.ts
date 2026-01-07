import { useCallback, useState, useTransition } from "react";
import {
  quizService,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from "../../../../domains/quiz/quiz.service";
import type { Question, Quiz } from "../../../../domains/quiz/types";

type QuestionsByQuiz = Record<number, Question[]>;

export function useQuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questionsByQuiz, setQuestionsByQuiz] = useState<QuestionsByQuiz>({});
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadQuizzes = useCallback(
    async (token: string) => {
      setHasLoadedQuizzes(false);
      try {
        const result = await quizService.getQuizzes(token);
        startTransition(() => {
          setQuizzes(result);
        });
        return result;
      } finally {
        setHasLoadedQuizzes(true);
      }
    },
    [startTransition]
  );

  const loadQuizQuestions = useCallback(
    async (token: string, quizId: number) => {
      const data = await quizService.getQuestions(token, quizId);
      startTransition(() => {
        setQuestionsByQuiz((prev) => ({
          ...prev,
          [quizId]: data,
        }));
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz.id === quizId
              ? {
                ...quiz,
                question_count: data.length,
              }
              : quiz
          )
        );
      });
      return data;
    },
    [startTransition]
  );

  const createQuiz = useCallback(
    async (
      token: string,
      title: string,
      description: string,
      organizationId: number
    ) => {
      const created = await quizService.createQuiz(
        token,
        title,
        description,
        organizationId
      );
      startTransition(() => {
        setQuizzes((prev) => [...prev, created]);
      });
      return created;
    },
    [startTransition]
  );

  const addQuestion = useCallback(
    async (token: string, payload: CreateQuestionPayload) => {
      const created = await quizService.addQuestion(token, payload);
      startTransition(() => {
        setQuestionsByQuiz((prev) => {
          const quizId = created.quiz_id;
          const existing = prev[quizId] ?? [];
          return {
            ...prev,
            [quizId]: [...existing, created],
          };
        });
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz.id === created.quiz_id
              ? {
                ...quiz,
                question_count: (quiz.question_count ?? 0) + 1,
              }
              : quiz
          )
        );
      });
      return created;
    },
    [startTransition]
  );

  const deleteQuiz = useCallback(
    async (token: string, quizId: number) => {
      await quizService.deleteQuiz(token, quizId);
      startTransition(() => {
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
        setQuestionsByQuiz((prev) => {
          const next = { ...prev };
          delete next[quizId];
          return next;
        });
      });
    },
    [startTransition]
  );

  const deleteQuestion = useCallback(
    async (token: string, quizId: number, questionId: number) => {
      await quizService.deleteQuestion(token, questionId);
      startTransition(() => {
        setQuestionsByQuiz((prev) => {
          const current = prev[quizId] ?? [];
          const nextQuestions = current.filter(
            (question) => question.id !== questionId
          );

          if (nextQuestions.length === 0) {
            const next = { ...prev };
            delete next[quizId];
            return next;
          }

          return {
            ...prev,
            [quizId]: nextQuestions,
          };
        });
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz.id === quizId
              ? {
                ...quiz,
                question_count: Math.max(0, (quiz.question_count ?? 0) - 1),
              }
              : quiz
          )
        );
      });
    },
    [startTransition]
  );

  const updateQuestion = useCallback(
    async (
      token: string,
      quizId: number,
      questionId: number,
      payload: UpdateQuestionPayload
    ) => {
      const updated = await quizService.updateQuestion(
        token,
        questionId,
        payload
      );
      startTransition(() => {
        setQuestionsByQuiz((prev) => ({
          ...prev,
          [quizId]: (prev[quizId] ?? []).map((question) =>
            question.id === updated.id ? updated : question
          ),
        }));
      });
      return updated;
    },
    [startTransition]
  );

  return {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    isPending,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
    deleteQuiz,
    deleteQuestion,
    updateQuestion,
    setQuestionsByQuiz,
  };
}
