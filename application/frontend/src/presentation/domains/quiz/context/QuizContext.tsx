import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useTransition,
} from "react";
import type { Quiz, Question } from "../../../../domains/quiz/types";
import type { CreateQuestionPayload } from "../../../../domains/quiz/quiz.payloads";
import { container } from "../../../../app/di/container";

type QuestionsByQuiz = Record<number, Question[]>;

interface QuizContextValue {
  quizzes: Quiz[];
  questionsByQuiz: QuestionsByQuiz;
  hasLoadedQuizzes: boolean;
  isPending: boolean;
  loadQuizzes: (token: string) => Promise<void>;
  loadQuizQuestions: (token: string, quizId: number) => Promise<void>;
  createQuiz: (
    token: string,
    title: string,
    description: string,
    organizationId: number,
  ) => Promise<void>;
  addQuestion: (
    token: string,
    questionData: CreateQuestionPayload,
  ) => Promise<void>;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

/**
 * Quiz Context Provider
 * Manages quiz state and operations
 * Following Context API pattern and Single Responsibility Principle
 */
export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questionsByQuiz, setQuestionsByQuiz] = useState<QuestionsByQuiz>({});
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadQuizzes = useCallback(
    async (token: string) => {
      setHasLoadedQuizzes(false);
      try {
        const data = await container.getQuizzesUseCase.execute({ token });
        startTransition(() => {
          setQuizzes(data);
        });
      } finally {
        setHasLoadedQuizzes(true);
      }
    },
    [startTransition],
  );

  const loadQuizQuestions = useCallback(
    async (token: string, quizId: number) => {
      const data = await container.getQuestionsUseCase.execute({
        token,
        quizId,
      });
      startTransition(() => {
        setQuestionsByQuiz((prev) => ({
          ...prev,
          [quizId]: data,
        }));
      });
    },
    [startTransition],
  );

  const createQuiz = useCallback(
    async (
      token: string,
      title: string,
      description: string,
      organizationId: number,
    ) => {
      await container.createQuizUseCase.execute({
        token,
        title,
        description,
        organizationId,
      });
      await loadQuizzes(token);
    },
    [loadQuizzes],
  );

  const addQuestion = useCallback(
    async (token: string, questionData: CreateQuestionPayload) => {
      await container.addQuestionUseCase.execute({ token, questionData });
      await loadQuizQuestions(token, Number(questionData.quizId));
    },
    [loadQuizQuestions],
  );

  const value: QuizContextValue = {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    isPending,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

/**
 * Hook to use Quiz Context
 * @throws Error if used outside QuizProvider
 */
export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }
  return context;
}
