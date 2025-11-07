import { useCallback, useState } from 'react';
import { quizService, type CreateQuestionPayload, type UpdateQuestionPayload } from '../../../domains/quiz/quiz.service';
import type { Question, Quiz } from '../../../shared/types';

type QuestionsByQuiz = Record<number, Question[]>;

export function useQuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questionsByQuiz, setQuestionsByQuiz] = useState<QuestionsByQuiz>({});
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);

  const loadQuizzes = useCallback(async (token: string) => {
    setHasLoadedQuizzes(false);
    try {
      const result = await quizService.getQuizzes(token);
      setQuizzes(result);
      return result;
    } finally {
      setHasLoadedQuizzes(true);
    }
  }, []);

  const loadQuizQuestions = useCallback(async (token: string, quizId: number) => {
    const data = await quizService.getQuestions(token, quizId);
    setQuestionsByQuiz((prev) => ({
      ...prev,
      [quizId]: data,
    }));
    return data;
  }, []);

  const createQuiz = useCallback(
    async (token: string, title: string, description: string, organizationId: number) => {
      const created = await quizService.createQuiz(token, title, description, organizationId);
      setQuizzes((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const addQuestion = useCallback(async (token: string, payload: CreateQuestionPayload) => {
    const created = await quizService.addQuestion(token, payload);
    setQuestionsByQuiz((prev) => {
      const quizId = created.quiz_id;
      const existing = prev[quizId] ?? [];
      return {
        ...prev,
        [quizId]: [...existing, created],
      };
    });
    return created;
  }, []);

  const deleteQuiz = useCallback(async (token: string, quizId: number) => {
    await quizService.deleteQuiz(token, quizId);
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
    setQuestionsByQuiz((prev) => {
      const { [quizId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const deleteQuestion = useCallback(
    async (token: string, quizId: number, questionId: number) => {
      await quizService.deleteQuestion(token, questionId);
      setQuestionsByQuiz((prev) => {
        const current = prev[quizId] ?? [];
        const nextQuestions = current.filter((question) => question.id !== questionId);

        if (nextQuestions.length === 0) {
          const { [quizId]: _removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [quizId]: nextQuestions,
        };
      });
    },
    [],
  );

  const updateQuestion = useCallback(
    async (token: string, quizId: number, questionId: number, payload: UpdateQuestionPayload) => {
      const updated = await quizService.updateQuestion(token, questionId, payload);
      setQuestionsByQuiz((prev) => ({
        ...prev,
        [quizId]: (prev[quizId] ?? []).map((question) =>
          question.id === updated.id ? updated : question,
        ),
      }));
      return updated;
    },
    [],
  );

  return {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
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
