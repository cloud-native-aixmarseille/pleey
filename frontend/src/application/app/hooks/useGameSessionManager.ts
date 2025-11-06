import { useCallback, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { gameService } from "../../../domains/game/game.service";
import { useGameSocket } from "../../../shared/hooks/useGameSocket";
import { useTimer } from "../../../shared/hooks/useTimer";
import type { Question, Quiz, User } from "../../../shared/types";
import type { ToastVariant } from "../context/NotificationContext";

type QuestionsByQuiz = Record<number, Question[]>;

type LoadQuizQuestions = (token: string, quizId: number) => Promise<Question[]>;

interface RegisterGuestResult {
  id: string;
}

type RegisterGuest = (nickname: string) => RegisterGuestResult;

type Notify = (messageKey: string, variant?: ToastVariant) => void;

type NotifyFromError = (error: unknown, fallbackKey: string) => void;

interface UseGameSessionManagerParams {
  token: string | null;
  user: User | null;
  guestId: string | null;
  registerGuest: RegisterGuest;
  questionsByQuiz: QuestionsByQuiz;
  fetchQuizQuestions: LoadQuizQuestions;
  notify: Notify;
  notifyFromError: NotifyFromError;
  navigate: NavigateFunction;
}

export function useGameSessionManager({
  token,
  user,
  guestId,
  registerGuest,
  questionsByQuiz,
  fetchQuizQuestions,
  notify,
  notifyFromError,
  navigate,
}: UseGameSessionManagerParams) {
  const [gamePin, setGamePin] = useState("");
  const [activeQuizQuestionCount, setActiveQuizQuestionCount] = useState(0);
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

  const isQuestionActive = useMemo(() => !!currentQuestion, [currentQuestion]);
  const hasSubmittedAnswer = useMemo(() => !!userAnswer, [userAnswer]);
  useTimer(timeLeft, setTimeLeft, isQuestionActive, hasSubmittedAnswer);

  const handleLaunchQuiz = useCallback(
    async (quizId: number) => {
      if (!token || !user) {
        return;
      }

      let questions = questionsByQuiz[quizId] ?? [];

      if (!questions.length) {
        try {
          questions = await fetchQuizQuestions(token, quizId);
        } catch (error) {
          notifyFromError(error, "errors.unableToLoadQuestions");
          return;
        }
      }

      if (!questions.length) {
        notify("errors.addAtLeastOneQuestion", "error");
        return;
      }

      try {
        // Stop any active sessions before creating a new one
        const activeSessions = await gameService.getActiveSessions(token);
        for (const session of activeSessions) {
          if (typeof session.sessionId === "number") {
            await gameService.stopSession(token, session.sessionId);
          }
        }

        const data = await gameService.createSession(token, quizId);
        setGamePin(data.pin);
        setActiveQuizQuestionCount(questions.length);
        navigate("/game/lobby");
        gameService.joinGame(data.pin, user.username, user.id);
      } catch (error) {
        notifyFromError(error, "game.errors.sessionCreateFailed");
      }
    },
    [
      token,
      user,
      questionsByQuiz,
      fetchQuizQuestions,
      notify,
      notifyFromError,
      navigate,
    ]
  );

  const handleJoinGame = useCallback(() => {
    if (!user) {
      return;
    }

    gameService.joinGame(gamePin, user.username, user.id);
    navigate("/game/lobby");
  }, [user, gamePin, navigate]);

  const handleJoinAsGuest = useCallback(
    (nickname: string) => {
      const { id } = registerGuest(nickname);
      gameService.joinGame(gamePin, nickname, undefined, id);
      navigate("/game/lobby");
    },
    [registerGuest, gamePin, navigate]
  );

  const handleStartGame = useCallback(() => {
    if (!gamePin) {
      return;
    }

    gameService.startGame(gamePin);
  }, [gamePin]);

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      if (user) {
        setUserAnswer(answer);
        gameService.submitAnswer(gamePin, user.id, answer, timeLeft);
        return;
      }

      if (guestId) {
        setUserAnswer(answer);
        gameService.submitAnswer(gamePin, undefined, answer, timeLeft, guestId);
      }
    },
    [user, guestId, gamePin, timeLeft]
  );

  const handleNextQuestion = useCallback(() => {
    if (!gamePin) {
      return;
    }

    gameService.nextQuestion(gamePin);
    setUserAnswer(null);
  }, [gamePin]);

  return {
    gamePin,
    setGamePin,
    activeQuizQuestionCount,
    userAnswer,
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    answerResult,
    showResult,
    leaderboard,
    gameStarted,
    gameEnded,
    handleLaunchQuiz,
    handleJoinGame,
    handleJoinAsGuest,
    handleStartGame,
    handleSubmitAnswer,
    handleNextQuestion,
  };
}
