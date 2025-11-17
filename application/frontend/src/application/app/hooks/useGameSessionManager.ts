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
  const [gamePinState, setGamePinState] = useState("");
  const [activeQuizQuestionCount, setActiveQuizQuestionCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [sessionsByQuiz, setSessionsByQuiz] = useState<Record<number, GameSession[]>>({});

  const setGamePin = useCallback((pin: string) => {
    setGamePinState(pin.toUpperCase());
  }, []);

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
    answerSubmitted,
  } = useGameSocket();

  const isQuestionActive = useMemo(() => !!currentQuestion, [currentQuestion]);
  const hasSubmittedAnswer = useMemo(() => answerSubmitted, [answerSubmitted]);
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
        const normalizedPin = data.pin.toUpperCase();
        setGamePin(normalizedPin);
        setActiveQuizQuestionCount(questions.length);
        await refreshActiveSessions();
        await loadSessionsForQuiz(quizId);
        gameService.joinGame(normalizedPin, user.username, user.id);
        navigate(`/game/${normalizedPin}/lobby`);
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
      refreshActiveSessions,
      loadSessionsForQuiz,
      navigate,
    ]
  );

  const handleJoinGame = useCallback(() => {
    if (!user || !gamePinState) {
      return;
    }

    gameService.joinGame(gamePinState, user.username, user.id);
    navigate(`/game/${gamePinState}/lobby`);
  }, [user, gamePinState, navigate]);

  const handleJoinAsGuest = useCallback(
    (nickname: string) => {
      if (!gamePinState) {
        return;
      }
      const { id } = registerGuest(nickname);
      gameService.joinGame(gamePinState, nickname, undefined, id);
      navigate(`/game/${gamePinState}/lobby`);
    },
    [registerGuest, gamePinState, navigate]
  );

  const handleStartGame = useCallback(() => {
    if (!gamePinState) {
      return;
    }

    gameService.startGame(gamePinState);
  }, [gamePinState]);

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      if (user) {
        setUserAnswer(answer);
        gameService.submitAnswer(gamePinState, user.id, answer, timeLeft);
        return;
      }

      if (guestId) {
        setUserAnswer(answer);
        gameService.submitAnswer(gamePinState, undefined, answer, timeLeft, guestId);
      }
    },
    [user, guestId, gamePinState, timeLeft]
  );

  const handleNextQuestion = useCallback(() => {
    if (!gamePinState) {
      return;
    }

    gameService.nextQuestion(gamePinState);
    setUserAnswer(null);
  }, [gamePinState]);

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

      const normalizedPin = session.pin.toUpperCase();
      setGamePin(normalizedPin);
      setActiveQuizQuestionCount(questions.length);

      await refreshActiveSessions();
      await loadSessionsForQuiz(quizId);

      navigate(`/game/${normalizedPin}/lobby`);
      gameService.joinGame(normalizedPin, user.username, user.id);
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
    gamePin: gamePinState,
    setGamePin,
    activeQuizQuestionCount,
    userAnswer,
    answerSubmitted,
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
