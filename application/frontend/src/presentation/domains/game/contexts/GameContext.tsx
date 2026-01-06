import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { User } from "../../../../domains/auth/types";
import type {
  AnswerResult,
  LeaderboardEntry,
  Player,
} from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";
import { container } from "../../../../app/di/container";
import { useGameSocket } from "../../../../presentation/shared/hooks/useGameSocket";

interface GameContextValue {
  // Game state
  gamePin: string;
  players: Player[];
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  userAnswer: string | null;
  answerResult: AnswerResult | null;
  showResult: boolean;
  leaderboard: LeaderboardEntry[];
  gameStarted: boolean;
  gameEnded: boolean;

  // Actions
  setGamePin: (pin: string) => void;
  setTimeLeft: (time: number) => void;
  setUserAnswer: (answer: string | null) => void;
  launchQuiz: (
    token: string,
    quizId: number,
    user: User,
    questionCount: number
  ) => Promise<void>;
  joinGame: (pin: string, username: string, userId: number) => void;
  startGame: (pin: string) => void;
  submitAnswer: (
    pin: string,
    userId: number,
    answer: string,
    timeLeft: number
  ) => void;
  nextQuestion: (pin: string) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Game Context Provider
 * Manages game state and operations
 * Following Context API pattern and Single Responsibility Principle
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const [gamePin, setGamePin] = useState("");
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const {
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    setTimeLeft,
    answerResult,
    showResult,
    leaderboard,
    gameStarted,
    gameEnded,
  } = useGameSocket();

  const launchQuiz = useCallback(
    async (
      token: string,
      quizId: number,
      user: User,
      questionCount: number
    ) => {
      const { session } = await container.launchQuizUseCase.execute({
        token,
        quizId,
        user,
        questionCount,
      });
      setGamePin(session.pin);
    },
    []
  );

  const joinGame = useCallback(
    (pin: string, username: string, userId: number) => {
      container.joinGameUseCase.execute({ pin, username, userId });
    },
    []
  );

  const startGame = useCallback((pin: string) => {
    const gameSocket = container.getGameSocket();
    gameSocket.startGame(pin);
  }, []);

  const submitAnswer = useCallback(
    (pin: string, userId: number, answer: string, timeLeft: number) => {
      container.submitAnswerUseCase.execute({ pin, userId, answer, timeLeft });
    },
    []
  );

  const nextQuestion = useCallback((pin: string) => {
    const gameSocket = container.getGameSocket();
    gameSocket.nextQuestion(pin);
    setUserAnswer(null);
  }, []);

  const value: GameContextValue = {
    gamePin,
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    userAnswer,
    answerResult,
    showResult,
    leaderboard,
    gameStarted,
    gameEnded,
    setGamePin,
    setTimeLeft,
    setUserAnswer,
    launchQuiz,
    joinGame,
    startGame,
    submitAnswer,
    nextQuestion,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/**
 * Hook to use Game Context
 * @throws Error if used outside GameProvider
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
