import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Quiz, Question } from "./shared/types";
import { authService } from "./domains/auth/auth.service";
import { quizService } from "./domains/quiz/quiz.service";
import { gameService } from "./domains/game/game.service";
import { useGameSocket } from "./shared/hooks/useGameSocket";
import { useTimer } from "./shared/hooks/useTimer";

// Feature Components
import HomePage from "./features/home/components/HomePage";
import LoginPage from "./features/authentication/components/LoginPage";
import RegisterPage from "./features/authentication/components/RegisterPage";
import AdminDashboard from "./features/quiz-management/components/AdminDashboard";
import ManageQuestionsPage from "./features/quiz-management/components/ManageQuestionsPage";
import JoinGamePage from "./features/game-play/components/JoinGamePage";
import LobbyPage from "./features/game-play/components/LobbyPage";
import PlayingPage from "./features/game-play/components/PlayingPage";
import LeaderboardPage from "./features/game-play/components/LeaderboardPage";
import AdminHostPlayingView from "./features/game-play/components/AdminHostPlayingView";
import AdminHostLeaderboardView from "./features/game-play/components/AdminHostLeaderboardView";

const TOKEN_STORAGE_KEY = "quizmaster_token";
const USER_STORAGE_KEY = "quizmaster_user";

type QuestionsByQuiz = Record<number, Question[]>;

interface ManageQuestionsRouteProps {
  quizzes: Quiz[];
  questionsByQuiz: QuestionsByQuiz;
  hasLoadedQuizzes: boolean;
  loadQuizQuestions: (quizId: number) => Promise<void>;
  onAddQuestion: (questionData: Partial<Question>) => Promise<void>;
}

function ManageQuestionsRoute({
  quizzes,
  questionsByQuiz,
  hasLoadedQuizzes,
  loadQuizQuestions,
  onAddQuestion,
}: ManageQuestionsRouteProps) {
  const { quizId } = useParams();
  const numericQuizId = Number(quizId);

  useEffect(() => {
    if (!Number.isFinite(numericQuizId)) {
      return;
    }
    if (questionsByQuiz[numericQuizId]) {
      return;
    }
    loadQuizQuestions(numericQuizId).catch(() => {
      // Failed loads are handled upstream; no-op here to avoid crash.
    });
  }, [numericQuizId, questionsByQuiz, loadQuizQuestions]);

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
      onAddQuestion={onAddQuestion}
    />
  );
}

