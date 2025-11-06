import { useCallback, useState } from 'react';
import { quizService } from '../../../domains/quiz/quiz.service';
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

  const addQuestion = useCallback(async (token: string, questionData: Partial<Question>) => {
    await quizService.addQuestion(token, questionData);
  }, []);

  return {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
    setQuestionsByQuiz,
  };
}
