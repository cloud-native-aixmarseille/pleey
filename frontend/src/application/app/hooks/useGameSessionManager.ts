import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { gameService } from "../../../domains/game/game.service";
import { useGameSocket } from "../../../shared/hooks/useGameSocket";
import { useTimer } from "../../../shared/hooks/useTimer";
import type { ToastVariant } from "../context/NotificationContext";
import type { GameSession, Question, User } from "../../../shared/types";

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
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [sessionsByQuiz, setSessionsByQuiz] = useState<Record<number, GameSession[]>>({});

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

  const refreshActiveSessions = useCallback(async (): Promise<GameSession[]> => {
    if (!token) {
      setActiveSessions([]);
      return [];
    }

    try {
      const sessions = await gameService.getActiveSessions(token);
      setActiveSessions(sessions);
      return sessions;
    } catch (error) {
      notifyFromError(error, "game.errors.activeSessionsFetchFailed");
      return [];
    }
  }, [token, notifyFromError]);

  const loadSessionsForQuiz = useCallback(
    async (quizId: number): Promise<GameSession[]> => {
      if (!token) {
        setSessionsByQuiz((previous) => ({
          ...previous,
          [quizId]: [],
        }));
        return [];
      }

      try {
        const sessions = await gameService.getSessionsByQuiz(token, quizId);
        setSessionsByQuiz((previous) => ({
          ...previous,
          [quizId]: sessions,
        }));
        return sessions;
      } catch (error) {
        notifyFromError(error, "game.errors.activeSessionsFetchFailed");
        throw error;
      }
    },
    [token, notifyFromError]
  );

  useEffect(() => {
    if (!token) {
      setActiveSessions([]);
      setSessionsByQuiz({});
      return;
    }

    refreshActiveSessions().catch(() => undefined);
  }, [token, refreshActiveSessions]);

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
        const currentSessions = await refreshActiveSessions();
        const liveSession = currentSessions.find((session) => {
          const sessionQuizId = session.quizId ?? session.quiz_id;
          return (
            sessionQuizId === quizId &&
            ["waiting", "active", "paused"].includes(session.status)
          );
        });

        if (liveSession) {
          notify("game.errors.quizSessionAlreadyActive", "error");
          return;
        }

        const data = await gameService.createSession(token, quizId);
        setGamePin(data.pin);
        setActiveQuizQuestionCount(questions.length);
        await refreshActiveSessions();
        await loadSessionsForQuiz(quizId);
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
      refreshActiveSessions,
      loadSessionsForQuiz,
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

  const rejoinSession = useCallback(
    async (session: GameSession) => {
      if (!token || !user) {
        notify("errors.sessionsLoadFailed", "error");
        return;
      }

      const quizId = session.quizId ?? session.quiz_id;
      if (typeof quizId !== "number") {
        notify("errors.sessionsLoadFailed", "error");
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

      setGamePin(session.pin);
      setActiveQuizQuestionCount(questions.length);

      await refreshActiveSessions();
      await loadSessionsForQuiz(quizId);

      navigate("/game/lobby");
      gameService.joinGame(session.pin, user.username, user.id);
    },
    [
      token,
      user,
      questionsByQuiz,
      fetchQuizQuestions,
      notifyFromError,
      notify,
      refreshActiveSessions,
      loadSessionsForQuiz,
      navigate,
    ]
  );

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
    activeSessions,
    sessionsByQuiz,
    refreshActiveSessions,
    loadSessionsForQuiz,
    rejoinSession,
    handleLaunchQuiz,
    handleJoinGame,
    handleJoinAsGuest,
    handleStartGame,
    handleSubmitAnswer,
    handleNextQuestion,
  };
}
