import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { container } from "../../../../app/di/container";
import { useTimer } from "../../../../presentation/shared/hooks/useTimer";
import type { User } from "../../../../domains/auth/types";
import type { GameSession } from "../../../../domains/game/types";
import type { Question, Quiz } from "../../../../domains/quiz/types";
import type { ToastVariant } from "../../app-shell/contexts/NotificationContext";
import { useGameSocket } from "./useGameSocket";

const { gameService } = container;

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
  guestNickname: string;
  registerGuest: RegisterGuest;
  quizzes: Quiz[];
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
  guestNickname,
  registerGuest,
  quizzes,
  questionsByQuiz,
  fetchQuizQuestions,
  notify,
  notifyFromError,
  navigate,
}: UseGameSessionManagerParams) {
  const [gamePinState, setGamePinState] = useState("");
  const [activeQuizQuestionCount, setActiveQuizQuestionCount] = useState(-1);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [sessionsByQuiz, setSessionsByQuiz] = useState<
    Record<number, GameSession[]>
  >({});

  const setGamePin = useCallback((pin: string) => {
    setGamePinState(pin.toUpperCase());
    setActiveQuizTitle(null);
  }, []);

  const lastGuestJoinPinRef = useRef<string | null>(null);
  const lastUserJoinPinRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      return;
    }

    if (!guestId || !guestNickname) {
      return;
    }

    const normalizedPin = gamePinState.trim().toUpperCase();
    if (!normalizedPin) {
      return;
    }

    if (lastGuestJoinPinRef.current === normalizedPin) {
      return;
    }

    lastGuestJoinPinRef.current = normalizedPin;
    gameService.joinGame(normalizedPin, guestNickname, undefined, guestId);
  }, [user, guestId, guestNickname, gamePinState]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const normalizedPin = gamePinState.trim().toUpperCase();
    if (!normalizedPin) {
      return;
    }

    if (lastUserJoinPinRef.current === normalizedPin) {
      return;
    }

    lastUserJoinPinRef.current = normalizedPin;
    gameService.joinGame(normalizedPin, user.username, user.id);
  }, [user, gamePinState]);

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
    isPaused,
    lastErrorCode,
  } = useGameSocket(gamePinState);

  const lastHandledSocketErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastErrorCode) {
      return;
    }

    if (lastHandledSocketErrorRef.current === lastErrorCode) {
      return;
    }

    lastHandledSocketErrorRef.current = lastErrorCode;

    if (lastErrorCode === "GAME_SESSION_ENDED") {
      notify("game.errors.gameSessionEnded", "error");
      navigate("/game/join", { replace: true });
      return;
    }

    if (lastErrorCode === "GAME_NOT_FOUND") {
      notify("game.errors.gameNotFound", "error");
      navigate("/game/join", { replace: true });
    }
  }, [lastErrorCode, navigate, notify]);

  const isQuestionActive = useMemo(() => !!currentQuestion, [currentQuestion]);
  const hasSubmittedAnswer = useMemo(() => answerSubmitted, [answerSubmitted]);
  useTimer(timeLeft, setTimeLeft, isQuestionActive, hasSubmittedAnswer, isPaused);

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
    [token, notifyFromError],
  );

  useEffect(() => {
    if (!token) {
      setActiveSessions((previous) => (previous.length ? [] : previous));
      setSessionsByQuiz((previous) =>
        Object.keys(previous).length ? {} : previous,
      );
      return;
    }

    refreshActiveSessions().catch(() => undefined);
  }, [token, refreshActiveSessions]);

  useEffect(() => {
    if (!gamePinState || activeQuizTitle) {
      return;
    }

    const normalizedPin = gamePinState.trim().toUpperCase();
    if (!normalizedPin) {
      return;
    }

    const findSessionByPin = (sessions: GameSession[]) =>
      sessions.find((session) => session.pin?.trim().toUpperCase() === normalizedPin);

    const sessionFromActive = findSessionByPin(activeSessions);
    const sessionFromQuizLists = sessionFromActive
      ? null
      : Object.values(sessionsByQuiz)
        .flat()
        .find((session) => session.pin?.trim().toUpperCase() === normalizedPin);

    const session = sessionFromActive ?? sessionFromQuizLists;
    const quizId = session?.quizId;

    if (typeof quizId !== "number") {
      return;
    }

    const title = quizzes.find((quiz) => quiz.id === quizId)?.title ?? null;
    if (title) {
      setActiveQuizTitle(title);
    }
  }, [gamePinState, activeQuizTitle, activeSessions, sessionsByQuiz, quizzes]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const normalizedPin = gamePinState.trim().toUpperCase();
    if (!normalizedPin) {
      return;
    }

    if (activeQuizQuestionCount > 0) {
      return;
    }

    let cancelled = false;

    async function hydrateQuestionCount() {
      const findSessionByPin = (sessions: GameSession[]) =>
        sessions.find(
          (session) => session.pin?.trim().toUpperCase() === normalizedPin,
        );

      let session = findSessionByPin(activeSessions);
      if (!session) {
        const refreshed = await refreshActiveSessions();
        session = findSessionByPin(refreshed);
      }

      const quizId = session?.quizId;
      if (typeof quizId !== "number") {
        return;
      }

      let questions = questionsByQuiz[quizId] ?? [];
      if (!questions.length) {
        try {
          questions = await fetchQuizQuestions(token, quizId);
        } catch {
          return;
        }
      }

      if (cancelled) {
        return;
      }

      setActiveQuizQuestionCount(questions.length);
    }

    hydrateQuestionCount().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    token,
    user,
    gamePinState,
    activeQuizQuestionCount,
    activeSessions,
    questionsByQuiz,
    fetchQuizQuestions,
    refreshActiveSessions,
  ]);

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
          const sessionQuizId = session.quizId;
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
        const title = quizzes.find((quiz) => quiz.id === quizId)?.title ?? null;

        lastUserJoinPinRef.current = normalizedPin;
        setGamePin(normalizedPin);
        setActiveQuizQuestionCount(questions.length);
        setActiveQuizTitle(title);
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
      quizzes,
    ],
  );

  const handleJoinGame = useCallback(() => {
    if (!user || !gamePinState) {
      return;
    }

    lastUserJoinPinRef.current = gamePinState.trim().toUpperCase();
    gameService.joinGame(gamePinState, user.username, user.id);
    navigate(`/game/${gamePinState}/lobby`);
  }, [user, gamePinState, navigate]);

  const handleJoinAsGuest = useCallback(
    (nickname: string) => {
      if (!gamePinState) {
        return;
      }
      const { id } = registerGuest(nickname);
      lastGuestJoinPinRef.current = gamePinState.trim().toUpperCase();
      gameService.joinGame(gamePinState, nickname, undefined, id);
      navigate(`/game/${gamePinState}/lobby`);
    },
    [registerGuest, gamePinState, navigate],
  );

  const handleStartGame = useCallback(() => {
    if (!gamePinState) {
      return;
    }

    gameService.startGame(gamePinState);
  }, [gamePinState]);

  const handleStopSession = useCallback(async () => {
    if (!token || !user || !gamePinState) {
      return;
    }

    const normalizedPin = gamePinState.toUpperCase();

    const findSessionByPin = (sessions: GameSession[]) =>
      sessions.find(
        (session) => session.pin?.trim().toUpperCase() === normalizedPin,
      );

    const sessionFromActive = findSessionByPin(activeSessions);
    const sessionFromQuizLists = sessionFromActive
      ? null
      : Object.values(sessionsByQuiz)
        .flat()
        .find(
          (session) =>
            session.pin?.trim().toUpperCase() === normalizedPin,
        );

    const session = sessionFromActive ?? sessionFromQuizLists;
    const quizId = session?.quizId;

    try {
      gameService.endGame(normalizedPin, user.id);

      navigate("/admin", { replace: true });

      refreshActiveSessions()
        .then(async () => {
          if (typeof quizId === "number") {
            await loadSessionsForQuiz(quizId);
          }
        })
        .catch(() => undefined);
    } catch (error) {
      notifyFromError(error, "game.errors.sessionStopFailed");
    }
  }, [
    token,
    user,
    gamePinState,
    activeSessions,
    sessionsByQuiz,
    refreshActiveSessions,
    loadSessionsForQuiz,
    navigate,
    notifyFromError,
  ]);

  const handleSubmitAnswer = useCallback(
    (answerId: number) => {
      if (user) {
        setUserAnswer(answerId);
        gameService.submitAnswer(gamePinState, user.id, answerId, timeLeft);
        return;
      }

      if (guestId) {
        setUserAnswer(answerId);
        gameService.submitAnswer(
          gamePinState,
          undefined,
          answerId,
          timeLeft,
          guestId,
        );
      }
    },
    [user, guestId, gamePinState, timeLeft],
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

      const quizId = session.quizId;
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

      lastUserJoinPinRef.current = normalizedPin;
      setGamePin(normalizedPin);
      setActiveQuizQuestionCount(questions.length);
      setActiveQuizTitle(quizzes.find((quiz) => quiz.id === quizId)?.title ?? null);

      await refreshActiveSessions();
      await loadSessionsForQuiz(quizId);

      // Join the game first, then navigate based on session status
      gameService.joinGame(normalizedPin, user.username, user.id);

      // Navigate to playing route if game is active, otherwise to lobby
      if (session.status === "active" || session.status === "paused") {
        navigate(`/game/${normalizedPin}/playing/current`);
      } else {
        navigate(`/game/${normalizedPin}/lobby`);
      }
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
      quizzes,
    ],
  );

  const handleTogglePause = useCallback(() => {
    if (!gamePinState || !user) {
      return;
    }

    if (isPaused) {
      gameService.resumeGame(gamePinState, user.id);
    } else {
      gameService.stopGame(gamePinState, user.id);
    }
  }, [gamePinState, user, isPaused]);

  const handleBackToLobby = useCallback(() => {
    if (!gamePinState) {
      return;
    }

    navigate(`/game/${gamePinState}/lobby`);
  }, [gamePinState, navigate]);

  const handleBackToAdmin = useCallback(() => {
    navigate("/admin", { replace: true });
  }, [navigate]);

  return {
    gamePin: gamePinState,
    setGamePin,
    activeQuizQuestionCount,
    activeQuizTitle,
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
    isPaused,
    activeSessions,
    sessionsByQuiz,
    refreshActiveSessions,
    loadSessionsForQuiz,
    rejoinSession,
    handleLaunchQuiz,
    handleJoinGame,
    handleJoinAsGuest,
    handleStartGame,
    handleStopSession,
    handleSubmitAnswer,
    handleNextQuestion,
    handleTogglePause,
    handleBackToLobby,
    handleBackToAdmin,
  };
}