export default function QuizApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questionsByQuiz, setQuestionsByQuiz] = useState<QuestionsByQuiz>({});
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);

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

  useTimer(timeLeft, setTimeLeft, !!currentQuestion, !!userAnswer);

  const loadQuizzes = useCallback(async (authToken: string) => {
    setHasLoadedQuizzes(false);
    try {
      const data = await quizService.getQuizzes(authToken);
      setQuizzes(data);
    } finally {
      setHasLoadedQuizzes(true);
    }
  }, []);

  const loadQuizQuestions = useCallback(
    async (quizId: number) => {
      if (!token) return;
      const data = await quizService.getQuestions(token, quizId);
      setQuestionsByQuiz((prev: QuestionsByQuiz) => ({
        ...prev,
        [quizId]: data,
      }));
    },
    [token]
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const data = await authService.login(email, password);

      setToken(data.token);
      setUser(data.user);

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      }

      if (data.user.isAdmin) {
        await loadQuizzes(data.token);
        navigate("/admin", { replace: true });
        return;
      }

      navigate("/game/join", { replace: true });
    },
    [loadQuizzes, navigate]
  );

  const handleRegister = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        await authService.register(username, email, password);
        alert(t("errors.registrationSuccess"));
        navigate("/auth/login", { replace: true });
      } catch (error) {
        alert(t("errors.registrationError"));
      }
    },
    [navigate, t]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);

      if (parsedUser.isAdmin) {
        loadQuizzes(storedToken).catch(() => {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setToken(null);
          setUser(null);
          navigate("/auth/login", { replace: true });
        });

        if (
          location.pathname === "/" ||
          location.pathname.startsWith("/auth")
        ) {
          navigate("/admin", { replace: true });
        }
        return;
      }

      if (location.pathname === "/" || location.pathname.startsWith("/auth")) {
        navigate("/game/join", { replace: true });
      }
    } catch (error) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [loadQuizzes, navigate, location.pathname]);

  const handleCreateQuiz = useCallback(
    async (title: string, description: string) => {
      if (!token) return;
      await quizService.createQuiz(token, title, description);
      await loadQuizzes(token);
    },
    [token, loadQuizzes]
  );

  const handleManageQuiz = useCallback(
    async (quiz: Quiz) => {
      await loadQuizQuestions(quiz.id);
      navigate(`/admin/quizzes/${quiz.id}`);
    },
    [loadQuizQuestions, navigate]
  );

  const handleAddQuestion = useCallback(
    async (questionData: Partial<Question>) => {
      if (!token) return;
      await quizService.addQuestion(token, questionData);
      if (questionData.quiz_id) {
        await loadQuizQuestions(Number(questionData.quiz_id));
      }
    },
    [token, loadQuizQuestions]
  );

  const handleLaunchQuiz = useCallback(
    async (quizId: number) => {
      if (!token || !user) return;

      let questions = questionsByQuiz[quizId];

      if (!questions || questions.length === 0) {
        try {
          const fetchedQuestions = await quizService.getQuestions(
            token,
            quizId
          );
          setQuestionsByQuiz((prev: QuestionsByQuiz) => ({
            ...prev,
            [quizId]: fetchedQuestions,
          }));
          questions = fetchedQuestions;
        } catch (error) {
          window.alert(t("errors.unableToLoadQuestions"));
          return;
        }
      }

      if (!questions || questions.length === 0) {
        window.alert(t("errors.addAtLeastOneQuestion"));
        return;
      }

      const data = await gameService.createSession(token, quizId);
      setGamePin(data.pin);
      setActiveQuizQuestionCount(questions.length);
      navigate("/game/lobby");
      gameService.joinGame(data.pin, user.username, user.id);
    },
    [token, user, navigate, questionsByQuiz]
  );

  const handleJoinGame = useCallback(() => {
    if (!user) return;
    gameService.joinGame(gamePin, user.username, user.id);
    navigate("/game/lobby");
  }, [user, gamePin, navigate]);

  const handleStartGame = useCallback(() => {
    gameService.startGame(gamePin);
  }, [gamePin]);

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      if (!user) return;
      setUserAnswer(answer);
      gameService.submitAnswer(gamePin, user.id, answer, timeLeft);
    },
    [user, gamePin, timeLeft]
  );

  const handleNextQuestion = useCallback(() => {
    gameService.nextQuestion(gamePin);
    setUserAnswer(null);
  }, [gamePin]);

  useEffect(() => {
    if (gameStarted) {
      navigate("/game/playing");
    }
  }, [gameStarted, navigate]);

  useEffect(() => {
    if (gameEnded) {
      navigate("/game/leaderboard");
    }
  }, [gameEnded, navigate]);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

  const joinRouteElement = useMemo(() => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    return (
      <JoinGamePage
        gamePin={gamePin}
        onGamePinChange={setGamePin}
        onJoinGame={handleJoinGame}
      />
    );
  }, [isAuthenticated, gamePin, handleJoinGame]);

  const lobbyRouteElement = useMemo(() => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    return (
      <LobbyPage
        gamePin={gamePin}
        players={players}
        isAdmin={isAdmin}
        hostUserId={isAdmin && user ? user.id : null}
        hostUsername={isAdmin && user ? user.username : null}
        onStartGame={handleStartGame}
        questionCount={activeQuizQuestionCount}
      />
    );
  }, [
    isAuthenticated,
    gamePin,
    players,
    isAdmin,
    user,
    handleStartGame,
    activeQuizQuestionCount,
  ]);

  const playingRouteElement = useMemo(() => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    if (!currentQuestion) {
      return <Navigate to="/game/lobby" replace />;
    }

    // Admin sees host view (display-only), players see interactive view
    if (isAdmin) {
      return (
        <AdminHostPlayingView
          currentQuestion={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          showResult={showResult}
          answerResult={answerResult}
          onNextQuestion={handleNextQuestion}
        />
      );
    }

    return (
      <PlayingPage
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        userAnswer={userAnswer}
        showResult={showResult}
        answerResult={answerResult}
        isAdmin={isAdmin}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
      />
    );
  }, [
    isAuthenticated,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    userAnswer,
    showResult,
    answerResult,
    isAdmin,
    handleSubmitAnswer,
    handleNextQuestion,
  ]);

  const leaderboardRouteElement = useMemo(() => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    // Admin sees enhanced host view, players see regular view
    if (isAdmin) {
      return <AdminHostLeaderboardView leaderboard={leaderboard} />;
    }

    return <LeaderboardPage leaderboard={leaderboard} />;
  }, [isAuthenticated, isAdmin, leaderboard]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/auth/register"
        element={<RegisterPage onRegister={handleRegister} />}
      />

      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard
              quizzes={quizzes}
              onCreateQuiz={handleCreateQuiz}
              onManageQuiz={handleManageQuiz}
              onLaunchQuiz={handleLaunchQuiz}
            />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route
        path="/admin/quizzes/:quizId"
        element={
          isAdmin ? (
            <ManageQuestionsRoute
              quizzes={quizzes}
              questionsByQuiz={questionsByQuiz}
              hasLoadedQuizzes={hasLoadedQuizzes}
              loadQuizQuestions={loadQuizQuestions}
              onAddQuestion={handleAddQuestion}
            />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route path="/game/join" element={joinRouteElement} />
      <Route path="/game/lobby" element={lobbyRouteElement} />
      <Route path="/game/playing" element={playingRouteElement} />
      <Route path="/game/leaderboard" element={leaderboardRouteElement} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
